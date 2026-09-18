export default {
  command: ['ping', 'p', 'speed'],
  help: ['ping'],
  tags: ['info'],
  desc: 'Muestra la velocidad del Bot.',

  run: async (client, m) => {
    const start = Date.now()
    const msg = await client.sendMessage(m.chat, { text: '✿ *Calculando...* ✿' }, { quoted: m })
    
    const end = Date.now() - start
    const uptime = Math.floor(process.uptime())
    const h = Math.floor(uptime / 3600)
    const min = Math.floor((uptime % 3600) / 60)
    const s = uptime % 60

    let txt = `> *¡Pong!* 🏓\n\n`
    txt += `⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒\n\n`
    txt += `: ̗̀❖ *ᴠᴇʟᴏᴄɪᴅᴀᴅ ::* ${end}ms\n`
    txt += `: ̗̀❖ *ᴀᴄᴛɪᴠᴏ ::* ${h}h ${min}m ${s}s\n`
    txt += `: ̗̀❖ *ʙᴏᴛ ::* Toki-Bot ✿\n\n`
    txt += `⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒`

    await client.sendMessage(m.chat, { text: txt, edit: msg.key })
  }
}
