const { RedisGet, RedisSet } = require("./Redis_Funct");
const { Login, PlayerLogin, WorldLogin, Farming } = require("./Grep_Funct");

module.exports={ Refresh };

let data;

Begginer();

async function RepeaterSpecific(user,world,city){
    if(!data?.[user]?.towns?.[world]){ return; }

    let login = await Login(data[user].username,data[user].psw);
    let playerLogin = await PlayerLogin(login);
    // console.log(data[user].towns[world][city].farms[0]);
    let claimData=await Farming(playerLogin,world,data[user].towns[world][city]);
    let nextFarm = claimData.nextFarm - new Date().getTime();
    nextFarm = nextFarm + 1000 + Math.floor(Math.random()* data[user].towns[world][city].extraTime +1) * 1000  ;
    console.log("now= " +new Date(),"nextFarm= " + new Date(new Date().getTime() + nextFarm));   
    setTimeout( RepeaterSpecific, nextFarm, user,world,city );
}

async function Begginer(){
    data = await RedisGet("jobs");
    console.log(data);
    if(!Object.keys(data ?? 0).length){ return; }
    
    for(let user in data){
        let login = await Login(data[user].username,data[user].psw);
        let playerLogin = await PlayerLogin(login);
        for( let world in data[user].towns){
            for(let city in data[user].towns[world]){
                let claimData=await Farming(playerLogin,world,data[user].towns[world][city]);
                let nextFarm = claimData.nextFarm - new Date().getTime();
                nextFarm = nextFarm + 1000 + Math.floor(Math.random()* data[user].towns[world][city].extraTime +1) * 1000  ;
                console.log("now= " +new Date(),"nextFarm= " + new Date(new Date().getTime() + nextFarm));
                setTimeout( RepeaterSpecific, nextFarm, user, world, city );
            }
        }
    }
}

async function Refresh(user,world,city ){
    let exists=false;
    if(data?.[user]?.towns?.[world][city]){
       exists = true;
    }
    data = await RedisGet("jobs");
    console.log(data);
    if( !exists && data?.[user]?.towns?.[world][city]){
        RepeaterSpecific( user,world,city );
    }
}
