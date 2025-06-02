const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

module.exports = {
  name: 'backup',
  command: ['backup'],
  tags: 'Owner Menu',
  desc: 'Membackup data bot',
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
    const botName = global.botName.replace(/\s+/g, "_");
    const vers = global.version.replace(/\s+/g, ".");
    const zipFileName = `${botName}-${vers}.zip`;
    const zipFilePath = path.join(__dirname, "..", "..", zipFileName);

    try {
      const zip = new AdmZip();
      const includePaths = [
        "plugins",
        "toolkit",
        "package.json",
        "index.js",
        "main.js",
        "README.md",
        "LICENSE"
      ];

      includePaths.forEach((item) => {
        const itemPath = path.join(__dirname, "..", "..", item);
        if (fs.existsSync(itemPath)) {
          if (fs.lstatSync(itemPath).isDirectory()) {
            zip.addLocalFolder(itemPath, item);
          } else {
            zip.addLocalFile(itemPath);
          }
        }
      });

      zip.writeZip(zipFilePath);

      await conn.sendMessage(chatId, {
        document: fs.readFileSync(zipFilePath),
        mimetype: "application/zip",
        fileName: zipFileName,
        caption: `📦 *Backup berhasil dibuat!*\nBerikut adalah arsip ZIP dari bot.`
      }, { quoted: message });

      setTimeout(() => fs.unlinkSync(zipFilePath), 5000);
    } catch (error) {
      console.error("Backup Error:", error);
      conn.sendMessage(chatId, { text: "❌ *Gagal membuat backup!*" });
    }
  }
};