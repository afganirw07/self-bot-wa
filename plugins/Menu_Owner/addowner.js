const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'addowner',
  command: ['addowner', 'adow'],
  tags: 'Owner Menu',
  desc: 'Menambah owner bot',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: message });
    }

    const rawInput = args.join(' ');
    if (!rawInput) {
      return conn.sendMessage(chatId, { text: 'Masukkan nomor yang akan dijadikan owner' }, { quoted: message });
    }

    const number = await calNumber(rawInput);

    if (config.ownerSetting.ownerNumber.includes(number)) {
      return conn.sendMessage(chatId, { text: 'Nomor sudah terdaftar' }, { quoted: message });
    }

    config.ownerSetting.ownerNumber.push(number);

    try {
      const fd = fs.openSync(configPath, 'w');
      fs.writeFileSync(fd, JSON.stringify(config, null, 2), 'utf-8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);

      conn.sendMessage(chatId, { text: `Nomor ${number} sudah ditambahkan sebagai owner` }, { quoted: message });
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: message });
    }
  }
};