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
		var sUniqueId = new Date().getTime() + "-" + Math.round(Math.random() * Math.pow(10, 5));
		let portalId = "portal_tid=" + sUniqueId + ";";
		let portalData = "portal_data=" + portalId;
		let metricsUvId = "metricsUvId=" + MetricsUvId() + ";";
		let login_startup_time;
		let myTowns = [];
		let farm_towns = [];
		let phpsessid ;
		let xsrftoken;
		let h_Token;
		let playerName;
		let cid;
		let pid;
		let ts;
		let username="tsiochris0001%40yahoo.gr",password="abcdefghik";

		let firstCookies = await FetchData("https://gr.grepolis.com/", {
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
			method: "GET",
			redirect: "manual",
		});

		phpsessid = firstCookies.headers.get("set-cookie").match(/phpsessid[^;]*;/i)[0];
		xsrftoken = firstCookies.headers.get("set-cookie").match(/xsrf-token[^;]*;/i)[0];

		let loginCheck = await FetchData("https://gr.grepolis.com/glps/login_check","noType",2,{
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"x-xsrf-token": xsrftoken.split("=")[1].split(";")[0],
				cookie: `${phpsessid} ${xsrftoken} ${metricsUvId} ${portalId} ${portalData} device_view=full; `,
			},
			body: `login%5Buserid%5D=${username}&login%5Bpassword%5D=${password}&login%5Bremember_me%5D=false`,
			method: "POST",
			redirect: "manual",
		});

		phpsessid = loginCheck.headers.get("set-cookie").match(/phpsessid[^;]*;/i)[0];
		
		let grepolis = await FetchData(loginCheck.headers.get("location"), "text",2,{
			headers: {
				"content-type": "text/html; charset=UTF-8",
				accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${phpsessid} ${xsrftoken} ${metricsUvId} ${portalId} ${portalData} device_view=full; `,
			},
			body: null,
			method: "GET",
			redirect: "manual"
		});

		xsrftoken = grepolis.headers.get("set-cookie").match(/xsrf-token[^;]*;/i)[0];
		pid = grepolis.headers.get("location").match(/(?<=player_id=)[^&]*/i)[0];

		let loginPlayer = await FetchData(grepolis.headers.get("location"),"noType",2,{
				headers: {
					accept:	"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "en,el;q=0.9",
					"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"Windows"',
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-site",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
					cookie: `${phpsessid} ${cid} ${metricsUvId} pid=${pid};`
				},
				body: null,
				method: "GET",
				redirect: "manual",
		});

		phpsessid = loginPlayer.headers.get("set-cookie").match(/phpsessid[^;]*;/i)[0];
		cid = loginPlayer.headers.get("set-cookie").match(/cid[^;]*;/i)[0];

		// let index = await FetchData(loginPlayer.headers.get("location"), "text",0,{
		// 	headers: {
		// 		"content-type": "text/html; charset=UTF-8",
		// 		accept:
		// 			"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		// 		cookie: `${phpsessid} ${cid} ${metricsUvId} ${pid};`,
		// 	},
		// 	body: null,
		// 	method: "GET",
		// });
		// // console.log(index.data)

		// h_Token = index.data.match(/(?<=CSRF\.token = ["'])[^"']*/gim)[0];
		// playerName = index.data.match(/(?<=Login.player_name = ["'])[^"']*/gim)[0];
		// let dataTowns = index.data.match(/"id":"[^"]*","name":"[^"]*","playing_on":true/gim);
		// for (let town of dataTowns) {
		// 	myTowns.push(JSON.parse("{" + town + "}"));
		// }
		// console.log(h_Token,playerName,dataTowns,phpsessid)

		// let worldLogin = await FetchData("https://gr0.grepolis.com/start?action=login_to_game_world", {
		// 	headers: {
		// 		accept:	"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		// 		"accept-language": "en",
		// 		"cache-control": "max-age=0",
		// 		"content-type": "application/x-www-form-urlencoded",
		// 		"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
		// 		"sec-ch-ua-mobile": "?0",
		// 		"sec-ch-ua-platform": '"Windows"',
		// 		"sec-fetch-dest": "document",
		// 		"sec-fetch-mode": "navigate",
		// 		"sec-fetch-site": "same-origin",
		// 		"sec-fetch-user": "?1",
		// 		"upgrade-insecure-requests": "1",
		// 		cookie: `${phpsessid} ${cid} ${metricsUvId} ${pid};`,
		// 		Referer: "https://gr0.grepolis.com/start/index",
		// 		"Referrer-Policy": "strict-origin-when-cross-origin",
		// 	},
		// 	body: `world=${worldId}&facebook_session=&facebook_login=&token=${h_Token}&portal_sid=&name=${playerName}&password=`,
		// 	method: "POST",
		// 	redirect: "manual",
		// });

		// login_startup_time = worldLogin.headers.get("set-cookie").match(/(?<=login_startup_time=)[^%]*/gi)[0];
		// sessId ="sid=" + worldLogin.headers.get("location").match(/(?<=session_id=)[^&]*/i)[0] + ";";

		// let session = await FetchData(worldLogin.headers.get("location"), {
		// 	headers: {
		// 		accept:
		// 			"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		// 		cookie: `${metricsUvId} login_startup_time=${login_startup_time}%2C0%2Cbrowser`,
		// 	},
		// 	body: null,
		// 	method: "GET",
		// 	redirect: "manual",
		// });

		// cid = session.headers.get("set-cookie").match(/cid[^;]*;/i)[0];
		// ts = session.headers.get("location").match(/(?<=ts=).*/i)[0];

		// let worldIndex = await FetchData(session.headers.get("location"), "text", {
		// 	headers: {
		// 		accept:
		// 			"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		// 		cookie: `${metricsUvId} login_startup_time=${login_startup_time}%2C0%2Cbrowser; ${cid} ${sessId} logged_in=false`,
		// 	},
		// 	body: null,
		// 	method: "GET",
		// });

		// h_Token = worldIndex.match(/(?<=csrfToken":['"])[^"']*/gim)[0];

		// let town_data = await FetchData(`https://${worldId}.grepolis.com/game/data?town_id=${tid}&action=get&h=${h_Token}`, "json",
		// 	{
		// 		headers: {
		// 			accept: "text/plain, */*; q=0.01",
		// 			"accept-language": "en,el;q=0.9",
		// 			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		// 			"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
		// 			"sec-ch-ua-mobile": "?0",
		// 			"sec-ch-ua-platform": '"Windows"',
		// 			"sec-fetch-dest": "empty",
		// 			"sec-fetch-mode": "cors",
		// 			"sec-fetch-site": "same-origin",
		// 			"x-requested-with": "XMLHttpRequest",
		// 			cookie: `${metricsUvId} ${cid} ${sessId} login_startup_time=${login_startup_time}%2C0%2Cbrowser toid=${tid}; logged_in=false; ig_conv_last_site=https://gr81.grepolis.com/game/index;`,
		// 		},
		// 		body: "json=%7B%22types%22%3A%5B%7B%22type%22%3A%22easterIngredients%22%7D%2C%7B%22type%22%3A%22map%22%2C%22param%22%3A%7B%22x%22%3A15%2C%22y%22%3A6%7D%7D%2C%7B%22type%22%3A%22bar%22%7D%2C%7B%22type%22%3A%22backbone%22%7D%5D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D",
		// 		method: "POST",
		// 	}
		// );

		// town_data = town_data["json"];

		// searchObject(town_data, farm_towns);
		// console.log(farm_towns);
		
	} catch (err) {
		console.log("kati gia error leei:", err);
	}
}

async function FetchData(url,type="none",debug=0,headers){
	try{
		let request = await fetch(url,headers);
		let data;

		switch(type){
			case "text":
				data = await request.text();
				break;
			case "json":
				data = await request.json();
				break;
		}

		switch (debug) {
			case 1:
				console.log(`url = ${request.url} \t ${request.statusText} ${request.status}`);
				break;
			case 2:
				console.log(`url = ${request.url} \t ${request.statusText} ${request.status} \n`, request.headers);
				break;
		}

		return {headers:request.headers, data:data ?? "no type has been set on FetchData function"};
	} catch (err) {
		console.log(`Fetch function error from url: ${url} \n`, err);
	}
}

function searchObject(jsonData, table) {
	for (var prop in jsonData) {
		if (jsonData.hasOwnProperty("farm_town_id")) {
			table.push(jsonData);
			break;
		} else if (jsonData[prop] instanceof Object) {
			searchObject(jsonData[prop], table);
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
