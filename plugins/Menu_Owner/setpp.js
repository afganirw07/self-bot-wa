const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Mengubah foto profil bot tanpa crop dan tanpa konversi',
  prefix: true,
  owner: true,

  run: async (conn, message, { chatInfo, prefix, commandText }) => {
    const { chatId } = chatInfo;
    try {
      const mtype = Object.keys(message.message || {})[0];

      let mediaMessage;
      if (mtype === "imageMessage") {
        mediaMessage = message.message.imageMessage;
      } else if (
        mtype === "extendedTextMessage" &&
        message.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage
      ) {
        mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
      }

      if (!mediaMessage) {
        return conn.sendMessage(chatId, {
          text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar dengan caption atau reply gambar dengan perintah:\n\`${prefix}${commandText}\``
        }, { quoted: message });
      }

      const stream = await downloadContentFromMessage(mediaMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Langsung update profile picture pakai buffer (tanpa upload ke EZGIF)
      await conn.updateProfilePicture(conn.user.id, { buffer });

      await conn.sendMessage(chatId, {
        text: "✅ Foto profil bot berhasil diperbarui tanpa crop!"
      }, { quoted: message });

    } catch (error) {
      console.error("❌ Error saat setpp:", error);
      await conn.sendMessage(chatId, {
        text: "❌ Terjadi kesalahan saat memperbarui foto profil bot."
      }, { quoted: message });
    }
  }
};
