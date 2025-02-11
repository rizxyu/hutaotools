const fetch = require("node-fetch").default;
const axios = require("axios");

module.exports = async function(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: "URL tidak valid" });
    const fileResponse = await axios.head(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const contentType = fileResponse.headers["content-type"];
    let fileExtension = "";

    if (contentType === "video/mp4") fileExtension = ".mp4";
    else if (contentType === "audio/mpeg") fileExtension = ".mp3";
    else if (contentType?.startsWith("image")) fileExtension = ".jpg";

    res.json({ success: true, extension: fileExtension });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mendapatkan informasi file" });
  }
}