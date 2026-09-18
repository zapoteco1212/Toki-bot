import fs from 'fs'
let db
for (let p of ["../../lib/db.js","../../lib/database.js","../../src/db.js","../../database.js","../../db.js"]) {
  try { db = (await import(p)).default; break } catch {}
}

export default {
  command: ['bal','balance','cartera','wallet','coins'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const jid = msg.sender
    let user = { coins: 0, bank: 0, exp: 0 }
    try {
      if (global.db && global.db.data && global.db.data.users && global.db.data.users[jid]) {
        user = global.db.data.users[jid]
      } else if (db && db.getUser) {
        user = await db.getUser(jid) || user
      } else if (db && db.get) {
        user = await db.get(jid) || user
      }
    } catch {}

    let coins = user.coins || user.money || user.limit || 0
    let bank = user.bank || user.banco || 0
    let exp = user.exp || user.xp || 0

    let txt = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗕𝗔𝗟 ✿ 〕─╮
│
│ ❀ Usuario: @${jid.split('@')[0]}
│
│ 💰 Cartera: ${coins}
│ 🏦 Banco: ${bank}
│ ✨ Total: ${coins + bank}
│ ⭐ Exp: ${exp}
│
╰─〔 Toki Bot Economy 〕─╯`

    return sock.sendMessage(msg.chat, { text: txt, mentions: [jid] }, { quoted: msg })
  }
          }
