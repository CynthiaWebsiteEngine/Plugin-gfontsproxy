const path = require("path");
const fs = require("fs");
const https = require("https");
const express = require("express");
let config = {
	port: "8012",
};
const configfile = path.join(__dirname, "./config.json");
if (fs.existsSync(configfile)) {
	const t = fs.readFileSync(configfile, "utf8");
	config = JSON.parse(t);
} else {
	fs.writeFileSync(configfile, JSON.stringify(config));
}
const port = config.port;
const app = new express();

function replacewithurlstome(body) {
	if (typeof body == "string") {
		return body
			.replaceAll("(http", "(/es/gfonts/http")
			.replaceAll(
				"(https://fonts.gstatic.com/",
				"(/es/gfonts/https://fonts.gstatic.com/",
			);
	}
}

app.get("/*", (req, res) => {
	const fonturl = req.originalUrl
		.replace("/gfonts//", "")
		.replace("/gfonts/", "");
	if (fonturl === "") {
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
	//    console.log("Plugin: GFONTSproxy\t\t\t --> '" + fonturl + "'")
	if (!fs.existsSync(fontpath)) {
		https.get(fonturl, (dl) => {
			const writer = fs.createWriteStream(fontpath);
			dl.pipe(writer);
			writer.on("finish", () => {
				writer.close();
				res.send(
					replacewithurlstome(
						fs.readFileSync(fontpath, { encoding: "utf8", flag: "r" }),
					),
				);
			});
		});
	} else {
		res.send(
			replacewithurlstome(
				fs.readFileSync(fontpath, { encoding: "utf8", flag: "r" }),
			),
		);
	}
});
app.listen(port, () => {
	console.log(
		`Plugin: GFONTSproxy\t\t\t --> listening on port ${port}, proxied through Cynthia!`,
	);
});
