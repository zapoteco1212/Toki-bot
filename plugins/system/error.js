
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export default {
  command: ['error', 'checksyntax', 'debug'],
  category: 'system',
  isOwner: true,
  run: async ({sock, msg}) => {
    const client = sock
    const m = msg
    const commandsDir = path.join(process.cwd(), 'cmds')

    if (!existsSync(commandsDir)) {
      return m.reply('❌ No se encontró la carpeta de comandos.')
    }

    const { key } = await client.sendMessage(m.chat, { text: 'Buscando errores...' })

    const getFilesRecursively = async (dir) => {
      let results = []
      const list = await fs.readdir(dir, { withFileTypes: true })

      for (const file of list) {
        const filePath = path.join(dir, file.name)
        if (file.isDirectory()) {
          results = results.concat(await getFilesRecursively(filePath))
        } else if (file.name.endsWith('.js')) {
          results.push(filePath)
        }
      }
      return results
    }

    try {
      const allFiles = await getFilesRecursively(commandsDir)
      let errorsFound = []

      for (const filePath of allFiles) {
        const fileName = path.relative(process.cwd(), filePath)

        const fileUrl = pathToFileURL(filePath).href

        try {
          await import(`${fileUrl}?t=${Date.now()}`)
        } catch (err) {
          if (err instanceof SyntaxError) {
            errorsFound.push({
              file: fileName,
              message: err.message,
              stack: err.stack
            })
          }
        }
      }

      if (errorsFound.length === 0) {
        return await client.sendMessage(m.chat, {
          text: `*Análisis completo*\n\nNingún error de sintaxis detectado en los *${allFiles.length}* archivos analizados.`,
          edit: key
        })
      }

      let reportMsg = `*ERRORES DE SINTAXIS DETECTADOS (${errorsFound.length})*\n\n`

      errorsFound.slice(0, 5).forEach((err, i) => {
        reportMsg += `*${i + 1}.* \`${err.file}\`\n> ❌ _${err.message}_\n`
        reportMsg += `—`.repeat(15) + `\n`
      })

      if (errorsFound.length > 5) {
        reportMsg += `\n... y ${errorsFound.length - 5} más detallados en el archivo adjunto.`
      }

      await client.sendMessage(m.chat, { text: reportMsg, edit: key })

      let fullTxt = `REPORTE DE ERRORES DE SINTAXIS REALES\n${'='.repeat(45)}\n\n`
      errorsFound.forEach((err, i) => {
        fullTxt += `[${i + 1}] ARCHIVO: ${err.file}\n${err.stack}\n\n${'-'.repeat(40)}\n`
      })

      await client.sendMessage(m.chat, {
        document: Buffer.from(fullTxt),
        fileName: `syntax_errors_${Date.now()}.txt`,
        mimetype: 'text/plain'
      }, { quoted: m })

    } catch (globalErr) {
      console.error(globalErr)
      await client.sendMessage(m.chat, { text: `❌ Ocurrió un error interno al escanear: ${globalErr.message}`, edit: key })
    }
  }
      }
