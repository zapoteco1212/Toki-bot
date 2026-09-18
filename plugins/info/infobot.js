
import os from 'os';

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const dDisplay = d > 0? d + (d === 1? " día, " : " días, ") : ""
  const hDisplay = h > 0? h + (h === 1? " hora, " : " horas, ") : ""
  const mDisplay = m > 0? m + (m === 1? " minuto, " : " minutos, ") : ""
  const sDisplay = s > 0? s + (s === 1? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
  command: ['infobot', 'infosocket', 'botinfo'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const botIdNumber = (client?.user?.id || '').split(':')[0]
      const botId = botIdNumber? `${botIdNumber}@s.whatsapp.net` : ''
      const mainBotIdNumber = (global.client?.user?.id || '').split(':')[0]
      const isOficialBot = botId === (mainBotIdNumber? `${mainBotIdNumber}@s.whatsapp.net` : '')

      const botSettings = global.db.data.settings[botId] || {}
      const botname = botSettings.botname || 'Bot'
      const namebot = botSettings.namebot || 'Bot'
      const monedas = botSettings.currency || 'Monedas'
      const banner = botSettings.banner || ''
      const prefijo = botSettings.prefix
      const owner = botSettings.owner || ''
      const canalId = botSettings.id || ''
      const canalName = botSettings.nameid || ''
      const link = botSettings.link || ''

      let desar = 'Oculto'
      if (owner &&!isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
        const userData = global.db.data.users[owner]
        desar = userData?.genre || 'Oculto'
      }

      const platform = os.type()
      const now = new Date()
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const nodeVersion = process.version
      const sistemaUptime = rTime(os.uptime())
      const uptime = process.uptime()
      const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000)

      const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/^./, str => str.toUpperCase())

      const botType = isOficialBot? 'Principal/Owner' : 'Sub Bot'

      const message = `✐ Información del bot *${botname}!*

✿ *Nombre Corto ›* ${namebot}
✿ *Nombre Largo ›* ${botname}
✦ *Moneda ›* ${monedas}
✦ *Prefijo${Array.isArray(prefijo) && prefijo.length > 1? 's' : ''} ›* ${prefijo === true? '`sin prefijos`' : (Array.isArray(prefijo)? prefijo : [prefijo || '/']).map(p => `\`${p}\``).join(', ')}

❒ *Tipo ›* ${botType}
❒ *Plataforma ›* ${platform}
❒ *NodeJS ›* ${nodeVersion}
❒ *Activo desde ›* ${formattedUptimeDate}
❒ *Sistema Activo ›* ${sistemaUptime}
❒ *${desar === 'Hombre'? 'Dueño' : desar === 'Mujer'? 'Dueña' : 'Dueño(a)'} ›* ${owner? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))? `@${owner.split('@')[0]}` : owner) : "Oculto por privacidad"}

> \`Enlace:\` ${link}`.trim()

      const isVideo = banner && (banner.includes('.mp4') || banner.includes('.webm'));

      const contextOptions = {
        mentionedJid: [owner, m.sender].filter(Boolean),
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '',
          newsletterName: canalName
        }
      };

      if (banner) {
        const mediaMsg = await client.sendMessage(m.chat, isVideo? { video: { url: banner }, gifPlayback: true } : { image: { url: banner } }, { quoted: m });
        await client.sendMessage(m.chat, { text: message, contextInfo: contextOptions }, { quoted: mediaMsg });
      } else {
        await client.sendMessage(m.chat, { text: message, contextInfo: contextOptions }, { quoted: m });
      }

    } catch (e) {
      return m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
};
