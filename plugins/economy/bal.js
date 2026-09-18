import { resolveLidToRealJid } from "../../core/utils.js"

export default {
  command: ['balance', 'bal', 'coins', 'bank', 'cartera', 'dinero'],
  category: 'economia',
  run: async (client, m, args, usedPrefix) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = db.settings[botId]
    const monedas = botSettings?.currency || "Toki Coins"

    if (chatData?.adminonly ||!chatData?.economy) return m.reply(
      `╭─〔 ✿ Toki Bot 〕─╮\n│ Economía desactivada en este grupo.\n│ Actívala con:\n│ » *${usedPrefix}economy on*\n╰─╯`
    )

    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length > 0? mentioned[0] : (m.quoted? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, client, m.chat)

    if (!(who in db.chats[m.chat].users)) {
      return m.reply(`《✿》 El usuario no está registrado en Toki.`)
    }

    const user = chatData.users[who]
    const total = (user.coins || 0) + (user.bank || 0)
    const name = global.db.data.users[who]?.name || "Usuario"

    const bal = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗕𝗔𝗟 ✿ 〕─╮
│
│ ❀ Usuario: <${name}>
│
│ ⛀ Cartera › *¥${user.coins?.toLocaleString() || 0} ${monedas}*
│ ⚿ Banco › *¥${user.bank?.toLocaleString() || 0} ${monedas}*
│ ⛁ Total › *¥${total.toLocaleString()} ${monedas}*
│
│ > _Deposita con ${usedPrefix}deposit para proteger tu dinero_
│
╰─〔 🐾 Toki Bot 〕─╯`

    await client.sendMessage(chatId, { text: bal }, { quoted: m })
  }
};
