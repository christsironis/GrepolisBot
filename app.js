const http = require("http");
const fetch = require("node-fetch");

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

// let port = process.env.PORT || "3000";

Login();

// const server = http.createServer((req, res) => {
// 	res.statusCode = 200;
// 	res.setHeader("Content-Type", "text/plain");
// 	res.end("Hello World");
// });

// server.listen(port, () => {
// 	console.log("Listening to port " + port);
// });

async function Login() {
	try {
		let firstCookies = await fetch("https://gr.grepolis.com/", {
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
			method: "GET",
			redirect: "manual",
		});

		let phpsessid = /phpsessid[^;]*;/i.exec(firstCookies.headers.get("set-cookie"))[0];
		let xsrftoken = /xsrf-token[^;]*;/i.exec(firstCookies.headers.get("set-cookie"))[0];
		let metricsUvId = MetricsUvId();
		let cid;
		var oExpirationDate = new Date();
		oExpirationDate.setHours(oExpirationDate.getHours() + 7 * 24);
		var sUniqueId = new Date().getTime() + "-" + Math.round(Math.random() * Math.pow(10, 5));
		let portalId = "portal_tid=" + sUniqueId + ";";
		let portalData = "portal_data=" + portalId;

		let newxsrfToken = await fetch("https://gr.grepolis.com/glps/login_check", {
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"x-xsrf-token": xsrftoken.split("=")[1].split(";")[0],
				cookie: `${phpsessid} ${xsrftoken} metricsUvId=${metricsUvId}; device_view=full; ${portalId} ${portalData}`,
			},
			body: "login%5Buserid%5D=tsiochris0001%40yahoo.gr&login%5Bpassword%5D=abcdefghik&login%5Bremember_me%5D=false",
			method: "POST",
			redirect: "follow",
		});
		xsrftoken = /xsrf-token[^;]*;/i.exec(newxsrfToken.headers.get("set-cookie"))[0];

		let newData = await fetch(
			"https://gr0.grepolis.com/?action=login_from_glps&player_id=848924721&hash=1434c734ff",
			{
				headers: {
					accept:
						"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en,el;q=0.9",
					"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"Windows"',
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-site",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
					cookie: `${phpsessid} ${cid} metricsUvId=${metricsUvId}; pid=848924721;`,
					Referer: "https://gr.grepolis.com/",
					"Referrer-Policy": "strict-origin-when-cross-origin",
				},
				body: null,
				method: "GET",
				redirect: "manual",
			}
		);
		phpsessid = /phpsessid[^;]*;/i.exec(newData.headers.get("set-cookie"))[0];
		cid = /cid[^;]*;/i.exec(newData.headers.get("set-cookie"))[0];

		let index = await fetch(newData.headers.get("location"), {
			headers: {
				"content-type": "text/html; charset=UTF-8",
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${phpsessid} ${cid} metricsUvId=${metricsUvId}; pid=848924721;`,
			},
			body: null,
			method: "GET",
		});

		let response = await index.text();
		let dataTowns = response.match(/"id":"[^"]*","name":"[^"]*","playing_on":true/gim);
		let myTowns = [];
		for (let town of dataTowns) {
			myTowns.push(JSON.parse("{" + town + "}"));
		}

		let h_token = response.match(/CSRF.token = '[^;]*';/gim)[0].split("'")[1];
		let playerName = response.match(/Login.player_name = '[^;]*';/gim)[0].split("'")[1];

		let world = await fetch("https://gr0.grepolis.com/start?action=login_to_game_world", {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "en",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded",
				"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1",
				cookie: `${phpsessid} ${cid} metricsUvId=${metricsUvId}; pid=848924721;`,
				Referer: "https://gr0.grepolis.com/start/index",
				"Referrer-Policy": "strict-origin-when-cross-origin",
			},
			body: `world=gr81&facebook_session=&facebook_login=&token=${h_token}&portal_sid=&name=${playerName}&password=`,
			method: "POST",
			redirect: "manual",
		});

		//   console.log(world,world.headers);

		const login_startup_time = world.headers
			.get("set-cookie")
			.match(/login_startup_time=[^%]*/gi)[0]
			.split("=")[1];

		let sessId =
			"sid=" +
			world.headers
				.get("location")
				.match(/session_id=[^&]*/i)[0]
				.split("=")[1] +
			";";
		let session = await fetch(world.headers.get("location"), {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `metricsUvId=${metricsUvId}; login_startup_time=${login_startup_time}%2C0%2Cbrowser`,
			},
			body: null,
			method: "GET",
			redirect: "manual",
		});

		cid = /cid[^;]*;/i.exec(session.headers.get("set-cookie"))[0];

		let worldIndex = await fetch(session.headers.get("location"), {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `metricsUvId=${metricsUvId}; login_startup_time=${login_startup_time}%2C0%2Cbrowser; ${cid} ${sessId} logged_in=false`,
			},
			body: null,
			method: "GET",
		});
		let worldIndexData = await worldIndex.text();
		h_token = worldIndexData.match(/csrfToken":"[^"]*/gim)[0].split('"')[2];

		let ts = session.headers.get("location").match(/ts=.*/gi)[0].split("=")[1];
		console.log(ts, login_startup_time);
		let town_data = await fetch(
			"https://gr81.grepolis.com/game/data?town_id=7718&action=get&h=" + h_token,
			{
				headers: {
					accept: "text/plain, */*; q=0.01",
					"accept-language": "en,el;q=0.9",
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"Windows"',
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-requested-with": "XMLHttpRequest",
					cookie: `metricsUvId=${metricsUvId}; ${cid} ${sessId} ig_conv_last_site=https://gr81.grepolis.com/game/index; login_startup_time=${login_startup_time}%2C0%2Cbrowser logged_in=false; toid=7718;`,
				},
				body: "json=%7B%22types%22%3A%5B%7B%22type%22%3A%22easterIngredients%22%7D%2C%7B%22type%22%3A%22map%22%2C%22param%22%3A%7B%22x%22%3A15%2C%22y%22%3A6%7D%7D%2C%7B%22type%22%3A%22bar%22%7D%2C%7B%22type%22%3A%22backbone%22%7D%5D%2C%22town_id%22%3A7718%2C%22nl_init%22%3Afalse%7D",
				method: "POST",
			}
		);
		//   console.log(town_data)

		let farm_towns=[];
		town_data = await town_data.json();
		town_data = town_data["json"];

		getObject(town_data,farm_towns);
		console.log(farm_towns);
	} catch (err) {
		console.log("kati gia error leei:", err);
	}
}

