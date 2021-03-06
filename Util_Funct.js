const { Login, PlayerLogin, WorldLogin } = require("./Grep_Funct");
const { RedisGet, RedisSet } = require("./Redis_Funct");
const { Refresh } = require("./Repeater_Funct.js");

module.exports = { authenticate, setAutomation };

async function authenticate(req, res, next) {
	if(!req.body.username){
		res.render("login.hbs"); 
		return;
	}
	let username = req.body.username.toLowerCase();
	let psw = req.body.psw;
	let data = await RedisGet("jobs") ?? {};
	console.log(data);
	redisData = data?.[username];
	let userInfo = redisData?.playerLoginCookies;
	if(!userInfo){
		let grepUser = await Login(username,psw);
		if(grepUser.error){
			res.locals.status="The email or password is wrong try again using your Grepolis account email and password";
			res.render('login.hbs');
			return;
		}
		userInfo = await PlayerLogin(grepUser);
		if(userInfo.error){
			res.locals.status= userInfo.error ;
			res.render('login.hbs');
			return;
		}
	}else{
		console.log("using playerLoginCookies ")
	}

	for(let worldId of userInfo.worlds){
		let townsForWorld = await WorldLogin(userInfo,worldId);
		if(townsForWorld.error) {continue;}
		if(redisData){
			for(let city in townsForWorld[worldId.id]){
				// console.log(city)
				for(let redWorld in redisData.towns ){
					for(let townData in redisData.towns[redWorld] ){
						if(townData == city){
							// console.log("eisai mlks")
							townsForWorld[worldId.id][city]={...townsForWorld[worldId.id][city], ...redisData.towns[redWorld][townData]};
						}
					}
				}
			}
		}
		userInfo.towns= { ...userInfo.towns, ...townsForWorld };
	}

	// console.log(/* [redisData], */userInfo.towns)
	userInfo.username = username;
	userInfo.psw = psw;
	res.locals.userInfo=userInfo;
	next();
}

async function setAutomation(req, res, next){
	try{
		let username=Object.keys(req.body)[0];
		let worldId=Object.keys(req.body[username].towns)[0];
		let townId=Object.keys(req.body[username].towns[worldId])[0];
		let alreadyEx = await RedisGet("jobs") ?? {};
		// console.log(alreadyEx)
		// alreadyEx = alreadyEx?.[username];
		
		if(alreadyEx?.[username]){
			console.log("alreadyEx= ",alreadyEx?.[username])
			if( !req.body[username].towns[worldId][townId].activeForAll ){
				if(Object.keys(alreadyEx[username].towns[worldId]).length == 1){
					delete alreadyEx[username].towns[worldId];
					if(Object.keys(alreadyEx[username].towns).length < 2){
						delete alreadyEx[username];
					}
				} else{
					delete alreadyEx[username].towns[worldId][townId];
				}
				// console.log("alreadyEx after deletion= ",alreadyEx[username].towns)
			} else{console.log(alreadyEx)
				alreadyEx[username].towns[worldId]= { ...alreadyEx[username].towns[worldId], ...req.body[username].towns[worldId] }
				console.log("deuterh periptwsh = ",alreadyEx[username]);
			}
		} 
		else{
			console.log(req.body[username]);
			if(req.body[username].towns[worldId][townId].activeForAll){
				alreadyEx[username]= req.body[username];
			}
		}
		await RedisSet("jobs", alreadyEx );
		Refresh( username, worldId, townId);
		res.status(200).json({status:"success"});
	}catch(err){
		console.log(err);
	}
}

async function saveJson(data){
	try {
		let a =  JSON.stringify(data);
		fs.writeFileSync('data.json', a);
		console.log("JSON data is saved.");
	} catch (err) {
		console.error(err);
	}
}
async function getJson(data){
	try {
		let file = fs.readFileSync('data.json')
		let a= JSON.parse(file)
		// console.log(a.data)
		return a[data];
	} catch (err) {
		console.error(err);
	}
}