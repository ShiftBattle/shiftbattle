/* global Eureca, Phaser, Player populatePowerUps, activateThreeRandom, checkActivePowerUps */

var myId=0;

var map;
var walls;
	
var localPlayerSprite;
var localPlayer;
var playersList = {};
// var explosions;

var speed = 5;

var ready = false;
var eurecaServer;

var keys;

var powerUpsActive;

function updatePlayerState(id, state)
	{
		if (playersList[id] && id != myId)  {

			playersList[id].cursor = state;
			playersList[id].playerSprite.x = state.x;
			playersList[id].playerSprite.y = state.y;
			playersList[id].playerSprite.angle = state.angle;
			playersList[id].playerSprite.rotation = state.rot;
			playersList[id].playerSprite.skin = state.skin;
			
			playersList[id].update();
		}
	}

//this function will handle client communication with the server
var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();
	
	eurecaClient.ready(function (proxy) {	
		eurecaServer = proxy;
	});
	
	//methods defined under "exports" namespace become available in the server side
	
	eurecaClient.exports.setId = function(id) {
		//create() is moved here to make sure nothing is created before unique id assignation
		myId = id;
		create();
		eurecaServer.handshake(myId);
		ready = true;
	}
		// this removes the player from the game on disconnect
	eurecaClient.exports.kill = function(id) {	
		if (playersList[id]) {
			playersList[id].destroy();
			console.log('Removing ', id, playersList[id], " from the game");
		}
	};
	// sends the powerups that are currently active to all players
	eurecaClient.exports.updatePowerUps = function(toRevive, toKill){
		if(!toKill) {
			game.powerUps.children[toRevive[0]].revive();
			game.powerUps.children[toRevive[1]].revive();
			game.powerUps.children[toRevive[2]].revive();
		}
		
		if(!toRevive) {
			game.powerUps.children[toKill].kill();
		}
		if (toRevive && toKill){
		game.powerUps.children[toRevive].revive();
		game.powerUps.children[toKill].kill();
		}
	}
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		if (i === myId) return; //this is me
		
		console.log('SPAWN', i);
		var plyr = new Player(i, game, localPlayerSprite, x, y);
		playersList[i] = plyr;
		plyr.update();
		eurecaServer.powerUpUpdate(powerUpsActive);
		
		};
		
	eurecaClient.exports.updateState = updatePlayerState;
};

var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });
// var game = new Phaser.Game(4000, 3000, Phaser.CANVAS, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {
	game.load.tilemap('fixedmap', 'assets/fixedmap.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('desert32', 'assets/desert32.png');
    game.load.image('wall32', 'assets/wall32.png');
    game.load.image('actuallyfloor', 'assets/actuallyfloor.png');

    game.load.spritesheet('final-player', 'assets/finalplayer.png', 150, 150);
    
    game.load.image('bullet', 'assets/bullet2.png');
    
    game.load.spritesheet('healthbar', 'assets/healthbarsprite.png', 75, 10);
    
	game.load.image('shotgunPowerup', 'assets/Shotgun.png');
	game.load.image('riflePowerup', 'assets/Ak47Pixel.png');
}

function create () {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	map = game.add.tilemap('fixedmap');
    walls = map.createLayer('Tile Layer 1');
    map.addTilesetImage('desert32', 'desert32');
    map.addTilesetImage('wall32', 'wall32');
    map.addTilesetImage('actuallyfloor', 'actuallyfloor');
    map.setCollision([1]);

	walls.resizeWorld();
	
	map.fixedToCamera = true;
	
    playersList = {};
	
	localPlayer = new Player(myId, game, localPlayerSprite);
	playersList[myId] = localPlayer;
	localPlayerSprite = localPlayer.playerSprite;
	localPlayerSprite.x=0;
	localPlayerSprite.y=0;

    localPlayerSprite.bringToTop();

    game.camera.follow(localPlayerSprite);

	keys = { 
		up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		reload: game.input.keyboard.addKey(Phaser.Keyboard.R),
		key1: game.input.keyboard.addKey(Phaser.Keyboard.ONE),
		key2: game.input.keyboard.addKey(Phaser.Keyboard.TWO),
		key3: game.input.keyboard.addKey(Phaser.Keyboard.THREE)
	};
	
	populatePowerUps();
}

function update () {
	//do not update if client not ready
	if (!ready) return;
	
	game.stage.disableVisibilityChange = true;
	
	var input = {
		left: keys.left.isDown,
		right: keys.right.isDown,
		up: keys.up.isDown,
		down: keys.down.isDown,
		fire: game.input.activePointer.isDown,
		tx: game.input.x + game.camera.x,
		ty: game.input.y + game.camera.y
	};
	
	if (keys.key1.isDown) {
		localPlayer.playerSprite.skin = 'handgun';
		eurecaServer.handleKeys({skin: 'handgun'});
		
	}
	else if (keys.key2.isDown){
		localPlayer.playerSprite.skin = 'shotgun';
		eurecaServer.handleKeys({skin: 'shotgun'});
	}
	else if (keys.key3.isDown){
		localPlayer.playerSprite.skin = 'rifle';
		eurecaServer.handleKeys({skin: 'rifle'});
	}


	localPlayerSprite.rotation = game.physics.arcade.angleToPointer(localPlayerSprite);
    
	var inputChanged = (
		localPlayer.cursor.left != input.left ||
		localPlayer.cursor.right != input.right ||
		localPlayer.cursor.up != input.up ||
		localPlayer.cursor.down != input.down ||
		localPlayer.cursor.fire != input.fire ||
		localPlayer.cursor.rot != localPlayerSprite.rotation ||
		localPlayer.cursor.alive != localPlayerSprite.alive
	);
	
	if (inputChanged){
		// send latest valid state to the server
		input.x = localPlayerSprite.x;
		input.y = localPlayerSprite.y;
		input.angle = localPlayerSprite.angle;
		input.rot = localPlayerSprite.rotation;
		input.skin = localPlayerSprite.skin;
		input.health = localPlayer.cursor.health

		eurecaServer.handleKeys(input);
		localPlayer.cursor = input;
	}
	
	
	// This loop checks who should be killed
    for (var i in playersList) {
        if (!playersList[i]) continue;
        var curBullets = playersList[i].bullets;
        var curPlayer = playersList[i].playerSprite;
        for (var j in playersList)
        {
            if (!playersList[j]) continue;
            if (j!=i) {
                var targetPlayer = playersList[j].playerSprite;
                game.physics.arcade.overlap(curBullets, targetPlayer, bulletHitPlayer, null, this);
                game.physics.arcade.collide(curBullets, walls, bulletHitWall, null, this);
            }
        }
    }
    
    // This loop updates all the players
    for (var i  in playersList) {
            if (playersList[i].alive)
            {
                playersList[i].update();
            }           
    }

    game.physics.arcade.overlap(this.game.powerUps, localPlayerSprite, collectPowerup, null, this);
    game.physics.arcade.collide(localPlayerSprite, walls);

}

function collectPowerup (player, powerup){
	powerup.kill();
    eurecaServer.killPowerUp(powerup.z);
    console.log("Got powerup");
}


function bulletHitWall (bullet) {
	// console.log('bullet has hit the wall');
	bullet.kill();
    
}

function bulletHitPlayer (player, bullet) {
	bullet.kill();
    playersList[player.id].damage();
}

function render () {

}
