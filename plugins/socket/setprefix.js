import db from "#db"

export default {
  command: ['setprefix','setbotprefix','prefix'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    let value = args[0]? args.join('').trim() : ''
    const def = ["#","/",".","!"]
    const config = await db.getSettings(idBot)

    if (!value) {
      let actual = config.prefijo
      if (actual === 1) actual = 'sin prefijos'
      else if (Array.isArray(actual)) actual = actual.join(' ')
      else actual = actual || '/'
      return msg.reply(`⌗°娲°₊ *— SetPrefix* ✿\n\nActual: ${actual}\n\nUsa:\n> ${usedPrefix+command} *\n> ${usedPrefix+command}!/.#\n> ${usedPrefix+command} reset\n> ${usedPrefix+command} noprefix`)
    }

    if (value.toLowerCase() === 'reset') {
      await db.updateSettings(idBot, 'prefijo', def)
      return sock.reply(msg.chat, `✅ Prefijo restaurado: ${def.join(' ')}`, msg)
    }

    if (value.toLowerCase() === 'noprefix') {
      await db.updateSettings(idBot, 'prefijo', 1)
      return sock.reply(msg.chat, `✅ Modo sin prefijo activado. Ahora escribe: p`, msg)
    }

    let lista = [...new Set([...value])].filter(v => v.trim()!== '')
    lista = lista.filter(v =>!/^[a-zA-Z0-9]$/.test(v))

    if (lista.length === 0) return sock.reply(msg.chat, `❌ No detecté prefijo. Ej: ${usedPrefix+command} *`, msg)
    if (lista.length > 6) return sock.reply(msg.chat, `❌ Máx 6 prefijos`, msg)

    await db.updateSettings(idBot, 'prefijo', lista)
    return sock.reply(msg.chat, `⌗°娲°₊\n❀ Prefijo cambiado a: ${lista.join(' ')}\n\nAhora usa: ${lista[0]}menu`, msg)
  }
                              }
