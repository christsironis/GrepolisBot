const Redis = require("ioredis");
const JSONCache = require("redis-json");
const bcrypt = require("bcrypt");
const process = require("process");
const { Login, PlayerLogin, WorldLogin } = require("./grep_login");
// if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
// }
module.exports = { authenticate, register };

const redis = new Redis({
	port: process.env.REDISPORT,
	host: process.env.HOST,
	password: process.env.PASSWORD,
});


async function authenticate(req, res, next) {
	// let a = await RedisSet("tsiochris0001@yahoo.gr", { psw: "abcdefghik" });
	let username = req.body.username;
	let psw = req.body.psw;
	let userInfo = await RedisGet(username);
	if(!userInfo){
		res.locals.status="The email does't exist try to register using your Grepolis account email and password";
		res.render('login.hbs');
		return;
	}
	let passCheck = await bcrypt.compare(psw, userInfo.psw);
	if(!passCheck){
		res.locals.status="wrong password" ;
		res.render('login.hbs');
		return;
	}
	let login = await Login(username,psw);
	let plr = await PlayerLogin(login);
	res.locals.userInfo={...userInfo ,...await WorldLogin(plr,{id:"gr81"})}
	console.log("user logged in");
	next();
}

async function register(req, res, next){
	let username = req.body.username;
	let psw = req.body.psw;
	let redisExists = await RedisGet(username);
	if(redisExists){
		res.locals.status="User already exists" ;
		res.render('register.hbs');
		return;
	}
	let grepExists = await Login(username,psw);
	if(grepExists.error){
		res.locals.status= grepExists.error ;
		res.render('register.hbs');
		return;
	}
	let playerLogin = await PlayerLogin(grepExists);
	if(playerLogin.error){
		res.locals.status= grepExists.error ;
		res.render('register.hbs');
		return;
	}
	let hash = await bcrypt.hash(psw, 10);
	playerLogin.psw= hash;
	let storeData = await RedisSet(username,playerLogin);
	res.locals.status = storeData;
	next(); 
}

async function RedisSet(property, value) {
	const jsonCache = new JSONCache(redis);
	let data = await jsonCache.set(property, value);
	return data;
}
async function RedisGet(property) {
	const jsonCache = new JSONCache(redis);
	let data = await jsonCache.get(property);
	return data;
}

function exitRedis(){
	redis.quit();
}

process.on('exit', ()=>{
	console.log(`Quit redis and exit `);
})