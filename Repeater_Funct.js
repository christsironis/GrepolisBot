const { RedisGet, RedisSet } = require("./Redis_Funct");
const { Login, PlayerLogin, WorldLogin, Farming } = require("./Grep_Funct");

module.exports={ Refresh };

let data;

Repeater();

async function RepeaterSpecific(user,world,city){
    if(!Object.keys(data[user]).length){ return; }

    let login = await Login(data[user].username,data[user].psw);
    let playerLogin = await PlayerLogin(login);
    // console.log(data[user].towns[world][city].farms[0]);
    let claimData=await Farming(playerLogin,world,data[user].towns[world][city]);

    let nextFarm = (claimData.data.json.notifications?.[1].param_str.match(/(?<="lootable_at\":)[^,]*/gi)[0] * 1000) || Number(claimData.login_startup_time) + 300000;
    console.log(nextFarm - new Date().getTime(),new Date(),new Date(nextFarm));   
    setTimeout( RepeaterSpecific,nextFarm - new Date().getTime() + 1000 + data[user].towns[world][city].extraTime * 1000, user,world,city );
}

async function Repeater(){
    data = await RedisGet("jobs");
    console.log(data);
    if(!Object.keys(data).length){ return; }
    for(let user in data){
        let login = await Login(data[user].username,data[user].psw);
        let playerLogin = await PlayerLogin(login);
        for( let world in data[user].towns){
            for(let city in data[user].towns[world]){
                console.log(data[user].towns[world][city].farms[0]);
                let claimData=await Farming(playerLogin,world,data[user].towns[world][city]);
                let nextFarm = (claimData.data.json.notifications?.[1].param_str.match(/(?<="lootable_at\":)[^,]*/gi)[0] * 1000) || Number(claimData.login_startup_time) + 300000;
                console.log(nextFarm - new Date().getTime(),new Date(nextFarm));   
                setTimeout( RepeaterSpecific,nextFarm - new Date().getTime() + 1000 + data[user].towns[world][city].extraTime * 1000, user,world,city );
            }
        }
    }
}

async function Refresh(user,world,city ){
    if(!Object.keys(data[user][world][city])){
        RepeaterSpecific( user,world,city );
    }
    data = await RedisGet("jobs");
    console.log(data);
}
