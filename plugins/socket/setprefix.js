import fs from 'fs'
let db
for (let p of ["../../lib/db.js","../../lib/database.js","../../src/db.js","../../database.js","../../db.js"]) {
  try { db = (await import(p)).default; break } catch {}
}
function saveFile(pref) {
  try { fs.writeFileSync('./lib/prefix.json', JSON.stringify(pref)) } catch {}
}

export default {
  command: ['setprefix','setbotprefix','prefix','prefijo'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const def = [".","#","/","!"]
    let current = ["."]
    try {
      if (db) { let c = await db.getSettings(idBot); if (c?.prefijo) current = c.prefijo }
      if (fs.existsSync('./lib/prefix.json')) current = JSON.parse(fs.readFileSync('./lib/prefix.json','utf8'))
    } catch {}
    let actualTxt = current === 1? '• Sin Prefijo (noprefix)' : current.map(v=>`〔 ${v} 〕`).join(' ')
    let value = args.join('').trim()
    if (!value) {
      let txt = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗣𝗥𝗘𝗙𝗜𝗫 ✿ 〕─╮
│
│ ❀ Prefijo Actual:
│ ${actualTxt}
│
│ ❀ Como usar:
│ ${usedPrefix+command} <simbolo>
│ Ej: ${usedPrefix+command} #
│ Ej: ${usedPrefix+command} *!-
│
│ ❀ Opciones:
│ • ${usedPrefix+command} reset → restaura ${def.join(' ')}
│ • ${usedPrefix+command} noprefix → sin prefijo
│
╰─〔 Toki Bot 〕─╯`
      return sock.sendMessage(msg.chat, { text: txt }, { quoted: msg })
    }
    if (value.toLowerCase() === 'reset') {
      try { if (db) await db.updateSettings(idBot, 'prefijo', def) } catch {}
      saveFile(def)
      return sock.sendMessage(msg.chat, { text: `╭─〔 ✿ TOKI 〕─╮\n│ ✅ Prefijos restaurados\n│ ${def.map(v=>`〔 ${v} 〕`).join(' ')}\n╰─────────╯` }, { quoted: msg })
    }
    if (['noprefix','sinprefijo','sin'].includes(value.toLowerCase())) {
      try { if (db) await db.updateSettings(idBot, 'prefijo', 1) } catch {}
      saveFile(1)
      return sock.sendMessage(msg.chat, { text: `╭─〔 ✿ TOKI 〕─╮\n│ ✅ Modo sin prefijo activado\n│ Ahora escribe: menu / ping\n╰─────────╯` }, { quoted: msg })
    }
    let lista = [...new Set([...value])].filter(v=>v.trim()!=='').filter(v=>!/^[a-zA-Z0-9]$/.test(v))
    if (!lista.length) {
      return sock.sendMessage(msg.chat, { text: `❌ Símbolo inválido\nUsa: ${usedPrefix+command} *` }, { quoted: msg })
    }
    try { if (db) await db.updateSettings(idBot, 'prefijo', lista) } catch {}
    saveFile(lista)
    let txt2 = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗣𝗥𝗘𝗙𝗜𝗫 ✿ 〕─╮
│
│ ✅ Nuevo Prefijo Guardado
│
│ ❀ Prefijos: ${lista.map(v=>`〔 ${v} 〕`).join(' ')}
│ ❀ Prueba: ${lista[0]}menu
│ ❀ Prueba: ${lista[0]}ping
│
╰─〔 Actualizado con éxito 〕─╯`
    return sock.sendMessage(msg.chat, { text: txt2 }, { quoted: msg })
  }
        }
