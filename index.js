import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
const __dirname = dirname(fileURLToPath(import.meta.url))

let db
for (let p of ["./lib/db.js","./lib/database.js","./src/db.js","./database.js","./db.js","./lib/lowdb.js"]) {
  try { db = (await import(p)).default; console.log(`✓ DB encontrada en ${p}`); break } catch {}
}
if (!db) {
  console.log('⚠ No se encontró DB, usando memoria temporal')
  db = { getSettings: async()=>({prefijo:["."]}), updateSettings: async()=>{} }
}

global.comandos = new Map()
function loadPlugins(dir) {
  for (let file of fs.readdirSync(dir)) {
    const fullPath = join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) loadPlugins(fullPath)
    else if (file.endsWith('.js')) {
      import(`file://${fullPath}`).then(p=>{
        const cmd = p.default || p
        if (cmd.command) for (let c of cmd.command) global.comandos.set(c, cmd)
      }).catch(e=>console.log(`Error ${file}:`, e.message))
    }
  }
}
loadPlugins(join(__dirname, 'plugins'))

async function getPrefix(idBot) {
  try {
    const c = await db.getSettings(idBot)
    if (c.prefijo === 1) return []
    if (Array.isArray(c.prefijo)) return c.prefijo
    return ["."]
  } catch { return ["."] }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()
  const client = makeWASocket({ version, auth: state, logger: pino({level:'silent'}), printQRInTerminal: true, browser: ['Toki-Bot','Chrome','1.0.0'] })
  client.ev.on('creds.update', saveCreds)
  client.ev.on('connection.update', u=>{
    if (u.connection === 'close') {
      const r = u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut
      if (r) startBot()
    } else if (u.connection === 'open') console.log('✿ TOKI-BOT CONECTADO ✿')
  })
  client.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const t = Object.keys(m.message)[0]
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message[t]?.caption || ''
    if (!body) return
    const idBot = client.user.id.split(':')[0]+'@s.whatsapp.net'
    const prefixes = await getPrefix(idBot)
    let used = ''
    let ok = prefixes.length===0
    for (let p of prefixes) if (body.startsWith(p)) { used=p; ok=true; break }
    if (!ok) return
    const args = body.slice(used.length).trim().split(/ +/)
    const command = args.shift()?.toLowerCase()
    if (!command) return
    m.chat = m.key.remoteJid; m.sender = m.key.participant || m.key.remoteJid
    const plugin = global.comandos.get(command)
    if (plugin) {
      try {
        if (plugin.category==='socket') await plugin.run({msg:m,sock:client,args,command,usedPrefix:used})
        else await plugin.run(client,m,args)
      } catch(e){ console.log(e) }
    }
  })
}
startBot()
