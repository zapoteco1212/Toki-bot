import os from 'os'
import fs from 'fs'
import path from 'path'

const getFolderSize = (dirPath) => {
  let size = 0
  try {
    const files = fs.readdirSync(dirPath)
    for (let f of files) {
      if (['node_modules','.git','.cache'].includes(f)) continue
      const fp = path.join(dirPath, f)
      const stat = fs.statSync(fp)
      if (stat.isFile()) size += stat.size
      else if (stat.isDirectory()) size += getFolderSize(fp)
    }
  } catch { return 0 }
  return size
}

export default {
  command: ['status','st','estado','p2'],
  help: ['status'],
  tags: ['info'],
  desc: 'Ver el estado del Bot.',

  run: async (client, m) => {
    const start = Date.now()
    const key = await client.sendMessage(m.chat, { text: '✿ *Calculando status...* ✿' }, { quoted: m })

    const latency = Date.now() - start
    const up = process.uptime()
    const h = Math.floor(up / 3600)
    const min = Math.floor((up % 3600) / 60)
    const s = Math.floor(up % 60)

    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
    const usedRom = (getFolderSize(process.cwd()) / 1024 / 1024).toFixed(2)
    const cpu = os.cpus()[0]?.model || 'Unknown'
    const platform = `${os.type()} ${os.release()} ${os.arch()}`

    let txt = `> *Status - Toki-Bot* ✿\n\n`
    txt += `⌒࣪᷼⏜͡ ۪ ࿚ꨪᰰ࿙ ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ ࿚ꨪᰰ࿙ ۪ ͡⏜ׄ᷼⌒\n\n`
    txt += `: ̗̀❖ *ᴘɪɴɢ ::* ${latency}ms\n`
    txt += `: ̗̀❖ *ᴜᴘᴛɪᴍᴇ ::* ${h}h ${min}m ${s}s\n`
    txt += `: ̗̀❖ *ᴘʟᴀᴛғᴏʀᴍ ::* ${platform}\n`
    txt += `: ̗̀❖ *ᴄᴘᴜ ::* ${cpu.slice(0, 35)}\n`
    txt += `: ̗̀❖ *ʀᴀᴍ ::* ${ram} MB / ${totalMem} GB\n`
    txt += `: ̗̀❖ *ʀᴀᴍ ʟɪʙʀᴇ ::* ${freeMem} GB\n`
    txt += `: ̗̀❖ *ᴀʟᴍᴀᴄᴇɴ ::* ${usedRom} MB\n`
    txt += `: ̗̀❖ *ɴᴏᴅᴇ ::* ${process.version}\n\n`
    txt += `⌒࣪᷼⏜͡ ۪ ࿚ꨪᰰ࿙ ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ ࿚ꨪᰰ࿙ ۪ ͡⏜ׄ᷼⌒\n\n`
    txt += `> *Toki-Bot ✿ Activo*`

    await client.sendMessage(m.chat, { text: txt, edit: key.key })
  }
            }
