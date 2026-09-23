import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
const execAsync = promisify(exec)

export default {
  command: ['fix', 'actualizar', 'update', 'sync'],
  category: 'owner',
  run: async (client, m) => {
    if (!global.owner?.includes(m.sender.split('@')[0]) &&!m.fromMe) {
      return client.sendMessage(m.chat, { text: '❌ *Solo Owner*' }, { quoted: m })
    }

    const editor = m.pushName || 'Owner'
    let msg = await client.sendMessage(m.chat, { text: `╭─❀ *S I N C R O N I Z A N D O* ❀\n│ ⏳ Bajando actualización...\n╰─>` }, { quoted: m })

    try {
      
      await execAsync('git fetch origin && git reset --hard origin/main && git pull origin main --force').catch(e => { throw new Error('Git Error: ' + e.message) })

      let filesOutput = ''
      try {
        const { stdout } = await execAsync('git log -1 --name-only --pretty=format:')
        filesOutput = stdout
      } catch {}

  
      if (filesOutput.includes('package.json')) {
        await client.sendMessage(m.chat, { text: '📦 package.json detectado, instalando...', edit: msg.key }).catch(() => {})
        try {
          await execAsync('npm install --no-audit --no-fund')
        } catch (e) {
          console.log('npm install error:', e.message)
        }

        
        try {
          if (fs.existsSync('/data/data/com.termux')) {
            const home = process.env.HOME || '/data/data/com.termux/files/home'
            const libPath = './node_modules/@skidy89/libsignal-plugins'
            const compiledPath = `${home}/libsignal-plugins/target/release`

            if (fs.existsSync(compiledPath) && fs.existsSync(libPath)) {
              const files = fs.readdirSync(compiledPath)
              const soFile = files.find(f => f.endsWith('.so'))
              if (soFile) {
                const src = path.join(compiledPath, soFile)
                fs.copyFileSync(src, path.join(libPath, 'libsignal-plugins.android-arm64.node'))
                fs.copyFileSync(src, path.join(libPath, 'libsignal-plugins.linux-arm64-gnu.node'))
                console.log('[FIX] libsignal parcheado OK')
              }
            }
          }
        } catch (e) {
          console.log('[FIX] No se pudo parchar libsignal, no importa:', e.message)
        }
      }

      
      try {
        const { loadCommands } = await import(`../main.js?update=${Date.now()}`)
        if (loadCommands) await loadCommands()
      } catch (e) {
        console.log('loadCommands error:', e.message)
      }

      let archivos = filesOutput? filesOutput.trim().split('\n').filter(f => f.trim()) : []
      let total = archivos.length || 0
      let detalle = total > 0? archivos.slice(0, 10).map(f => `│ • \`${f.trim()}\``).join('\n') : '│ • `Fix menor`'
      if (total > 10) detalle += `\n│ • _... y ${total - 10} más_`

      let commit = 'Sin info'
      try {
        const { stdout } = await execAsync('git log -1 --pretty=format:"%h | %s"')
        commit = stdout.trim()
      } catch {}

      let texto = `╭─❀ *A C T U A L I Z A C I Ó N E X I T O S A* ❀
│
│ ✦ *Editor:* ${editor}
│ ✦ *Commit:* ${commit}
│ ✦ *Total:* ${total || 1} archivo(s)
│
│ ✦ *Detalles:*
${detalle}
│
╰─> *Bot sincronizado* ✅`

      await client.sendMessage(m.chat, { text: texto, edit: msg.key })

    } catch (e) {
      await client.sendMessage(m.chat, {
        text: `╭─❌ *ERROR EN UPDATE*\n│\n│ ${String(e.message).slice(0, 700)}\n╰─>`,
        edit: msg?.key
      }, { quoted: m })
      console.log(e)
    }
  }
                                       }
