module.exports = {
  name: 'antistiker',
  command: ['antistiker'],
  tags: 'Group Menu',
  desc: 'Mengaktifkan atau menonaktifkan fitur anti stiker spam',
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
    if (!input || !['on', 'off'].includes(input)) {
      return conn.sendMessage(chatId, {
        text: `Penggunaan: ${prefix}${commandText} <on/off>`
      }, { quoted: message });
    }

    groupData.gbFilter = groupData.gbFilter || {};
    groupData.gbFilter.stiker = groupData.gbFilter.stiker || {};
    groupData.gbFilter.stiker.antistiker = input === 'on';

    saveDB(db);

    return conn.sendMessage(chatId, {
      text: `✅ Fitur antistiker berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.`
    }, { quoted: message });
  }
};