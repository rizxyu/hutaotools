const FormData = require("form-data")
const fetch = require("node-fetch")
const beautify = require("js-beautify")
const cheerio = require("cheerio")
const similarity = require("similarity")

async function getSize(url) {
  const res = await fetch(url, {
    method: "HEAD"
  })
  return res.headers.get("content-length") * 1
}

function bytesToSize(bytes) {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if(bytes == 0 || isNaN(bytes * 1)) return "0 B"
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}

//const regex = /^https:\/\/(www\.facebook\.com\/([^\/?].+\/)?(video(s|\.php)|reel)|fb\.watch|reel)[\/?].*$/gm
async function fbdl(url) {
  if(!url) return {
    error: true,
    message: "URL Required"
  }
  /*if(!regex.test(url)) return {
    error: true,
    message: "Invalid URL"
  }*/
  try {
    const { hostname } = new URL(url)
    const _sim = similarity("facebook.com", hostname)
    if(!(_sim >= 0.65 && hostname.includes("facebook.com"))) throw false
  } catch {
    return {
      error: true,
      message: "Invalid URL"
    }
  }

  const form = new FormData()
  form.append("url", url)

  const res = await fetch("https://snapsave.app/action.php", {
    headers: {
      "User-Agent": "WhatsApp/2.24.6.21",
      Referer: "https://snapsave.app/"
    },
    body: form,
    method: "POST"
  })

  // eslint-disable-next-line no-unused-vars
  const window = {
    location: new URL("https://dev.snapsave.app")
  }
  const script = await res.text()
  let js
  try {
    js = eval(script.replace("eval", ""))
    js = beautify(js).split("\n")[2]
  } catch {
    throw script
  }

  try {
    const html = eval(js.slice(js.indexOf("<") - 1, -1))
    const $ = cheerio.load(html)

    const thumbnail = $(".image > img").attr("src")
    const video = []
    for(const i of $("table > tbody > tr")) {
      const _$ = $(i).find.bind($(i))

      const quality = _$(".video-quality").text()
      let url = _$("a").attr("href")
      if(!url) continue

      url = new URL(url)
      url.searchParams.delete("dl")
      url += ""
      const size = await getSize(url)
      const fSize = bytesToSize(size)

      video.push({
        resolusi: quality,
        url,
        size,
        fSize
      })
    }

    return {
      status: 200,
      title: "",
      thumbnail,
      video
    }
  } catch(e) {
    if(!(e instanceof SyntaxError)) throw e

    return {
      error: true,
      message: eval(js.split(" = ")[1])
    }
  }
}