/* global Eureca, Phaser, Player */

var showDebug = true;

var bullet;
var myId=0;

var map;
var layer;
	
var localPlayerSprite;
var localPlayer;
var playersList;
// var explosions;

var speed = 5;

var ready = false;
var eurecaServer;

var keys;

var healthView;

function updatePlayerState(id, state)
	{
		
		if (playersList[id] && id != myId)  {

			playersList[id].cursor = state;
			playersList[id].playerSprite.x = state.x;
			playersList[id].playerSprite.y = state.y;
			playersList[id].playerSprite.angle = state.angle;
			playersList[id].playerSprite.rotation = state.rot;
			
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
	
	eurecaClient.exports.setId = function(id) 
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
		create();
		eurecaServer.handshake(myId);
		ready = true;
	};

	
	eurecaClient.exports.kill = function(id)
	{	
		
		
		if (playersList[id]) {
			playersList[id].destroy();
			console.log('Removing ', id, playersList[id], " from the game");
		}
	};
	
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{

		if (i === myId) return; //this is me
		
		console.log('SPAWN', i);
		var plyr = new Player(i, game, localPlayerSprite, x, y);
		playersList[i] = plyr;
		plyr.update();

	};
	
	// eurecaClient.exports.updateState = function(id, state, playerAlive)
	eurecaClient.exports.updateState = updatePlayerState;
};




var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {
	
	// attaching the guns to the game itself so we can access to the specs from anywhere
	
	
    game.load.tilemap('simplemap', 'assets/simplemap.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('desert64', 'assets/desert64.png');
    game.load.image('wall64', 'assets/wall64.png');

    game.load.spritesheet('handgun-player', 'assets/handgun-player.png', 150, 150);
    game.load.spritesheet('rifle-player', 'assets/rifle-player.png', 150, 150);
    game.load.spritesheet('shotgun-player', 'assets/shotgun-player.png', 150, 150);
    
    game.load.image('earth', 'assets/scorched_earth.png');

    
    // small bullet. the anchoring is different for each bullet!
    // game.load.image('bullet', 'assets/bullet4.png');
    
    // large bullet. the anchoring is different for each bullet!
    game.load.image('bullet', 'assets/bullet2.png');
    // game.load.image('hitbox', 'assets/63x30.png');
    
    game.load.spritesheet('healthbar', 'assets/healthbarsprite.png', 75, 10);
}



function create () {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	map = game.add.tilemap('simplemap');
	layer = map.createLayer('Tile Layer 1');
	map.addTilesetImage('desert64', 'desert64');
	map.addTilesetImage('wall64', 'wall64');
	map.setCollision([2]);
	layer.resizeWorld();
	layer.bouncePadding = 0;
	map.fixedToCamera = true;
	
	

    playersList = {};
	
	localPlayer = new Player(myId, game, localPlayerSprite);
	playersList[myId] = localPlayer;
	localPlayerSprite = localPlayer.playerSprite;
	localPlayerSprite.x=0;
	localPlayerSprite.y=0;

    // localPlayer.hitbox.enableBody = true;
    // localPlayer.hitbox.physicsBodyType = Phaser.Physics.ARCADE;
    // console.log(localPlayer)
	// console.log(localPlayer.hitbox);
 


    
    localPlayerSprite.bringToTop();
    // localPlayer.hitbox.bringToTop();


    game.camera.follow(localPlayerSprite);


	keys = { 
		up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		reload: game.input.keyboard.addKey(Phaser.Keyboard.R)
	};
	


// gun stats

game.gun = {
		rifle: {
			fireRate: 100
		},
		shotgun: {
			fireRate: 800
		},
		handgun: {
			fireRate: 500
		}
	};






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
	
	if (keys.reload.isDown) {
    	if (localPlayer.bullets.countLiving() === 5) {
        		localPlayer.bullets.setAll('alive', false);
        		localPlayer.reloadText.visible = false;
    	}
	}
	
	
	
	localPlayerSprite.rotation = game.physics.arcade.angleToPointer(localPlayerSprite);
    // localPlayer.hitbox.rotation = localPlayerSprite.rotation;
    
	var inputChanged = (
		localPlayer.cursor.left != input.left ||
		localPlayer.cursor.right != input.right ||
		localPlayer.cursor.up != input.up ||
		localPlayer.cursor.down != input.down ||
		localPlayer.cursor.fire != input.fire ||
		localPlayer.cursor.rot != localPlayerSprite.rotation ||
		localPlayer.cursor.alive != localPlayer.alive
		
	);
	
	if (inputChanged){

		// send latest valid state to the server
		input.x = localPlayerSprite.x;
		input.y = localPlayerSprite.y;
		input.angle = localPlayerSprite.angle;
		input.rot = localPlayerSprite.rotation;

		eurecaServer.handleKeys(input);
		localPlayer.cursor = input;
	}
	
	
	// This loop checks who should be killed
    for (var i in playersList) {
        if (!playersList[i]) continue;
        var curBullets = playersList[i].bullets;
        var curPlayer = playersList[i].playerSprite;
        // var hitbox = playersList[i].hitbox;
		// console.log(hitbox)
		// console.log(curBullets)
        for (var j in playersList)
        {
            if (!playersList[j]) continue;
            if (j!=i) 
            {
            
                var targetPlayer = playersList[j].playerSprite;
                // game.physics.arcade.collide(player, playersList[i].player);
                game.physics.arcade.overlap(curBullets, targetPlayer, bulletHitPlayer, null, this);
                game.physics.arcade.collide(curBullets, layer, bulletHitWall, null, this);
                // game.physics.arcade.overlap(hitbox, layer, bounceBack, null, this);
                // console.log(hitbox)
            
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
    
    game.physics.arcade.collide(localPlayerSprite, layer);
    // game.physics.arcade.overlap(localPlayer.hitbox, layer, bounceBack, null, this);

}

// function bounceBack() {
// 	console.log('the hitbox collides with the wall')
// }


function bulletHitWall (bullet) {
	console.log('bullet has hit the wall')
    bullet.alive = true;
    bullet.exists = false;
    
}

function bulletHitPlayer (player, bullet) {
    bullet.alive = true;
    bullet.exists = false;
    // bullet.visible= false;
    playersList[player.id].damage();
    
}

function render () {
	
	game.debug.body('shotgun-player');

}
