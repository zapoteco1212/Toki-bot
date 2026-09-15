require('./settings.js')
const fs=require('fs')
const {default:makeWASocket,useMultiFileAuthState,DisconnectReason,makeCacheableSignalKeyStore}=require('@whiskeysockets/baileys')
const pino=require('pino')
async function start(){
const {state,saveCreds}=await useMultiFileAuthState('sessions')
const sock=makeWASocket({logger:pino({level:'silent'}),auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},browser:["Ubuntu","Chrome","20.0.04"],printQRInTerminal:false})
sock.ev.on('creds.update',saveCreds)
sock.ev.on('connection.update',u=>{
if(u.connection==='open')console.log('✅ Conectado!')
if(u.connection==='close'&&u.lastDisconnect?.error?.output?.statusCode!=DisconnectReason.loggedOut)start()
})
sock.ev.on('messages.upsert',async m=>{
try{
let msg=m.messages[0]
if(!msg.message||msg.key.fromMe)return
let from=msg.key.remoteJid
let body=msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.imageMessage?.caption||""
if(!body.startsWith('.'))return
let args=body.trim().split(/ +/)
let cmd=args.shift().slice(1).toLowerCase()
let plugins=fs.readdirSync('./plugins').filter(f=>f.endsWith('.js'))
for(let file of plugins){
delete require.cache[require.resolve('./plugins/'+file)]
let plugin=require('./plugins/'+file)
if(plugin.command.includes(cmd)){await plugin.run(sock,msg,args)}
}
}catch(e){console.log(e.message)}
})
}
start()
