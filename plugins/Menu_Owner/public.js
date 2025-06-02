const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'public',
  command: ['public'],
  tags: 'Owner Menu',
  desc: 'Mengatur mode publik bot',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isOwner(module.exports, conn, message))) return;

      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(
          chatId,
          { text: `⚠ Gunakan perintah:\n${prefix}${commandText} on/off\n\nStatus: ${public}` },
          { quoted: message }
        );
      }

      const status = args[0].toLowerCase() === 'on';

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      config.botSetting.public = status;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      global.public = status;

      conn.sendMessage(
        chatId,
        { text: `✅ Mode publik telah ${status ? 'diaktifkan' : 'dimatikan'}` },
        { quoted: message }
      );
    } catch (error) {
      console.error('Error mengubah mode publik:', error);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan!' }, { quoted: message });
    }
  }
};