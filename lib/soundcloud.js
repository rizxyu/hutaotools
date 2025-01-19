const FormData = require("form-data");
const axios = require("axios");
const cheerio = require("cheerio");

async function search(query) {
  try {
    const url = `https://m.soundcloud.com/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const $ = await cheerio.load(response.data);

    const results = [];

    $(".List_VerticalList__2uQYU li").each((index, element) => {
      const title = $(element).find(".Information_CellTitle__2KitR").text();
      const artist = $(element).find(".Information_CellSubtitle__1mXGx").text();
      const thumbnail = $(element)
        .find(".Artwork_ArtworkImage__1Ws9-")
        .attr("src");
      const link = $(element)
        .find(".Cell_CellLink__3yLVS")
        .attr("href");

      results.push({
        title,
        artist,
        thumbnail,
        link: `https://soundcloud.com${link}`,
      });
    });

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function download(url) {
  const form = new FormData();
  form.append("formurl", url);

  const {
    data
  } = await axios.post("https://www.forhub.io/download.php", form, {
    headers: form.getHeaders(),
  });

  const $ = cheerio.load(data);
  const fullTitleText = $("td.small-10.columns").text().trim();
  // eslint-disable-next-line no-unused-vars
  const [title] = fullTitleText.split("320 KB/S").map((text) => text.trim());
  const music = $("td a").attr("href");
  // eslint-disable-next-line no-unused-vars
  const cover = $("td img").attr("src");

  return music
}

async function metadata(url) {

  const modif = url.replace(/(?:on\.)?soundcloud\.com/, "soundcloud.com");

  const {
    data
  } = await axios.get(modif)
  const $ = cheerio.load(data)

  let script
  $("script").each(function() {
    const scr = $(this).text()
    if(scr?.includes?.("@context") && scr?.includes?.("embedUrl")) script = JSON.parse(scr)
  })
  const result = script.props.pageProps.initialStoreState.entities.tracks[script.props.pageProps.trackUrn]

  const artworkHdLink = $("link[rel=\"preload\"][as=\"image\"]").attr("href");
  if(artworkHdLink) {
    result.artwork_hd = artworkHdLink;
  }
  return result
}

async function soundcloud(query, type) {
  if(type === "search") {
    const search_result = await search(query)
    return search_result
  } else {
    const result_download = await download(query)
    const result_metadata = await metadata(query)

    const metarossa = {
      title: result_metadata.data.title,
      description: result_metadata.data.description,
      caption: result_metadata.data.caption,
      publisher: result_metadata?.data?.publisher_metadata || null,
      like: result_metadata.data.likes_count,
      play_count: result_metadata.data.playback_count,
      comment_count: result_metadata.data.comment_count,
      created: result_metadata.data.created_at,
      thumb: result_metadata.artwork_hd,
      duration: result_metadata.data.duration
    }
    const resd = {
      status: 200,
      type: "soundcloud",
      title: metarossa.title,
      thumbnail: metarossa.thumb,
      publisher: metarossa.publisher,
      music: [
        {
          resolusi: "default",
          url: result_download
        }
      ]
    }
    return resd
  }
}

module.exports = {
  search,
  download,
  soundcloud,
  metadata
}
