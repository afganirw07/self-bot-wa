module.exports = {
  name: 'delete',
  command: ['d', 'del'],
  tags: 'Group Menu',
  desc: 'Menghapus pesan pengguna di group',
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
      if (!isGroup) {
        return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: message });
      }

      const contextInfo = message.message?.extendedTextMessage?.contextInfo;
      const quotedMessage = contextInfo?.quotedMessage;
      const quotedKey = contextInfo?.stanzaId;
      const quotedSender = contextInfo?.participant;

      if (!quotedMessage || !quotedKey || !quotedSender) {
        return conn.sendMessage(chatId, { text: "❌ Harap kutip pesan yang ingin dihapus!" }, { quoted: message });
      }

      const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isQuotedFromBot = quotedSender === botId;

      const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

      if (!isQuotedFromBot && !userAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan admin dan hanya bisa menghapus pesan dari bot.' }, { quoted: message });
      }

      if (!isQuotedFromBot && !botAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Bot bukan admin, tidak bisa menghapus pesan pengguna lain.' }, { quoted: message });
      }

      await conn.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: isQuotedFromBot,
          id: quotedKey,
          ...(isQuotedFromBot ? {} : { participant: quotedSender })
        }
      });

    } catch (error) {
      console.error('Delete command error:', error);
      conn.sendMessage(message.key.remoteJid, { text: "⚠️ Gagal menghapus pesan." }, { quoted: message });
    }
  }
};