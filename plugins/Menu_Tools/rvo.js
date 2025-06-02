const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'rvo',
  command: ['rvo', 'readviewonce'],
  tags: 'Tools Menu',
  desc: 'Mengekstrak media sekali lihat.',
  prefix: true,
  isPremium: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, message))) return;

      const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg) {
        return conn.sendMessage(chatId, { text: 'Balas ke media (View Once atau biasa) yang mau diambil.' }, { quoted: message });
      }

      let viewOnce = 
        quotedMsg?.viewOnceMessageV2Extension?.message ||
        quotedMsg?.viewOnceMessageV2?.message ||
        quotedMsg?.viewOnceMessage?.message ||
        quotedMsg;

      let mediaType, mediaMessage;

      if (viewOnce?.imageMessage) {
        mediaType = 'image';
        mediaMessage = viewOnce.imageMessage;
      } else if (viewOnce?.videoMessage) {
        mediaType = 'video';
        mediaMessage = viewOnce.videoMessage;
      } else if (viewOnce?.audioMessage) {
        mediaType = 'audio';
        mediaMessage = viewOnce.audioMessage;
      } else {
        return conn.sendMessage(chatId, { text: 'Media tidak didukung untuk diekstrak.' }, { quoted: message });
      }

      try {
        const buffer = await downloadMediaMessage(
          { message: { [`${mediaType}Message`]: mediaMessage } },
          'buffer',
          {},
          { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
        );

        if (!buffer) {
          return conn.sendMessage(chatId, { text: 'Gagal mengunduh media.' }, { quoted: message });
        }

        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const filename = path.join(tempDir, `${Date.now()}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`);
        fs.writeFileSync(filename, buffer);

        const caption = mediaMessage.caption || '';

        await conn.sendMessage(chatId, {
          [mediaType]: { url: filename },
          caption: caption ? `*Pesan:* ${caption}` : 'Media berhasil diambil.',
        }, { quoted: message });
      } catch (error) {
        console.error('Error processing media:', error);
        conn.sendMessage(chatId, { 
          text: `Gagal memproses media: ${error.message || error}` 
        }, { quoted: message });
      }
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
};