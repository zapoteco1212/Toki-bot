import util from 'util'
export default {
  command: ['e','owner','owners','listowner'],
  isOwner: true,
  run: async (client, m, args) => {
    let owners = global.owner || []
    if (owners[0]?.jid) owners = owners.map(v => v.jid.split('@')[0])
    owners = owners.map(v => String(v).replace(/[^0-9]/g, ''))
    if (!args[0] || args[0].toLowerCase() === 'owner') {
      let list = owners.map((v,i) => `❖ *${i+1}.* wa.me/${v} - \`${v}\``).join('\n')
      let txt = `> 𖧧 *OWNER LIST - TOKI BOT*\n\n༺═━━━━━✦❖✦━━━━━═༻\n❖ *ᴛᴏᴛᴀʟ ::* ${owners.length}\n༺═━━━━━✦❖✦━━━━━═༻\n\n${list}\n\n༺═━━━━━✦❖✦━━━━━═༻\n\`\`\`js\n${JSON.stringify(owners, null, 2)}\n\`\`\`\n༺═━━━━━✦❖✦━━━━━═༻`
      return await client.sendMessage(m.chat, { text: txt, mentions: owners.map(v=>v+'@s.whatsapp.net') }, { quoted: m })
    }
    try {
      let result = await eval(`(async()=>{ return ${args.join(' ')} })()`)
      await client.sendMessage(m.chat, { text: util.format(result) }, { quoted: m })
    } catch(e) {
      await client.sendMessage(m.chat, { text: `Error: ${e.message}` }, { quoted: m })
    }
  }
}
