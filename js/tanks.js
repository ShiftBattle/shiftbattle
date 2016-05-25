/* global Eureca, Phaser */

var myId=0;

var land;

var localPlayerSprite;
var localPlayer;
var playersList;
// var explosions;

var speed = 5;

var cursors;

var ready = false;
var eurecaServer;




function updatePlayerState(id, state, myself)
	{
		
		if (playersList[id] && (id != myId || myself))  {
			// playersList[id].alive = playerAlive
			playersList[id].cursor = state;
			playersList[id].playerSprite.x = state.x;
			playersList[id].playerSprite.y = state.y;
			playersList[id].playerSprite.angle = state.angle;
			playersList[id].playerSprite.rotation = state.rot;
			
			if (!myself) {
				playersList[id].update();
			}
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
		eurecaServer.handshake();
		ready = true;
	}	

	
	eurecaClient.exports.kill = function(id)
	{	
		
		
		if (playersList[id]) {
			
			
			playersList[id].kill();
			
			
			
			console.log('killing ', id, playersList[id]);
		}
	}	
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		
		if (i == myId) return; //this is me
		
		console.log('SPAWN');
		var plyr = new Player(i, game, localPlayerSprite);
		playersList[i] = plyr;
	}
	
	// eurecaClient.exports.updateState = function(id, state, playerAlive)
	eurecaClient.exports.updateState = updatePlayerState
}


function Player(index, game, user) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false,
		down: false
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		fire:false,
		down:false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 5;
    this.user = user;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    
    // create 20-30 bullets per clip, maybe carry 4-5 clips and then have a reload function added
    this.bullets.createMultiple(200, 'bullet', 0, false);
    
    // anchoring for the small bullet
    // this.bullets.setAll('anchor.x', -15);
    // this.bullets.setAll('anchor.y', -2);
    
    // anchoring for the large bullet
    this.bullets.setAll('anchor.x', -3.2);
    this.bullets.setAll('anchor.y', -0.4);
    
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
	
	// this should be set to 500 for normal gameplay, 100 for 'Codrin' gameplay
    this.fireRate = 100;
    this.nextFire = 0;
    this.alive = true;
	
	
	var startX = 500//Math.round(Math.random() * (1000) - 500)
  	var startY = 500//Math.round(Math.random() * (1000) - 500)
    this.playerSprite = game.add.sprite(startX, startY, 'player');

    this.playerSprite.anchor.set(0.5);
    
    this.playerSprite.animations.add('move', [0], 20, false);
  	this.playerSprite.animations.add('attack', [1, 2, 3], 10, false);
    

    this.playerSprite.id = index;
    game.physics.enable(this.playerSprite, Phaser.Physics.ARCADE);
    this.playerSprite.body.setSize(30, 30);
    this.playerSprite.body.immovable = false;
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.body.bounce.setTo(0, 0);

    this.playerSprite.angle = 0;
};




Player.prototype.damage = function(){
    console.log(this.playerSprite.id + " IS GETTING POUNDED BY " + localPlayerSprite.id);
    this.health--;
    if (this.health <= 0)
    {
        // this.alive = false;
        this.playerSprite.kill();
        
        
	// setTimeout(function(){
	// 	console.log("SHIT IS RUNNIG")
	// 		 this.playerSprite.visible = true
	// 		this.playerSprite.alive = true
	// 		this.playerSprite.exists = true
	// }, 50)
	
		
        return true;
    }
    return false;
}

