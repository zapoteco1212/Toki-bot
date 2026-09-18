
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  isAdmin: true,
  run: async ({ sock, msg }) => {
    const client = sock;
    const m = msg;

    try {
      let maxSubsLimit = 0;
      try {
        const subsPath = ['Subs.js', 'subs.js']
         .map((file) => path.join(__dirname, file))
         .find((filePath) => fs.existsSync(filePath));

        if (subsPath) {
          const fileContent = fs.readFileSync(subsPath, 'utf-8');
          const match = fileContent.match(/MAX_CONNECTIONS\s*=\s*(\d+)/);
          if (match) maxSubsLimit = parseInt(match[1], 10);
        }
      } catch (err) {
        console.error('Error al leer MAX_CONNECTIONS desde subs.js:', err);
      }

      const MAX_LIMITS = {
        Sub: maxSubsLimit,
        Premium: 0
      };

      const botIdNumber = (client?.user?.id || '').split(':')[0].replace(/:\d+/, '');
      const botId = botIdNumber? `${botIdNumber}@s.whatsapp.net` : '';

      const botSettings = global.db?.data?.settings?.[botId] || {};
      const canalId = botSettings.id || '';
      const canalName = botSettings.nameid || '';

      const from = m.chat || m.key?.remoteJid;
      const groupMetadata = m.isGroup? await client.groupMetadata(from).catch(() => null) : null;

      const participantMap = new Map();
      if (groupMetadata?.participants) {
        for (const p of groupMetadata.participants) {
          const rawId = p.id || p.jid || '';
          const num = rawId.split('@')[0].split(':')[0];
          if (num) {
            participantMap.set(num, {
              jid: rawId.endsWith('@s.whatsapp.net')? rawId : `${num}@s.whatsapp.net`,
              lid: p.lid? `${p.lid.split('@')[0].split(':')[0]}@lid` : null
            });
          }
        }
      }

      const mainBotIdNumber = (global.sock?.user?.id || global.client?.user?.id || '').split(':')[0].replace(/:\d+/, '');
      const mainBotJid = mainBotIdNumber? `${mainBotIdNumber}@s.whatsapp.net` : '';

      const basePath = path.resolve('./Sessions');

      const getBotsFromFolder = (folderName) => {
        const folderPath = path.join(basePath, folderName);
        if (!fs.existsSync(folderPath)) return [];
        return fs.readdirSync(folderPath)
         .filter((dir) => fs.existsSync(path.join(folderPath, dir, 'creds.json')))
         .map((id) => id.replace(/\D/g, ''));
      };

      const subs = getBotsFromFolder('Subs');
      const mods = getBotsFromFolder('Mods');
      const prems = getBotsFromFolder('Prems');

      const categorizedBots = { Owner: [], Mod: [], Premium: [], Sub: [] };
      const mentionedJid = [];

      const formatBot = (number, label) => {
        const pInfo = participantMap.get(number);
        if (!pInfo) return null;

        if (pInfo.jid) mentionedJid.push(pInfo.jid);
        if (pInfo.lid) mentionedJid.push(pInfo.lid);

        const jid = `${number}@s.whatsapp.net`;
        const data = global.db?.data?.settings?.[jid] || {};
        const name = data.namebot || label;
        const handle = `@${number}`;
        const lidText = ``;

        return `- [${label} *${name}*] › ${handle}${lidText}`;
      };

      if (mainBotJid && global.db?.data?.settings?.[mainBotJid]) {
        const line = formatBot(mainBotIdNumber, 'Owner');
        if (line) categorizedBots.Owner.push(line);
      }

      mods.forEach((num) => {
        const line = formatBot(num, 'Mod');
        if (line) categorizedBots.Mod.push(line);
      });

      prems.forEach((num) => {
        const line = formatBot(num, 'Premium');
        if (line) categorizedBots.Premium.push(line);
      });

      subs.forEach((num) => {
        const line = formatBot(num, 'Sub');
        if (line) categorizedBots.Sub.push(line);
      });

      const totalCounts = {
        Owner: (mainBotJid && global.db?.data?.settings?.[mainBotJid])? 1 : 0,
        Mod: mods.length,
        Premium: prems.length,
        Sub: subs.length,
      };

      const totalBots = totalCounts.Owner + totalCounts.Mod + totalCounts.Premium + totalCounts.Sub;
      const totalInGroup = categorizedBots.Owner.length + categorizedBots.Mod.length + categorizedBots.Premium.length + categorizedBots.Sub.length;

      let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`;
      message += `❖ Principales › *${totalCounts.Owner + totalCounts.Mod}*\n`;
      message += `✰ Premiums › *${totalCounts.Premium} / ${MAX_LIMITS.Premium}*\n`;
      message += `✿ Subs › *${totalCounts.Sub} / ${MAX_LIMITS.Sub}*\n\n`;
      message += `➭ *Bots en el grupo ›* ${totalInGroup}\n\n`;

      for (const category of ['Owner', 'Mod', 'Premium', 'Sub']) {
        if (categorizedBots[category].length) {
          message += categorizedBots[category].join('\n') + '\n';
        }
      }

      const contextOptions = {
        mentionedJid: [m.sender,...mentionedJid],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '',
          newsletterName: canalName
        }
      };

      await client.sendMessage(m.chat, {
          text: message.trim(),
          contextInfo: contextOptions
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      const errText = `> ❌ Error inesperado.\n> [Error: *${e.message}*]`;
      if (m.reply) {
        await m.reply(errText);
      } else {
        await client.sendMessage(m.chat, { text: errText }, { quoted: m });
      }
    }
  },
};
