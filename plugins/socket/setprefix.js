import fs from 'fs'
let db
for (let p of ["../../lib/db.js","../../lib/database.js","../../src/db.js","../../database.js","../../db.js"]) {
  try { db = (await import(p)).default; break } catch {}
}

function saveFile(pref) {
  try { fs.writeFileSync('./lib/prefix.json', JSON.stringify(pref)) } catch {}
}

export default {
  command: ['setprefix','setbotprefix','prefix'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const def = [".","#","/","!"]
    let current = ["."]
    try {
      if (db) { let c = await db.getSettings(idBot); if (c.prefijo) current = c.prefijo }
      if (fs.existsSync('./lib/prefix.json')) current = JSON.parse(fs.readFileSync('./lib/prefix.json','utf8'))
    } catch {}
    let value = args.join('').trim()
    if (!value) {
      let actual = current === 1? 'sin prefijos' : Array.isArray(current)? current.join(' ') : current
      return sock.sendMessage(msg.chat, { text: `Actual: ${actual}\nUsa: ${usedPrefix+command} *` }, { quoted: msg })
    }
    if (value.toLowerCase() === 'reset') {
      try { if (db) await db.updateSettings(idBot, 'prefijo', def) } catch {}
      saveFile(def)
      return sock.sendMessage(msg.chat, { text: `Restaurado: ${def.join(' ')}` }, { quoted: msg })
    }
    if (['noprefix','sinprefijo'].includes(value.toLowerCase())) {
      try { if (db) await db.updateSettings(idBot, 'prefijo', 1) } catch {}
      saveFile(1)
      return sock.sendMessage(msg.chat, { text: `Sin prefijos activado` }, { quoted: msg })
    }
    let lista = [...new Set([...value])].filter(v=>v.trim()!=='').filter(v=>!/^[a-zA-Z0-9]$/.test(v))
    if (!lista.length) return sock.sendMessage(msg.chat, { text: `Ej: ${usedPrefix+command} *` }, { quoted: msg })
    try { if (db) await db.updateSettings(idBot, 'prefijo', lista) } catch {}
    saveFile(lista)
    return sock.sendMessage(msg.chat, { text: `Nuevo: ${lista.join(' ')} | Usa: ${lista[0]}menu\nReiniciando lectura...` }, { quoted: msg })
  }
}
