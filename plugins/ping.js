export default {
  command: ['ping','p'],
  run: async (client, m) => {
    const start = Date.now()
    await client.sendMessage(m.chat, { text: `✿ Pong! ${Date.now()-start}ms` }, { quoted: m })
  }
}
