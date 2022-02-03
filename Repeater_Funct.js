const { RedisGet, RedisSet } = require("./Redis_Funct");
const { Login, PlayerLogin, WorldLogin, Farming } = require("./Grep_Funct");

module.exports={ Refresh };

let data;

Begginer();

// it is being called by Begginer or when someone activates a new automation for a city
async function RepeaterSpecific(user,world,city){
    if(!data?.[user]?.towns?.[world]){ return; }

    let playerLoginCookies;
    if(data[user].playerLoginCookies){
        playerLoginCookies = data[user].playerLoginCookies;
        console.log("using playerLoginCookies ")
    }
    else {
        let login = await Login(data[user].username,data[user].psw);
        playerLoginCookies = await PlayerLogin(login);
        data[user].playerLoginCookies = playerLoginCookies;
        RedisSet("jobs", data );
        console.log("Creating new playerLoginCookies ")
    }
    let claimData=await Farming(playerLoginCookies,world,data[user].towns[world][city]);

    let nextFarm = claimData.nextFarm - new Date().getTime();
    nextFarm = nextFarm + (5+Math.floor(Math.random() * 6)*1000) + Math.floor(Math.random()* data[user].towns[world][city].extraTime +1) * 1000  ;
    console.log("now= " +new Date(),"nextFarm= " + new Date(new Date().getTime() + nextFarm));   
    setTimeout( RepeaterSpecific, nextFarm, user,world,city );
}
// runs once when the server starts and then sets a timeout to run RepeaterSpecific for each city of each user
async function Begginer(){
    data = await RedisGet("jobs");
    console.log(data);
    if(!Object.keys(data ?? 0).length){ return; }
    
    for(let user in data){
        let playerLoginCookies;
        if(data[user].playerLoginCookies){
            playerLoginCookies = data[user].playerLoginCookies;
            console.log("using playerLoginCookies ");
        }
        else {
            let login = await Login(data[user].username,data[user].psw);
            playerLoginCookies = await PlayerLogin(login);
            data[user].playerLoginCookies = playerLoginCookies;
            RedisSet("jobs", data );
            console.log("Creating new playerLoginCookies ")
        }
        for( let world in data[user].towns){
            for(let city in data[user].towns[world]){
                let claimData=await Farming(playerLoginCookies,world,data[user].towns[world][city]);
                let nextFarm = claimData.nextFarm - new Date().getTime();
                nextFarm = nextFarm + (5+Math.floor(Math.random() * 6)*1000) + Math.floor(Math.random()* data[user].towns[world][city].extraTime +1) * 1000  ;
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
