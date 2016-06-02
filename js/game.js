/* global Eureca, Phaser, Player populatePowerUps, playerSpawns, randomize*/

var myId = 0;

var map;
var walls;

var localPlayerSprite;
var localPlayer;
var playersList = {};

var speed = 5;

var ready = false;
var eurecaServer;

var keys;

var powerUpsActive;

function updatePlayerState(id, state) {
	// {console.log(state)
	if (playersList[id] && id != myId) {

		playersList[id].cursor = state;
		playersList[id].playerSprite.x = state.x;
		playersList[id].playerSprite.y = state.y;
		playersList[id].playerSprite.angle = state.angle;
		playersList[id].playerSprite.rotation = state.rot;

		playersList[id].update();
	}

}

function updatePowerups(newPowerups) {
	newPowerups.forEach(function(pu, idx) {
		var powerUpSprite = game.powerUps.children[idx];
		powerUpSprite.reset(pu[0][0], pu[0][1]);
		powerUpSprite.type = pu[1];
		powerUpSprite.play(pu[1]);
	});
}

function updatePlayerHealth(playerShotandShooter, allNames) {
	var victim = playerShotandShooter[Object.keys(playerShotandShooter)[0]]
	var shooter = playerShotandShooter[Object.keys(playerShotandShooter)[1]]
	if (playersList[victim].shield.health > 0) {
		playersList[victim].shield.health--;
	}
	else {
		console.log(playersList[victim].shield.health, 'inside else statement on damage');
		playersList[victim].shield.kill();
		playersList[victim].cursor.health--;
		playersList[victim].cursor.shield = false;
	}
	if (playersList[victim].cursor.health <= 0) {

		playersList[victim].shield.kill();
		playersList[victim].healthbar.kill();
		playersList[victim].label.kill();
		playersList[victim].playerSprite.kill();
		playersList[victim].cursor.alive = false;
		playersList[victim].cursor.exists = false;
		playersList[victim].cursor.visible = false;
		playersList[victim].cursor.shield = false;
		for (var each in playersList) {
			console.log(playersList[each].playerSprite.id, victim, "THY SHIT BE HERE")
			if ((playersList[each].playerSprite.id === victim) && (victim === myId)) {
				eurecaServer.killUpdate({
					killer: shooter,
					victim: victim
				})
			}
		}
		setTimeout(function() {
			console.log("RESPAWN TIMEOUT FUNCTION");

			var loc = playerSpawns[randomize(playerSpawns)];
			playersList[victim].playerSprite.x = loc[0];
			playersList[victim].playerSprite.y = loc[1];
			playersList[victim].playerSprite.revive();
			playersList[victim].label.revive();
			playersList[victim].healthbar.revive();

			playersList[victim].cursor.alive = true;
			playersList[victim].cursor.exists = true;
			playersList[victim].cursor.visible = true;
			playersList[victim].cursor.health = 10;
			playersList[victim].cursor.skin = 'handgun';
		}, 5000);
	}
}

