
import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../core/commands.js';
import db from '#db';
import '../../settings.js';

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s')? text.slice(0, -1) : text;
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ sock, msg, args, usedPrefix, command }) => {
    try {
      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
      const tempo = moment.tz('America/Caracas').format('hh:mm A');

      const botIdNumber = (sock?.user?.id || '').split(':')[0];
      const botId = botIdNumber + '@s.whatsapp.net';

      const botSettings = (typeof db?.getSettings === 'function')
      ? db.getSettings(botId)
        : (global.db?.data?.settings?.[botId] || {});

      const botname = botSettings.botname || '';
      const namebot = botSettings.namebot || '';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const canalId = botSettings.id || '';
      const canalName = botSettings.nameid || '';
      const link = botSettings.link || global.links?.channel || global.links?.api || '';

      const version = global.version || botSettings.version || '1.0';

      const isPremiumBot = fs.existsSync(`./Sessions/Prems/${botIdNumber}`);
      const isModBot = fs.existsSync(`./Sessions/Mods/${botIdNumber}`);
      const isOficialBot = botId === (global.sock?.user?.id || '').split(':')[0] + '@s.whatsapp.net';
      const botType = isOficialBot
      ? 'Principal'
        : isPremiumBot
        ? 'Premium'
          : isModBot
          ? 'Mod'
            : 'SubBot';

      const users = Object.keys(global.db?.data?.users || {}).length;
      const device = getDevice(msg.key.id);

      const user = (typeof db?.getUser === 'function')
      ? db.getUser(msg.sender)
        : (global.db?.data?.users?.[msg.sender] || {});
      const sender = user?.name || msg.pushName || 'Usuario';

      const time = sock.uptime? formatearMs(Date.now() - sock.uptime) : "Desconocido";

      const alias = {
        anime: ['anime', 'reacciones'],
        downloads: ['downloads', 'descargas'],
        economia: ['economia', 'economy', 'eco'],
        gacha: ['gacha'],
        grupo: ['grupo', 'group'],
        nsfw: ['nsfw', '+18'],
        profile: ['profile', 'perfil'],
        sockets: ['sockets', 'bots'],
        stickers: ['stickers', 'sticker'],
        utils: ['utils', 'utilidades', 'herramientas']
      };

      const input = normalize(args[0] || '');
      const cat = Object.keys(alias).find(k => alias[k].map(normalize).includes(input));
      const category = `${cat? ` para \`${cat}\`` : '. *(˶ᵔ ᵕ ᵔ˶)*'}`;

      if (args[0] &&!cat) {
        return msg.reply(`《✧》 La categoria *${args[0]}* no existe, las categorias disponibles son: *${Object.keys(alias).join(', ')}*.\n> Para ver la lista completa escribe *${usedPrefix}menu*\n> Para ver los comandos de una categoría escribe *${usedPrefix}menu [categoría]*\n> Ejemplo: *${usedPrefix}menu anime*`);
      }

      const sections = menuObject;
      const content = cat? String(sections[cat] || '') : Object.values(sections).map(s => String(s || '')).join('\n\n');
      let menu = bodyMenu? String(bodyMenu || '') + '\n\n' + content : content;

      const replacements = {
        $owner: owner? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))? (global.db?.data?.users?.[owner]?.name || owner.split('@')[0]) : owner) : '@亗𝙽𝚎𝚝𝚑𝚎𝚛𝙻𝚘𝚛𝚍亗',
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tempo: tempo,
        $users: users.toLocaleString(),
        $link: link,
        $cat: category,
        $sender: sender,
        $botname: botname,
        $namebot: namebot,
        $prefix: usedPrefix,
        $uptime: time,
        $versionbot: version,
        $version: version,
        $dev: global.dev || ''
      };

      const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

      for (const key of sortedKeys) {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), replacements[key]);
      }

      const isVideo = banner.includes('.mp4') || banner.includes('.webm');

      const contextOptions = {
        mentionedJid: [msg.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '',
          newsletterName: canalName
        }
      };

      if (banner && isVideo) {
        await sock.sendMessage(msg.chat, {
          video: { url: banner },
          gifPlayback: true,
          caption: menu,
          contextInfo: contextOptions
        }, { quoted: msg });
      } else if (banner) {
        await sock.sendMessage(msg.chat, {
          image: { url: banner },
          caption: menu,
          contextInfo: contextOptions
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.chat, {
          text: menu,
          contextInfo: contextOptions
        }, { quoted: msg });
      }

    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`].filter(Boolean).join(" ");
               }
