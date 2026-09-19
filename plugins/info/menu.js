export const bodyMenu = `> 𖧧 ¡Hola! *@$sender*, Soy *$namebot*

༺═━━━━━✦❖✦━━━━━═༻
❖ *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* $owner
✦ *ᴛʏᴘᴇ ::* $botType
❖ *ᴠᴇʀsɪᴏɴ ::* ^3.0 - Latest
✦ *sʏsᴛᴇᴍ/ᴏᴘʀ ::* $device
❖ *ᴛɪᴍᴇ ::* $tiempo, $tempo
✦ *ᴜsᴇʀs ::* $users
❖ *ᴜʀʟ ::* $link
༺═━━━━━✦❖✦━━━━━═༻

$cat

> Vincula un *Socket* con tu número utilizando *$prefixqr* o *$prefixcode*.
‧꒷︶꒷꒥꒷‧₊˚꒷︶꒷‧₊˚꒷︶꒷‧₊˚꒷︶꒷‧`

export const menuObject = {
economia: `༺═────────────═༻
✧･ﾟ: *✧ 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 ✧* :ﾟ･✧
༺═────────────═༻
> ✐ Comandos de Economía
✧ *$prefix...*
༺═━━━━━✦❖✦━━━━━═༻`,
gacha: `༺═────────────═༻
✧･ﾟ: *✧ GACHA ✧* :ﾟ･✧
༺═────────────═༻
✧ *$prefix...*
༺═━━━━━✦❖✦━━━━━═༻`,
downloads: `༺═────────────═༻
✧･ﾟ: *✧ DOWNLOADS ✧* :ﾟ･✧
༺═────────────═༻
✧ *$prefix...*
༺═━━━━━✦❖✦━━━━━═༻`
}

export default {
  command: ['menu','help','menú'],
  run: async (client, m, args, used) => {
    let cat = '\n\n' + Object.values(menuObject).join('\n\n')
    let txt = bodyMenu
  .replace('$sender', m.sender.split('@')[0])
  .replace('$namebot', 'Toki-Bot')
  .replace('$owner', 'Toki')
  .replace('$botType', 'Socket')
  .replace('$device', 'Linux')
  .replace('$tiempo', new Date().toLocaleDateString())
  .replace('$tempo', new Date().toLocaleTimeString())
  .replace('$users', String(Object.keys(global.db?.data?.users||{}).length))
  .replace('$link', 'toki-bot.com')
  .replace('$prefixqr', used+'qr')
  .replace('$prefixcode', used+'code')
  .replace('$cat', cat)
  .split('$prefix').join(used)
    await client.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })
  }
}
