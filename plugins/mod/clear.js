export default {
  command: ['clear','clearchat'],
  category: 'mod',
  run: async (client, m) => {
    try {
      await client.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] }, m.chat)
      await client.sendMessage(m.chat, { text: '> 𖧧 Chat limpiado\n\n༺═━━━━━✦❖✦━━━━━═༻' }, { quoted: m })
    } catch(e) {
      await client.sendMessage(m.chat, { text: `Error: ${e.message}` }, { quoted: m })
    }
  }
}
