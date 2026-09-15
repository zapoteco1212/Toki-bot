import { exec } from 'child_process'

export default {
  command: ['fix', 'actualizar', 'update', 'actualizacion'],
  category: 'owner',
  run: async (client, m) => {
    const nombre = m.pushName || 'Guayalo'
    const numero = m.sender.split('@')[0]
    const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })

    const decoracionInicio = `
╭━〔 〔 *🔧 TOKI-BOT UPDATE* 〕 〕━⬣
┃
┃ *✿ Iniciando actualización...*
┃
┃ 👤 *Solicitado por:* ${nombre}
┃ 📱 *Número:* wa.me/${numero}
┃ 📅 *Fecha:* ${fecha}
┃
╰━━━━━━━━━━━━⬣
`.trim()

    await client.sendMessage(m.chat, { text: decoracionInicio }, { quoted: m })

    exec('git fetch origin && git reset --hard origin/main && git pull origin main --force && npm install --silent', async (err, stdout, stderr) => {
      try {
        const { loadCommands } = await import('../main.js?update=' + Date.now())
        await loadCommands()

        const decoracionFinal = `
╭━〔 〔 *✅ ACTUALIZACIÓN EXITOSA* 〕 〕━⬣
┃
┃ 👤 *Hecho por:* ${nombre}
┃ 📱 *Usuario:* @${numero}
┃ 📦 *Comandos cargados:* ${global.comandos.size}
┃ 🟢 *Estado:* Conectado - Guayalo
┃ ⏰ *Hora:* ${fecha}
┃
┃ *📜 Cambios:*
┃ ${stdout? stdout.slice(0, 300) : 'Sincronizado con GitHub'}
┃
╰━━━━━━━━━━━━⬣
*Gracias por actualizar Toki-Bot* ✨
`.trim()

        await client.sendMessage(m.chat, {
          text: decoracionFinal,
          mentions: [m.sender]
        }, { quoted: m })

      } catch (e) {
        await client.sendMessage(m.chat, { text: `❌ Error en fix: ${e.message}` }, { quoted: m })
      }
    })
  }
}
