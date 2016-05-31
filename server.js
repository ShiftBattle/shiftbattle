var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
// serve static files from the current directory
app.use(express.static(__dirname));
//we'll keep clients data here
var clients = {};
var updatedPowers = [];
powerUpUpdate();

//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;
//create an instance of EurecaServer
var eurecaServer = new EurecaServer({allow:['killPowerups', 'setInfo', 'spawnEnemy', 'kill', 'updateState', 'updatePowerUps']});
//attach eureca.io to our http server
eurecaServer.attach(server);
//eureca.io provides events to detect clients connect/disconnect
//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
    
    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
    
    //register the client
    clients[conn.id] = {id:conn.id, remote:remote};
    
    //here we call setId (defined in the client side)
    remote.setInfo({id: conn.id, powerups: updatedPowers});  
    
});
//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
    
    var removeId = clients[conn.id].id;
    
    delete clients[conn.id];
    
    for (var c in clients)
    {
        
        var remote = clients[c].remote;
        
        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }   
});

eurecaServer.exports.handshake = function(connId)
{
    var remote = clients[connId].remote;
    
    // loop thru all players
    for (var cc in clients)
    {
        
        if (cc === connId) {
            continue;
        }
        //send latest known position
        var x = clients[cc].laststate ? clients[cc].laststate.x:  0;
        var y = clients[cc].laststate ? clients[cc].laststate.y:  0;
        
        // send current player to new player
        remote.spawnEnemy(clients[cc].id, x, y);
        
        // send new player spawn to current player
        clients[cc].remote.spawnEnemy(connId, 0, 0);
    }
};

function powerUpUpdate(){
var locs = [
		[2161, 2421],
		[2145, 1360],
		[1814, 1629],
		[1694, 1169],
		[670, 2043],
		[1022, 2421],
		[522, 1087],
		[324, 325],
		[889, 129],
		[1578, 200],
		[2261, 234],
		[1296, 815]
	];
         var powerUpType = ['rifle', 'shotgun', 'health', 'shield'];
        updatedPowers = [];
        for (var i = 0; i < 3; i++) {
            var pu = updatedPowers[i] = [
                locs.splice( Math.floor(locs.length * Math.random()), 1)[0],
                powerUpType[Math.floor(powerUpType.length * Math.random())]
            ];
        }

    for (var c in clients) {
        var remote = clients[c].remote;
        
        remote.updatePowerUps(updatedPowers);
    
    }
}

eurecaServer.exports.pickupPowerUp = function(){
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.killPowerups();
    }
    console.log('SOMEONE PICKED UP A POWERUP');
    setTimeout(function() {
        powerUpUpdate();
    }, 5000);    
};


eurecaServer.exports.handleKeys = function (keys) {
    
        
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    
    for (var c in clients)
    {
        var remote = clients[c].remote;
        
        remote.updateState(updatedClient.id, keys);
        
        //keep last known state so we can send it to new connected clients
        clients[c].laststate = keys;
    }
};
server.listen(process.env.PORT);