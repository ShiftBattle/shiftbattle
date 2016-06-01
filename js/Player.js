/* global eurecaServer, Phaser, Player, speed, localPlayerSprite, game*/

var playerSpawns = {
1: [180, 170],
2: [155, 1080],
3: [119, 1355],
4: [129, 2420],
5: [890, 1981],
6: [1170, 1985],
7: [1500, 2423],
8: [2435, 2421],
9: [1778, 1971],
10: [2475, 1360],
11: [1474, 1554],
12: [2449, 124],
13: [1872, 364]
};

function countObjectKeys(obj) { 
    return Object.keys(obj).length; 
}

function randomize (spawnObject) {
	return Math.floor((Math.random() * countObjectKeys(spawnObject)) + 1);
}


function Player(index, game, user, x, y) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false,
		down: false,
		alive: true,
		visible: true,
		exists: true,
		skin: 'handgun',
		health: 10,
		shield: false
		};

    this.game = game;
    this.user = user;
    this.alive = true;
    this.nextFire = 0;
    this.cursor.health = 10;
    this.cursor.skin = 'handgun';
    this.cursor.shield = false;
   
    // create 20-30 bullets per clip, maybe carry 4-5 clips and then have a reload function added
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    this.bullets.createMultiple(30, 'bullet', 0, false);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
    
   	var loc = playerSpawns[randomize(playerSpawns)];
    this.playerSprite = game.add.sprite(loc[0], loc[1], 'final-player');
    this.playerSprite.anchor.set(0.5);
    
    this.playerSprite.animations.add('move-handgun', [0], 20, false);
    this.playerSprite.animations.add('move-rifle', [4], 20, false);
    this.playerSprite.animations.add('move-shotgun', [8], 20, false);
    
  	this.playerSprite.animations.add('shoot-handgun', [1, 2, 3], 7, false);
  	this.playerSprite.animations.add('shoot-rifle', [5, 6, 7], 10, false);
  	this.playerSprite.animations.add('shoot-shotgun', [9, 10, 11], 4, false);
    
    this.playerSprite.id = index;
    game.physics.enable(this.playerSprite, Phaser.Physics.ARCADE);
    this.playerSprite.body.setSize(75, 75, 15, 35);
    this.playerSprite.body.immovable = false;
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.body.bounce.setTo(0, 0);
    this.playerSprite.angle = 0;
    
    this.healthbar = game.add.sprite(x, y, 'healthbar');
  	this.healthbar.animations.add('10health', [9], 20, false);    
  	this.healthbar.animations.add('9health', [8], 20, false);    
  	this.healthbar.animations.add('8health', [7], 20, false);    
  	this.healthbar.animations.add('7health', [6], 20, false);    
  	this.healthbar.animations.add('6health', [5], 20, false);
  	this.healthbar.animations.add('5health', [4], 20, false);   
  	this.healthbar.animations.add('4health', [3], 20, false);
  	this.healthbar.animations.add('3health', [2], 20, false);
  	this.healthbar.animations.add('2health', [1], 20, false);
  	this.healthbar.animations.add('1health', [0], 20, false);

    this.shield = game.add.sprite(x, y, 'shield');
    this.shield.animations.add('shield', [0, 1, 2, 3], 10, true);
    // this.shield.health = 0;
    this.shield.visible = false;
    
    //name label
    this.label = game.add.text(x, y, '' + this.playerSprite.id + '', { font: "14px Arial", fill: "#ffffff", align: "center" });  //Creating player ID (here based on index)

	// this.reloadText = game.add.text(game.camera.width / 2, game.camera.height / 2, "OUT OF BULLETS!! PRESS R TO RELOAD", {font: "30px Arial", fill: "#ffffff ", stroke: '#000000 ', strokeThickness: 3, align: 'center'});
	// this.reloadText.exists = false;
	
	// this.reloadText.visible = false;
	// this.reloadText.fixedToCamera = true;
    
	this.healthbar.x = this.playerSprite.x;
    this.healthbar.y = this.playerSprite.y; 
    this.healthbar.anchor.setTo(.5, -5.5);
    
   	this.shield.x = this.playerSprite.x;
    this.shield.y = this.playerSprite.y; 
    this.shield.anchor.setTo(0.5, 0.5);
    
	this.label.x = this.playerSprite.x;       //Adding player id beneath player
    this.label.y = this.playerSprite.y;       //
    this.label.anchor.setTo(.5, -1.8);  


}


