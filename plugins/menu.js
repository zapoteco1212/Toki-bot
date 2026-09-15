export default {
  command: ['menu', 'help', 'comandos', 'toki'],
  run: async (client, m) => {
    const nombre = m.pushName || 'Guayalo'
    const botName = '✿ TOKI-BOT ✿'
    const total = global.comandos.size
    const fecha = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })

    // Agrupar por si tienen categoria
    let lista = ''
    for (let [k, v] of global.comandos) {
      lista += `┃ ✦ .${k}\n`
    }

    const menu = `
╭━──━─〔 *${botName}* 〕─━──━╮
┃
┃ Hola, *${nombre}* 🐓✨
┃
┃ *📅* ${fecha}
┃ *📦 Comandos:* ${total}
┃ *👑 Creador:* Guayalo
┃ *🟢 Estado:* Activo
┃
╰━──━──━──━──━──━╯

╭━〔 *📜 LISTA DE COMANDOS* 〕━⬣
┃
${lista.trim()}
┃
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 *✨ INFO EXTRA* 〕━⬣
┃
┃ ✿ Usa .help + comando
┃ ✿ Ej: .help ppp
┃ ✿ Prefijo actual: .
┃
╰━━━━━━━━━━━━━━━━━━⬣
*Powered by Toki-Bot x Guayalo* ⚡
`.trim()

    // Si tienes imagen, puedes mandar con imagen
    await client.sendMessage(m.chat, { text: menu }, { quoted: m })
  }
}
