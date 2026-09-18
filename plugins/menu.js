export default {
  command: ['menu', 'help', 'comandos', 'toki'],
  run: async (client, m) => {
    const nombre = m.pushName || 'Guayalo'
    const botName = '✿ TOKI-BOT ✿'
    const total = global.comandos ? global.comandos.size : 0
    const fecha = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })

    const menu = `
╭━──━─〔 *${botName}* 〕─━──━╮
┃
┃ Hola, *${nombre}* 🐓✨
┃
┃ *📅* ${fecha}
┃ *📦 Comandos:* ${total}
┃ *👑 Creador:* werkito
┃ *🟢 Estado:* Activo
┃
╰━──━──━──━──━──━╯

╭━〔 *❄️ ECONOMYA * 〕━⬣
┃
┃ 
┃
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 *🎮 JUEGOS* 〕━⬣
┃
┃ 
┃
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 *👥 GRUPOS* 〕━⬣
┃
┃ 
┃
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 *🛠️ TOOLS* 〕━⬣
┃*p ping*, ver el ping del 
   estado del bot.
┃ 
┃
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 *🔥 Descargas* 〕━⬣
┃
┃ 
┃
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 *✨ INFO EXTRA* 〕━⬣
┃
┃ ✿ Usa .help + comando
┃ ✿ Ej: .help 
┃ ✿ Prefijo actual: .
┃
╰━━━━━━━━━━━━━━━━━━⬣
*Powered by Toki-Bot x Guayalo* ⚡
`.trim()

    await client.sendMessage(m.chat, { text: menu }, { quoted: m })
  }
}
