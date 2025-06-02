const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

module.exports = {
  name: 'autoai',
  command: ['autoai', 'ai'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan ai',
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
      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(chatId, {
          text: `Gunakan format: ${prefix + commandText} <on/off>`
        }, { quoted: message });
      }

      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const settingValue = args[0].toLowerCase() === 'on';

      if (isGroup) {
        const groupData = Object.values(db.Grup).find(g => g.Id === chatId);
        if (!groupData) {
          return conn.sendMessage(chatId, {
            text: 'Grup ini belum terdaftar dalam database.'
          }, { quoted: message });
        }

        groupData.autoai = settingValue;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        return conn.sendMessage(chatId, {
          text: `Fitur Auto-AI untuk grup ini telah *${settingValue ? 'diaktifkan' : 'dinonaktifkan'}*.`
        }, { quoted: message });

      } else {
        const userKey = Object.keys(db.Private).find(name => db.Private[name].Nomor === senderId);
        if (!userKey) {
          return conn.sendMessage(chatId, {
            text: 'Nomor kamu belum terdaftar dalam database.'
          }, { quoted: message });
        }

        db.Private[userKey].autoai = settingValue;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        return conn.sendMessage(chatId, {
          text: `Fitur Auto-AI untuk kamu telah *${settingValue ? 'diaktifkan' : 'dinonaktifkan'}*.`
        }, { quoted: message });
      }

    } catch (err) {
      console.error(err);
      conn.sendMessage(message.chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: message });
    }
  }
};