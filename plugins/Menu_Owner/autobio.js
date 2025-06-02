const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'autobio',
  command: ['autobio', 'bio'],
  tags: 'Owner Menu',
  desc: 'Mengatur autobio',
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

    const option = args[0]?.toLowerCase();
    if (!option || !['on', 'off'].includes(option)) {
      return conn.sendMessage(chatId, { text: `Gunakan: ${prefix}${commandText} on/off\n\nStatus autobio: ${autoBio}` }, { quoted: message });
    }

    const status = option === 'on';

    global.autoBio = status;
    if (global.setting?.botSetting) {
      global.setting.botSetting.autoBio = status;
    }

    try {
      fs.writeFileSync(configPath, JSON.stringify(global.setting, null, 2));
    } catch (e) {
      return conn.sendMessage(chatId, { text: 'Gagal menyimpan pengaturan ke config.json' }, { quoted: message });
    }

    await conn.sendMessage(
      chatId,
      { text: `Auto Bio telah ${status ? 'diaktifkan' : 'dimatikan'}` },
      { quoted: message }
    );

    if (status) global.updateBio?.(conn);
  }
};