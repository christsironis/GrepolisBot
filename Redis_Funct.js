const Redis = require("ioredis");
const JSONCache = require("redis-json");
const process = require("process");
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

module.exports = { RedisGet, RedisSet, exitRedis };

// const redis = new Redis({
// 	port: process.env.REDISPORT,
// 	host: process.env.HOST,
// 	password: process.env.PASSWORD,
// });
// redis.flushall();

async function RedisSet(property, value) {
	const redis = new Redis({
		port: process.env.REDISPORT,
		host: process.env.HOST,
		password: process.env.PASSWORD,
	});
	const jsonCache = new JSONCache(redis);
	await jsonCache.del(property);
	// console.log("Redis set function=",value,property)
	let data = await jsonCache.set(property, value);
	redis.quit();
	return data;
}
async function RedisGet(prop1) {
	const redis = new Redis({
		port: process.env.REDISPORT,
		host: process.env.HOST,
		password: process.env.PASSWORD,
	});
	const jsonCache = new JSONCache(redis);
	let data = await jsonCache.get(prop1);
	redis.quit();
	return data;
}

function exitRedis(){
	redis.quit();
}

process.on('exit', ()=>{
	exitRedis();
	console.log(`Quit redis and exit `);
})