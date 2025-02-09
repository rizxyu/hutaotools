const axios = require("axios");
const cheerio = require("cheerio");

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

async function scrapeKuaishou(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const scriptTag = $("script")
      .filter((_, el) => $(el).html().includes("window.INIT_STATE"))
      .html();

    if (!scriptTag) {
      console.warn("INIT_STATE tidak ditemukan.");
      return null;
    }

    const jsonString = scriptTag.match(/window\.INIT_STATE\s*=\s*(\{.*\});?/)[1];
    const result = JSON.parse(jsonString);

    const decodedResult = Object.keys(result).reduce((acc, key) => {
      const decodedKey = decodeKey(key);
      acc[decodedKey] = result[key];
      return acc;
    }, {});

    const photoKey = Object.keys(decodedResult).find((key) => {
      const data = decodedResult[key];
      return data && data.photo;
    });

    if (!photoKey) {
      console.warn("Key dengan variabel 'photo' tidak ditemukan.");
      return null;
    }

    const x_1a = decodedResult[photoKey];

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

    if (x_1a.atlas) {
      res.slide = {
        size: x_1a.atlas.size,
        urls: x_1a.atlas.list.map((v) => "https://p5.a.yximgs.com" + v),
      };
    }

    if (x_1a.photo.photoType === "VIDEO") {
      res.video = x_1a.photo.manifest.adaptationSet[0].representation[0].url;
    }
    if (x_1a.photo.soundTrack) {
      res.sound = {
        name: x_1a.photo.soundTrack.name,
        cover: x_1a.photo.soundTrack.imageUrls[0].url,
        audio: x_1a.photo.soundTrack.audioUrls[0].url,
      };
    }

    return res;
  } catch (error) {
    console.warn(`Gagal scrape: ${error.message}`);
    return null;
  }
}

async function validasi(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Step ${attempt}...`);
    const result = await scrapeKuaishou(url);
    if (result) {
      console.log("Scraping berhasil!");
      console.log(result);
      return result;
    }
    console.log("Gagal, mencoba ulang...");
  }
  console.error("Scraping gagal setelah 3 kali percobaan.");
  return null;
}

module.exports = validasi;