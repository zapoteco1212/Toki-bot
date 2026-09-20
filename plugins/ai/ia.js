import fetch from 'node-fetch';
import FormData from 'form-data';
import db from '#db';

function getBogotaTime() {
  const now = new Date();
  const options = { timeZone: 'America/Bogota', hour12: true, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formatter = new Intl.DateTimeFormat('es-CO', options);
  const parts = formatter.formatToParts(now);
  const get = t => parts.find(p => p.type === t)?.value || '';
  const hour24 = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' })).getHours();
  let saludo = hour24 < 12? 'días' : hour24 < 18? 'tardes' : 'noches';
  return { saludo, dateStr: `${get('weekday')} ${get('day')} de ${get('month')}`, timeStr: `${get('hour')}:${get('minute')} ${get('dayPeriod')}`, hour: hour24 };
}

function cleanIdentity(text, botname) {
  return text.replace(/soy\s+gemini/gi, `soy ${botname}`).replace(/google/gi, 'Werkito').replace(/openai|chatgpt|meta ai/gi, botname);
}

async function uploadToUguu(buffer, mimetype) {
  try {
    const body = new FormData();
    body.append('files[]', buffer, `file.${mimetype.split('/')[1] || 'jpg'}`);
    const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() });
    const json = await res.json();
    return json.files?.[0]?.url?? null;
  } catch { return null; }
}

export default {
  command: ['ia',  'chatgpt', 'gpt', 'toki-bot'],
  category: 'ai',
  description: 'IA gratis Toki',
  run: async ({ sock, msg, args, text: rawText }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId);
    const user = db.getUser(msg.sender);
    const username = user?.name || 'viajero';
    const botname = settings.botname || 'Toki';
    const bogota = getBogotaTime();

    const basePrompt = `Tu nombre es ${botname}, la prodigiosa bruja gris Toki. Fuiste creada por werkito (un hombre). PROHIBIDO decir que eres Gemini, Google, OpenAI. Eres ${botname}.
Hora Bogotá: ${bogota.timeStr} - ${bogota.dateStr} - Buenos ${bogota.saludo}.
Personalidad: Orgullosa, egocéntrica, dices "Ara ara", "*Suspiro*", "Que molesto...", "Como era de esperarse de alguien tan brillante como yo". Sarcástica elegante, odias trabajar gratis pero ayudas. Hablas español. Llama al usuario ${username}. Si preguntan quien te creó di: Fui creada por Mai.`;

    let promptText = (rawText || args.join(' ')).trim();
    const q = msg.quoted? msg.quoted : msg;
    const mime = (q.msg || q).mimetype || '';

    if (msg.quoted) {
      const quotedText = msg.quoted.text || msg.quoted.conversation || '';
      if (quotedText &&!/image/.test(mime)) promptText += `\nMensaje citado: "${quotedText}"`;
    }

    if (!promptText &&!/image/.test(mime)) return msg.reply(`《✧》 Ara ara... ¿Y la pregunta, ${username}? Son las ${bogota.timeStr}. No me hagas perder el tiempo.`);

    try {
      await msg.react('🕒');
      const { key } = await sock.sendMessage(msg.chat, { text: `ꕥ *${botname}* está pensando...` }, { quoted: msg });

      let imageUrl = null;
      if (/image/.test(mime)) {
        const buffer = await q.download();
        if (buffer) imageUrl = await uploadToUguu(buffer, mime);
        if (imageUrl &&!promptText) promptText = 'Describe esta imagen';
      }

      const fullPrompt = `${basePrompt}\n\nUsuario ${username} dice: ${promptText}`;
      let responseText = null;

      
      const apis = [
        `https://api.delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(promptText)}&prompt=${encodeURIComponent(basePrompt)}`,
        `https://vihangayt.me/tools/chatgpt?q=${encodeURIComponent(fullPrompt)}`,
        `https://api.dorratz.com/ai/chatgpt?text=${encodeURIComponent(fullPrompt)}`,
        `https://api.delirius-apiofc.vercel.app/ia/gemini?text=${encodeURIComponent(promptText)}&prompt=${encodeURIComponent(basePrompt)}`
      ];

      for (const url of apis) {
        try {
          const res = await fetch(url);
          const json = await res.json();
          let r = json?.data || json?.result || json?.response || json?.message || json?.answer || json?.text;
          if (typeof r === 'object') r = r.result || r.response || r.text || '';
          if (typeof r === 'string' && r.trim().length > 5) { responseText = r.trim(); break; }
        } catch {}
      }

      if (!responseText) return sock.sendMessage(msg.chat, { text: '《✧》 Qué molesto... todas las APIs gratis se cayeron. Intenta de nuevo en 10 seg, viajero.', edit: key });

      responseText = cleanIdentity(responseText, botname);

      await sock.sendMessage(msg.chat, { text: responseText, edit: key });
      await msg.react('✔️');

    } catch (e) {
      msg.reply(`> Error: ${e.message}`);
    }
  },
};
