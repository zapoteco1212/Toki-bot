import { exec } from 'child_process'

export default {
  command: ['fix', 'actualizar', 'update', 'actualizacion'],
  category: 'owner',
  run: async (client, m) => {
    const nombre = m.pushName || 'Guayalo'
    const fecha = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })

    const inicio = `
╭━〔 〔 *🔧 TOKI-BOT UPDATE* 〕 〕━⬣
┃
┃ *✿ Iniciando actualización...*
┃
┃ 👤 *Solicitado por:* ${nombre}
┃ 📅 *Fecha:* ${fecha}
┃
╰━━━━━━━━━━━━⬣
`.trim()

    await client.sendMessage(m.chat, { text: inicio }, { quoted: m })

    exec('git fetch origin && git reset --hard origin/main && git pull origin main --force && npm install --silent', async (err, stdout) => {
      try {
        const { loadCommands } = await import('../main.js?update=' + Date.now())
        await loadCommands()

        const final = `
╭━〔 〔 *✅ ACTUALIZACIÓN EXITOSA* 〕 〕━⬣
┃
┃ 👤 *Hecho por:* ${nombre}
┃ 📦 *Comandos:* ${global.comandos.size}
┃ 🟢 *Estado:* Conectado - Guayalo
┃ ⏰ *Hora:* ${fecha}
┃
╰━━━━━━━━━━━━⬣
*Gracias por actualizar ✨*
`.trim()

        await client.sendMessage(m.chat, { text: final }, { quoted: m })

      } catch (e) {
        await client.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
      }
    })
  }
}
