
export default {
  command: ['balance','bal','coins','bank'],
  run: async (sock, m, args) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const db = global.db?.data || global.db

    if (!db?.chats?.[chatId]?.users) {
      return sock.sendMessage(chatId, { text: '❌ No hay datos de economía en este chat.' }, { quoted: m })
    }

    const chatData = db.chats[chatId]
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    const monedas = db.settings?.[botId]?.currency || 'Coins'

    
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant
    const who = mentioned[0] || quoted || sender

    if (!(who in chatData.users)) {
      return sock.sendMessage(chatId, { text: '「✎」 El usuario no está registrado.' }, { quoted: m })
    }

    const user = chatData.users[who]
    const name = db.users?.[who]?.name || who.split('@')[0]
    const coins = user.coins || 0
    const bank = user.bank || 0
    const total = coins + bank

    const bal = `✿ Usuario <${name}>

⛀ Cartera › *¥${coins.toLocaleString()} ${monedas}*
⚿ Banco › *¥${bank.toLocaleString()} ${monedas}*
⛁ Total › *¥${total.toLocaleString()} ${monedas}*

> _Para proteger tu dinero, ¡depósitalo en el banco usando.deposit!_`

    await sock.sendMessage(chatId, { text: bal }, { quoted: m })
  }
  }