function getObject(jsonData,table) {
	for (var prop in jsonData) {
		if (jsonData.hasOwnProperty("farm_town_id")) {
			table.push(jsonData);
			break;
		}
		else if (jsonData[prop] instanceof Object) {
			getObject(jsonData[prop],table);
		}
	}
}


function MetricsUvId() {
	for (var bth = [], htb = {}, i = 0; i < 256; i++)
		(bth[i] = (i + 256).toString(16).substr(1)), (htb[bth[i]] = i);
	var r = (function () {
		for (var r, randoms = new Array(16), i = 0; i < 16; i++)
			0 == (3 & i) && (r = 4294967296 * Math.random()), (randoms[i] = (r >>> ((3 & i) << 3)) & 255);
		return randoms;
	})();
	(r[6] = (15 & r[6]) | 64), (r[8] = (63 & r[8]) | 128);
	var pos = 0;
	return (
		bth[r[pos++]] +
		bth[r[pos++]] +
		bth[r[pos++]] +
		bth[r[pos++]] +
		"-" +
		bth[r[pos++]] +
		bth[r[pos++]] +
		"-" +
		bth[r[pos++]] +
		bth[r[pos++]] +
		"-" +
		bth[r[pos++]] +
		bth[r[pos++]] +
		"-" +
		bth[r[pos++]] +
		bth[r[pos++]] +
		bth[r[pos++]] +
		bth[r[pos++]] +
		bth[r[pos++]] +
		bth[r[pos++]]
	);
}
