const fetch = require("node-fetch").default;
const axios = require("axios");

module.exports = async function(req, res, next) {
  try {
    const {
      url,
      name
    } = req.query;
    if(!url || !name) return next();

    const _res = await fetch(url, {
      headers: {
        "Referer": url,
        "Access-Control-Allow-Origin": "*", 
        "Referrer-Policy": "strict-origin-when-cross-origin", 
        "User-Agent": req.get("User-Agent"),
        ...(req.headers.range ? {
          Range: req.headers.range
        } : {})
      }
    });
    for(const [key, value] of _res.headers.entries()) res.setHeader(key, value);
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
    _res.body.pipe(res.status(_res.status));
  } catch(e) {
    console.error(e)
    next();
  };
}