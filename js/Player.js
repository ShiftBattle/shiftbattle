/* global eurecaServer, Phaser, Player, speed, localPlayerSprite, game*/

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
		health: 5,
		kills: [],
		deaths: []
		};

    this.game = game;
    this.cursor.health = 5;
    this.user = user;
    this.alive = true;
    this.nextFire = 0;
    
   
    // create 20-30 bullets per clip, maybe carry 4-5 clips and then have a reload function added
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    this.bullets.createMultiple(30, 'bullet', 0, false);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
    
    this.playerSprite = game.add.sprite(x || 0, y || 0, 'final-player');
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
    this.playerSprite.skin = 'handgun';
    
    this.healthbar = game.add.sprite(x, y, 'healthbar');
  	this.healthbar.animations.add('5health', [5], 20, false);
  	this.healthbar.animations.add('4health', [4], 20, false);
  	this.healthbar.animations.add('3health', [3], 20, false);
  	this.healthbar.animations.add('2health', [2], 20, false);
  	this.healthbar.animations.add('1health', [1], 20, false);
    this.healthbar.animations.add('0health', [0], 20, false);

    //name label
    this.label = game.add.text(x, y, 'CODRIN', { font: "14px Arial", fill: "#ffffff", align: "center" });  //Creating player ID (here based on index)

	this.reloadText = game.add.text(game.camera.width / 2, game.camera.height / 2, "OUT OF BULLETS!! PRESS R TO RELOAD", {font: "30px Arial", fill: "#ffffff ", stroke: '#000000 ', strokeThickness: 3, align: 'center'});
	this.reloadText.exists = false;
	
	// this.reloadText.visible = false;
	// this.reloadText.fixedToCamera = true;
    

}


Player.prototype.update = function() {
	
	//cursor value is now updated by eurecaClient.exports.updateState method
	
	
	if (this.cursor.left) {
		if (this.cursor.up) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y -= speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y += speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else {
			this.playerSprite.body.x -= speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
	}
	
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y -= speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y += speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
		else {
			this.playerSprite.body.x += speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
		}
	}
	else if (this.cursor.up) {
			this.playerSprite.body.y -= speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
	}
	else if (this.cursor.down) {
		this.playerSprite.body.y += speed;
			if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('move-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('move-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('move-rifle');
			}
			}
	
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		if (this.playerSprite.skin === 'handgun') {
				this.playerSprite.animations.play('shoot-handgun');
			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.playerSprite.animations.play('shoot-shotgun');
			}
			else if (this.playerSprite.skin === 'rifle') {
				this.playerSprite.animations.play('shoot-rifle');
			}
	}

    
    if (this.cursor.health === 5){
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
    else if (this.cursor.health === 0){
      		this.healthbar.animations.play('0health');
    }
    
    this.healthbar.x = this.playerSprite.x;
    this.healthbar.y = this.playerSprite.y; 
    this.healthbar.anchor.setTo(.5, -5.5);
    
	this.label.x = this.playerSprite.x;       //Adding player id beneath player
    this.label.y = this.playerSprite.y;       //
    this.label.anchor.setTo(.5, -1.8);         //
    
};

Player.prototype.fire = function(target) {
		if (!this.playerSprite.alive) return;

        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        	
            var bullet = this.bullets.getFirstExists(false);
            
            if (this.playerSprite.skin === 'handgun') {
            	this.fireRate = 500;
            	this.nextFire = this.game.time.now + this.fireRate;
     			this.bullets.setAll('anchor.x', 0);
    			this.bullets.setAll('anchor.y', -0.7);
				bullet.reset((this.playerSprite.x + (45*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (45*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity); 

			}
			else if (this.playerSprite.skin === 'shotgun') {
				this.fireRate = 800;
				this.nextFire = this.game.time.now + this.fireRate;
				this.bullets.setAll('anchor.x', 0);
    			this.bullets.setAll('anchor.y', -0.4);
				bullet.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
				bullet.rotation = this.playerSprite.rotation;      
	            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 1200, bullet.body.velocity); 

			}
			else if (this.playerSprite.skin === 'rifle') {
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
    this.cursor.health--;
    
   // eurecaServer.killUpdate(localPlayerSprite.id, this.playerSprite.id)
    console.log(this.playerSprite.id, localPlayerSprite)
    eurecaServer.handleKeys({
		health: this.cursor.health});

    if (this.cursor.health <= 0) {
    	var killer = this.playerSprite.id
    	var victim = localPlayerSprite.id
    	var packge = {killer: killer, victim: victim}
        eurecaServer.killUpdate(packge)
        this.death();

    }
};

Player.prototype.death = function() {
	var that= this;
	// console.log(this.playerSprite)
	this.playerSprite.kill();
	this.healthbar.kill();
	this.label.destroy();

	eurecaServer.handleKeys({
		alive: false,
		exists: false,
		visible: false});
	
	setTimeout(function() {
		
		console.log("RESPAWN TIMEOUT FUNCTION")
		that.respawn();
	}, 5000);
};

Player.prototype.respawn = function() {
	this.cursor.health = 5;
	this.playerSprite.revive();
	this.healthbar.revive();
	this.label = game.add.text(this.playerSprite.x, this.playerSprite.y, 'CODRIN', { font: "14px Arial", fill: "#ffffff", align: "center" });
    this.label.anchor.setTo(.5, -1.8); 
};

Player.prototype.destroy = function() {
	console.log("Destroying ", this);
	this.playerSprite.destroy();
	this.healthbar.destroy();
	this.label.destroy();
};