//this function will handle client communication with the server
var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();

	eurecaClient.ready(function(proxy) {
		eurecaServer = proxy;
	});

	//methods defined under "exports" namespace become available in the server side
	eurecaClient.exports.nameChange = function(id, name, allNames) {
		for (var player in playersList) {
			playersList[id].label.destroy();
			playersList[id].label = game.add.text(playersList[id].playerSprite.x, playersList[id].playerSprite.y, '' + name + '', {
				font: "14px Arial",
				fill: "#ffffff",
				align: "center"
			});
			playersList[id].displayName = name;
			playersList[id].label.anchor.setTo(.5, -1.7);
			playersList[id].playerSprite.bringToTop();
		}

		for (var player in playersList) {
			allNames.forEach(function(playerName) {
				console.log(playerName)
				if (playersList[player].playerSprite.id === playerName.id) {
					console.log(playersList[player].displayName);
					playersList[player].displayName = playerName.name;
					console.log(playersList[player].displayName);
					playersList[player].label.destroy();
					playersList[player].label = game.add.text(playersList[player].playerSprite.x, playersList[player].playerSprite.y, '' + playersList[player].displayName + '', {
						font: "14px Arial",
						fill: "#ffffff",
						align: "center"
					});
					playersList[player].label.anchor.setTo(.5, -1.7);
				}

			})

		}
	};

	eurecaClient.exports.setInfo = function(info) {
			//create() is moved here to make sure nothing is created before unique id assignation
			myId = info.id;
			create();
			updatePowerups(info.powerups);
			console.log(info.powerups)
				// call powerup display with info.powerups
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

	eurecaClient.exports.printKillText = function(obj, allNames) {
		// console.log(obj) //{killer: ID, victim: ID}
		// console.log(allNames, 'allNames') //[{ID, name}, {ID, name}, {ID, name}]

		var killer;
		var victim;

		allNames.forEach(function(each) {
			if (obj.killer === each.id) {
				killer = each.name
			}
			else if (obj.victim === each.id) {
				victim = each.name
			}
		});
		// console.log(killer, victim, 'killervictim')

		//var victim = playerShotandShooter[Object.keys(playerShotandShooter)

		for (var i in playersList) {
			console.log(playersList[i].playerSprite.id, victim, "print kill text")
			if ((playersList[i].playerSprite.id === obj.victim) && (obj.victim === myId)) {
				var t = game.add.text(0, 0, "Fragged by " + killer, {
					font: "20px Arial",
					fill: "#ffffff",
					align: "center"
				});
				t.fixedToCamera = true
				setTimeout(function() {
					t.destroy();
				}, 2000)
			}
			// console.log(i, 'each')
			// console.log(playersList[i].playerSprite.id, 'playerId before if')
			// console.log(killer, 'killer before if')
			if (playersList[i].playerSprite.id === obj.killer && obj.killer === myId) {
				// console.log('made it to if')
				var t = game.add.text(0, 0, "You fragged " + victim, {
					font: "20px Arial",
					fill: "#ffffff",
					align: "center"
				});
				t.fixedToCamera = true
				setTimeout(function() {
					t.destroy();
				}, 2000)
			}
		}
	}
	eurecaClient.exports.displayScoreboard = function(res, id) {
		console.log(res, 'displayScoreboard res')
		if (id === myId) {
			var style = {
				font: "40px Arial",
				fill: "#0000FF",
				align: "left",
				backgroundColor: 'rgba(211,211,211,0.25)',
				tabs: [ 400, 120 ]
			}
			
			var kdTabs = ['Name', 'Kills', 'Deaths']
			res.unshift(kdTabs)

			var scoreboard = game.add.text(250, 150, '', style);
			scoreboard.parseList(res)
			scoreboard.fixedToCamera = true
			setTimeout(function() {
				scoreboard.destroy();
			}, 2000);
		}
	}


	// sends the powerups that are currently active to all players and spawns a new one if one of them is picked up
	eurecaClient.exports.updatePowerUps = updatePowerups;

	eurecaClient.exports.spawnEnemy = function(i, x, y) {
		if (i === myId) return; //this is me

		console.log('SPAWN', i);
		var plyr = new Player(i, game, localPlayerSprite, x, y);
		playersList[i] = plyr;
		plyr.update();
	};

	eurecaClient.exports.updateState = updatePlayerState;
	eurecaClient.exports.removePlayerHealth = updatePlayerHealth;

	eurecaClient.exports.killPowerups = function() {
		game.powerUps.children.forEach(function(pu) {
			pu.kill()
		});
	};
};

var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'phaser-example', {
	preload: preload,
	create: eurecaClientSetup,
	update: update,
	render: render
});
// var game = new Phaser.Game(4000, 3000, Phaser.CANVAS, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });
// var game = new Phaser.Game(window.width, window.height, Phaser.CANVAS, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });


