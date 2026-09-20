
import moment from "moment";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFolderSize = (dirPath) => {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) size += stats.size;
      else if (stats.isDirectory() && !['node_modules', '.git', '.cache'].includes(files[i])) {
        size += getFolderSize(filePath);
      }
    }
  } catch (e) { return 0; }
  return size;
};

export default {
  command: ["ping2", "p2"],
  isOwner: true,
  category: "info",
  run: async (client, m, args) => {
    const start = Date.now();
    const senderNumber = m.sender.split('@')[0];

    const isOwner = (global.owner || []).some(user => 
      (Array.isArray(user) ? user[0] : user).replace(/[^0-9]/g, '') === senderNumber.replace(/[^0-9]/g, '')
    );
    const isModeration = (global.mods || []).includes(senderNumber);
    const isMaintenance = (global.maintenanceUsers || []).includes(senderNumber);

    const version = global.version || "No definida"; 
    const internalVersion = global.internalVersion || "No definida";
    const userTag = m.pushName || senderNumber || "Usuario";

    const { key } = await client.sendMessage(
      m.chat,
      { text: `⌗°亗˚₊\n\`Usuario:\` *${userTag}*\n────────────────\n❀ *Calculando ping…*\n────────────────` },
      { quoted: m }
    );

    let gitStatus = "";
    if (isOwner) {
      try {
        await execPromise('git fetch origin main');
        const { stdout: local } = await execPromise('git rev-parse HEAD');
        const { stdout: remote } = await execPromise('git rev-parse origin/main');

        if (local.trim() !== remote.trim()) {
          const { stdout: filesChanged } = await execPromise('git diff --name-only HEAD..origin/main');
          const fileList = filesChanged.trim().split('\n').filter(f => f);
          const count = fileList.length;
          const listFormatted = fileList.map(file => `- ${file}`).join('\n');

          gitStatus = `\n────────────────\n*¡Actualización disponible!*\n✎ \GitHub: ${count} archivos.\n────────────────\n\`\`\`\n${listFormatted}\n\`\`\``;
        }
      } catch (e) {
        gitStatus = `\n\`GitHub:\` Error en la consulta.`;
      }
    }

    const latency = Date.now() - start;
    let msg = `⌗°亗°₊\n\`Usuario:\` *${userTag}*\n`;
    msg += `────────────────\n❀ \`Ping:\` ${latency} ms\n────────────────\n`;

    if (isOwner || isModeration || isMaintenance) {
      const up = process.uptime();
      const h = Math.floor(up / 3600);
      const min = Math.floor((up % 3600) / 60);
      const s = Math.floor(up % 60);
      const uptimeStr = `[ ${h}h ${min}m ${s}s ]`;
      const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const usedRom = (getFolderSize(process.cwd()) / 1024 / 1024).toFixed(2);

      if (isOwner) {
        msg += `*ⴵ* \`Uptime:\` ${uptimeStr}\n✥ \`RAM usada:\` ${ram} MB\nꕥ \`ROM usada:\` ${usedRom} MB${gitStatus}\n────────────────\n> ✎ *Versión Interna: ${internalVersion}*\n`;
      } else if (isModeration) {
        msg += `*ⴵ* \`Uptime:\` ${uptimeStr}\n✥ \`RAM usada:\` ${ram} MB\nꕥ \`ROM usada:\` ${usedRom} MB\n────────────────\n> Interfaz *_Moderador_*\n`;
      } else if (isMaintenance) {
        msg += `*ⴵ* \`Uptime:\` ${uptimeStr}\n────────────────\n> Interfaz *_Tester_*\n> ✎ *Versión Interna: ${internalVersion}*\n`;
      }
    }

    msg += `> ¥`;

    await client.sendMessage(m.chat, { text: msg.trim(), edit: key, mentions: [m.sender] });
  },
};
