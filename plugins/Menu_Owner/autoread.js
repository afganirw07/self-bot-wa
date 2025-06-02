const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autoread',
  command: ['autoread', 'ad'],
  tags: 'Owner Menu',
  desc: 'Setting autoread gc/private',
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

    const configPath = path.join(__dirname, '../../toolkit/set/config.json');

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal membaca konfigurasi bot.' }, { quoted: message });
    }

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `🔹 *Status Auto Read:*\n` +
              `- Group: ${config.botSetting.autoread.group ? '✅ Aktif' : '❌ Nonaktif'}\n` +
              `- Private: ${config.botSetting.autoread.private ? '✅ Aktif' : '❌ Nonaktif'}\n\n` +
              `➤ *Gunakan:*\n` +
              `${prefix}autoread group on/off\n` +
              `${prefix}autoread private on/off\n\n` +
              `Contoh:\n${prefix}autoread group on\n${prefix}autoread private off`
      }, { quoted: message });
    }

    let type = args[0].toLowerCase();
    let state = args[1]?.toLowerCase();

    if (!['group', 'private'].includes(type)) {
      return conn.sendMessage(chatId, { text: `❌ Gunakan *${prefix}autoread group on/off* atau *${prefix}autoread private on/off*` }, { quoted: message });
    }

    if (!['on', 'off'].includes(state)) {
      return conn.sendMessage(chatId, { text: `❌ Gunakan *on* atau *off*` }, { quoted: message });
    }

    config.botSetting.autoread[type] = state === 'on';

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal menyimpan konfigurasi.' }, { quoted: message });
    }

    global.readGroup = config.botSetting.autoread.group;
    global.readPrivate = config.botSetting.autoread.private;

    conn.sendMessage(chatId, { text: `✅ Auto Read untuk *${type}* telah *${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*!` }, { quoted: message });
  }
};