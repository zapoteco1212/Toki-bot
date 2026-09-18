import db from "#db"

export default {
  command: ['setprefix','setbotprefix','prefix'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const def = [".","#","/","!"]
    const config = await db.getSettings(idBot)

    let value = args.join('').trim()

    if (!value) {
      let actual = config.prefijo
      if (actual === 1) actual = '`sin prefijos (escribe p)`'
      else if (Array.isArray(actual)) actual = actual.map(v=>`\`${v}\``).join(' ')
      else actual = `\`${actual}\``
      return sock.sendMessage(msg.chat, { text: `⌗°娲°₊ *— SetPrefix* ✿\n\n❀ Actual: ${actual}\n\nUsa:\n> ${usedPrefix+command} *\n> ${usedPrefix+command}!/.#\n> ${usedPrefix+command} reset\n> ${usedPrefix+command} noprefix` }, { quoted: msg })
    }

    if (value.toLowerCase() === 'reset') {
      await db.updateSettings(idBot, 'prefijo', def)
      return sock.sendMessage(msg.chat, { text: `✅ Prefijo restaurado: ${def.join(' ')}` }, { quoted: msg })
    }

    if (['noprefix','sinprefijo','sin'].includes(value.toLowerCase())) {
      await db.updateSettings(idBot, 'prefijo', 1)
      return sock.sendMessage(msg.chat, { text: `✅ Modo sin prefijos activado\nAhora escribe: menu (sin prefijo)` }, { quoted: msg })
    }

    let lista = [...new Set([...value])].filter(v => v.trim()!=='')
    lista = lista.filter(v =>!/^[a-zA-Z0-9]$/.test(v))

    if (lista.length === 0) return sock.sendMessage(msg.chat, { text: `❌ Ej: ${usedPrefix+command} *` }, { quoted: msg })
    if (lista.length > 6) return sock.sendMessage(msg.chat, { text: `❌ Máximo 6 prefijos` }, { quoted: msg })

    await db.updateSettings(idBot, 'prefijo', lista)
    return sock.sendMessage(msg.chat, { text: `⌗°娲°₊\n❀ Prefijo cambiado a: ${lista.join(' ')}\n\nPrueba: ${lista[0]}menu` }, { quoted: msg })
  }
}
