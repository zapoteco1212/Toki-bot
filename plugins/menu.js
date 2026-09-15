export default {
  command: ['menu','help'],
  run: async (client, m) => {
    let txt = `*MENU TOKI-BOT*\n\n`
    for(let [k] of global.comandos) txt += `• .${k}\n`
    txt += `\nTotal: ${global.comandos.size} comandos`
    await client.sendMessage(m.chat, { text: txt }, { quoted: m })
  }
}