Player.prototype.update = function() {
	
	//cursor value is now updated by eurecaClient.exports.updateState method
	this.healthbar.x = this.playerSprite.x;
    this.healthbar.y = this.playerSprite.y; 
    this.shield.x = this.playerSprite.x;
    this.shield.y = this.playerSprite.y; 
    this.label.x = this.playerSprite.x;  
    this.label.y = this.playerSprite.y;  
    
	
	if (this.cursor.left) {
		if (this.cursor.up) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else {
			this.playerSprite.body.x -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
	}
	
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else {
			this.playerSprite.body.x += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
	}
	else if (this.cursor.up) {
			this.playerSprite.body.y -= speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
	}
	else if (this.cursor.down) {
		this.playerSprite.body.y += speed;
			if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			}
	
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		if (this.cursor.skin === 'handgun') {
				this.playerSprite.animations.play('shoot-handgun');
			}
			else if (this.cursor.skin === 'shotgun') {
				this.playerSprite.animations.play('shoot-shotgun');
			}
			else if (this.cursor.skin === 'rifle') {
				this.playerSprite.animations.play('shoot-rifle');
			}
	}
    if (this.cursor.health === 10){
      		this.healthbar.animations.play('10health');
    }
    else if (this.cursor.health === 9){
      		this.healthbar.animations.play('9health');
    }
    else if (this.cursor.health === 8){
      		this.healthbar.animations.play('8health');
    }
    else if (this.cursor.health === 7){
      		this.healthbar.animations.play('7health');
    }
    else if (this.cursor.health === 6){
      		this.healthbar.animations.play('6health');
    }
    else if (this.cursor.health === 5){
      		this.healthbar.animations.play('5health');
    }
    else if (this.cursor.health === 4){
      		this.healthbar.animations.play('4health');
    }
    else if (this.cursor.health === 3){
      		this.healthbar.animations.play('3health');
    }
    else if (this.cursor.health === 2){
      		this.healthbar.animations.play('2health');
    }
    else if (this.cursor.health === 1){
      		this.healthbar.animations.play('1health');
    }
    
    if (this.cursor.shield === true) {
    	this.shield.visible = true;
    	this.shield.animations.play('shield');
    }
    if (this.cursor.shield === false) {
    	this.shield.visible = false;
    }
    
};

Player.prototype.fire = function(target) {
		if (!this.playerSprite.alive) return;

        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        	
            var bullet = this.bullets.getFirstExists(false);
            
            if (this.cursor.skin === 'handgun') {
            	this.fireRate = 500;
            	this.nextFire = this.game.time.now + this.fireRate;
     			this.bullets.setAll('anchor.x', 0);
    			this.bullets.setAll('anchor.y', -0.7);
				bullet.reset((this.playerSprite.x + (45*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (45*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity); 

			}
			else if (this.cursor.skin === 'shotgun') {

				this.fireRate = 800;
				this.nextFire = this.game.time.now + this.fireRate;
				var bullet = this.bullets.getRandom();
				var bullet2 = this.bullets.getRandom();
				var bullet3 = this.bullets.getRandom();
				this.bullets.setAll('anchor.x', 0);
    			this.bullets.setAll('anchor.y', -0.4);
				bullet.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet2.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet3.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity); 
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet2.body.velocity); 
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet3.body.velocity); 

			}
			else if (this.cursor.skin === 'rifle') {
				this.fireRate = 200;
				this.nextFire = this.game.time.now + this.fireRate;
				this.bullets.setAll('anchor.x', 0.5);
				this.bullets.setAll('anchor.y', -0.4);
				bullet.reset((this.playerSprite.x + (73*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (73*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity);
			}
        }
};    
      

Player.prototype.damage = function(){
	
    console.log(this.playerSprite.id, " IS GETTING POUNDED BY ", localPlayerSprite.id);
    if (this.shield.health > 0) {
    	console.log(this.shield.health, 'inside if statement on damage');
    	this.shield.health--;
    }
    else {
    	console.log(this.shield.health, 'inside else statement on damage');
    	this.shield.kill();
    	this.cursor.health--;
    	eurecaServer.handleKeys({
		health: this.cursor.health,
    	shield: false
    	});
    }
    if (this.cursor.health <= 0) {
        console.log(localPlayerSprite.id, " JUST KILLED ", this.playerSprite.id);
        this.death();
    }
};

Player.prototype.death = function() {
	var that= this;
	// console.log(this.playerSprite)
	this.shield.kill();
	this.healthbar.kill();
	this.label.kill();
	// this.label.destroy();
	this.playerSprite.kill();

	eurecaServer.handleKeys({
		alive: false,
		exists: false,
		visible: false});
		shield: false;
	
	setTimeout(function() {
		console.log("RESPAWN TIMEOUT FUNCTION");
		that.respawn();
	}, 5000);
};

Player.prototype.respawn = function() {
	this.cursor.health = 10;
	this.cursor.skin = 'handgun';
	var loc = playerSpawns[randomize(playerSpawns)];
	this.playerSprite.x = loc[0];
	this.playerSprite.y = loc[1];
	this.playerSprite.revive();
	this.label.revive();
	this.healthbar.revive();
	eurecaServer.handleKeys({
		alive: true,
		exists: true,
		visible: true,
		skin: 'handgun',
		health: 10
	});
	
};

Player.prototype.destroy = function() {
	console.log("Destroying ", this);
	this.playerSprite.destroy();
	this.healthbar.destroy();
	this.label.destroy();
	this.shield.destroy();
};
