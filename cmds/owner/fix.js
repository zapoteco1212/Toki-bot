import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const execPromise = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function reloadCommands(dir = path.join(__dirname, '..')) {
  const commandsMap = new Map()
  async function readCommands(folder) {
    const files = fs.readdirSync(folder)
    for (const file of files) {
      const fullPath = path.join(folder, file)
      if (fs.lstatSync(fullPath).isDirectory()) {
        await readCommands(fullPath)
      } else if (file.endsWith('.js')) {
        try {
          const { default: cmd } = await import(`file://${fullPath}?update=${Date.now()}`)
          if (cmd?.command) {
            cmd.command.forEach((c) => {
              commandsMap.set(c.toLowerCase(), cmd)
            })
          }
        } catch (err) {
          console.error(`Error recargando comando ${file}:`, err)
        }
      }
    }
  }
  await readCommands(dir)
  global.comandos = commandsMap
}

export default {
  command: ['fix'],
  isOwner: true,
  run: async (client, m) => {
    try {
      await client.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

      await execPromise('git config user.email "bot@host.com"')
      await execPromise('git config user.name "HostBot"')
      await execPromise('git fetch origin')

      const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD')
      const currentBranch = branch.trim()
      const { stdout: diffStatus } = await execPromise(`git diff --name-status HEAD..origin/${currentBranch}`).catch(() => ({ stdout: '' }))
      const { stdout: info } = await execPromise(`git log HEAD..origin/${currentBranch} --format="%an" -1`).catch(() => ({ stdout: 'Desconocido' }))

      const lines = diffStatus.trim().split('\n').filter(line => line.trim() !== '')
      const totalFiles = lines.length

      if (totalFiles > 0) {
        await execPromise(`git reset --hard origin/${currentBranch}`)

        await reloadCommands(path.join(__dirname, '..'))

        let changeList = lines.map(line => {
          const [status, ...fileParts] = line.split(/\s+/)
          const file = fileParts.join(' ')
          switch (status) {
            case 'A': return `+ ${file}`
            case 'M': return `• ${file}`
            case 'D': return `- ${file}`
            default: return `? ${file}`
          }
        }).slice(0, 20).join('\n')

        let msg = `❀ *Actualización exitosa*\n\n`
        msg += `亗 *Editor:* ${info.trim()}\n`
        msg += `✎ *Total Cambios:* ${totalFiles}\n\n`
        msg += `ꕥ *Detalles de archivos:*\n\`\`\`${changeList}${totalFiles > 20 ? '\n...entre otros.' : ''}\`\`\`\n\n`

        await client.sendMessage(m.chat, { text: msg }, { quoted: m })
      } else {
        await client.sendMessage(m.chat, { text: 'ꕥ *Estado:* El bot ya está en su última versión.' }, { quoted: m })
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      console.log(chalk.greenBright(`✅ rfix: Cambios aplicados y comandos recargados.`))

      if (global.db && global.db.write) await global.db.write()

    } catch (error) {
      console.error(error)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`*⚠️ ERROR EN FIX:* \n\n${error.message}`)
    }
  }
        }
