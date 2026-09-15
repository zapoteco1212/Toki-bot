import os from 'os'
let handler = async (m, { conn }) => {
  let uptime = process.uptime()
  let h = Math.floor(uptime / 3600)
  let min = Math.floor((uptime % 3600) / 60)
  let s = Math.floor(uptime % 60)
  let txt = `❀ *ESTADO - TOKI BOT* ❀

✦ *Uptime:* ${h}h ${min}m ${s}s
✦ *RAM Bot:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
✦ *Plataforma:* ${os.platform()}
✦ *Chats:* ${Object.keys(conn.chats).length}

> Toki-Bot activo ✅`
  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}
handler.command = ['status','estado','est']
export default handler
