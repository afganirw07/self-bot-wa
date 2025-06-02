const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'mode',
  command: ['mode'],
  tags: 'Owner Menu',
  desc: 'Ubah mode bot menjadi group/private/off',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    const Mode = args[0]?.toLowerCase();
    if (!['group', 'private', 'off'].includes(Mode)) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Mode tidak valid!\n\nContoh penggunaan:\n${prefix}${commandText} group\n${prefix}${commandText} private\n${prefix}off\n\nMode saat ini: *${global.setting?.botSetting?.Mode || 'unknown'}*`
      }, { quoted: message });
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath));
      config.botSetting = config.botSetting || {};
      config.botSetting.Mode = Mode;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(chatId, { text: `✅ Mode bot berhasil diubah menjadi *${Mode}*.` }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengubah mode bot.' }, { quoted: message });
    }
  }
};