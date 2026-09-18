
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
 command: ['clear'],
 category: 'mod',
 isOwner: true,
 run: async (client, m) => {
  try {
   const botDirs = [
    { label: 'Subbot', path: path.resolve(dirname, '../../Sessions/Subs') },
    { label: 'Owner', path: path.resolve(dirname, '../../Sessions/Owner') },
    { label: 'Prems', path: path.resolve(dirname, '../../Sessions/Prems') }
   ]

   let totalArchivos = 0
   let totalCarpetasProcesadas = 0
   let details = []

   for (const { label, path: baseDir } of botDirs) {
    if (!fs.existsSync(baseDir)) continue

    const subDirs = fs.readdirSync(baseDir).filter(dir => {
     const fullPath = path.join(baseDir, dir)
     return fs.statSync(fullPath).isDirectory()
    })

    for (const subDir of subDirs) {
     const subPath = path.join(baseDir, subDir)
     const files = fs.readdirSync(subPath)

     let eliminated = 0
     let carpetaModificada = false

     for (const file of files) {
      if (file !== 'creds.json') {
       const filePath = path.join(subPath, file)
       try {
        await fs.promises.rm(filePath, { recursive: true, force: true })
        eliminated++
        totalArchivos++
        carpetaModificada = true
       } catch (e) {
       }
      }
     }

     if (carpetaModificada) {
      totalCarpetasProcesadas++
      details.push(`[${label}] *${subDir}*: ${eliminated} archivos`)
     }
    }
   }

   let msg = `《✧》 *LIMPIEZA GENERAL COMPLETADA*\n\n`
   msg += `*Total carpetas limpiadas:* ${totalCarpetasProcesadas}\n`
   msg += `*Total archivos eliminados:* ${totalArchivos}\n`

   if (details.length > 0) {
    msg += `\n*Detalles por sesión:*\n${details.join('\n')}`
   } else {
    msg += `\n_No se encontraron archivos para limpiar._`
   }

   await m.reply(msg)
  } catch (err) {
   console.error(err)
   await m.reply('✧ Error crítico durante la limpieza')
  }
 }
};
