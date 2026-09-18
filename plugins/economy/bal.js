let handler = async (sock, m, args) => {
  let who = m.key?.participant || m.key?.remoteJid || m.sender || m.chat
  let data = global.db?.data?.users?.[who] || global.db?.users?.[who] || {}

  let coins = data.coins?? data.coin?? data.money?? data.dinero?? data.wallet?? data.limit?? 0
  let bank = data.bank?? data.banco?? 0
  let exp = data.exp?? data.xp?? 0
  let level = data.level?? data.nivel?? 0

  let txt = `╭─〔 ✿ 𝗧𝗢𝗞𝗜 - 𝗕𝗔𝗟 ✿ 〕─╮
│
│ ❀ @${who.split('@')[0]}
│
│ 💰 Cartera: ${coins}
│ 🏦 Banco: ${bank}
│ 💎 Total: ${coins + bank}
│ ⭐ Nivel: ${level} | Exp: ${exp}
│
╰─〔 Toki Bot 〕─╯`

  await sock.sendMessage(m.chat, { text: txt, mentions: [who] }, { quoted: m })
}

handler.command = ['bal','balance','cartera','wallet','coins','dinero']
handler.category = 'economia'
export default handler
