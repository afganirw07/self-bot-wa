module.exports = {
  name: 'antibadword',
  command: ['antibadword'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur anti badword dalam grup',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '❌ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const db = readDB();
    const groupData = Object.values(db.Grup || {}).find(g => g.Id === chatId);
    if (!groupData) {
      return conn.sendMessage(chatId, {
        text: "❌ Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar."
      }, { quoted: message });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);
    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    }

    if (!botAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });
    }

    const input = args[0]?.toLowerCase();

    groupData.antibadword = groupData.antibadword || {
      badword: false,
      badwordText: ""
    };

    if (!input) {
      return conn.sendMessage(chatId, {
        text: `Penggunaan:
${prefix}${commandText} <on/off>
${prefix}${commandText} set <kata>
${prefix}${commandText} reset`
      }, { quoted: message });
    }

    switch (input) {
      case 'on':
      case 'off':
        groupData.antibadword.badword = input === 'on';
        saveDB(db);
        return conn.sendMessage(chatId, {
          text: `✅ Fitur antibadword berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.`
        }, { quoted: message });

      case 'set':
        if (!args[1]) {
          return conn.sendMessage(chatId, { text: `❌ Masukkan kata yang ingin ditambahkan.` }, { quoted: message });
        }
        const newWord = args.slice(1).join(' ').toLowerCase();
        let current = groupData.antibadword.badwordText || '';
        const currentWords = current.split(',').filter(Boolean).map(w => w.trim());
        if (currentWords.includes(newWord)) {
          return conn.sendMessage(chatId, { text: `❌ Kata "${newWord}" sudah ada di daftar.` }, { quoted: message });
        }
        currentWords.push(newWord);
        groupData.antibadword.badwordText = currentWords.join(', ');
        saveDB(db);
        return conn.sendMessage(chatId, { text: `✅ Kata "${newWord}" berhasil ditambahkan ke daftar badword.` }, { quoted: message });

      case 'reset':
        groupData.antibadword.badwordText = '';
        saveDB(db);
        return conn.sendMessage(chatId, { text: `✅ Daftar badword berhasil direset.` }, { quoted: message });

      default:
        return conn.sendMessage(chatId, {
          text: `❌ Perintah tidak dikenal.\nGunakan:\n${prefix}${commandText} <on/off>\n${prefix}${commandText} set <kata>\n${prefix}${commandText} reset`
        }, { quoted: message });
    }
  }
};