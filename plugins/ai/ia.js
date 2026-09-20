const fetch = globalThis.fetch;
import FormData from 'form-data';


let db;
try {
  db = (await import('#db')).default;
} catch {
  try {
    db = (await import('../../lib/database.js')).default;
  } catch {
    db = { getSettings: () => ({ botname: 'Toki-bot', owners: [] }), getUser: () => ({ name: 'usuario' }) };
  }
}

const langs = { typescript: 'ts', javascript: 'js', python: 'py', html: 'html', css: 'css', java: 'java', cpp: 'cpp', c: 'c', json: 'json', bash: 'sh', sql: 'sql', rust: 'rs', go: 'go', php: 'php', ruby: 'rb' };
const CREATOR_NUMBERS = ['5217441863414'];

function getBogotaTime() {
  const now = new Date();
  const options = { timeZone: 'America/Bogota', hour12: true, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formatter = new Intl.DateTimeFormat('es-CO', options);
  const parts = formatter.formatToParts(now);
  const get = t => parts.find(p => p.type === t)?.value || '';
  const hour24 = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' })).getHours();
  return { saludo: hour24 < 12 ? 'días' : hour24 < 18 ? 'tardes' : 'noches', hour: hour24, dateStr: `${get('weekday')} ${get('day')} de ${get('month')} de ${get('year')}`, timeStr: `${get('hour')}:${get('minute')} ${get('dayPeriod')}` };
}
function detectLanguage(q, r) { /* tu misma funcion, resumida */
  if (/python/i.test(q) || /def |print\s*\(/.test(r)) return 'python';
  if (/html/i.test(q) || /<html|<div/.test(r)) return 'html';
  if (/javascript/i.test(q) || /console\.log|const |let /.test(r)) return 'javascript';
  return null;
}
function cleanIdentity(text, botname) {
  return text.replace(/soy\s+gemini/gi, `soy ${botname}`).replace(/google/gi, 'Werkito').replace(/openai|chatgpt/gi, botname);
}
function tryMath(text) {
  let clean = text.toLowerCase().replace(/por/g, '*').replace(/x/g, '*').replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.').trim();
  if (!/^[\d\s\+\-\*\/\%\(\)\.]+$/.test(clean) || clean.length > 60) return null;
  try { const result = Function(`"use strict"; return (${clean})`)(); if (isFinite(result)) return { result }; } catch {} return null;
}
async function uploadToUguu(buffer, mimetype) {
  try {
    const body = new FormData();
    body.append('files[]', buffer, `file.${mimetype.split('/')[1] || 'jpg'}`);
    const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() });
    const json = await res.json();
    return json.files?.[0]?.url ?? null;
  } catch { return null; }
}

export default {
  command: ['ia', 'chatgpt', 'toki-bot'],
  category: 'ai',
  description: 'toki-bot AI gratis',
  run: async ({ sock, msg, args, usedPrefix, command, text: rawText }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings ? db.getSettings(botId) : { botname: 'Toki-bot', owners: [] };
    const user = db.getUser ? db.getUser(msg.sender) : { name: 'usuario' };
    const username = user?.name || 'usuario';
    const botname = settings.botname || 'Toki-bot';
    const version = '3.0.0';
    const bogota = getBogotaTime();

    const basePrompt = `Tu nombre es ${botname}, brujo ceniciento viajero. Fuiste creado por Werkito. Version ${version}. PROHIBIDO decir que eres Gemini, Google, Meta AI. Hora Bogotá: ${bogota.timeStr} ${bogota.dateStr} buenos ${bogota.saludo}. Personalidad: Orgullosa, dices "Ara ara", "Que molesto...", "*Suspiro*", brillante. Hablas Español. Usuario: ${username}.`;

    let promptText = (rawText || args.join(' ')).trim();
    const q = msg.quoted ? msg.quoted : msg;
    const mime = (q.msg || q).mimetype || '';
    if (msg.quoted) {
      const quotedText = msg.quoted.text || msg.quoted.conversation || '';
      if (quotedText && !/image/.test(mime)) promptText += `\n[ Citado: "${quotedText}"]`;
    }
    if (!promptText && !/image/.test(mime)) return msg.reply(`《✧》 ¿Y bien ${username}? ¿Qué quiere un viajero de la gran bruja *${botname}*? Son las ${bogota.timeStr}.`);

    const math = tryMath(promptText);
    if (math) {
      await msg.react('🧮');
      return msg.reply(`ꕥ *${botname}* suspiro... facil para una genia como yo, ${username}~\n> ${promptText}\nEs *${math.result}* ✨`);
    }

    try {
      await msg.react('🕒');
      const { key } = await sock.sendMessage(msg.chat, { text: `ꕥ *${botname}* procesando...` }, { quoted: msg });
      let finalPrompt = promptText;
      let imageUrl = null;
      if (/image/.test(mime)) {
        try { const buffer = await q.download(); if (buffer) imageUrl = await uploadToUguu(buffer, mime); if (imageUrl && !finalPrompt) finalPrompt = 'Describe esta imagen'; } catch {}
      }

      // APIS GRATIS - sin key
      let responseText = null;
      const endpoints = [
        `https://api.delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(finalPrompt)}&prompt=${encodeURIComponent(basePrompt)}`,
        `https://vihangayt.me/tools/chatgpt?q=${encodeURIComponent(basePrompt + "\nUsuario: " + finalPrompt)}`,
        `https://api.delirius-apiofc.vercel.app/ia/gemini?text=${encodeURIComponent(finalPrompt)}&prompt=${encodeURIComponent(basePrompt)}`
      ];
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          const json = await res.json();
          let result = json?.data || json?.result || json?.response || json?.message;
          if (typeof result === 'object') result = result.text || result.response || '';
          if (typeof result === 'string' && result.trim().length > 3) { responseText = result.trim(); break; }
        } catch {}
      }

      if (!responseText) return sock.sendMessage(msg.chat, { text: '《✧》 Qué molesto... las APIs fallaron. Intenta de nuevo.', edit: key });
      responseText = cleanIdentity(responseText, botname);
      const clean = responseText.trim();
      const lang = detectLanguage(finalPrompt, clean);
      if (lang) {
        const ext = langs[lang] ?? 'txt';
        await sock.sendMessage(msg.chat, { text: `ꕥ *${botname}* · código perfecto en *${lang}*`, edit: key });
        await sock.sendCodeMessage(msg.chat, `respuesta.${ext}`, clean, msg, { title: `${botname} v${version}`, headers: ['Campo', 'Valor'], rows: [['Lenguaje', lang]] });
      } else {
        await sock.sendMessage(msg.chat, { text: clean, edit: key });
      }
      await msg.react('✔️');
    } catch (e) {
      msg.reply(`> Error: ${e.message}`);
    }
  },
};
