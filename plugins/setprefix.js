import fs from 'fs'

const SETTINGS = './settings.json'
const loadSettings = () => {
  if(!fs.existsSync(SETTINGS)) fs.writeFileSync(SETTINGS, JSON.stringify({ prefix: ["."] }, null, 2))
  return JSON.parse(fs.readFileSync(SETTINGS))
}
const saveSettings = (s) => fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 2))

export default {
  command: ['setprefix', 'setbotprefix', 'prefix'],
  run: async (client, m, args) => {
    const settings = loadSettings()
    const defaultPrefix = [".", "#", "/", "!"]
    const value = args.join(' ').trim()

    if (!value) {
      const lista = Array.isArray(settings.prefix) && settings.prefix.length 
        ? settings.prefix.map(p=>`\`${p}\``).join(', ') 
        : '`sin prefijos`'
      return client.sendMessage(m.chat, { text:
`❀ Por favor, elige cualquiera de los siguientes métodos de prefijos.

> *○ Only-Prefix* » .setprefix *.*
> *○ Multi-Prefix* » .setprefix *!/.#*
> *○ No-Prefix* » .setprefix *noprefix*
> *○ Reset* » .setprefix *reset*

ꕥ Actualmente se está usando: ${lista}` }, { quoted: m })
    }

    if (value.toLowerCase() === 'reset') {
      settings.prefix = defaultPrefix
      saveSettings(settings)
      return client.sendMessage(m.chat, { text: `❀ Se han restaurado los prefijos predeterminados: *${defaultPrefix.join(' ')}*` }, { quoted: m })
    }

    if (value.toLowerCase() === 'noprefix') {
      settings.prefix = []
      saveSettings(settings)
      return client.sendMessage(m.chat, { text: `❀ Se cambio al modo sin prefijos correctamente\n> Ahora el bot responderá a comandos *sin prefijos*.` }, { quoted: m })
    }

    
    let lista = [...new Set(value.split(''))].filter(c => !/[a-zA-Z0-9\s]/.test(c))
    if (lista.length === 0) return client.sendMessage(m.chat, { text: `ꕥ No se detectaron prefijos válidos. Debes incluir al menos un símbolo o emoji.` }, { quoted: m })
    if (lista.length > 6) return client.sendMessage(m.chat, { text: `ꕥ Máximo 6 prefijos permitidos.` }, { quoted: m })

    settings.prefix = lista
    saveSettings(settings)

    return client.sendMessage(m.chat, { text: `❀ Se cambió el prefijo a *${lista.join(' ')}* correctamente.\n\n> Haz .fix y reinicia` }, { quoted: m })
  }
      }
