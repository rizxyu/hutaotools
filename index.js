const fetch = require("node-fetch").default;
const express = require("express");
const https = require("https");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
require('dotenv').config();
const axios = require("axios");

const apis = require("./fnc/apis");
const checkType = require("./fnc/checktype");
const validateToken = require("./fnc/validate");
const downloadf = require("./fnc/download");
const ai = require("./fnc/ai");

global.tokenVd ??= [] //Save Token Global

const app = express();
const port = process.env.PORT || 443;


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const key = fs.readFileSync("privkey.pem", "UTF8");
const cert = fs.readFileSync("cert.pem", "UTF8");
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key,
  cert
}, app);
// Mapping negara ke bahasa

const countryToLang = {
    "ID": "id",  
    "US": "en",  // Amerika
    "JP": "ja",  // Jepang
    "CN": "zh",  // China
    "FR": "fr",  // Prancis
    "DE": "de",  // Jerman
};


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, "public")));
app.use("/cdn", express.static(path.join(__dirname, 'cdn')));
app.use("/lang", express.static(path.join(__dirname, 'lang')));

app.use(async (req, res, next) => {
  const _req = Date.now()

  const ip = req?.ip?.replace("::ffff:", "") || req?.ip;
  req._ip = ip;
  
  res.on("finish", () => {
    const _end = Date.now();
    const total = _end - _req;
    const _date = formatDate(new Date(_req));
    const date = `${_date.YYYY}-${_date.MM}-${_date.DD}`;
    const time = `${_date.hh}:${_date.mm}:${_date.ss}`;

  
    console.log(
      "\x1b[36;1m[\x1b[32;1m" + req.method + "\x1b[36;1m]\x1b[0;0m\n",
      "Path:", req.originalUrl + "\n",
      "Host:", req.get("host") + "\n",
      "Status: \x1b[33m" + res.statusCode + "\x1b[0;0m\n",
      "Time:", total + "ms\n",
      "Length:", res.getHeaders()["content-length"] + "\n",
      "User-Agent:", req.get("user-agent") + "\n",
      "IP:", ip + "\n",
      "Date:", date + "\n",
      "Time:", time
    );
  });
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  console.log(req);
});
app.get("/hd", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "enhance.html"));
  console.log(req);
});
app.post("/api", apis);
app.post("/ai/hd", ai);
app.get("/checkType", checkType);
app.get("/validate", validateToken)
app.get("/download", downloadf);
app.get("/get-userCountry", async (req, res) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const cleanIp = ip.replace("::ffff:", ""); // Bersihin format IPv6

        // Ambil data lokasi dari API eksternal
        const response = await axios.get(`http://ip-api.com/json/${cleanIp}`);
        const countryCode = response.data?.countryCode || "US"; // Default ke US kalau gagal

        // Cek bahasa berdasarkan negara
        const lang = countryToLang[countryCode] || "en";

        res.json({ country: response.data?.country, lang });
    } catch (error) {
        console.error("Gagal mendapatkan lokasi:", error);
        res.json({ country: "Unknown", lang: "en" }); // Default ke English
    }
});
app.get("/lang/tr", (req, res) => {
    res.sendFile(path.join(__dirname, "lang/tr.json"));
});


let server
// For development without httpServer
/*
app.listen(3000, () => {
  console.log("listening on localhost:3000");
})
*/


server = (
  port == 443 ?
  httpsServer :
  httpServer
).listen(port, () => {
  console.log(
    "Server is running on %s",
    (
      port == 443 ?
      "https://localhost" :
      `http://localhost${port == 80 ? "" : ":" + port}`
    )
  );
})


function formatDate(date) {
  const YYYY = String(date.getFullYear());
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return {
    YYYY,
    MM,
    DD,
    hh,
    mm,
    ss
  }
}
