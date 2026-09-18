import os from 'os'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

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
  desc: 'Status estilo Elaina adaptado a Toki',

  run: async (client, m) => {
    const start = Date.now()
    const userTag = m.pushName || m.sender.split('@')[0]

    const sent = await client.sendMessage(m.chat, {
      text: `⌗°娲°₊\n\`Usuario:\` *${userTag}*\n─────────────────\n❀ *Calculando ping…*\n─────────────────`
    }, { quoted: m })

    let gitStatus = ""
    try {
      await execPromise('git fetch origin main').catch(()=>{})
      const { stdout: local } = await execPromise('git rev-parse HEAD')
      const { stdout: remote } = await execPromise('git rev-parse origin/main')
      if (local.trim()!== remote.trim()) {
        const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main')
        const fileList = filesChanged.trim().split('\n').filter(f=>f)
        const count = fileList.length
        const listFormatted = fileList.map(f=>`- ${f}`).join('\n')
        gitStatus = `\n─────────────────\n*¡Actualización disponible!*\n✎ \`GitHub:\` ${count} archivos.\n─────────────────\n\`\`\`\n${listFormatted}\n\`\`\``
      }
    } catch {
      gitStatus = `\n\`GitHub:\` Error en la consulta.`
    }

    const latency = Date.now() - start
    const up = process.uptime()
    const h = Math.floor(up / 3600)
    const min = Math.floor((up % 3600) / 60)
    const s = Math.floor(up % 60)
    const uptimeStr = `[ ${h}h ${min}m ${s}s ]`
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const usedRom = (getFolderSize(process.cwd()) / 1024 / 1024).toFixed(2)

    let txt = `⌗°娲°₊\n\`Usuario:\` *${userTag}*\n`
    txt += `─────────────────\n❀ \`Ping:\` ${latency} ms\n─────────────────\n`
    txt += `*ⴵ* \`Uptime:\` ${uptimeStr}\n`
    txt += `─────────────────\n`
    txt += `*ⴵ* \`Último en reiniciar:\` Toki-Bot\n`
    txt += `ꕥ \`RAM usada:\` ${ram} MB\n`
    txt += `ꕥ \`Almac. usado:\` ${usedRom} MB${gitStatus}\n─────────────────`

    await client.sendMessage(m.chat, { text: txt.trim(), edit: sent.key })
  }
                           }
