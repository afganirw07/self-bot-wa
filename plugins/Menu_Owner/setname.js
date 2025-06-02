const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../toolkit/set/config.json");

module.exports = {
  name: 'setname',
  command: ['setname', 'setfullname'],
  tags: 'Owner Menu',
  desc: 'Mengatur nama bot',
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

      if (!args.length) {
        return conn.sendMessage(
          chatId,
          { text: "❌ Masukkan nama baru untuk bot!" },
          { quoted: message }
        );
      }

      let newName = args.join(" ");

      if (!fs.existsSync(configPath)) {
        return conn.sendMessage(
          chatId,
          { text: "⚠️ Config bot tidak ditemukan!" },
          { quoted: message }
        );
      }

      let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      if (commandText === "setname") {
        global.botName = newName;
        config.botSetting.botName = newName;
      } else if (commandText === "setfullname") {
        global.botFullName = newName;
        config.botSetting.botFullName = newName;
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(
        chatId,
        { text: `✅ *Nama bot berhasil diubah!*\n📌 Nama baru: *${newName}*` },
        { quoted: message }
      );

      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } catch (err) {
      console.error(err);
      conn.sendMessage(
        message.key.remoteJid,
        { text: "⚠️ Terjadi kesalahan saat mengubah nama bot!" },
        { quoted: message }
      );
    }
  }
};