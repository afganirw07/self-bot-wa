module.exports = {
  name: 'left',
  command: ['left'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur pesan keluar grup',
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
      groupData.gbFilter.Left = groupData.gbFilter.Left || { gcLeft: false, leftText: '' };

      if (sub === "on") {
        groupData.gbFilter.Left.gcLeft = true;
        saveDB(db);
        return conn.sendMessage(chatId, { text: "✅ Fitur pesan keluar diaktifkan!" }, { quoted: message });

      } else if (sub === "off") {
        groupData.gbFilter.Left.gcLeft = false;
        saveDB(db);
        return conn.sendMessage(chatId, { text: "❌ Fitur pesan keluar dinonaktifkan!" }, { quoted: message });

      } else if (sub === "set") {
        let leftText = textMessage.replace(`${prefix}${commandText} set`, "").trim();
        if (!leftText)
          return conn.sendMessage(chatId, {
            text: "⚠️ Gunakan perintah:\n.left set <teks selamat tinggal>"
          }, { quoted: message });

        groupData.gbFilter.Left.gcLeft = true;
        groupData.gbFilter.Left.leftText = leftText;
        saveDB(db);

        return conn.sendMessage(chatId, {
          text: `✅ Pesan selamat tinggal diperbarui:\n\n${leftText}`
        }, { quoted: message });

      } else if (sub === "restart") {
        const defaultText = "👋 Selamat tinggal @user!";
        groupData.gbFilter.Left.gcLeft = true;
        groupData.gbFilter.Left.leftText = defaultText;
        saveDB(db);

        return conn.sendMessage(chatId, { text: "✅ Pesan selamat tinggal direset ke default!" }, { quoted: message });

      } else {
        return conn.sendMessage(chatId, {
          text: `⚙️ Penggunaan:\n${prefix}${commandText} on → Aktifkan pesan keluar\n${prefix}${commandText} off → Nonaktifkan pesan keluar\n${prefix}${commandText} set <teks> → Atur teks pesan keluar\n${prefix}${commandText} restart → Reset teks pesan keluar ke default`
        }, { quoted: message });
      }

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(chatId, {
        text: `Error: ${error.message || error}`
      }, { quoted: message });
    }
  }
};