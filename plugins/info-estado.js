import { execSync } from 'child_process'
import os from 'os'

let handler = async (m, { conn }) => {
  let uptime = clockString(process.uptime() * 1000)
  let users = Object.keys(global.db?.data?.users || {}).length
  let chats = Object.keys(conn?.chats || {}).length

  let used = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  let total = (os.totalmem() / 1024 / 1024).toFixed(0)

  // commit local
  let commit = 'No git'
  let update = '✅ Actualizado'
  try {
    commit = execSync('git log -1 --pretty=format:"%h | %s"').toString().trim()
    execSync('git fetch --quiet')
    let behind = execSync('git rev-list --count HEAD..origin/main 2>/dev/null || echo 0').toString().trim()
    if (parseInt(behind) > 0) update = `❌ ${behind} update(s) pendiente(s) - usa .update`
  } catch {}

  let txt = `╭─❀ *T O K I  -  E S T A D O* ❀
│
│ ✦ *Uptime:* ${uptime}
│ ✦ *Users:* ${users}
│ ✦ *Chats:* ${chats}
│ ✦ *RAM:* ${used} MB / ${total} MB
│ ✦ *Platform:* ${os.platform()} ${os.arch()}
│ ✦ *Node:* ${process.version}
│
│ ✦ *Commit:* ${commit}
│ ✦ *GitHub:* ${update}
│
╰─> *Bot activo y estable* 🦊✨`

  await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.help = ['estado']
handler.tags = ['info']
handler.command = ['estado','status','est','st','botstatus']
export default handler

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}
