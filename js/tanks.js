var myId=0;

var map;
var layer;
var walls;
var player;
var user;
var playersList;
var explosions;

var speed = 3;

var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;

var ready = false;
var eurecaServer;
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
		var plyr = new Player(i, game, player);
		playersList[i] = plyr;
	}
	
	eurecaClient.exports.updateState = function(id, state)
	{
		if (playersList[id])  {
			playersList[id].cursor = state;
			playersList[id].player.x = state.x;
			playersList[id].player.y = state.y;
			playersList[id].player.angle = state.angle;
			playersList[id].player.rotation = state.rot;
			playersList[id].update();
		}
	}
}


Player = function (index, game, user) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false	,
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
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);	
	
	
	this.currentSpeed = 0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;
	
	
	var startX = Math.round(Math.random() * (1000) - 500)
  	var startY = Math.round(Math.random() * (1000) - 500)
    this.player = game.add.sprite(startX, startY, 'player');	//Changed where player spawn

    this.player.anchor.set(0.5);
    
    this.player.animations.add('move', [0], 20, false);
  	this.player.animations.add('attack', [1, 2, 3], 10, false);
    

    this.player.id = index;
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.setSize(20, 20);
    this.player.body.immovable = false;
    this.player.body.collideWorldBounds = true;
    this.player.body.bounce.setTo(0, 0);

    this.player.angle = 0;

};

Player.prototype.damage = function(){
    console.log(this.player.id + " IS GETTING POUNDED!");
    this.health--;
    if (this.health <= 0)
    {
        this.alive = false;
        this.player.kill();
        return true;
    }
    return false;
}

Player.prototype.update = function() {
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.down != this.input.down ||
		this.cursor.fire != this.input.fire
	);
	
	
	if (inputChanged)
	{
		//Handle input change here
		//send new values to the server		
		if (this.player.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.player.x;
			this.input.y = this.player.y;
			this.input.angle = this.player.angle;
			this.input.rot = this.player.rotation;
			
			eurecaServer.handleKeys(this.input);
			
		}
	}

	//cursor value is now updated by eurecaClient.exports.updateState method
	
	
	if (this.cursor.left) {
		if (this.cursor.up) {
			this.player.body.x -= speed;
			this.player.body.y -= speed;
			this.player.animations.play('move');
		}
		else if (this.cursor.down) {
			this.player.body.x -= speed;
			this.player.body.y += speed;
			this.player.animations.play('move');
		}
		else {
			this.player.body.x -= speed;
			this.player.animations.play('move');
		}
	}
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.player.body.x += speed;
			this.player.body.y -= speed;
			this.player.animations.play('move');
		}
		else if (this.cursor.down) {
			this.player.body.x += speed;
			this.player.body.y += speed;
			this.player.animations.play('move');
		}
		else {
			this.player.body.x += speed;
			this.player.animations.play('move');
		}
	}
	else if (this.cursor.up) {
		this.player.body.y -= speed;
		this.player.animations.play('move');
	}
	else if (this.cursor.down) {
		this.player.body.y += speed;
		this.player.animations.play('move');
	}
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		this.player.animations.play('attack');
	}
		
};


Player.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.player.x, this.player.y, this.player.rotation);
			bullet.rotation = this.player.rotation;      
            game.physics.arcade.velocityFromRotation(this.player.rotation, 600, bullet.body.velocity); 

        }
}


Player.prototype.kill = function() {
	this.alive = false;
	this.player.kill();
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

	game.load.tilemap('map2', 'assets/map2.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('newtiles', 'assets/newtiles.png');	//64x64 tiles
	game.load.spritesheet('player', 'assets/test_guy.png', 150, 150);
    game.load.spritesheet('enemy', 'assets/test_guy.png', 150, 150);
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet4.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.image('ground_1x1', 'assets/ground_1x1.png');

    
}



function create () {

    //  Resize our game world to be a 2000 x 2000 square
    // game.world.setBounds(-1280, -1280, 2560, 2560);	//2560
	// game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background

	//  The 'mario' key here is the Loader key given in game.load.tilemap
    map = game.add.tilemap('map2');

    //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
    //  The second parameter maps this name to the Phaser.Cache key 'tiles'
    map.addTilesetImage('newtiles', 'newtiles');
    
    //  Creates a layer from the World1 layer in the map data.
    //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
    layer = map.createLayer('backgroundLayer');
    walls = map.createLayer('blockedLayer')
    console.log(map, 'HERE IS MAP')
    console.log(walls, 'WALLS')
    
        walls.enableBody = true;
    walls.physicsBodyType = Phaser.Physics.ARCADE;


    //  This resizes the game world to match the layer dimensions
    layer.resizeWorld();

    
    map.fixedToCamera = true;
    
    playersList = {};
	
	user = new Player(myId, game, player);
	playersList[myId] = user;
	player = user.player;
	player.x=0;
	player.y=0;
	bullets = user.bullets;

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    player.bringToTop();
		
    // logo = game.add.sprite(0, 200, 'logo');
    // logo.fixedToCamera = true;

    // game.input.onDown.add(removeLogo, this);

    game.camera.follow(player);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
	
	// setTimeout(removeLogo, 1000);
	
}

// function removeLogo () {
//     game.input.onDown.remove(removeLogo, this);
//     logo.kill();
// }

function update () {
	//do not update if client not ready
	if (!ready) return;
	
	user.input.left = cursors.left.isDown;
	user.input.right = cursors.right.isDown;
	user.input.up = cursors.up.isDown;
	user.input.down = cursors.down.isDown;
	user.input.fire = game.input.activePointer.isDown;
	user.input.tx = game.input.x+ game.camera.x;
	user.input.ty = game.input.y+ game.camera.y;
	
	player.rotation = game.physics.arcade.angleToPointer(player);	
	

    	
	
    for (var i in playersList)
    {
        if (!playersList[i]) continue;
        var curBullets = playersList[i].bullets;
        var curPlayer = playersList[i].player;
        for (var j in playersList)
        {
            if (!playersList[j]) continue;
            if (j!=i) 
            {
            
                var targetPlayer = playersList[j].player;
                // game.physics.arcade.collide(player, playersList[i].player);
                game.physics.arcade.overlap(curBullets, targetPlayer, bulletHitPlayer, null, this);
 
            
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
    console.log(myId, "THIS IS YOUR PLAYER!");
    playersList[player.id].damage();
    console.log(player.id, 'THE PLAYER')
    console.log(player, 'TANKINFO')
}

function render () {
}

