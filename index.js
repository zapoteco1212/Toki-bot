require('./settings.js')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const pino = require('pino')
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('sessions')
  const sock = makeWASocket({
    logger: pino({level:'silent'}),
    auth:{ creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'})) },
    browser:["Ubuntu","Chrome","20.0.04"],
    printQRInTerminal:false
  })
  if(!sock.authState.creds.registered){
    let num = global.pairingNumber
    console.log("Pidiendo codigo para:", num)
    setTimeout(async ()=>{
      try{
        let code = await sock.requestPairingCode(num)
        console.log("\n\n=========================")
        console.log(" TU CODIGO: "+code)
        console.log("=========================\n")
        console.log("Ve a WhatsApp > 3 puntitos > Dispositivos vinculados > Vincular con numero de telefono > pega el codigo")
      }catch(e){
        console.log("Error:", e.message)
        console.log("Espera 5 min, borra sessions con rm -rf sessions y vuelve a intentar")
      }
    }, 3000)
  }
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', u=>{
    if(u.connection==='open') console.log('¡Toki-Bot Conectado!')
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!= DisconnectReason.loggedOut) start()
  })
  sock.ev.on('messages.upsert', async m=>{
    let msg = m.messages[0]
    if(!msg.message || msg.key.fromMe) return
    let from = msg.key.remoteJid
    let body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    if(body.toLowerCase() === ".menu" || body.toLowerCase() === ".ping"){
      await sock.sendMessage(from, {text:`Hola soy *${global.botName}* 🔥\n\n.menu - menu\n.ping - vivo`}, {quoted: msg})
    }
  })
}
start()
