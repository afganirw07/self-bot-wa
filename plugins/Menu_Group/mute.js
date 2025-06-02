module.exports = {
  name: 'mute',
  command: ['mute'],
  tags: 'Group Menu',
  desc: 'Aktifkan atau nonaktifkan mode mute grup',
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
        return conn.sendMessage(chatId, { text: '❗ Perintah ini hanya bisa digunakan di grup.' }, { quoted: message });
      }

      const normalizedSenderId = senderId.replace(/:\d+@/, '@');
      const groupMetadata = await conn.groupMetadata(chatId);
      const groupName = groupMetadata?.subject || `Group_${chatId}`;

      const db = readDB();
      const groupData = Object.values(db.Grup).find((g) => g.Id === chatId);

      if (!groupData) {
        db.Grup[groupName] = {
          Id: chatId,
          mute: false,
          Welcome: { welcome: false, welcomeText: '' },
          autoai: false,
          chat: 0,
        };
        saveDB(db);
      }

      const currentGroup = Object.values(db.Grup).find((g) => g.Id === chatId);

      const { userAdmin } = await stGrup(conn, chatId, senderId);

      if (!userAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
      }

      const action = args[0]?.toLowerCase();

      if (action === 'on') {
        if (currentGroup.mute) {
          return conn.sendMessage(chatId, { text: '⚠️ Mode mute sudah aktif di grup ini.' }, { quoted: message });
        }
        currentGroup.mute = true;
        saveDB(db);
        return conn.sendMessage(chatId, {
          text: '✅ Mode mute berhasil diaktifkan. Hanya admin yang dapat menggunakan bot.',
        }, { quoted: message });
      }

      if (action === 'off') {
        if (!currentGroup.mute) {
          return conn.sendMessage(chatId, { text: '⚠️ Mode mute tidak aktif di grup ini.' }, { quoted: message });
        }
        currentGroup.mute = false;
        saveDB(db);
        return conn.sendMessage(chatId, {
          text: '✅ Mode mute berhasil dinonaktifkan. Semua member dapat menggunakan bot.',
        }, { quoted: message });
      }

      conn.sendMessage(chatId, {
        text: `❗ Penggunaan yang benar:\n${prefix}${commandText} on - Aktifkan mode mute\n${prefix}${commandText} off - Nonaktifkan mode mute`,
      }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin mute.js:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `❗ Terjadi kesalahan saat menjalankan perintah.`,
      }, { quoted: message });
    }
  },
};