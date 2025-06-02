const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeExifImg, writeExifVid } = require('../../toolkit/exif.js');

module.exports = {
  name: 'stiker',
  command: ['s', 'stiker', 'sticker'],
  tags: 'Tools Menu',
  desc: 'Membuat sticker',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage = quotedMessage?.imageMessage || message.message?.imageMessage;
      const isVideo = quotedMessage?.videoMessage || message.message?.videoMessage;

      if (!isImage && !isVideo) {
        return conn.sendMessage(
          message.key.remoteJid,
          {
            text: `Balas gambar/video dengan caption *${prefix}s*, *${prefix}stiker*, atau *${prefix}sticker* ` +
                  `atau kirim langsung media dengan caption yang sama!`,
          },
          { quoted: message }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage || message.message }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal mengunduh media! ${error.message}` },
          { quoted: message }
        );
      }

      const metadata = {
        packname: footer,
        author: message.pushName
      };

      let stickerPath;
      try {
        stickerPath = isImage
          ? await writeExifImg(media, metadata)
          : await writeExifVid(media, metadata);

        if (!stickerPath) throw new Error('Gagal membuat stiker!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal membuat stiker! ${error.message}` },
          { quoted: message }
        );
      }

      const stickerBuffer = require('fs').readFileSync(stickerPath);
      await conn.sendMessage(message.key.remoteJid, { sticker: stickerBuffer }, { quoted: message });
    } catch (error) {
      conn.sendMessage(
        message.key.remoteJid,
        { text: `❌ Terjadi kesalahan saat membuat stiker, coba lagi! ${error.message}` },
        { quoted: message }
      );
      console.error('❌ Error pada plugin stiker:', error);
    }
  },
};