Player.prototype.update = function() {
	
	var cursors;
	cursors = game.input.keyboard.createCursorKeys();

	localPlayer.input.left = cursors.left.isDown;
	localPlayer.input.right = cursors.right.isDown;
	localPlayer.input.up = cursors.up.isDown;
	localPlayer.input.down = cursors.down.isDown;
	localPlayer.input.fire = game.input.activePointer.isDown;
	localPlayer.input.tx = game.input.x+ game.camera.x;
	localPlayer.input.ty = game.input.y+ game.camera.y;
	localPlayerSprite.rotation = game.physics.arcade.angleToPointer(localPlayerSprite);
	// game.input.moveCallback = function(pointer, x, y) { 
		
	//player.rotation = game.physics.arcade.angleToPointer(player);
		
		
		
	// }
	
	


	//cursor value is now updated by eurecaClient.exports.updateState method
	
	
	if (this.cursor.left) {
		if (this.cursor.up) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y -= speed;
			this.playerSprite.animations.play('move');
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y += speed;
			this.playerSprite.animations.play('move');
		}
		else {
			this.playerSprite.body.x -= speed;
			this.playerSprite.animations.play('move');
		}
	}
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y -= speed;
			this.playerSprite.animations.play('move');
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y += speed;
			this.playerSprite.animations.play('move');
		}
		else {
			this.playerSprite.body.x += speed;
			this.playerSprite.animations.play('move');
		}
	}
	else if (this.cursor.up) {
			this.playerSprite.body.y -= speed;
			this.playerSprite.animations.play('move');
	}
	else if (this.cursor.down) {
		this.playerSprite.body.y += speed;
		this.playerSprite.animations.play('move');
	}
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		this.playerSprite.animations.play('attack');
	}
		
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.down != this.input.down ||
		this.cursor.fire != this.input.fire ||
		this.cursor.rot != this.playerSprite.rotation
	);
	
	if (inputChanged)
	{
	
		//Handle input change here
		//send new values to the server		
		if (this.playerSprite.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.playerSprite.x;
			this.input.y = this.playerSprite.y;
			this.input.angle = this.playerSprite.angle;
			this.input.rot = this.playerSprite.rotation;
			this.input.fire = this.cursor.fire;
		
			eurecaServer.handleKeys(this.input);
			updatePlayerState(myId, this.input, true);
		} 
	}
	
};

Player.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.playerSprite.x, this.playerSprite.y, this.playerSprite.rotation);
			bullet.rotation = this.playerSprite.rotation;      
            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 600, bullet.body.velocity); 

        }
}


Player.prototype.kill = function() {
	// this.alive = false;
	this.playerSprite.kill();
	
}






var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

    game.load.spritesheet('player', 'assets/test_guy.png', 150, 150);
    game.load.spritesheet('enemy', 'assets/test_guy.png', 150, 150);
    game.load.image('logo', 'assets/logo.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    // game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
    // small bullet. the anchoring is different for each bullet!
    // game.load.image('bullet', 'assets/bullet4.png');
    
    // large bullet. the anchoring is different for each bullet!
    game.load.image('bullet', 'assets/bullet2.png');
}



function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;
    
    playersList = {};
	
	localPlayer = new Player(myId, game, localPlayerSprite);
	playersList[myId] = localPlayer;
	localPlayerSprite = localPlayer.playerSprite;
	localPlayerSprite.x=0;
	localPlayerSprite.y=0;
	// bullets = user.bullets;

    //  Explosion pool
    // explosions = game.add.group();

    // for (var i = 0; i < 10; i++)
    // {
    //     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
    //     explosionAnimation.anchor.setTo(0.5, 0.5);
    //     explosionAnimation.animations.add('kaboom');
    // }

    localPlayerSprite.bringToTop();
		
    // logo = game.add.sprite(0, 200, 'logo');
    // logo.fixedToCamera = true;

    // game.input.onDown.add(removeLogo, this);

    game.camera.follow(localPlayerSprite);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

  
	
	// setTimeout(removeLogo, 1000);
	
}

// function removeLogo () {
//     game.input.onDown.remove(removeLogo, this);
//     logo.kill();
// }

function update () {
	//do not update if client not ready
	if (!ready) return;


	

	
    for (var i in playersList)
    {
        if (!playersList[i]) continue;
        var curBullets = playersList[i].bullets;
        var curPlayer = playersList[i].playerSprite;
        for (var j in playersList)
        {
            if (!playersList[j]) continue;
            if (j!=i) 
            {
            
                var targetPlayer = playersList[j].playerSprite;
                // game.physics.arcade.collide(player, playersList[i].player);
                game.physics.arcade.overlap(curBullets, targetPlayer, bulletHitPlayer, null, this);
                // console.log(curPlayer);
                // console.log(curBullets);
            
            }
            if (playersList[j].alive)
            {
                playersList[j].update();
            }           
        }
    }
}

function bulletHitPlayer (player, bullet) {
    bullet.kill();
    // console.log(myId, "THIS IS YOUR PLAYER!");
    playersList[player.id].damage();
    console.log(player.id, 'THE PLAYER')
    console.log(player, 'TANKINFO')
    console.log(myId + " JUST KILLED " + player.id);
    
}

function render () {
}

