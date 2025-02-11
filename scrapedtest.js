const axios = require("axios");
const fs = require("fs");
const { JSDOM } = require("jsdom");

async function scrapeSnapchat() {
  try {
    const { data } = await axios.get("https://www.snapchat.com/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYcWh0bnhnYmVyAZQ8KZ-oAZQ8KZ-UAAAAAQ", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      }
    });

    const dom = new JSDOM(data);
    const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]');

    let jsonData = null;
    scripts.forEach(script => {
      try {
        const parsedData = JSON.parse(script.textContent);
        if (parsedData["@context"] === "https://schema.org") {
          jsonData = {
            status: 200,
            thumbnail: parsedData["@graph"][0].thumbnailUrl,
            title: parsedData["@graph"][0].name,
            author: parsedData["@graph"][0].creator,
            video: [{
              resolusi: "Watermark",
              url: parsedData["@graph"][0].contentUrl
            }]
          }
        }
      } catch (e) {}
    });

    if (jsonData) {
      console.log("JSON ditemukan:");
      console.log(JSON.stringify(jsonData, null, 2));
    } else {
      console.log("Tidak ditemukan data JSON yang sesuai.");
    }
  } catch (error) {
    console.error("Gagal mengambil data:", error.message);
  }
}

scrapeSnapchat();