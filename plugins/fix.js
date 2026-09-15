const { exec } = require('child_process')
module.exports = {
command: ["fix","update","sync","actualizar","gitpull"],
run: async (sock, msg) => {
if(!global.owner.includes((msg.key.participant||msg.key.remoteJid).split('@')[0])) return sock.sendMessage(msg.key.remoteJid,{text:"*Solo mi dueño* 👑"},{quoted:msg})
await sock.sendMessage(msg.key.remoteJid,{text:"🔄 *Sincronizando con GitHub...*"}, {quoted: msg})
exec(`cd ~/Toki-bot && git reset --hard && git pull origin main && npm install --silent`, async (err, stdout, stderr) => {
if(err){
await sock.sendMessage(msg.key.remoteJid,{text:"❌ Error:\n"+stderr.slice(0,300)}, {quoted: msg})
return
}
let txt = `✅ *ACTUALIZADO DESDE GITHUB*

\`\`\`${stdout.slice(0,500)}\`\`\`

*Reinicia el bot:*
En Termux haz CTRL+C y luego
node index.js
O escribe.reiniciar
`
await sock.sendMessage(msg.key.remoteJid,{text:txt}, {quoted: msg})
})
}
}
