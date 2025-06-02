const fs = require('fs');
const path = require('path');
const os = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'setppgc',
  command: ['setppgc', 'setfotogc'],
  tags: 'Group Menu',
  desc: 'Mengatur foto profil group',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    }

    if (!botAdmin) {
    return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });
    }

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.imageMessage) {
      return conn.sendMessage(chatId, { text: '⚠️ Balas gambar dengan perintah *setppgc* untuk mengubah foto grup.' }, { quoted: message });
    }

    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        throw new Error('Gagal mengunduh gambar.');
      }

      const tempFilePath = path.join(os.tmpdir(), `group-profile-${chatId}.jpg`);
      fs.writeFileSync(tempFilePath, buffer);

      await conn.updateProfilePicture(chatId, { url: tempFilePath });

      fs.unlinkSync(tempFilePath);

      conn.sendMessage(chatId, { text: '✅ Foto profil grup berhasil diperbarui!' }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengubah foto grup. Pastikan gambar yang dikirim tidak bermasalah.' }, { quoted: message });
    }
  }
};