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

global.tokenVd ??= [] //Save Token Global

const app = express();
const port = process.env.PORT || 443;

const key = fs.readFileSync("privkey.pem", "UTF8");
const cert = fs.readFileSync("cert.pem", "UTF8");
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key,
  cert
}, app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, "public")));
app.use("/cdn", express.static(path.join(__dirname, 'cdn')));


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
app.post("/api", apis);
app.get("/checkType", checkType);
app.get("/validate", validateToken)
app.get("/download", downloadf);



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
