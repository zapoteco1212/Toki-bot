const { exec } = require('child_process')
module.exports = {
command: ["reiniciar","restart","r"],
run: async (sock, msg) => {
if(!global.owner.includes((msg.key.participant||msg.key.remoteJid).split('@')[0])) return
await sock.sendMessage(msg.key.remoteJid,{text:"♻️ Reiniciando Toki..."}, {quoted: msg})
exec(`cd ~/Toki-bot && node index.js`)
process.exit(0)
}
}
