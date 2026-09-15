import { exec } from 'child_process'

export default {
  command: ['fix', 'actualizar', 'update'],
  category: 'owner',
  run: async (client, m) => {
    const editor = m.pushName || 'Guayalo'

    exec('git fetch origin && git reset --hard origin/main && git pull origin main --force && npm install --silent', async () => {
      
      // Sacar archivos cambiados del ultimo commit
      exec('git log -1 --name-only --pretty=format:', async (err, filesOutput) => {
        try {
          const { loadCommands } = await import('../main.js?update=' + Date.now())
          await loadCommands()

          let archivos = filesOutput ? filesOutput.trim().split('\n').filter(f=>f) : []
          let total = archivos.length || 1
          let detalle = archivos.length ? archivos.map(f=>`• \`${f.trim()}\``).join('\n') : '• `Actualización general`'

          let texto = `❀ *Actualización exitosa*\n\n⊥ *Editor:* ${editor}\n✎ *Total Cambios:* ${total}\n\n❀ *Detalles de archivos:*\n${detalle}`

          await client.sendMessage(m.chat, { text: texto }, { quoted: m })

        } catch (e) {
          await client.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
        }
      })
    })
  }
}
