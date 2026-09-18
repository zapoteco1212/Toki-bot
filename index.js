import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import db from "#db"

const __dirname = dirname(fileURLToPath(import.meta.url))
global.comandos = new Map()

// Carga recursiva para que agarre plugins/socket/
function loadPlugins(dir) {
  const files = fs.readdirSync(dir)
  for (let file of files) {
    const fullPath = join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      loadPlugins(fullPath)
    } else if (file.endsWith('.js')) {
      import(`file://${fullPath}`).then(plugin => {
        const cmd = plugin.default || plugin
        if (cmd.command) {
          for (let c of cmd.command) global.comandos.set(c, cmd)
          console.log(`✓ Cargado: ${file} -> ${cmd.command}`)
        }
      }).catch(e => console.log(`Error ${file}:`, e.message))
    }
  }
}
loadPlugins(join(__dirname, 'plugins'))

async function getPrefix(idBot) {
  try {
    const config = await db.getSettings(idBot)
    if (config.prefijo === 1) return []
    if (Array.isArray(config.prefijo)) return config.prefijo
    return [".","#","/","!"]
  } catch { return ["."] }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()
  const client = makeWASocket({
    version, auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Toki-Bot','Chrome','1.0.0']
  })
  client.ev.on('creds.update', saveCreds)
  client.ev.on('connection.update', (u) => {
    const { connection, lastDisconnect } = u
    if (connection === 'close') {
      const rec = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
      if (rec) startBot()
    } else if (connection === 'open') console.log('✿ TOKI-BOT CONECTADO ✿')
  })
  client.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const type = Object.keys(m.message)[0]
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message[type]?.caption || ''
    if (!body) return
    const idBot = client.user?.id?.split(':')[0] + '@s.whatsapp.net' || 'bot'
    const prefixes = await getPrefix(idBot)
    let usedPrefix = ''
    let isCmd = prefixes.length === 0? true : false
    if (prefixes.length > 0) {
      for (let p of prefixes) { if (body.startsWith(p)) { usedPrefix = p; isCmd = true; break } }
    }
    if (!isCmd) return
    const args = body.slice(usedPrefix.length).trim().split(/ +/)
    const command = args.shift()?.toLowerCase()
    if (!command) return
    m.chat = m.key.remoteJid
    m.sender = m.key.participant || m.key.remoteJid
    const plugin = global.comandos.get(command)
    if (plugin) {
      try {
        if (plugin.category === 'socket') await plugin.run({ msg: m, sock: client, args, command, usedPrefix, text: args.join(' ') })
        else await plugin.run(client, m, args)
      } catch (e) { console.log(e) }
    }
  })
}
startBot()
