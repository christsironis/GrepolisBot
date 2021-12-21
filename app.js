const http = require("http");
const fetch = require("node-fetch");

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

let port = process.env.PORT || "3000";

// Login();

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain");
	res.end("Hello World");
});

server.listen(port, () => {
	console.log("Listening to port " + port);
});

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
		let portalId= "portal_tid=" + sUniqueId+";" ;
		let portalData= "portal_data="+portalId;

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

		// phpsessid = /phpsessid[^;]*;/i.exec(index.headers.get("set-cookie"))[0];
		// xsrftoken = /xsrf-token[^;]*;/i.exec(index.headers.get("set-cookie"))[0];

		// let data = await fetch("https://gr0.grepolis.com/start/index?action=login_from_start_page", {
		// 	"headers": {
		// 	  "accept": "text/plain, */*; q=0.01",
		// 	  "accept-language": "en,el;q=0.9",
		// 	  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		// 	  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
		// 	  "sec-ch-ua-mobile": "?0",
		// 	  "sec-ch-ua-platform": "\"Windows\"",
		// 	  "sec-fetch-dest": "empty",
		// 	  "sec-fetch-mode": "cors",
		// 	  "sec-fetch-site": "same-origin",
		// 	  "x-requested-with": "XMLHttpRequest",
		// 	  "cookie": `${phpsessid} metricsUvId=${metricsUvId} ${cid} pid=848924721;`,
		// 	},
		// 	"body": "json=%7B%22name%22%3A%22Okwstastonpairnei%22%2C%22password%22%3A%22%22%2C%22passwordhash%22%3A%22%22%2C%22autologin%22%3Afalse%2C%22window_size%22%3A%221920x937%22%7D",
		// 	"method": "POST",
		// 	redirect: "manual"
		//   });

		let text = await index.text();
		// console.log(text);

		// console.log(`${phpsessid} ${xsrftoken} metricsUvId=${metricsUvId} ${cid}`);
		// console.log(grepol, grepol.headers);
		let h_token =text.match(/CSRF.token = '[^;]*';/igm)[0].split("'")[1];
		let playerName = text.match(/Login.player_name = '[^;]*';/igm)[0].split("'")[1];

		let world= await fetch("https://gr0.grepolis.com/start?action=login_to_game_world", {
			"headers": {
			  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			  "accept-language": "en",
			  "cache-control": "max-age=0",
			  "content-type": "application/x-www-form-urlencoded",
			  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
			  "sec-ch-ua-mobile": "?0",
			  "sec-ch-ua-platform": "\"Windows\"",
			  "sec-fetch-dest": "document",
			  "sec-fetch-mode": "navigate",
			  "sec-fetch-site": "same-origin",
			  "sec-fetch-user": "?1",
			  "upgrade-insecure-requests": "1",
			  "cookie": `${phpsessid} ${cid} metricsUvId=${metricsUvId}; pid=848924721;`,
			  "Referer": "https://gr0.grepolis.com/start/index",
			  "Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": `world=gr81&facebook_session=&facebook_login=&token=${h_token}&portal_sid=&name=${playerName}&password=` ,
			"method": "POST",
			redirect: "manual"
		  });

		//   console.log(world,world.headers);

		  const login_startup_time = new Date().getTime();

		  let sessId= "sid="+ world.headers.get("location").match(/session_id=[^&]*/i)[0].split("=")[1]+ ";";
		    let session =await fetch(world.headers.get("location"), {
		  	"headers": {
		  	  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		  	  "cookie": `metricsUvId=${metricsUvId}; login_startup_time=${login_startup_time}%2C0%2Cbrowser` ,
		  	},
		  	"body": null,
		  	"method": "GET",
		  	redirect: "manual"
		    });

			cid = /cid[^;]*;/i.exec(session.headers.get("set-cookie"))[0];

		  let worldIndex = await fetch(session.headers.get("location"), {
		  	"headers": {
		  	  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		  	  "cookie": `metricsUvId=${metricsUvId}; login_startup_time=${login_startup_time}%2C0%2Cbrowser; ${cid} ${sessId} logged_in=false`,
		  	},
		  	"body": null,
		  	"method": "GET"
		    });
		  console.log(worldIndex.headers);
	} catch (err) {
		console.log("kati gia error leei:", err.message);
	}
}

// async function zwdia(){
// 	try{
// 	let dereg= await fetch("https://api.antenna.gr/v100/api/auth.class.api.php/deregister/354?format=json&seviceID=default", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en,el;q=0.9",
//     "content-type": "application/x-www-form-urlencoded",
//   },
//   "body": "versionNumber=1.0.7&modelNumber=Mozilla%2F5.0+%28Windows+NT+10.0%3B+Win64%3B+x64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F96.0.4664.93+Safari%2F537.36&accountType=mediahq_fa&appID=Antenna&plt=web&format=json&deviceId=Web-v1-1fc9950e28bd63dae05b09faffada689-56ea5532aabc3f6d1ab75d2b070d5f12-0.25319102333487575&loginToken=494b735036646c63446d656d79445938534a74654b67784f494e4e61776e307379335856456c38355848766754486e5a397675785847356630616a52716e47304f6a43476d3432427a4f5849784d4a4f6a71326e685a6639436279633776783931626c45686f464c7a73735872495177586f6c2b7679724247656b7130495930706f505672412f6b672b56536569534b4178566b2f7a737a37644f736e493879794c33397064464850742b6d536c4474634434647563774778667432706f6c37746730554e45395171726f577a667773314b2f345979497532733657433671794f68463564587a656838424766387a393644322f75437133445578663932333469444135343558794d59654c5466633338663942502b6970463779675546465443646f6d2f326136305564575250497a394c33516b46577977646c687947786c62426c4c6557465449747774303842372b3835466d4c656f56764c50493967737278644b502f567930424d5878756b67695742744e516767513565534b4137694d363449653062454c796672677a3137486b797345392f31542f6e4832364e5546647767517031786e735930373245763431342b61387a64524a4d4d327534583978484c7749336b4b6655526c6a6c4b4d70754e695151556c6a6167554a384154504b64635266765a44373935426a333737663773302b776f3145417568354336736e7136624776464d432b374e3564454a676251486769397a66345442794452483279324c7a71524b713754376d31766d76543552387672725a71334f706530474d33676e5737346978493350584c4f7a762f624f4c78344a4166317a6b4c7057736354357a534776326d4738584d6b6541424f6f4f4f625a796b786b5452684356374c50784a6e5232436e4d2b774b374273586b62394b6d4b30665a6c693876574f3150764b374e566c3349483937364d6b494a6a4a766c556a78432b7537656d337558364d7a714f3176664f316f794b626158476b4c687242436478644c6f644d785a4d466656686a7732794a2f67425766374f56354c7859556139464a654e74534f327a4b4e38326e42725934774e4674777156626363726434652b61447a567934344843316b3d",
//   "method": "POST"
// });
// let json = await dereg.json();
// console.log(json,dereg.headers);
// 	}
// 	catch(err){
// 		console.log("kati gia error leei:", err.message);
// 	}
// }

// zwdia()