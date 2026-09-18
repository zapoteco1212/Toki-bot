
import { resolveLidToRealJid } from "../../core/utils.js"

export default {
  command: ['addcoin', 'addxp'],
  run: async (client, m, args, usedPrefix, command) => {
    try {
    const chatId = m.chat
    const sender = m.sender
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botId = botJid
    const settings = global.db.data.settings[botJid]
    const bot = settings
    const sandboxMode = settings?.sandboxEnabled || false
    const senderNumber = m.sender.split('@')[0].replace(/[^0-9]/g, '')
    const ownerList = global.Owners || global.owner || []
    const isOwner = ownerList.some(user => {
      const ownerNumber = (Array.isArray(user)? user[0] : user).toString().replace(/[^0-9]/g, '')
      return ownerNumber === senderNumber
    })
    const havePass = sandboxMode? true : isOwner
    if (!havePass) {
      return m.reply('\`\`\`《✧》 Este bot no es de\`\`\` *Donadores*\n\n\`\`\`《♤》Para apoyar el proyecto comunícate con algún desarrollador:\`\`\`\n\n> 亗𝙽𝚎𝚝𝚑𝚎𝚛𝙻𝚘𝚛𝚍亗: https://wa.me/5491140642242\n> Mai: https://wa.me/573015200599\n> Sh: https://wa.me/584122228574')
    }

      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0? mentioned[0] : (m.quoted? m.quoted.sender : null)
      const who = await resolveLidToRealJid(who2, client, m.chat)
      const currency = bot.currency || '$'
      if (command === 'addcoin') {
        if (!who) return client.reply(m.chat, '❀ Por favor, menciona al usuario o cita un mensaje.', m)
        const coinTxt = args.find(arg =>!isNaN(arg) &&!arg.includes('@'))
        if (!coinTxt) return client.reply(m.chat, 'ꕥ Por favor, ingresa la cantidad que deseas añadir.\nEjemplo:!addcoin @usuario 100', m)
        if (isNaN(coinTxt)) return client.reply(m.chat, 'ꕥ Solo se permiten números.', m)
        await m.react('🕒')
        const dmt = parseInt(coinTxt)
        if (dmt < 1) {
          await m.react('✖️')
          return client.reply(m.chat, 'ꕥ Mínimo es *1*', m)
        }
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { users: {} }
        if (!global.db.data.chats[m.chat].users) global.db.data.chats[m.chat].users = {}
        const userData = global.db.data.chats[m.chat].users
        if (!userData[who]) {
          userData[who] = { coins: 0 }
        }
        userData[who].coins += dmt
        await m.react('✔️')
        return client.reply(m.chat, `❀ *Añadido:*\n» ${dmt} ${currency}\n@${who.split('@')[0]}, recibiste ${dmt} ${currency}`, m, { mentions: [who] })
      }
      if (command === 'addxp') {
        if (!who) return client.reply(m.chat, '❀ Por favor, menciona al usuario o cita un mensaje.', m)
        const xpTxt = args.find(arg =>!isNaN(arg) &&!arg.includes('@'))
        if (!xpTxt) return client.reply(m.chat, 'ꕥ Ingresa la cantidad de experiencia (XP) que deseas añadir.\nEjemplo:!addxp @usuario 50', m)
        if (isNaN(xpTxt)) return client.reply(m.chat, 'ꕥ Solo números son permitidos.', m)
        await m.react('🕒')
        const xp = parseInt(xpTxt)
        if (xp < 1) {
          await m.react('✖️')
          return client.reply(m.chat, 'ꕥ El mínimo de experiencia (XP) es *1*', m)
        }
        if (!global.db.data.users) global.db.data.users = {}
        const userData = global.db.data.users
        if (!userData[who]) {
          userData[who] = { exp: 0 }
        }
        userData[who].exp += xp
        await m.react('✔️')
        return client.reply(m.chat, `❀ XP Añadido: *${xp}*\n@${who.split('@')[0]}, recibiste ${xp} XP`, m, { mentions: [who] })
      }
    } catch (error) {
      console.error(error)
      await m.react('✖️')
      return client.reply(m.chat, `⚠︎ Se ha producido un problema.\n${error.message}`, m)
    }
  }
      }
