module.exports = {
  name: 'unreg',
  command: ['unreg', 'hapusakun'],
  tags: 'Info Menu',
  desc: 'Menghapus akun dari database bot.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId } = chatInfo;

      if (args.length < 1) {
        return conn.sendMessage(chatId, {
          text: `📌 Cara unreg:\n\n*${prefix}${commandText} <noId>*\n\nContoh:\n*${prefix}${commandText} bcdfghx72*\n_.me untuk melihat Nomor Id_`,
        }, { quoted: message });
      }

      const noIdInput = args[0];
      const db = readDB();

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database pengguna kosong!' }, { quoted: message });
      }

      let foundUser = null;

      for (const [nama, data] of Object.entries(db.Private)) {
        if (data.noId === noIdInput && data.Nomor === senderId) {
          foundUser = nama;
          break;
        }
      }

      if (!foundUser) {
        return conn.sendMessage(chatId, {
          text: `❌ NoId *${noIdInput}* tidak ditemukan atau tidak sesuai dengan akun Anda!`,
        }, { quoted: message });
      }

      delete db.Private[foundUser];
      saveDB(db);

      conn.sendMessage(chatId, {
        text: `✅ Akun dengan NoId *${noIdInput}* berhasil dihapus dari database.\nTerima kasih telah menggunakan bot ini!`,
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin unreg.js:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menghapus akun!' }, { quoted: message });
    }
  },
};