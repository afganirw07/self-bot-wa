const { exec } = require('child_process');

module.exports = {
  name: 'Shell',
  command: ['sh', '$', 'shell'],
  tags: 'Owner Menu',
  desc: 'Menjalankan perintah shell di server',
  prefix: false,
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

      if (args.length === 0) {
        return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan perintah shell yang valid!' }, { quoted: message });
      }

      const shellCommand = args.join(' ');

      exec(shellCommand, (error, stdout, stderr) => {
        if (error) {
          return conn.sendMessage(chatId, { text: `❌ *Error:* ${error.message}` }, { quoted: message });
        }
        if (stderr) {
          return conn.sendMessage(chatId, { text: `⚠️ *Stderr:* ${stderr}` }, { quoted: message });
        }
        conn.sendMessage(chatId, { text: `✅ *Output:*\n${stdout || 'Perintah berhasil dijalankan tanpa output.'}` }, { quoted: message });
      });

    } catch (error) {
      console.error('Shell Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `❌ *Gagal menjalankan perintah!*\nError: ${error.message}`
      });
    }
  }
};