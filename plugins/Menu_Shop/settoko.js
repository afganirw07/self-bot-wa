const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'settoko',
  command: ['settoko'],
  tags: 'Shop Menu',
  desc: 'Mengatur atau menulis barang',
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

    const tokoName = args.shift();
    const itemName = args.shift();
    const itemPrice = args.shift();

    if (!tokoName || !itemName || !itemPrice) {
      return conn.sendMessage(chatId, { text: "❌ Format: settoko <nama_toko> <nama_barang> <harga>" }, { quoted: message });
    }

    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file tokoon" }, { quoted: message });
    }

    if (!tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "❌ Toko tidak ditemukan" }, { quoted: message });
    }

    tokoData.storeSetting[tokoName].push({ name: itemName, price: itemPrice });
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    await conn.sendMessage(chatId, { 
      text: `✅ Barang *"${itemName}"* dengan harga *${itemPrice}* berhasil ditambahkan ke toko *"${tokoName}"*!`
    }, { quoted: message });
  }
};