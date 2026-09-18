import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import qrcode from 'qrcode-terminal'
const __dirname = dirname(fileURLToPath(import.meta.url))

let db
for (let p of ["./lib/db.js","./lib/database.js","./src/db.js","./database.js","./db.js"]) {
  try { db = (await import(p)).default; console.log("DB real en "+p); break } catch {}
}
if (!db) console.log("AVISO: usando prefijo en archivo./lib/prefix.json")

// FIX: Exponer la DB global para que bal/baltop funcionen
global.db = db
if (db?.data) global.db.data = db.data
if (!global.db) global.db = { data: { users: {}, chats: {}, settings: {} } }
if (!global.db.data) global.db.data = global.db

global.comandos = new Map()
function loadPlugins(dir) {
  for (let file of fs.readdirSync(dir)) {
    const fullPath = join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) loadPlugins(fullPath)
    else if (file.endsWith('.js')) {
      import("file://"+fullPath+"?update="+Date.now()).then(pl=>{
        const cmd = pl.default || pl
        if (cmd.command) for (let c of cmd.command) global.comandos.set(c.toLowerCase(), cmd)
      }).catch(e=>console.log(`❌ ${file}: ${e.message}`))
    }
  }
}
loadPlugins(join(__dirname, 'plugins'))

function getPrefixFromFile() {
  try {
    if (fs.existsSync('./lib/prefix.json')) return JSON.parse(fs.readFileSync('./lib/prefix.json','utf8'))
  } catch {}
  return null
}

async function getPrefix(idBot) {
  let filePref = getPrefixFromFile()
  if (filePref) {
    if (filePref === 1) return []
    if (Array.isArray(filePref)) return filePref
  }
  try {
    if (!db) return filePref || [".","+"]
    const c = await db.getSettings(idBot)
    if (c.prefijo === 1) return []
    if (Array.isArray(c.prefijo)) return c.prefijo
    return filePref || [".","+"]
  } catch { return filePref || [".","+" ] }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()
  const client = makeWASocket({ version, auth: state, logger: pino({level:'silent'}), browser: ['Toki-Bot','Chrome','1.0.0'] })
  client.ev.on('creds.update', saveCreds)
  client.ev.on('connection.update', u=>{
    const { connection, lastDisconnect, qr } = u
    if (qr) qrcode.generate(qr, { small: true })
    if (connection === 'close') {
      const r = lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut
      if (r) startBot()
    } else if (connection === 'open') console.log('CONECTADO')
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
        // FIX: Ahora si pasa usedPrefix y command como tu baltop necesita
        if (plugin.category==='socket') await plugin.run({msg:m,sock:client,args,command,usedPrefix:used})
        else await plugin.run(client,m,args,used,command)
      } catch(e){ console.log(`Error en ${command}:`, e) }
    }
  })
}
startBot()
