export default {
  command: ['botlist','subbots','listbots','bots'],
  category: 'socket',
  run: async (client, m) => {
    if (!global.subBots || global.subBots.length === 0) {
      return m.reply(`╭─〔 ✿ SubBots 〕─╮\n│ No hay subbots activos\n╰─╯`)
    }
    let txt = `╭─〔 ✿ 𝗟𝗜𝗦𝗧𝗔 𝗦𝗨𝗕𝗢𝗧𝗦 〕─╮\n│\n│ Total: ${global.subBots.length}\n│\n`
    global.subBots.forEach((v,i)=>{
      txt += `│ ${i+1}. @${v.id} - ${v.jid.split('@')[0]}\n`
    })
    txt += `│\n╰─〔 Toki-Bot 〕─╯`
    await client.sendMessage(m.chat, { text: txt, mentions: global.subBots.map(v=>v.jid) }, { quoted: m })
  }
}
