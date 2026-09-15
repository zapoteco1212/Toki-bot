export default {
  command: ['owner','creador'],
  run: async (client, m) => {
    await client.sendMessage(m.chat, { text: `👑 Owner: Guayalo\nWa: wa.me/${global.owner[0]}` }, { quoted: m })
  }
}