function preload() {
	game.load.tilemap('fixedmap', 'assets/fixedmap.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('desert32', 'assets/desert32.png');
	game.load.image('wall32', 'assets/wall32.png');
	game.load.image('actuallyfloor', 'assets/actuallyfloor.png');

	game.load.spritesheet('final-player', 'assets/finalplayer.png', 150, 150);

	game.load.image('bullet', 'assets/bullet2.png');

	game.load.spritesheet('healthbar', 'assets/healthbarfinal.png', 74.9, 10);
	game.load.spritesheet('powerups', 'assets/powerups.png', 75, 75);
	game.load.spritesheet('shield', 'assets/shield.png', 130, 128);

}

function create() {
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
	// localPlayerSprite.x=0;
	// localPlayerSprite.y=0;

	localPlayerSprite.bringToTop();

	game.camera.follow(localPlayerSprite);

	keys = {
		up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		tab: game.input.keyboard.addKey(Phaser.Keyboard.TAB)
			// reload: game.input.keyboard.addKey(Phaser.Keyboard.R),
			// key1: game.input.keyboard.addKey(Phaser.Keyboard.ONE),
			// key2: game.input.keyboard.addKey(Phaser.Keyboard.TWO),
			// key3: game.input.keyboard.addKey(Phaser.Keyboard.THREE)
	};

	populatePowerUps();
	// console.log(localPlayer.powerUps.children);

	game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

	var fullscreen = game.input.keyboard.addKey(Phaser.Keyboard.ONE);

	fullscreen.onDown.add(gofull, this);

}


function gofull() {

	if (game.scale.isFullScreen) {
		game.scale.stopFullScreen();
	}
	else {
		game.scale.startFullScreen(false);
	}

}


function update() {
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

	// if (keys.key1.isDown) {
	// 	localPlayer.cursor.skin = 'handgun';
	// 	console.log(game.powerUps.children);
	// 	eurecaServer.handleKeys({skin: 'handgun'});

	// }
	// else if (keys.key2.isDown){
	// 	localPlayer.cursor.skin = 'shotgun';
	// 	eurecaServer.handleKeys({skin: 'shotgun'});
	// }
	// else if (keys.key3.isDown){
	// 	localPlayer.cursor.skin = 'rifle';
	// 	eurecaServer.handleKeys({skin: 'rifle'});
	// }

	if (keys.tab.isDown) {
		eurecaServer.scoreDisplay(localPlayerSprite.id);
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

	if (inputChanged) {
		// send latest valid state to the server
		input.x = localPlayerSprite.x;
		input.y = localPlayerSprite.y;
		input.angle = localPlayerSprite.angle;
		input.rot = localPlayerSprite.rotation;
		input.skin = localPlayer.cursor.skin;
		input.health = localPlayer.cursor.health;
		input.shield = localPlayer.cursor.shield

		eurecaServer.handleKeys(input);
		localPlayer.cursor = input;
	}


	// This loop checks who should be killed
	for (var i in playersList) {
		if (!playersList[i]) continue;
		var curBullets = playersList[i].bullets;
		var curPlayer = playersList[i].playerSprite;
		for (var j in playersList) {
			if (!playersList[j]) continue;
			if (j != i) {
				var targetPlayer = playersList[j].playerSprite;
				game.physics.arcade.overlap(curBullets, targetPlayer, bulletHitPlayer, null, this);
				game.physics.arcade.collide(curBullets, walls, bulletHitWall, null, this);
			}
		}
	}

	// This loop updates all the players
	for (var i in playersList) {
		if (playersList[i].alive) {
			playersList[i].update();
		}
	}

	game.physics.arcade.overlap(game.powerUps, localPlayerSprite, collectPowerup, null, this);
	game.physics.arcade.collide(localPlayerSprite, walls);

}

function collectPowerup(player, powerup) {
	powerup.kill();
	if (powerup.type === 'shotgun') {
		localPlayer.cursor.skin = 'shotgun';
		eurecaServer.handleKeys({
			skin: 'shotgun'
		});
	}
	else if (powerup.type === 'rifle') {
		localPlayer.cursor.skin = 'rifle';
		eurecaServer.handleKeys({
			skin: 'rifle'
		});
	}
	else if (powerup.type === 'health') {
		localPlayer.cursor.health = 10;
		eurecaServer.handleKeys({
			health: 10
		});
	}
	else if (powerup.type === 'shield') {
		localPlayer.cursor.shield = true;
		localPlayer.shield.health = 5;
		localPlayer.shield.animations.play('shield');
		eurecaServer.handleKeys({
			shield: true
		});
	}

	eurecaServer.pickupPowerUp();

	console.log(powerup)
	console.log(player.id, "picked up a", powerup.type, "powerup!");
}


function bulletHitWall(bullet) {
	// console.log(bullet, 'bullet has hit the wall');
	bullet.kill();

}

function bulletHitPlayer(player, bullet) {
	bullet.kill();

	if (localPlayer.playerSprite.id === player.id)
		playersList[player.id].damage(bullet);
}

function render() {

}
