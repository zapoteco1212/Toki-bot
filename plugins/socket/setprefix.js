import db from "#db"
import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setbotprefix','setprefix','prefix'],
  category: 'socket',
  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await db.getSettings(idBot)

    const ownerList = [idBot,...(config.owner? [config.owner] : []),...global.owner.map(n => n + '@s.whatsapp.net')]
    if (!ownerList.includes(msg.sender)) return sock.reply(msg.chat, mess.socket, msg)

    let value = args.join('').trim() 
    if (!value) value = args.join(' ').trim()

    const defaultPrefix = ["#","/",".","!"]

    if (!value) {
      const lista = config.prefijo === 1? '`sin prefijos`' : (Array.isArray(config.prefijo)? config.prefijo : [config.prefijo || '/']).map(p=>`\`${p}\``).join(', ')
      return msg.reply(`⌗°娲°₊ *— SetPrefix Socket* ✿\n\n─────────────────\n❀ *Opciones:*\n\n> *○ Multi-Prefix:* ${usedPrefix+command} *!/.#*\n> *○ Reset:* ${usedPrefix+command} *reset*\n> *○ No-Prefix:* ${usedPrefix+command} *noprefix*\n\n─────────────────\nꕥ *Actual:* ${lista}\n─────────────────`)
    }

    const low = value.toLowerCase()

    if (low === 'reset') {
      await db.updateSettings(idBot, 'prefijo', defaultPrefix)
      return sock.reply(msg.chat, `⌗°娲°₊\n❀ Restaurado\n─────────────────\nꕥ *Prefijos:* ${defaultPrefix.map(v=>`\`${v}\``).join(' ')}\n─────────────────`, msg)
    }
    if (low === 'noprefix' || low === 'sinprefijo') {
      await db.updateSettings(idBot, 'prefijo', 1)
      return msg.reply(`⌗°娲°₊\n❀ *Modo sin prefijos activado*\n─────────────────`, { quoted: msg })
    }


    const splitter = new GraphemeSplitter()
    let graphemes = splitter.splitGraphemes(value)
    
    graphemes = graphemes.filter(g => g.trim()!== '' &&!/^[a-zA-Z0-9]$/.test(g))
    const lista = [...new Set(graphemes)]

    if (lista.length === 0) {
      return sock.reply(msg.chat, `ꕥ No detecté ningún prefijo válido.\n\nManda solo símbolos, ejemplo:\n${usedPrefix+command} *\n${usedPrefix+command}!/.#\n${usedPrefix+command} ✨`, msg)
    }

    await db.updateSettings(idBot, 'prefijo', lista)
    return sock.reply(msg.chat, `⌗°娲°₊\n❀ *Prefijo actualizado*\n─────────────────\nꕥ *Nuevos prefijos:* ${lista.map(v=>`\`${v}\``).join(' ')}\n─────────────────\n> Ya puedes usar el bot.`, msg)
  }
  }
