import { exec } from 'child_process'
export default {
  command: ['fix','actualizar','update'],
  run: async (client, m) => {
    await client.sendMessage(m.chat, { text: `⏳ Actualizando...` }, { quoted: m })
    exec('git fetch origin && git reset --hard origin/main && git pull origin main --force && npm install --silent', async () => {
      const { loadCommands } = await import('../main.js?u='+Date.now())
      await loadCommands()
      await client.sendMessage(m.chat, { text: `✅ Actualizado - ${global.comandos.size} comandos` }, { quoted: m })
    })
  }
}
