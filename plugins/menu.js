module.exports={command:["menu"],run:async(sock,msg)=>{await sock.sendMessage(msg.key.remoteJid,{text:`*🔥 TOKI-BOT 🔥*\n\n.ping\n.menu\n.s\n.toimg\n.owner`},{quoted:msg})}}
