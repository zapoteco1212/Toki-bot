import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import qrcode from 'qrcode-terminal'

const subBotsDir = './auth-subbots'
if (!fs.existsSync(subBotsDir)) fs.mkdirSync(subBotsDir, { recursive: true })

if (!global.subBots) global.subBots = []

export default {
  command: ['serbot','jadibot','ser','code','qr'],
  category: 'socket',
  run: async (client, m, args) => {
    let id = m.sender.split('@')[0]
    let authFolder = path.join(subBotsDir, id)

    if (args[0] === 'del' || args[0] === 'delete') {
      if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true })
        let i = global.subBots.findIndex(v => v.id === id)
        if (i!== -1) {
          try { global.subBots[i].ws.close() } catch {}
          global.subBots.splice(i,1)
        }
      }
      return m.reply(`╭─〔 ✿ SubBot 〕─╮\n│ ✿ Sesión borrada\n╰─╯`)
    }

    if (global.subBots.find(v => v.id === id)) {
      return m.reply(`╭─〔 ✿ Ya eres SubBot 〕─╮\n│ Conectado ✅\n│ Usa: ${args[0] || ''} del para borrar\n╰─╯`)
    }

    await m.reply(`╭─〔 ✿ Vinculando SubBot 〕─╮\n│ Escanea el QR en 40s\n│ Tu código se guarda en\n│ auth-subbots/${id}\n╰─╯`)

    const { state, saveCreds } = await useMultiFileAuthState(authFolder)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'})) },
      logger: pino({level:'silent'}),
      browser: ['Toki-SubBot','Chrome','1.0.0']
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (up) => {
      const { connection, lastDisconnect, qr } = up
      if (qr) {
        qrcode.generate(qr, { small: true })
        await client.sendMessage(m.chat, { text: `✿ *Escanea este QR para ser SubBot*\n\n${qr}` }, { quoted: m })
      }
      if (connection === 'open') {
        global.subBots.push({ id, sock, jid: sock.user.id })
        await client.sendMessage(m.chat, { text: `╭─〔 ✿ Conectado 〕─╮\n│ ✅ Ya eres SubBot\n│ Usuario: @${id}\n│\n│ Comandos:.botlist\n╰─╯`, mentions: [m.sender] }, { quoted: m })
        // Cargar plugins para el subbot
        const pluginsDir = './plugins'
        // Mensajes del subbot
        sock.ev.on('messages.upsert', async ({messages}) => {
          const msg = messages[0]
          if (!msg.message) return
          const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
          if (!body.startsWith('.') &&!body.startsWith('+')) return
          let raw = body.slice(1).trim()
          let command = raw.split(' ')[0].toLowerCase()
          let plugin = global.comandos?.get(command)
          if (plugin) {
            try {
              let mm = msg
              mm.chat = msg.key.remoteJid
              mm.reply = (t) => sock.sendMessage(mm.chat, { text: t }, { quoted: mm })
              if (plugin.run.length === 1) await plugin.run({msg:mm, sock, args: raw.split(' ').slice(1)})
              else await plugin.run(sock, mm, raw.split(' ').slice(1))
            } catch(e){ console.log(e) }
          }
        })
      }
      if (connection === 'close') {
        let reason = lastDisconnect?.error?.output?.statusCode
        if (reason === DisconnectReason.loggedOut) {
          fs.rmSync(authFolder, { recursive: true, force: true })
        } else {
          // reconectar
          // no hacemos nada, el usuario debe poner.serbot de nuevo
        }
      }
    })
  }
  }
