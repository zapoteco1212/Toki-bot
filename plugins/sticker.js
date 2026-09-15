export default {
  command: ['s','sticker'],
  run: async (client, m) => {
    await client.sendMessage(m.chat, { text: `Responde a una imagen/video con .s para sticker` }, { quoted: m })
  }
}
