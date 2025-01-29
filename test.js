const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fungsi untuk mendekode key terenkripsi
 * @param {string} encodedKey
 * @returns {string} decodedKey
 */
function decodeKey(encodedKey) {
  const unicodeDecoded = encodedKey.replace(/\\u[0-9a-fA-F]{4}/g, (match) =>
    String.fromCharCode(parseInt(match.replace("\\u", ""), 16))
  );
  return unicodeDecoded
    .split("")
    .map((char) => {
      if (char >= "a" && char <= "z") {
        return String.fromCharCode(((char.charCodeAt(0) - 97 - 1 + 26) % 26) + 97);
      } else if (char >= "A" && char <= "Z") {
        return String.fromCharCode(((char.charCodeAt(0) - 65 - 1 + 26) % 26) + 65);
      } else {
        return char;
      }
    })
    .join("");
}

/**
 * Fungsi untuk melakukan scraping dan parsing data dari Kuaishou
 * @param {string} url
 * @returns {Object} result JSON hasil scraping
 */
async function scrapeKuaishou(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Cari elemen <script> yang berisi INIT_STATE
    const scriptTag = $("script")
      .filter((_, el) => $(el).html().includes("window.INIT_STATE"))
      .html();

    if (scriptTag) {
      const jsonString = scriptTag.match(/window\.INIT_STATE\s*=\s*(\{.*\});?/)[1];
      const result = JSON.parse(jsonString);

      // Dekode key dan cari key yang mengandung "photo"
      const decodedResult = Object.keys(result).reduce((acc, key) => {
        const decodedKey = decodeKey(key);
        acc[decodedKey] = result[key];
        return acc;
      }, {});

      const photoKey = Object.keys(decodedResult).find((key) => {
        const data = decodedResult[key];
        return data && data.photo; // Key yang memiliki variabel `photo`
      });

      if (!photoKey) {
        throw new Error("Key dengan variabel 'photo' tidak ditemukan.");
      }

      const x_1a = decodedResult[photoKey];

      // Menyusun JSON hasil
      const res = {
        userInfo: {
          id: x_1a.photo.userId,
          username: x_1a.photo.kwaiId,
          fullname: x_1a.photo.userName,
          avatar: x_1a.photo.headUrl,
          sex: x_1a.photo.userSex,
          stats: x_1a.counts,
        },
        caption: x_1a.photo.caption,
      };

      if (x_1a.photo.photoType === "VIDEO") {
        res.video = x_1a.photo.manifest.adaptationSet[0].representation[0].url;
      }
      if (x_1a.photo.soundTrack) {
        res.sound = x_1a.photo.soundTrack;
      }

      return res;
    } else {
      throw new Error("INIT_STATE tidak ditemukan.");
    }
  } catch (error) {
    throw new Error(`Gagal scrape: ${error.message}`);
  }
}


async function validasi(url, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      console.log(`Percobaan ${attempt + 1}...`);
      const result = await scrapeKuaishou(url);
      console.log("Scraping berhasil!");
      return result;
    } catch (error) {
      attempt++;
      console.error(error.message);
      if (attempt >= maxRetries) {
        console.error("Script scrape sudah basi, perlu diperbarui.");
        throw new Error("Scraping gagal setelah 3 kali percobaan.");
      }
      console.log("Mengulangi percobaan...");
    }
  }
}
