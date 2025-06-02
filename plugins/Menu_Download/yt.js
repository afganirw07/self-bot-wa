const { ytMp3, ytMp4 } = require('../../toolkit/scrape/youtube');

module.exports = {
  name: 'youtube',
  command: ['ytmp3', 'ytmp4'],
  tags: 'Download Menu',
  desc: 'Mendownload media dari YouTube',
  prefix: true,
  isPremium: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isPrem(module.exports, conn, message))) return;
      const text = args.join(' ').trim();
      if (!text) {
        return conn.sendMessage(chatId, {
          text: `Silakan masukkan link YouTube!\n\nContoh:\n${prefix}${commandText} https://youtu.be/rCYlIIf_1L0?si=fGJw_zjBVPCRlDXM`
        }, { quoted: message });
      }

      const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      if (!regex.test(text)) {
        return conn.sendMessage(chatId, { text: `Link YouTube tidak valid.` }, { quoted: message });
      }

      await conn.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

      if (commandText === 'ytmp3') {
        const result = await ytMp3(text);
        await conn.sendMessage(chatId, {
          audio: { url: result.url },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: message });
      } else if (commandText === 'ytmp4') {
        const result = await ytMp4(text, { quality: 'hd' });
        await conn.sendMessage(chatId, {
          video: { url: result.url },
          caption: result.title || 'Berikut videonya'
        }, { quoted: message });
      } else {
        await conn.sendMessage(chatId, { text: `Command tidak dikenali.` }, { quoted: message });
      }
    } catch (error) {
      console.error(error);
      await conn.sendMessage(message.key.remoteJid, { text: 'Aduh kak, error nih...' }, { quoted: message });
    }
  }
};