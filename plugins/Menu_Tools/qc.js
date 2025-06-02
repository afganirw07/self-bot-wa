const { generateQuotly, convertToWebp, sendImageAsSticker } = require('../../toolkit/exif.js');
const { uploadImage } = require('../../toolkit/scrape/uploadImage.js');
const { webp2png } = require('../../toolkit/scrape/webp2mp4.js');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'qc',
  command: ['qc', 'quoted', 'quotly'],
  tags: 'Tools Menu',
  desc: 'Membuat quoted stiker',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, pushName } = chatInfo;

    if (!args[0]) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}qc pink | Halo dunia` });
    if (textMessage.length > 100) return conn.sendMessage(chatId, { text: "Maksimal 100 karakter!" });

    let text = args.join(" ");
    let color = '';
    let quotedText = '';
    let quotedName = '';

    if (text.includes("|")) {
      let [clr, ...rest] = text.split("|");
      color = clr.trim().toLowerCase();
      text = rest.join("|").trim();
    }

    if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = message.message.extendedTextMessage.contextInfo;
      const quotedMessage = quoted.quotedMessage;
      const quotedType = Object.keys(quotedMessage)[0];

      if (quotedType === "conversation" || quotedType === "extendedTextMessage") {
        quotedText = quotedMessage[quotedType].text || '';
        quotedName = await conn.getName(quoted.participant);
        text = `${quotedName}: ${quotedText}\n\n${pushName || 'User'}: ${text}`;
      } else if (quotedType === "stickerMessage" || quotedType === "imageMessage") {
        try {
          let img = await downloadMediaMessage(quotedMessage);
          let up = quotedType === "stickerMessage" ? await webp2png(img) : await uploadImage(img);
          text = `${pushName || 'User'}:\n${text}\n[Media: ${up}]`;
        } catch (e) {
          console.error('Error processing media:', e);
        }
      }
    }

    conn.sendMessage(chatId, { react: { text: "🕛", key: message.key } });

    try {
      const buffer = await generateQuotly(text, pushName || 'User', color);
      const webpBuffer = await convertToWebp(buffer);
      await sendImageAsSticker(conn, chatId, webpBuffer, message);
    } catch (error) {
      console.error('Error in quoted sticker creation:', error);
      conn.sendMessage(chatId, { text: "Gagal membuat kutipan." });
    }
  },
};