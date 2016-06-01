var express = require('express'),
    app = express(app),
    server = require('http').createServer(app);
// serve static files from the current directory
app.use(express.static(__dirname));
//we'll keep clients data here
var clients = {};
var updatedPowers = [];
var totalKills = [];
powerUpUpdate();

//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;
//create an instance of EurecaServer
var eurecaServer = new EurecaServer({
    allow: ['killPowerups', 'setInfo', 'spawnEnemy', 'kill', 'updateState', 'updatePowerUps',
        'nameChange', 'removePlayerHealth', 'displayScoreboard', 'printKillText'
    ]
});
//attach eureca.io to our http server
eurecaServer.attach(server);
//eureca.io provides events to detect clients connect/disconnect
//detect client connection
eurecaServer.onConnect(function(conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    //register the client
    clients[conn.id] = {
        id: conn.id,
        remote: remote
    };

    //here we call setId (defined in the client side)
    remote.setInfo({
        id: conn.id,
        powerups: updatedPowers
    });

});
//detect client disconnection
eurecaServer.onDisconnect(function(conn) {
    console.log('Client disconnected ', conn.id);
    var removeId = clients[conn.id].id;
    delete clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;
        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }
});

eurecaServer.exports.handshake = function(connId) {
    var remote = clients[connId].remote;

    // loop thru all players
    for (var cc in clients) {

        if (cc === connId) {
            continue;
        }
        //send latest known position
        var x = clients[cc].laststate ? clients[cc].laststate.x : 0;
        var y = clients[cc].laststate ? clients[cc].laststate.y : 0;

        // send current player to new player
        remote.spawnEnemy(clients[cc].id, x, y);

        // send new player spawn to current player
        clients[cc].remote.spawnEnemy(connId, 0, 0);
    }
};

function powerUpUpdate() {
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
            locs.splice(Math.floor(locs.length * Math.random()), 1)[0],
            powerUpType[Math.floor(powerUpType.length * Math.random())]
        ];
    }

    for (var c in clients) {
        var remote = clients[c].remote;
        remote.updatePowerUps(updatedPowers);
    }
}

eurecaServer.exports.assignName = function(id, name) {
    console.log(name, 'To add a name')
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.nameChange(id, name);
    }
}


eurecaServer.exports.bulletHitsPlayer = function(playerShotandShooter) {
    // console.log(playerShotandShooter.shooter, 'the player being shot')
    // console.log(playerShotandShooter.playerShot, 'the shooter')
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.removePlayerHealth(playerShotandShooter);
    }
}

eurecaServer.exports.pickupPowerUp = function() {
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.killPowerups();
    }
    console.log('SOMEONE PICKED UP A POWERUP');
    setTimeout(function() {
        powerUpUpdate();
    }, 5000);
};

eurecaServer.exports.killUpdate = function(packge) {
    console.log(totalKills, 'totalkills before push')
    totalKills.push(packge) //packge is the latest kill event
    console.log(packge, 'here is package')
    console.log(totalKills, 'totalkills after push')
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;
        remote.printKillText(packge);
    }
}



eurecaServer.exports.scoreDisplay = function(id) { //obj = totalKills
    console.log(totalKills, 'here is totalkills')
    if (totalKills.length === 0) return;
    var victims = []
    totalKills.forEach(function(each) {
        victims.push(each.victim)
    })
    var bodycount = {}
    victims.forEach(function(i) {
        bodycount[i] = (bodycount[i] || 0) + 1;
    });



    var killers = []
    totalKills.forEach(function(each) {
        killers.push(each.killer)
    })
    var score = {}
    killers.forEach(function(i) {
        score[i] = (score[i] || 0) + 1;
    });


        //Construct a nice string out of killers and body count once NAMES are in.


    //we display to only the ID passed in the function to us
    for (var c in clients) {
        var remote = clients[c].remote;
        remote.displayScoreboard(killers, id);
    }
}


eurecaServer.exports.handleKeys = function(keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;

        remote.updateState(updatedClient.id, keys);

        //keep last known state so we can send it to new connected clients
        clients[c].laststate = keys;
    }
};
server.listen(process.env.PORT);