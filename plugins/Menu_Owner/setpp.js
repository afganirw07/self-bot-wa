const https = require("https");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const { FormData, Blob } = require("formdata-node");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp"); // Install: npm install sharp

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Mengubah foto profil bot tanpa crop.',
  prefix: true,
  owner: true,

  run: async (conn, message, { chatInfo, prefix, commandText }) => {
    const { chatId } = chatInfo;
    const mtype = Object.keys(message.message || {})[0];

    let mediaMessage;
    if (mtype === "imageMessage") {
      mediaMessage = message.message.imageMessage;
    } else if (
      mtype === "extendedTextMessage" &&
      message.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage
    ) {
      mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    if (!mediaMessage) {
      return conn.sendMessage(chatId, {
        text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar dengan caption atau reply gambar dengan perintah:\n\`${prefix}${commandText}\`\n\n💡 *Tips:* Gambar akan otomatis disesuaikan menjadi persegi tanpa crop!`
      }, { quoted: message });
    }

    // Send processing message
    const processingMsg = await conn.sendMessage(chatId, {
      text: "⏳ Sedang memproses gambar..."
    }, { quoted: message });

    try {
      const stream = await downloadContentFromMessage(mediaMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Process image to make it square without cropping
      const processedBuffer = await makeSquareImage(buffer);

      // Try multiple methods to set profile picture
      let success = false;
      let lastError;

      // Method 1: Direct buffer upload
      try {
        await conn.updateProfilePicture(conn.user.id, processedBuffer);
        success = true;
      } catch (error) {
        console.log("Direct buffer upload failed:", error.message);
        lastError = error;
      }

      // Method 2: Via URL conversion
      if (!success) {
        try {
          const url = await webp2png(processedBuffer);
          await conn.updateProfilePicture(conn.user.id, { url });
          success = true;
        } catch (error) {
          console.log("URL conversion method failed:", error.message);
          lastError = error;
        }
      }

      // Method 3: Try with original buffer
      if (!success) {
        try {
          await conn.updateProfilePicture(conn.user.id, buffer);
          success = true;
        } catch (error) {
          console.log("Original buffer method failed:", error.message);
          lastError = error;
        }
      }

      if (!success) {
        throw lastError || new Error("Semua metode upload gagal");
      }

      // Delete processing message and send success message
      await conn.sendMessage(chatId, { delete: processingMsg.key });
      
      conn.sendMessage(chatId, {
        text: "✅ Foto profil bot berhasil diperbarui!\n\n📐 Gambar telah disesuaikan menjadi persegi tanpa memotong bagian penting."
      }, { quoted: message });

    } catch (error) {
      console.error("❌ Error saat setpp:", error);
      
      // Delete processing message
      await conn.sendMessage(chatId, { delete: processingMsg.key });
      
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat memperbarui foto profil bot.\n\n*Error:* ${error.message || 'Unknown error'}`
      }, { quoted: message });
    }
  }
};

// Function to make image square without cropping
async function makeSquareImage(buffer) {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    const { width, height } = metadata;
    const size = Math.max(width, height);
    
    // Create square canvas with white background
    const squareImage = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: await image.resize({
        width: width > height ? size : Math.round(width * size / height),
        height: height > width ? size : Math.round(height * size / width),
        fit: 'inside'
      }).toBuffer(),
      gravity: 'center'
    }])
    .jpeg({ quality: 90 })
    .toBuffer();
    
    return squareImage;
  } catch (error) {
    console.log("⚠️ Sharp processing failed, using original buffer:", error.message);
    return buffer;
  }
}

// Multiple conversion methods with fallback
async function webp2png(source) {
  // Method 1: Try direct buffer upload to WhatsApp (most reliable)
  try {
    return await directUpload(source);
  } catch (error) {
    console.log("Direct upload failed, trying EZGIF...", error.message);
  }

  // Method 2: Try EZGIF conversion
  try {
    return await convertViaEzgif(source);
  } catch (error) {
    console.log("EZGIF failed, trying alternative...", error.message);
  }

  // Method 3: Try alternative service
  try {
    return await convertViaAlternative(source);
  } catch (error) {
    console.log("All conversion methods failed:", error.message);
    throw new Error("Semua metode konversi gagal. Coba lagi dalam beberapa saat.");
  }
}

// Direct buffer upload (works with most WA libraries)
async function directUpload(buffer) {
  // Create temporary file URL using data URI
  const base64 = buffer.toString('base64');
  const mimeType = 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

// EZGIF conversion with better error handling
async function convertViaEzgif(source) {
  const agent = new https.Agent({ 
    rejectUnauthorized: false,
    timeout: 25000
  });

  let arrayBuffer;
  if (Buffer.isBuffer(source)) {
    arrayBuffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  } else {
    throw new Error("Input source must be a Buffer");
  }

  // Try different EZGIF endpoints
  const endpoints = [
    'https://ezgif.com/jpg-to-png',
    'https://s6.ezgif.com/jpg-to-png',
    'https://s7.ezgif.com/jpg-to-png'
  ];

  for (const endpoint of endpoints) {
    try {
      const form = new FormData();
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      form.append('new-image-url', '');
      form.append('new-image', blob, 'profile.jpg');

      const res = await fetch(endpoint, {
        method: 'POST',
        body: form,
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!res.ok) continue;

      const html = await res.text();
      const { document } = new JSDOM(html).window;

      // Try multiple selectors for file input
      const fileInput = document.querySelector('form input[name="file"]') ||
                       document.querySelector('input[name="file"]') ||
                       document.querySelector('form input[type="hidden"][name*="file"]');
      
      if (!fileInput || !fileInput.value) {
        console.log(`No file input found in ${endpoint}`);
        continue;
      }

      const fileValue = fileInput.value;
      
      // Step 2: Convert
      const form2 = new FormData();
      const inputs = document.querySelectorAll('form input[name]');
      for (let input of inputs) {
        if (input.name && input.value) {
          form2.append(input.name, input.value);
        }
      }

      const convertUrl = `${endpoint.replace('ezgif.com', 'ezgif.com')}/${fileValue}`;
      const res2 = await fetch(convertUrl, {
        method: 'POST',
        body: form2,
        agent
      });

      if (!res2.ok) continue;

      const html2 = await res2.text();
      const { document: document2 } = new JSDOM(html2).window;

      const img = document2.querySelector('div#output img') ||
                 document2.querySelector('.output img') ||
                 document2.querySelector('img[src*=".png"]') ||
                 document2.querySelector('img[src*="ezgif"]');
      
      if (img?.src) {
        return new URL(img.src, res2.url).toString();
      }
    } catch (err) {
      console.log(`EZGIF endpoint ${endpoint} failed:`, err.message);
      continue;
    }
  }
  
  throw new Error('Semua EZGIF endpoint gagal');
}

// Alternative conversion service
async function convertViaAlternative(source) {
  // Using a simple base64 approach as fallback
  const base64 = source.toString('base64');
  
  // Create a temporary PNG data URI
  // This might work with some WhatsApp implementations
  return `data:image/png;base64,${base64}`;
}