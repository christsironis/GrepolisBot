const { RedisGet, RedisSet } = require("./Redis_Funct");
const { Login, PlayerLogin, WorldLogin, Farming } = require("./Grep_Funct");


async function Repeater(){
    let data = await RedisGet("jobs");
    console.log(data);
    for(let user in data){
        let login = await Login(data[user].username,data[user].psw);
        let playerLogin = await PlayerLogin(login);
        for( let world in data[user].towns){
            for(let city in data[user].towns[world]){
                console.log(data[user].towns[world][city]);
                console.log(await Farming(playerLogin,world,city.town_data));
                
            }
        }
    }
}

Repeater();