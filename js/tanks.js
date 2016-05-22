var myId=0;

var land;

var tank;
var player;
var tanksList;
var explosions;

var logo;
var speed = 2;

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
		if (tanksList[id]) {
			tanksList[id].kill();
			console.log('killing ', id, tanksList[id]);
		}
	}	
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		
		if (i == myId) return; //this is me
		
		console.log('SPAWN');
		var tnk = new Tank(i, game, tank);
		tanksList[i] = tnk;
	}
	
	eurecaClient.exports.updateState = function(id, state)
	{
		if (tanksList[id])  {
			tanksList[id].cursor = state;
			tanksList[id].tank.x = state.x;
			tanksList[id].tank.y = state.y;
			tanksList[id].tank.angle = state.angle;
			tanksList[id].tank.rotation = state.rot;
			tanksList[id].update();
		}
	}
}


Tank = function (index, game, player) {
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
    this.health = 30;
    this.player = player;
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

    this.tank = game.add.sprite(x, y, 'enemy', 'tank');

    this.tank.anchor.set(0.5);
    
    this.tank.animations.add('move', [0], 20, false);
  	this.tank.animations.add('attack', [1, 2, 3], 10, false);
    

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);

    this.tank.angle = 0;

    // game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

};

Tank.prototype.update = function() {
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
		if (this.tank.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.tank.x;
			this.input.y = this.tank.y;
			this.input.angle = this.tank.angle;
			this.input.rot = this.tank.rotation;
			
			eurecaServer.handleKeys(this.input);
			
		}
	}

	//cursor value is now updated by eurecaClient.exports.updateState method
	
	
	if (this.cursor.left) {
		if (this.cursor.up) {
			this.tank.body.x -= speed;
			this.tank.body.y -= speed;
			this.tank.animations.play('move');
		}
		else if (this.cursor.down) {
			this.tank.body.x -= speed;
			this.tank.body.y += speed;
			this.tank.animations.play('move');
		}
		else {
			this.tank.body.x -= speed;
			this.tank.animations.play('move');
		}
	}
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.tank.body.x += speed;
			this.tank.body.y -= speed;
			this.tank.animations.play('move');
		}
		else if (this.cursor.down) {
			this.tank.body.x += speed;
			this.tank.body.y += speed;
			this.tank.animations.play('move');
		}
		else {
			this.tank.body.x += speed;
			this.tank.animations.play('move');
		}
	}
	else if (this.cursor.up) {
		this.tank.body.y -= speed;
		this.tank.animations.play('move');
	}
	else if (this.cursor.down) {
		this.tank.body.y += speed;
		this.tank.animations.play('move');
	}
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		this.tank.animations.play('attack');
	}
		
};


Tank.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.tank.x, this.tank.y, this.tank.rotation);
			bullet.rotation = this.tank.rotation;      
            game.physics.arcade.velocityFromRotation(this.tank.rotation, 500, bullet.body.velocity); 

        }
}


Tank.prototype.kill = function() {
	this.alive = false;
	this.tank.kill();
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

    game.load.spritesheet('tank', 'assets/test_guy.png', 150, 150);
    game.load.spritesheet('enemy', 'assets/test_guy.png', 150, 150);
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet2.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
}



function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;
    
    tanksList = {};
	
	player = new Tank(myId, game, tank);
	tanksList[myId] = player;
	tank = player.tank;
	// turret = player.turret;
	tank.x=0;
	tank.y=0;
	bullets = player.bullets;
	// shadow = player.shadow;	

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    // turret.bringToTop();
		
    logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
	
	setTimeout(removeLogo, 1000);
	
}

function removeLogo () {
    game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

function update () {
	//do not update if client not ready
	if (!ready) return;
	
	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.down = cursors.down.isDown;
	player.input.fire = game.input.activePointer.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;
	
	tank.rotation = game.physics.arcade.angleToPointer(tank);	
	
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    	
	
    for (var i in tanksList)
    {
		if (!tanksList[i]) continue;
		var curBullets = tanksList[i].bullets;
		var curTank = tanksList[i].tank;
		for (var j in tanksList)
		{
			if (!tanksList[j]) continue;
			if (j!=i) 
			{
			
				var targetTank = tanksList[j].tank;
				
				game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this);
			
			}
			if (tanksList[j].alive)
			{
				tanksList[j].update();
			}			
		}
    }
}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();
}

function render () {
}

