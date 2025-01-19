const axios = require("axios");
//const cheerio = require("cheerio");
const FormData = require("form-data");

async function ttt(link) {
  const form = new FormData();
  form.append("url", link);
  form.append("count", "12");
  form.append("cursor", "0");
  form.append("web", "1");
  form.append("hd", "1");

  const {
    data
  } = await axios.post("https://www.tikwm.com/api/", form);

  if(data.code === 0 && data.msg === "success") {
    const baseUrl = "https://www.tikwm.com";
    data.data.cover = baseUrl + data.data.cover;
    data.data.play = baseUrl + data.data.play;
    data.data.wmplay = baseUrl + data.data.wmplay;
    data.data.hdplay = baseUrl + data.data.hdplay;
    data.data.music = baseUrl + data.data.music;
    data.data.author.avatar = baseUrl + data.data.author.avatar;
  }


  const res = {
    status: 200,
    type: "tiktok",
    title: data.data?.title || null,
    desc: null,
    thumbnail: data.data.cover,
    video: [
      {
        resolusi: "hd",
        url: data.data.hdplay
      },
      {
        resolusi: "sd",
        url: data.data.play
      }
    ],
    music: [
      {
        resolusi: "default",
        url: data.data.music
      }
    ],
    images: data.data.images
  }
  return res
}

module.exports = {
  ttt
}
