let db
for (let p of ["../../lib/db.js","../../lib/database.js","../../src/db.js","../../database.js"]) {
  try { db = (await import(p)).default; break } catch {}
}
if (!db) db = { getSettings: async()=>({prefijo:["."]}), updateSettings: async()=>{} }

export default {
  command: ['setprefix','setbotprefix','prefix'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const def = [".","#","/","!"]
    const config = await db.getSettings(idBot)
    let value = args.join('').trim()
    if (!value) {
      let actual = config.prefijo === 1? 'sin prefijos' : Array.isArray(config.prefijo)? config.prefijo.join(' ') : config.prefijo
      return sock.sendMessage(msg.chat, { text: `Actual: ${actual}\nUsa: ${usedPrefix+command} *` }, { quoted: msg })
    }
    if (value.toLowerCase() === 'reset') {
      await db.updateSettings(idBot, 'prefijo', def)
      return sock.sendMessage(msg.chat, { text: `✅ Restaurado: ${def.join(' ')}` }, { quoted: msg })
    }
    if (value.toLowerCase() === 'noprefix') {
      await db.updateSettings(idBot, 'prefijo', 1)
      return sock.sendMessage(msg.chat, { text: `✅ Sin prefijos` }, { quoted: msg })
    }
    let lista = [...new Set([...value])].filter(v=>v.trim()!=='').filter(v=>!/^[a-zA-Z0-9]$/.test(v))
    if (!lista.length) return sock.sendMessage(msg.chat, { text: `❌ Ej: ${usedPrefix+command} *` }, { quoted: msg })
    await db.updateSettings(idBot, 'prefijo', lista)
    return sock.sendMessage(msg.chat, { text: `✅ Nuevo: ${lista.join(' ')} | Usa: ${lista[0]}menu` }, { quoted: msg })
  }
                                         }
