import util from 'util'

export const tokiOwnersStyle = (owners) => {
  let list = owners.map((v,i) => `❖ *${i+1}.* @${v} - \`${v}\``).join('\n')
  return `> 𖧧 *OWNER LIST - TOKI BOT*

༺═━━━━━✦❖✦━━━━━═༻
❖ *ᴛᴏᴛᴀʟ ::* ${owners.length} Owners
༺═━━━━━✦❖✦━━━━━═༻

${list}

༺═━━━━━✦❖✦━━━━━═༻
> Array crudo:
\`\`\`js
${JSON.stringify(owners, null, 2)}
\`\`\`
༺═━━━━━✦❖✦━━━━━═༻`
}

export default {
  command: ['e', 'owner', 'owners', 'listowner', 'ownerlist'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, args, used) => {
    
    let query = args.join(' ').trim().toLowerCase()

    
    if (!query || query === 'owner' || query === 'owners') {
      let owners = global.owner || global.owners || global.db?.data?.settings?.owners || []
      if (owners[0]?.jid) owners = owners.map(v => v.jid.split('@')[0])
      owners = owners.map(v => String(v).replace(/[^0-9]/g, ''))

      let txt = tokiOwnersStyle(owners)
      return await client.sendMessage(m.chat, {
        text: txt,
        mentions: owners.map(v => v + '@s.whatsapp.net')
      }, { quoted: m })
    }

    
    try {
      let code = args.join(' ')
      let result = await eval(`(async () => { return ${code} })()`)
      if (typeof result!== 'string') result = util.format(result)
      await m.reply(result)
    } catch (e) {
      await m.reply(`༺═━━━━━✦❖✦━━━━━═༻\n*ERROR TOKI:*\n${e.message}\n༺═━━━━━✦❖✦━━━━━═༻`)
    }
  }
  }
