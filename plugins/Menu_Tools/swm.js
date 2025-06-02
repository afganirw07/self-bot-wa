const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeExifImg } = require('../../toolkit/exif.js');

module.exports = {
  name: 'Sticker Watermark',
  command: ['swm', 'swn'],
  tags: 'Tools Menu',
  desc: 'Mengubah watermark stiker',
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
      const inputText = args.join(' ').trim();
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quotedMessage?.stickerMessage;

      if (!stickerMessage || !inputText) {
        return conn.sendMessage(
          message.key.remoteJid,
          {
            text:
              'Gunakan:\n' +
              '- *swm <author> | <pack>* → Mengubah author & pack\n' +
              '- *swn <author>* → Hanya mengubah author\n' +
              'Harus reply ke stiker!',
          },
          { quoted: message }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal mengunduh stiker! ${error.message}` },
          { quoted: message }
        );
      }

      let author = 'Unknown';
      let pack = footer;

      if (inputText.includes('|')) {
        const [a, p] = inputText.split('|').map(t => t.trim());
        author = a || author;
        pack = p || pack;
      } else {
        author = inputText;
      }

      let stickerPath;
      try {
        stickerPath = await writeExifImg(media, { author, packname: pack }, true);
        if (!stickerPath) throw new Error('Exif tidak berhasil ditulis!');
        const stickerBuffer = require('fs').readFileSync(stickerPath);

        await conn.sendMessage(message.key.remoteJid, { sticker: stickerBuffer }, { quoted: message });
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal membuat stiker! ${error.message}` },
          { quoted: message }
        );
      }
    } catch (error) {
      conn.sendMessage(
        message.key.remoteJid,
        { text: `❌ Terjadi kesalahan! ${error.message}` },
        { quoted: message }
      );
      console.error('❌ Error pada plugin swm/swn:', error);
    }
  },
};