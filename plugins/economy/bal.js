export default {
  command: ['bal','balance','cartera','wallet','coins','dinero'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    let who = msg.sender || msg.key?.participant || msg.key?.remoteJid
    let id = who

    let data = {}
    try {
      if (global.db?.data?.users) data = global.db.data.users[id] || global.db.data.users[who] || {}
      else if (global.db?.users) data = global.db.users[id] || {}
    } catch {}

    let coins = data.coins?? data.coin?? data.money?? data.dinero?? data.limit?? 0
    let bank = data.bank?? data.banco?? 0
    let exp = data.exp?? data.xp?? 0
    let level = data.level?? data.nivel?? 0

    if (coins === 0 && bank === 0) {
      coins = data.wallet?? 0
    }

    let txt = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗕𝗔𝗟 ✿ 〕─╮
│
│ ❀ @${id.split('@')[0]}
│
│ 💰 Cartera: ${coins}
│ 🏦 Banco: ${bank}
│ 💎 Total: ${coins + bank}
│ ⭐ Nivel: ${level} | Exp: ${exp}
│
╰─〔 Toki Bot 〕─╯`

    return await sock.sendMessage(msg.chat, { text: txt, mentions: [id] }, { quoted: msg })
  }
}
