import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
global.comandos = new Map()

// CARGAR COMANDOS
const pluginsFolder = join(__dirname, 'plugins')
for (let file of fs.readdirSync(pluginsFolder).filter(f => f.endsWith('.js'))) {
  try {
    const plugin = await import(`./plugins/${file}`)
    const cmd = plugin.default || plugin
    if (cmd.command) {
      for (let c of cmd.command) {
        global.comandos.set(c, cmd)
      }
    }
  } catch (e) {
    console.log(`Error en plugin ${file}:`, e.message)
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const client = makeWASocket({
    version,
    auth: state,
    // ESTO QUITA EL SPAM QUE TE SALE EN LA CAPTURA
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Toki-Bot', 'Chrome', '1.0.0']
  })

  client.ev.on('creds.update', saveCreds)

  client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
      console.log('Conexion cerrada, reconectando...', shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✿ TOKI-BOT CONECTADO ✿')
    }
  })

  client.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    if (m.key.fromMe) return

    const msgType = Object.keys(m.message)[0]
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message[msgType]?.caption || ''
    if (!body) return

    const prefix = '.'
    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    m.pushName = m.pushName || 'Guayalo'
    m.chat = m.key.remoteJid
    m.text = body

    const plugin = global.comandos.get(command)
    if (plugin) {
      try {
        await plugin.run(client, m, args)
      } catch (e) {
        console.log(e)
      }
    }
  })
}

startBot()
