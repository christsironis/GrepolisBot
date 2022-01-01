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
                console.log(data[user].towns[world][city].farms[0],new Date(data[user].towns[world][city].farms[0].lootable_at*1000));
                let a=await Farming(playerLogin,world,data[user].towns[world][city])
                // console.log(a.json.notifications[1].param_str.match(/(?<="lootable_at\":)[^,]*/gi)[0]);                
            }
        }
    }
}

// Repeater();