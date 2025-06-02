const fetch = require('node-fetch');

module.exports = {
  name: 'gitclone',
  command: ['git', 'gitclone'],
  tags: 'Download Menu',
  desc: 'Download repository GitHub dalam bentuk .zip',
  prefix: true,
  isPremium: false,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isPrem(module.exports, conn, message))) return;
    const text = args.join(' ');
    if (!text) {
      return conn.sendMessage(chatId, { text: `Where is the link?\nExample:\n${prefix}${commandText} https://github.com/MaouDabi0/Dabi-Ai` }, { quoted: message });
    }

    if (!/^https?:\/\//.test(text) || !text.includes('github.com')) {
      return conn.sendMessage(chatId, { text: `Link invalid!!` }, { quoted: message });
    }

    await conn.sendMessage(chatId, { react: { text: '📦', key: message.key } });

    try {
      let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
      let [, user, repo] = text.match(regex) || [];
      if (!user || !repo) {
        return conn.sendMessage(chatId, { text: 'Invalid GitHub link.' }, { quoted: message });
      }

      repo = repo.replace(/.git$/, '');
      let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
      let head = await fetch(url, { method: 'HEAD' });
      let disposition = head.headers.get('content-disposition');
      if (!disposition) {
        return conn.sendMessage(chatId, { text: 'Failed to get file info.' }, { quoted: message });
      }
      
      let filename = disposition.match(/attachment; filename=(.*)/)[1];

      await conn.sendMessage(chatId, {
        document: { url: url },
        fileName: filename + '.zip',
        mimetype: 'application/zip'
      }, { quoted: message });

    } catch (e) {
      console.error(e);
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mendownload repository.' }, { quoted: message });
    }
  }
};