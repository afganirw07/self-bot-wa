module.exports = {
  name: 'welcome',
  command: ['welcome'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur welcome di grup',
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

      if (!isGroup)
        return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan di dalam grup!" }, { quoted: message });

      const db = readDB();
      const groupData = Object.values(db.Grup || {}).find(g => g.Id === chatId);
      if (!groupData)
        return conn.sendMessage(chatId, {
          text: "❌ Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar."
        }, { quoted: message });

      const { userAdmin } = await stGrup(conn, chatId, senderId);
      if (!userAdmin)
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });

      const sub = args[0]?.toLowerCase();

      groupData.gbFilter = groupData.gbFilter || {};
      groupData.gbFilter.Welcome = groupData.gbFilter.Welcome || { welcome: false, welcomeText: '' };

      if (sub === "on") {
        groupData.gbFilter.Welcome.welcome = true;
        saveDB(db);
        return conn.sendMessage(chatId, { text: "✅ Fitur welcome diaktifkan!" }, { quoted: message });

      } else if (sub === "off") {
        groupData.gbFilter.Welcome.welcome = false;
        saveDB(db);
        return conn.sendMessage(chatId, { text: "❌ Fitur welcome dinonaktifkan!" }, { quoted: message });

      } else if (sub === "set") {
        let welcomeText = textMessage.replace(`${prefix}welcome set`, "").trim();
        if (!welcomeText)
          return conn.sendMessage(chatId, {
            text: "⚠️ Gunakan perintah:\n.welcome set <teks selamat datang>"
          }, { quoted: message });

        groupData.gbFilter.Welcome.welcome = true;
        groupData.gbFilter.Welcome.welcomeText = welcomeText;
        saveDB(db);

        return conn.sendMessage(chatId, {
          text: `✅ Pesan selamat datang diperbarui:\n\n${welcomeText}`
        }, { quoted: message });

      } else {
        return conn.sendMessage(chatId, {
          text: `⚙️ Penggunaan:\n${prefix}welcome on → Aktifkan welcome\n${prefix}welcome off → Nonaktifkan welcome\n${prefix}welcome set <teks> → Atur teks welcome`
        }, { quoted: message });
      }

    } catch (error) {
      console.error('Error:', error);
      return conn.sendMessage(chatId, {
        text: `Error: ${error.message || error}`
      }, { quoted: message });
    }
  }
};