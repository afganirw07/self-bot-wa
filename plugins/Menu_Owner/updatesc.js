const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

module.exports = {
  name: 'update',
  command: ['update'],
  tags: 'Owner Menu',
  desc: 'Update file dari GitHub.',
  prefix: true,
  owner: true,

  run: async (conn, message, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, message))) return;

    if (args.length < 2) {
      return conn.sendMessage(chatId, { text: '⚠️ Contoh penggunaan:\n.update main.js https://github.com/user/repo' }, { quoted: message });
    }

    const targetPath = args[0];
    const githubUrl = args[1];
    const baseDir = path.resolve(__dirname, '../../');
    const fullFilePath = path.resolve(baseDir, targetPath);

    if (!fullFilePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori bot tidak diizinkan!' }, { quoted: message });
    }

    if (!fs.existsSync(fullFilePath)) {
      return conn.sendMessage(chatId, { text: '⚠️ File tidak ditemukan di direktori lokal!' }, { quoted: message });
    }

    const fileName = path.basename(targetPath);

    try {
      const githubMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!githubMatch) throw new Error('URL GitHub tidak valid.');

      const [_, user, repo] = githubMatch;
      const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/${targetPath}`;

      https.get(rawUrl, (res) => {
        if (res.statusCode !== 200) {
          return conn.sendMessage(chatId, { text: `⚠️ Gagal mengunduh file dari GitHub. Status: ${res.statusCode}` }, { quoted: message });
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
          fs.writeFileSync(fullFilePath, data, 'utf8');

          let reloadMessage = '';
          if (fullFilePath.includes('/plugins/')) {
            try {
              delete require.cache[require.resolve(fullFilePath)];
              reloadMessage = '\n✅ Plugin berhasil di-reload.';
            } catch (e) {
              reloadMessage = '\n⚠️ File diperbarui, tapi gagal me-reload plugin.';
              console.error(e);
            }
          }

          conn.sendMessage(chatId, {
            text: `✅ File berhasil diperbarui dari GitHub!\n📂 *Path:* ${targetPath}${reloadMessage}`
          }, { quoted: message });

          await new Promise(r => setTimeout(r, 2000));
          await conn.sendMessage(chatId, { text: '🔄 Bot akan restart dalam 3 detik...' }, { quoted: message });
          setTimeout(() => process.exit(1), 3000);
        });
      }).on('error', err => {
        console.error(err);
        conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat mengunduh file!' }, { quoted: message });
      });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '⚠️ URL GitHub tidak valid atau struktur salah.' }, { quoted: message });
    }
  }
};