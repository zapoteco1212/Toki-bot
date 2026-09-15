export default {
  command: ['reiniciar','restart'],
  run: async (client, m) => {
    await client.sendMessage(m.chat, { text: `♻️ Reiniciando...` }, { quoted: m })
    process.exit(0)
  }
}
