const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const { Format } = require('../../toolkit/helper');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'stats',
  command: ['stats', 'info', 'st', 'ping', 'device'],
  tags: 'Info Menu',
  desc: 'Menampilkan status device dan statik bot',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const startTime = performance.now();
    try {
      const { chatId, senderId } = chatInfo;

      global.commandCount = (global.commandCount || 0) + 1;

      const thumbnail = global.thumbnail;

      const uptime = process.uptime();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const platform = os.platform();
      const architecture = os.arch();
      const botName = global.botName || 'Bot';
      const botFullName = global.botFullName || botName;
      const cpuInfo = os.cpus()[0]?.model || 'Tidak diketahui';

      let deviceUptimeStr = 'Tidak diketahui';
      try {
        const deviceUptime = os.uptime();
        const days = Math.floor(deviceUptime / 86400);
        const hrs = Math.floor((deviceUptime % 86400) / 3600);
        const mins = Math.floor((deviceUptime % 3600) / 60);
        deviceUptimeStr = `${days} hari ${hrs} jam ${mins} menit`;
      } catch (e) {
        console.error('❌ Gagal mendapatkan uptime device:', e.message);
      }

      let totalDisk = 'Tidak diketahui';
      let usedDisk = 'Tidak diketahui';
      let freeDisk = 'Tidak diketahui';
      try {
        const diskInfo = execSync('df -h /', { encoding: 'utf8' }).split('\n')[1].split(/\s+/);
        totalDisk = diskInfo[1];
        usedDisk = diskInfo[2];
        freeDisk = diskInfo[3];
      } catch (e) {
        console.error('❌ Gagal mendapatkan informasi penyimpanan:', e.message);
      }

      const db = global.readDB();

      let privateCmd = '-';
      let maxCmd = 0;

      if (db && db.Private) {
        for (const key in db.Private) {
          const user = db.Private[key];
          const nomor = user.Nomor;
          const cmd = user.cmd || 0;

          if (nomor === senderId) {
            privateCmd = cmd;
          }

          if (cmd > maxCmd) {
            maxCmd = cmd;
          }
        }
      }

      const endTime = performance.now();
      const responseTime = (endTime - startTime).toFixed(2);

      const statsMessage = `

Ini adalah status dari bot ${botName}

Stats Bot ${Obrack} ${botFullName} ${Cbrack}
┃
┣ ${btn} Bot Name: ${botName}
┣ ${btn} Time Server: ${Format.time()}
┣ ${btn} Uptime: ${Format.uptime(uptime)}
┖ ${btn} Respon: ${responseTime} ms

Stats Chat
┃
┣ ${btn} Private (cmd): ${privateCmd}
┖ ${btn} Total Cmd (terbesar): ${maxCmd}

Stats System
┃
┣ ${btn} Uptime Device: ${deviceUptimeStr}
┣ ${btn} Platform: ${platform} (${architecture})
┣ ${btn} Cpu: ${cpuInfo}
┣ ${btn} Ram: ${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(totalMemory / 1024 / 1024).toFixed(2)} MB
┖ ${btn} Storage: ${usedDisk} / ${totalDisk} (Free: ${freeDisk})
`.trim();

      const adReply = {
        text: statsMessage,
        contextInfo: {
          externalAdReply: {
            title: "Bot Stats",
            body: "Ini adalah statistik bot",
            thumbnailUrl: thumbnail,
            sourceUrl: "https://github.com/maoudabi0",
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true
          },
          forwardingScore: 19,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363310100263711@newsletter'
          }
        }
      };

      await conn.sendMessage(chatId, adReply, { quoted: message });

    } catch (err) {
      console.error('❌ Error pada plugin stats:', err.message);
    }
  }
};