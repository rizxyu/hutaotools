const { ttt } = require("../lib/skrep");
const { soundcloud } = require("../lib/soundcloud");
const ig = require("../lib/ig");
const spotify = require("../lib/spotify");
const yt = require("../lib/ytdl");
const kwaii = require("../lib/kuaishou");

module.exports = async function(req, res) {
  const { url } = req.body;
  const ip = req.ip.replace("::ffff:", "") || req.ip;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Token is missing or invalid" });
    }
    
    const token = authHeader.split(" ")[1];
    const isValid = global.tokenVd.some(entry => entry.ip === ip && entry.token === token);
    if (!isValid) return res.status(403).json({ message: "Forbidden: Invalid token or IP mismatch" });
    
    if (!url) return res.status(400).json({ error: "URL diperlukan." });

  let ress;
  try {
    if (/^(https?:\/\/)?(www\.)?instagram\.com\/.*$/i.test(url)) {
      ress = await ig(url);
    } else if (/https?:\/\/(([a-zA-Z0-9_-]+)\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i.test(url)) {
      ress = await soundcloud(url);
    } else if (/https?:\/\/(www\.|v(t|m)\.|t\.)?tiktok\.com/i.test(url)) {
      ress = await ttt(url);
    } else if (/https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)(\?.*)?/i.test(url)) {
      ress = await spotify(url);
    } else if (/(?:http(?:s|):\/\/|)(?:(?:www\.|)?(?:music\.)?youtube(?:\-nocookie|)\.com\/(?:shorts\/)?(?:watch\?.*(?:|\&)v=|embed\/|v\/)?|youtu\.be\/)([-_0-9A-Za-z]{11})/i.test(url)) {
      ress = await yt(url);
    } else if(/^https?:\/\/v\.kuaishou\.com\/[a-zA-Z0-9]+$/i.test(url)) {
      ress = await kwaii(url);
    
    } else {
      ress = {
        status: 400,
        message: "failed request"
      };
    }
  } catch (e) {
    console.log(e);
    ress = {
      status: 404,
      message: `${e.message}`
    };
  }

  console.log(ress);
  return res.status(ress.status || 200).json(ress.data || ress);
};