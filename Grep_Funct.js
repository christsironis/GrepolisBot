const fetch = require("node-fetch");

module.exports = { Login, PlayerLogin, WorldLogin, Farming };

async function Login(username,psw) {
	try {
		var sUniqueId = new Date().getTime() + "-" + Math.round(Math.random() * Math.pow(10, 5));
		let portalId = "portal_tid=" + sUniqueId + ";";
		let portalData = "portal_data=" + portalId;
		let metricsUvId = "metricsUvId=" + MetricsUvId() + ";";
		let phpsessid;
		let xsrftoken;
		let pid;
		let hash;

		let firstCookies = await FetchData("https://gr.grepolis.com/", "noType", 0, {
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
			method: "GET",
			redirect: "manual",
		});

		phpsessid = firstCookies.headers.get("set-cookie").match(/phpsessid[^;]*;/i)[0];
		xsrftoken = firstCookies.headers.get("set-cookie").match(/xsrf-token[^;]*;/i)[0];

		let loginCheck = await FetchData("https://gr.grepolis.com/glps/login_check", "noType", 0, {
			headers: {
				accept: "application/json, text/plain, */*",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"x-xsrf-token": xsrftoken.split("=")[1].split(";")[0],
				cookie: `${phpsessid} ${xsrftoken} ${metricsUvId} ${portalId} ${portalData} device_view=full; `,
			},
			body: `login%5Buserid%5D=${username}&login%5Bpassword%5D=${psw}&login%5Bremember_me%5D=false`,
			method: "POST",
			redirect: "manual",
		});

		phpsessid = loginCheck.headers.get("set-cookie").match(/phpsessid[^;]*;/i)[0];

		let grepolis = await FetchData(loginCheck.headers.get("location"), "text", 0, {
			headers: {
				"content-type": "text/html; charset=UTF-8",
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${phpsessid} ${xsrftoken} ${metricsUvId} ${portalId} ${portalData} device_view=full; `,
			},
			body: null,
			method: "GET",
			redirect: "manual",
		});

		xsrftoken = grepolis.headers.get("set-cookie").match(/xsrf-token[^;]*;/i)[0];
		pid = grepolis.headers.get("location").match(/(?<=player_id=)[^&]*/i)[0];
		hash = grepolis.headers.get("location").match(/(?<=hash=).*/i)[0];

		return {redirect: grepolis.headers.get("location"), metricsUvId : metricsUvId, phpsessid : phpsessid, xsrftoken : xsrftoken, pid : pid, hash: hash, username: username, psw: psw}
	
	} catch (err) {
		console.log("kati gia error leei:", err);
		return {error:err}
	}
}

async function PlayerLogin(data) {
	try {
		let metricsUvId=data.metricsUvId;
		let phpsessid=data.phpsessid;
		let xsrftoken=data.xsrftoken;
		let hash= data.hash;
		let pid=data.pid;
		let playerName;
		let h_Token;
		let cid;
		let worlds=[];

		let loginPlayer = await FetchData(data.redirect, "noType", 0, {
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
				cookie: `${phpsessid} ${cid} ${metricsUvId} pid=${pid};`,
			},
			body: null,
			method: "GET",
			redirect: "manual",
		});

		phpsessid = loginPlayer.headers.get("set-cookie").match(/phpsessid[^;]*;/i)[0];
		cid = loginPlayer.headers.get("set-cookie").match(/cid[^;]*;/i)[0];

		let index = await FetchData(loginPlayer.headers.get("location"), "text", 0, {
			headers: {
				"content-type": "text/html; charset=UTF-8",
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${phpsessid} ${cid} ${metricsUvId} pid=${pid};`,
			},
			body: null,
			method: "GET",
			redirect: "manual",
		});

		h_Token = index.data.match(/(?<=CSRF\.token = ["'])[^"']*/gim)[0];
		playerName = index.data.match(/(?<=Login.player_name = ["'])[^"']*/gim)[0];
		let worldsData = index.data.match(/"id":"[^'"]*","name":"[^'"]*"(?=,"playing_on":true,)/gim);
		for (let world of worldsData) {
			worlds.push(JSON.parse("{" + world + "}"));
		}
		// console.log(worlds)

		return { metricsUvId : metricsUvId, playerName: playerName, phpsessid : phpsessid, xsrftoken : xsrftoken, h_Token : h_Token, cid : cid, pid : pid, hash: hash, worlds: worlds}
	
	} catch (err) {
		console.log("kati gia error leei:", err);
		return {error:err}
	}
}

async function WorldLogin(data,currentWorld) {
	try {
		let metricsUvId=data.metricsUvId;
		let login_startup_time;
		let phpsessid=data.phpsessid;
		let h_Token=data.h_Token;
		let playerName=data.playerName;
		let cid=data.cid;
		let pid=data.pid;
		let ts=data.ts;
		let worlds=data.worlds;
		let tid;
		let sessId;
		let towns={};


		let worldLogin = await FetchData(`https://gr0.grepolis.com/start?action=login_to_game_world`,"noType",	0,
			{
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
					cookie: `${phpsessid} ${cid} ${metricsUvId} pid=${pid};`,
					Referer: "https://gr0.grepolis.com/start/index",
					"Referrer-Policy": "strict-origin-when-cross-origin",
				},
				body: `world=${currentWorld.id}&facebook_session=&facebook_login=&token=${h_Token}&portal_sid=&name=${playerName}&password=`,
				method: "POST",
				redirect: "manual",
			}
		);

		login_startup_time = worldLogin.headers.get("set-cookie").match(/(?<=login_startup_time=)[^%]*/gi)[0];
		sessId = "sid=" + worldLogin.headers.get("location").match(/(?<=session_id=)[^&]*/i)[0] + ";";

		let session = await FetchData(worldLogin.headers.get("location"), "noType", 0, {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${metricsUvId} login_startup_time=${login_startup_time}%2C0%2Cbrowser`,
			},
			body: null,
			method: "GET",
			redirect: "manual",
		});

		cid = session.headers.get("set-cookie").match(/cid[^;]*;/i)[0];
		ts = session.headers.get("location").match(/(?<=ts=).*/i)[0];

		let worldIndex = await FetchData(session.headers.get("location"), "text", 0, {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${metricsUvId} login_startup_time=${login_startup_time}%2C0%2Cbrowser; ${cid} ${sessId} logged_in=false`,
			},
			body: null,
			method: "GET",
		});

		h_Token = worldIndex.data.match(/(?<=csrfToken":['"])[^"']*/gim)[0];
		tid = worldIndex.headers.get("set-cookie").match(/(?<=toid=)[^;]*/gi)[0];

		let town_data = await FetchData(
			`https://${currentWorld.id}.grepolis.com/game/data?town_id=${tid}&action=get&h=${h_Token}`, "json",	0,
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
					cookie: `${metricsUvId} ${cid} ${sessId} login_startup_time=${login_startup_time}%2C0%2Cbrowser toid=${tid}; logged_in=false; ig_conv_last_site=https://${currentWorld.id}.grepolis.com/game/index;`,
				},
				body: `json=%7B%22types%22%3A%5B%7B%22type%22%3A%22easterIngredients%22%7D%2C%7B%22type%22%3A%22map%22%2C%22param%22%3A%7B%22x%22%3A15%2C%22y%22%3A6%7D%7D%2C%7B%22type%22%3A%22bar%22%7D%2C%7B%22type%22%3A%22backbone%22%7D%5D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D`,
				method: "POST",
			}
		);

		town_data = town_data.data["json"];
		towns[currentWorld.id]= {["t"+tid]: { tid: tid, farms: searchObject(town_data, "farm_town_id"), town_data: searchObject(town_data, "model_class_name", "Town")[0]["data"]}};

		let townsIds= searchObject(town_data, "model_class_name", "TownIdList")[0]["data"]["town_ids"];
		townsIds = townsIds.filter( id => id != tid );
		for( let town_id of townsIds){
			let townInfo =  await FetchData(`https://${currentWorld.id}.grepolis.com/game/data?town_id=${town_id}&action=get&h=${h_Token}`, "json",	0,
				{headers: {
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
						cookie: `${metricsUvId} ${cid} ${sessId} login_startup_time=${login_startup_time}%2C0%2Cbrowser toid=${town_id}; logged_in=false; ig_conv_last_site=https://${currentWorld.id}.grepolis.com/game/index;`,
					},
					body: `json=%7B%22types%22%3A%5B%7B%22type%22%3A%22easterIngredients%22%7D%2C%7B%22type%22%3A%22map%22%2C%22param%22%3A%7B%22x%22%3A15%2C%22y%22%3A6%7D%7D%2C%7B%22type%22%3A%22bar%22%7D%2C%7B%22type%22%3A%22backbone%22%7D%5D%2C%22town_id%22%3A${town_id}%2C%22nl_init%22%3Afalse%7D`,
					method: "POST",
			});
			await Frondend_bridge({ metricsUvId : metricsUvId, h_Token : h_Token, cid : cid, pid : pid, wid: currentWorld.id , tid: town_id , sessId: sessId, ts: ts});
			towns[currentWorld.id]={ ...towns[currentWorld.id], ["t"+town_id]: { tid: town_id, farms: searchObject(townInfo, "farm_town_id"), town_data: searchObject(townInfo, "model_class_name", "Town")[0]["data"]}};		
		}

		return towns;

	} catch (err) {
		console.log("kati gia error leei:", err);
		return {error:err}
	}
}


async function Farming(data,currentWorld,town) {
	try {
		let metricsUvId=data.metricsUvId;
		let phpsessid=data.phpsessid;
		let playerName=data.playerName;
		let h_Token=data.h_Token;
		let cid=data.cid;
		let pid=data.pid;
		let login_startup_time;
		let ts;
		let sessId;
		let tid= town.tid;
		let nextFarm;
		let townData={};
		
		let worldLogin = await FetchData(`https://gr0.grepolis.com/start?action=login_to_game_world`,"noType",	0,
			{
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
					cookie: `${phpsessid} ${cid} ${metricsUvId} pid=${pid};`,
					Referer: "https://gr0.grepolis.com/start/index",
					"Referrer-Policy": "strict-origin-when-cross-origin",
				},
				body: `world=${currentWorld}&facebook_session=&facebook_login=&token=${h_Token}&portal_sid=&name=${playerName}&password=`,
				method: "POST",
				redirect: "manual",
			}
		);

		login_startup_time = worldLogin.headers.get("set-cookie").match(/(?<=login_startup_time=)[^%]*/gi)[0];
		sessId = "sid=" + worldLogin.headers.get("location").match(/(?<=session_id=)[^&]*/i)[0] + ";";

		let session = await FetchData(worldLogin.headers.get("location"), "noType", 0, {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${metricsUvId} login_startup_time=${login_startup_time}%2C0%2Cbrowser`,
			},
			body: null,
			method: "GET",
			redirect: "manual",
		});

		cid = session.headers.get("set-cookie").match(/cid[^;]*;/i)[0];
		ts = session.headers.get("location").match(/(?<=ts=).*/i)[0];

		let worldIndex = await FetchData(session.headers.get("location"), "text", 0, {
			headers: {
				accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				cookie: `${metricsUvId} login_startup_time=${login_startup_time}%2C0%2Cbrowser; ${cid} ${sessId} logged_in=false`,
			},
			body: null,
			method: "GET",
		});

		h_Token = worldIndex.data.match(/(?<=csrfToken":['"])[^"']*/gim)[0];
		tid = worldIndex.headers.get("set-cookie").match(/(?<=toid=)[^;]*/gi)[0];

		let getTownData = await FetchData(
			`https://${currentWorld}.grepolis.com/game/data?town_id=${tid}&action=get&h=${h_Token}`, "json",	0,
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
					cookie: `${metricsUvId} ${cid} ${sessId} login_startup_time=${login_startup_time}%2C0%2Cbrowser toid=${tid}; logged_in=false; ig_conv_last_site=https://${currentWorld}.grepolis.com/game/index;`,
				},
				body: `json=%7B%22types%22%3A%5B%7B%22type%22%3A%22easterIngredients%22%7D%2C%7B%22type%22%3A%22map%22%2C%22param%22%3A%7B%22x%22%3A15%2C%22y%22%3A6%7D%7D%2C%7B%22type%22%3A%22bar%22%7D%2C%7B%22type%22%3A%22backbone%22%7D%5D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D`,
				method: "POST",
			}
		);

		await Frondend_bridge({ metricsUvId : metricsUvId, h_Token : h_Token, cid : cid, pid : pid, wid: currentWorld , tid: tid , sessId: sessId, ts: ts});

		getTownData = getTownData.data["json"];
		townData= { farms: searchObject(getTownData, "farm_town_id"), town_data: searchObject(getTownData, "model_class_name", "Town")[0]["data"]};

		h_Token = worldIndex.data.match(/(?<=csrfToken":['"])[^"']*/gim)[0];
		let storage = townData.town_data.storage;
		let wood = townData.town_data.resources.wood + Math.floor( townData.town_data.production.wood * ( (new Date().getTime() - new Date(townData.town_data.resources_last_update*1000)) / 3600000 ) );
		let stone = townData.town_data.resources.stone + Math.floor( townData.town_data.production.stone * ( (new Date().getTime() - new Date(townData.town_data.resources_last_update*1000)) / 3600000 ) );
		let iron = townData.town_data.resources.iron + Math.floor( townData.town_data.production.iron * ( (new Date().getTime() - new Date(townData.town_data.resources_last_update*1000)) / 3600000 ) );
		console.log(`\n Town = ${townData.town_data.name} \n current wood= ${wood > storage ? "Full:"+storage : wood} \n current stone= ${stone > storage ? "Full:"+storage : stone} \n current iron= ${iron > storage ? "Full:"+storage : iron}`) 

		if( wood < storage || stone < storage || iron < storage  ){
			for( let farm in townData.farms){
				let farmTime = townData.farms?.[farm]?.lootable_at * 1000;
				if( (farmTime - new Date().getTime()) < 0){
					await Frondend_bridge({ metricsUvId : metricsUvId, h_Token : h_Token, cid : cid, pid : pid, wid: currentWorld.id , tid: town_id , sessId: sessId, ts: ts},
						true,
						{ftid: townData.farms[farm].farm_town_id, optionForAll: town.optionForAll , fPRelation: townData.farms[farm].id});
					let farming = await FetchData(`https://${currentWorld}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=execute&h=${h_Token}`,"json", 2, {
						"headers": {
						"accept": "text/plain, */*; q=0.01",
						"accept-language": "en,el;q=0.9",
						"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
						"sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": "\"Windows\"",
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "same-origin",
						"x-requested-with": "XMLHttpRequest",
						"cookie": `${metricsUvId} ${cid} ${sessId} login_startup_time=${login_startup_time}%2C0%2Cbrowser toid=${tid}; logged_in=false; ig_conv_last_site=https://${currentWorld}.grepolis.com/game/index;`,
						"Referer": `https://${currentWorld}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts}`,
						"Referrer-Policy": "strict-origin-when-cross-origin"
						},
						"body": `json=%7B%22model_url%22%3A%22FarmTownPlayerRelation%2F${townData.farms[farm].id}%22%2C%22action_name%22%3A%22claim%22%2C%22arguments%22%3A%7B%22farm_town_id%22%3A${townData.farms[farm].farm_town_id}%2C%22type%22%3A%22resources%22%2C%22option%22%3A${town.optionForAll}%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Atrue%7D`,
						"method": "POST"
					});
					nextFarm = nextFarm || (farming.data.json.notifications?.[1]?.param_str.match?.(/(?<="lootable_at\":)[^,]*/gi)[0] * 1000);
				} else {
					nextFarm = nextFarm || farmTime;
				}
			}
			console.log(` lootable at = ${nextFarm}`);
		} else { 
			console.log("\n City storage is full. \n"); 
			nextFarm = Number(login_startup_time) + 3600000;
		}

		nextFarm = nextFarm || Number(login_startup_time) + 300000;
		return {nextFarm: nextFarm}
	} catch (err) {
		console.log("kati gia error leei:", err);
		return {error:err}
	}
}
async function Frondend_bridge(data, forFarms=false, fData={}){
	let metricsUvId=data.metricsUvId;
	let h_Token=data.h_Token;
	let wid = data.wid;
	let cid=data.cid;
	let pid=data.pid;
	let ts_ref = data.ts;
	let sessId = data.sessId;
	let tid= data.tid;
	let fPRelation = fData?.fPRelation;
	let ftid = fData?.ftid;
	let optionForAll = fData?.optionForAll;

	if(!forFarms){
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=refetch&h=${h_Token}&json=%7B%22collections%22%3A%7B%22BuildingBuildDatas%22%3A%5B%5D%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		});
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=refetch&h=${h_Token}&json=%7B%22collections%22%3A%7B%22Towns%22%3A%5B%5D%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		});
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=refetch&h=${h_Token}&json=%7B%22collections%22%3A%7B%22Units%22%3A%5B%5D%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		});
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=refetch&h=${h_Token}&json=%7B%22collections%22%3A%7B%22TownGroupTowns%22%3A%5B%5D%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Afalse%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		});
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=fetch&h=${h_Token}&json=%7B%22window_type%22%3A%22daily_login%22%2C%22tab_type%22%3A%22index%22%2C%22known_data%22%3A%7B%22models%22%3A%5B%5D%2C%22collections%22%3A%5B%5D%2C%22templates%22%3A%5B%5D%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Atrue%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
				},
				"body": null,
				"method": "GET"
		});
	} else{	
		////// farm_towns requests
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=fetch&h=${h_Token}&json=%7B%22window_type%22%3A%22farm_town%22%2C%22tab_type%22%3A%22index%22%2C%22known_data%22%3A%7B%22models%22%3A%5B%22PlayerKillpoints%22%2C%22PremiumFeatures%22%5D%2C%22collections%22%3A%5B%22FarmTownPlayerRelations%22%2C%22FarmTowns%22%2C%22Towns%22%2C%22CastedPowers%22%5D%2C%22templates%22%3A%5B%5D%7D%2C%22arguments%22%3A%7B%22farm_town_id%22%3A1738%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Atrue%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
				},
				"body": null,
				"method": "GET"
		});
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=execute&h=${h_Token}&json=%7B%22model_url%22%3A%22FarmTownPlayerRelation%22%2C%22action_name%22%3A%22getTownSpecificData%22%2C%22arguments%22%3A%7B%22farm_town_id%22%3A1738%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Atrue%7D&_=${new Date().getTime()}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		});
		await FetchData(`https://${wid}.grepolis.com/game/frontend_bridge?town_id=${tid}&action=execute&h=${h_Token}`, "json",	0, {
			"headers": {
				"accept": "text/plain, */*; q=0.01",
				"accept-language": "en,el;q=0.9",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": `${metricsUvId} ${cid} ${sessId} toid=${tid}; logged_in=false; ig_conv_last_site=https://${wid}.grepolis.com/game/index;`,
				"Referer": `https://${wid}.grepolis.com/game/index?login=1&p=${pid}&ts=${ts_ref}`,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": `json=%7B%22model_url%22%3A%22FarmTownPlayerRelation%2F${fPRelation}%22%2C%22action_name%22%3A%22claim%22%2C%22arguments%22%3A%7B%22farm_town_id%22%3A${ftid}%2C%22type%22%3A%22resources%22%2C%22option%22%3A${optionForAll}%7D%2C%22town_id%22%3A${tid}%2C%22nl_init%22%3Atrue%7D`,
			"method": "POST"
		});
	}
}

function searchObject(jsonData, propertyName, propertyValue) {
	let result = [];
	if (jsonData.hasOwnProperty(propertyName)) {
		if (propertyValue && jsonData[propertyName] === propertyValue) {
			result.push(jsonData);
		} else if (!propertyValue) {
			result.push(jsonData);
		}
	} else {
		for (var prop in jsonData) {
			if (jsonData[prop] instanceof Object) {
				result = [...result, ...searchObject(jsonData[prop], propertyName, propertyValue)];
			}
		}
	}
	return result;
}

async function FetchData(url, type = "none", debug = 0, headers) {
	try {
		let request = await fetch(url, headers);
		let data;

		switch (type) {
			case "text":
				data = await request.text();
				break;
			case "json":
				data = await request.json();
				break;
		}

		switch (debug) {
			case 1:
				console.log(`url = ${request.url} \t response = ${request.statusText} ${request.status} \n`,request.headers	);
				break;
			case 2:
				console.log(`data = \n ${JSON.stringify(data) ?? "no data"}`);
				break;
		}

		return { headers: request.headers, data: data ?? "no type has been set on FetchData function" };
	} catch (err) {
		console.log(`Fetch function error from url: ${url} \n`, err);
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
