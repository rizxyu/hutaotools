const {
  ttt
} = require("../lib/skrep");
const {
  soundcloud
} = require("../lib/soundcloud");
const ig = require("../lib/ig");
const spotify = require("../lib/spotify");

module.exports = async function(req, res) {
  const {
    url
  } = req.body;

  if(!url) {
    return res.status(400).json({
      error: "URL diperlukan."
    });
  }
  let ress
  try {
  if (/^(https?:\/\/)?(www\.)?instagram\.com\/.*$/i.test(url)) {
   ress = await ig(url);
    } else if(/https?:\/\/(([a-zA-Z0-9_-]+)\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i.test(url)) {
    ress = await soundcloud(url);
  } else if(/https?:\/\/(www\.|v(t|m)\.|t\.)?tiktok\.com/i.test(url)) {
    ress = await ttt(url);
  } else if(/https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)(\?.*)?/i.test(url)) {
    ress = await spotify(url);
  } else {
    ress = {
      status: 400,
      message: "failed request"
    }
  }
  } catch (e) {
    console.log(e);
    ress = {
      status: 404,
      message: `${e.message}`
    }
  }
  console.log(ress)
  return res.status(ress.status || 200).json(ress.data || ress);
}





