const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  command: ['help', 'info'],
  tags: 'Info Menu',
  desc: 'Menampilkan informasi tentang command.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!args.length) {
        return conn.sendMessage(chatId, { text: `Gunakan perintah: ${prefix}${commandText} <nama_file_plugin>` }, { quoted: message });
      }

      const pluginsDir = path.join(__dirname, '..'); 
      const categories = fs.readdirSync(pluginsDir).filter(folder => fs.lstatSync(path.join(pluginsDir, folder)).isDirectory());

      let foundPlugin = null;
      let foundFile = '';
      for (const category of categories) {
        const files = fs.readdirSync(path.join(pluginsDir, category)).filter(file => file.endsWith('.js'));
        for (const file of files) {
          const fileNameWithoutExt = path.parse(file).name.toLowerCase();
          if (fileNameWithoutExt === args[0].toLowerCase()) {
            foundPlugin = require(path.join(pluginsDir, category, file));
            foundFile = file;
            break;
          }
        }
        if (foundPlugin) break;
      }

      if (!foundPlugin) {
        return conn.sendMessage(chatId, { text: `Plugin dengan nama file *${args[0]}* tidak ditemukan.` }, { quoted: message });
      }

      const { name, command, desc } = foundPlugin;
      const commandList = Array.isArray(command) ? command.map(cmd => `${prefix}${cmd}`).join(', ') : '-';
      const description = desc || 'Tidak ada deskripsi.';

      const helpMessage = `*Informasi Plugin*\n` +
        `• *File:* ${foundFile}\n` +
        `• *Nama:* ${name || '-'}\n` +
        `• *Command:* ${commandList}\n` +
        `• *Deskripsi:* ${description}\n`;

      conn.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
};