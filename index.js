const path = require("path");
const fs = require("fs");
const https = require("https");
const express = require("express");
const config = require("./config.json");
const port = config.port;
const app = new express();
    app.get("/*", (req, res) => {
      const fonturl = req.originalUrl.replace("/gfonts//", "").replace("/gfonts/", "");
      if (fonturl == "") {
        res.sendStatus(400);
        return;
      }
      if (
        !fonturl.includes("fonts.googleapis.com") &&
        !fonturl.includes("fonts.gstatic.com")
        ) {
        console.log(fonturl + " is not a google fonts url.");
        res.sendStatus(400);
        return;
      }
      if (fonturl.includes("css")) {
        res.type("text/css");
      }
      if (fonturl.includes("woff2")) {
        res.type("font/woff2");
      }
      if (fonturl.includes("woff")) {
        res.type("font/woff");
      }
      if (fonturl.includes("svg")) {
        res.type("image/svg+xml");
      }
      if (fonturl.includes("ttf")) {
        res.type("font/ttf");
      }
      if (fonturl.includes("otf")) {
        res.type("font/otf");
      }
      if (fonturl.includes("sfnt")) {
        res.type("font/sfnt");
      }
      const gfontstoragedir = path.join(__dirname, "/gfontcache/");
      if (!fs.existsSync(gfontstoragedir)) {
        fs.mkdirSync(gfontstoragedir);
      }
      const fontid = btoa(fonturl);
      const fontpath = path.join(gfontstoragedir, fontid);
      console.log("Plugin: GFONTSproxy\t\t\t --> '" + fonturl+ "'")
      if (!fs.existsSync(fontpath)) {
        https.get(fonturl, (dl) => {
          const writer = fs.createWriteStream(fontpath);
          dl.pipe(writer);
          writer.on("finish", () => {
            writer.close();
            res.send(
              fs.readFileSync(fontpath, {
                encoding: "utf8",
                flag: "r",
              })
              );
          });
        });
      } else {
        res.send(
          fs.readFileSync(fontpath, {
            encoding: "utf8",
            flag: "r",
          })
          );
      }
    });
    app.listen(port, () => {
      console.log(`Plugin: GFONTSproxy\t\t\t --> listening on port ${port}, proxied through Cynthia!`)
    })