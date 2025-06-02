const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = {
  name: 'updateall',
  command: ['updateall'],
  tags: 'Owner Menu',
  desc: 'Perbarui seluruh script dari repository GitHub.',
  prefix: true,
  owner: true,

  run: async (conn, message, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    if (args.length < 1) {
      return conn.sendMessage(chatId, {
        text: '⚠️ Contoh penggunaan:\n.updateall https://github.com/user/repo',
      }, { quoted: message });
    }

    const githubUrl = args[0];
    const tempDir = path.resolve(__dirname, '../../temp_repo');
    const baseDir = path.resolve(__dirname, '../../');
    const configPath = path.join(baseDir, 'toolkit/set/config.json');

    try {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });

      conn.sendMessage(chatId, { text: '📥 Mengkloning repository...' }, { quoted: message });

      execSync(`git clone --depth=1 ${githubUrl} ${tempDir}`);

      const copyRecursiveSync = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (let entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (srcPath === configPath) continue;

          if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
            copyRecursiveSync(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      copyRecursiveSync(tempDir, baseDir);

      conn.sendMessage(chatId, { text: '✅ Semua file berhasil diperbarui dari GitHub.' }, { quoted: message });

      fs.rmSync(tempDir, { recursive: true, force: true });

      await new Promise(res => setTimeout(res, 2000));
      conn.sendMessage(chatId, { text: '♻️ Bot akan restart dalam 3 detik...' }, { quoted: message });
      setTimeout(() => process.exit(1), 3000);

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat proses update.' }, { quoted: message });
    }
  }
};