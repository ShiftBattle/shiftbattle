var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
// serve static files from the current directory
app.use(express.static(__dirname));
//we'll keep clients data here
var clients = {};
var updatedPowers = [];

//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;
//create an instance of EurecaServer
var eurecaServer = new EurecaServer({allow:['setId', 'spawnEnemy', 'kill', 'updateState', 'updatePowerUps']});
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
    remote.setId(conn.id);  
    
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

eurecaServer.exports.powerUpUpdate = function(powerUpList){
 
    var list = [].slice.call(arguments);
    if (list[0] !== null) {
        updatedPowers = powerUpList;
    }
    
    var pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    
    
    if (updatedPowers.length === 0) {
        
    	var index = Math.floor(pool.length * Math.random());
		var drawn = pool.splice(index, 1);
		updatedPowers.push(drawn[0]);
	    var index2 = Math.floor(pool.length * Math.random());
	    var drawn2 = pool.splice(index2, 1);
		updatedPowers.push(drawn2[0]);
		var index3 = Math.floor(pool.length * Math.random());
	    var drawn3 = pool.splice(index3, 1);
		updatedPowers.push(drawn3[0]);
		}
    if (updatedPowers.length === 1) {
      
        pool.splice(updatedPowers[0], 1);
    	var index = Math.floor(pool.length * Math.random());
		var drawn = pool.splice(index, 1);
		updatedPowers.push(drawn[0]);
	    var index2 = Math.floor(pool.length * Math.random());
	    var drawn2 = pool.splice(index2, 1);
		updatedPowers.push(drawn2[0]);
		}
    if (updatedPowers.length === 2) {

        pool.splice(updatedPowers[0], 1);
        pool.splice(updatedPowers[1], 1);
    	var index = Math.floor(pool.length * Math.random());
		var drawn = pool.splice(index, 1);
		updatedPowers.push(drawn[0]);
    }
    var conn = this.connection;
    var updatedClient = clients[conn.id];
    for (var c in clients) {
        var remote = clients[c].remote;

        remote.updatePowerUps(updatedPowers, null);
    
    }
}

eurecaServer.exports.killPowerUp = function(powerUpToKill){
    var index = updatedPowers.indexOf(powerUpToKill);
    updatedPowers.splice(index, 1);

    var pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    pool.splice(updatedPowers[0], 1);
    pool.splice(updatedPowers[1], 1);
    var number = Math.floor(pool.length * Math.random());
	var drawn = pool.splice(number, 1);
	updatedPowers.push(drawn[0]);

    var conn = this.connection;
    var updatedClient = clients[conn.id];
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.updatePowerUps(drawn, powerUpToKill);
    }
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