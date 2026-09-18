import db from "#db"
import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setprefix','setbotprefix','prefix'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    try {
      const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const config = await db.getSettings(idBot)

      const listaOwners = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(n => n + '@s.whatsapp.net')]
      if (!listaOwners.includes(msg.sender)) {
        return await sock.reply(msg.chat, '❌ Solo el owner del socket puede cambiar el prefijo.', msg)
      }

      let value = args.join('').trim()
      if (!value) value = args.join(' ').trim()

      const defaultPrefix = ["#","/",".","!"]

      if (!value) {
        const actual = config.prefijo === 1? '`sin prefijos`' : (Array.isArray(config.prefijo)? config.prefijo : [config.prefijo]).map(p=>`\`${p}\``).join(', ')
        return await sock.reply(msg.chat,
`⌗°娲°₊ *— SetPrefix Socket* ✿

─────────────────
❀ *Usa:*
> ${usedPrefix+command} *
> ${usedPrefix+command}!/.#
> ${usedPrefix+command} reset
> ${usedPrefix+command} noprefix
─────────────────
ꕥ *Actual:* ${actual}
─────────────────`, msg)
      }

      if (value.toLowerCase() === 'reset') {
        await db.updateSettings(idBot, 'prefijo', defaultPrefix)
        return await sock.reply(msg.chat, `⌗°娲°₊\n❀ Prefijo restaurado a ${defaultPrefix.join(' ')}`, msg)
      }

      if (['noprefix','sinprefijo','sin'].includes(value.toLowerCase())) {
        await db.updateSettings(idBot, 'prefijo', 1)
        return await sock.reply(msg.chat, `⌗°娲°₊\n❀ Modo sin prefijos activado.\nAhora escribe: p`, msg)
      }

      const splitter = new GraphemeSplitter()
      let graphemes = splitter.splitGraphemes(value)
      graphemes = graphemes.filter(g => g.trim()!== '')

      const lista = [...new Set(graphemes)]

      if (lista.length === 0) {
        return await sock.reply(msg.chat, `No detecté prefijo. Manda ejemplo: ${usedPrefix+command} *`, msg)
      }

      await db.updateSettings(idBot, 'prefijo', lista)

      return await sock.reply(msg.chat,
`⌗°娲°₊
❀ *Prefijo actualizado*
─────────────────
ꕥ *Nuevos:* ${lista.map(v=>`\`${v}\``).join(' ')}
─────────────────
> Ahora prueba con: ${lista[0]}p`, msg)

    } catch (e) {
      console.log('[SETPREFIX ERROR]', e)
      await sock.reply(msg.chat, `❌ Error: ${e.message}`, msg)
    }
  }
        }
