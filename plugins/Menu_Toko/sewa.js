
const fs = require('fs');

module.exports = {
  name: 'sewa',
  command: ['sewa'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko sewa',

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: message });
    }

    const items = tokoData.storeSetting['sewa'];
    if (!items || items.length === 0) {
      return conn.sendMessage(chatId, { text: "Toko ini belum memiliki barang." }, { quoted: message });
    }

    const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

    const itemList = sortedItems.map((item, index) => `${side} ${btn} ${index + 1}. ${item.name}: ${item.price}
`).join('');
    
    conn.sendMessage(chatId, { 
      text: `Selamat datang di toko sewa!

${head}${Obrack} Daftar sewa ${Cbrack}
${itemList}${foot}`
    }, { quoted: message });
  }
};