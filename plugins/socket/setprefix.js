import db from "#db"
import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setbotprefix', 'setprefix', 'prefix'],
  category: 'socket',

  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await db.getSettings(idBot)

    const isOwner = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner) return sock.reply(msg.chat, mess.socket, msg)

    const value = args.join(' ').trim()
    const defaultPrefix = ["#", "/", ".", "!"]

    
    if (!value) {
      const lista = config.prefijo === 1
       ? '`sin prefijos`'
        : (Array.isArray(config.prefijo)? config.prefijo : [config.prefijo || '/']).map(p => `\`${p}\``).join(', ')

      return msg.reply(
        `⌗°娲°₊ *— SetPrefix Socket* ✿\n\n`+
        `─────────────────\n`+
        `❀ *Opciones disponibles:*\n\n`+
        `> *○ Multi-Prefix:* ${usedPrefix + command} *!/.#*\n`+
        `> *○ Reset:* ${usedPrefix + command} *reset*\n`+
        `> *○ No-Prefix:* ${usedPrefix + command} *noprefix*\n\n`+
        `─────────────────\n`+
        `ꕥ *Actual:* ${lista}\n`+
        `─────────────────`
      )
    }

    if (value.toLowerCase() === 'reset') {
      await db.updateSettings(idBot, 'prefijo', defaultPrefix)
      return sock.reply(msg.chat, `⌗°娲°₊\n❀ Prefijos restaurados\n─────────────────\nꕥ *Prefijos:* ${defaultPrefix.map(v=>`\`${v}\``).join(' ')}\n─────────────────\n> Ya puedes usar el bot.`, msg)
    }

    if (value.toLowerCase() === 'noprefix') {
      await db.updateSettings(idBot, 'prefijo', 1)
      return msg.reply(`⌗°娲°₊\n❀ *Modo sin prefijos activado*\n─────────────────\nꕥ Ahora responderá sin prefijo.\n─────────────────`)
    }

    const splitter = new GraphemeSplitter()
    const graphemes = splitter.splitGraphemes(value)
    const lista = [...new Set(graphemes)].filter(c =>!/[a-zA-Z0-9\s]/.test(c))

    if (lista.length === 0) {
      return sock.reply(msg.chat, `ꕥ No se detectaron prefijos válidos.\n\n> Usa solo símbolos o emojis, ej: *.!/#* ✨`, msg)
    }

    if (lista.length > 6) {
      return sock.reply(msg.chat, `ꕥ Máximo 6 prefijos permitidos, pusiste ${lista.length}.`, msg)
    }

    await db.updateSettings(idBot, 'prefijo', lista)

    return sock.reply(msg.chat,
      `⌗°娲°₊\n❀ *Prefijo actualizado*\n─────────────────\nꕥ *Nuevos prefijos:* ${lista.map(v=>`\`${v}\``).join(' ')}\n─────────────────\n> Cambio aplicado al instante.`, msg)
  }
  }
