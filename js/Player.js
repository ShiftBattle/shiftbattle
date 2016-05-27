function Player(index, game, user, x, y) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false,
		down: false,
		alive: true,
		visible: true,
		exists: true
	};

	// this.weapon = 'rifle';

    // var x = 0;
    // var y = 0;

    this.game = game;
    this.health = 5;
    this.user = user;
    this.alive = true;
   
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    
    // create 20-30 bullets per clip, maybe carry 4-5 clips and then have a reload function added
    this.bullets.createMultiple(5, 'bullet', 0, false);
    
    
    // anchoring of the bullets for the rifle
    // this.bullets.setAll('anchor.x', 0);
    // this.bullets.setAll('anchor.y', -0.3);
    
    // anchoring of the bullets for the handgun
    // this.bullets.setAll('anchor.x', 0);
    // this.bullets.setAll('anchor.y', -0.7);
    
    // anchoring of the bullets for the shotgun
    this.bullets.setAll('anchor.x', 0);
    this.bullets.setAll('anchor.y', -0.4);
    
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
    // this.bullets.setAll('alive', true);
	
	// this should be set to 500 for normal gameplay, 100 for 'Codrin' gameplay
    this.fireRate = 100;
    this.nextFire = 100;

    this.playerSprite = game.add.sprite(x || 0, y || 0, 'shotgun-player');
    // this.hitbox = game.add.sprite(x, y, 'hitbox');

    this.playerSprite.anchor.set(0.5);
    
    this.playerSprite.animations.add('move', [0], 20, false);
  	// this.playerSprite.animations.add('reload', [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37], 20, false);
  	this.playerSprite.animations.add('shoot', [1, 2, 3], 10, false);
  	
  	this.healthbar = game.add.sprite(x, y, 'healthbar');
  	this.healthbar.animations.add('5health', [5], 20, false);
  	this.healthbar.animations.add('4health', [4], 20, false);
  	this.healthbar.animations.add('3health', [3], 20, false);
  	this.healthbar.animations.add('2health', [2], 20, false);
  	this.healthbar.animations.add('1health', [1], 20, false);
    this.healthbar.animations.add('0health', [0], 20, false);

    
    this.playerSprite.id = index;
    game.physics.enable(this.playerSprite, Phaser.Physics.ARCADE);
    this.playerSprite.body.setSize(100, 100, 25, 25);
    this.playerSprite.body.immovable = false;
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.body.bounce.setTo(0, 0);
    // this.playerSprite.body.reset(this.playerSprite.x, this.playerSprite.y);
    this.playerSprite.angle = 0;
    
    //name label
    this.label = game.add.text(x, y, 'CODRIN', { font: "14px Arial", fill: "#ffffff", align: "center" });  //Creating player ID (here based on index)

	this.reloadText = game.add.text(game.camera.width / 2, game.camera.height / 2, "OUT OF BULLETS!! PRESS R TO RELOAD", {font: "30px Arial", fill: "#ffffff ", stroke: '#000000 ', strokeThickness: 3});
	this.reloadText.visible = false;
	
    //name label
    /*player ID =>*/ //index
    this.playerSprite.angle = 0;
    
    console.log(this.reloadText );
}


Player.prototype.update = function() {
	
	//cursor value is now updated by eurecaClient.exports.updateState method
	
	
	if (this.cursor.left) {
		if (this.cursor.up) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y -= speed;
			// this.playerSprite.animations.play('move');
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x -= speed;
			this.playerSprite.body.y += speed;
			// this.playerSprite.animations.play('move');
		}
		else {
			this.playerSprite.body.x -= speed;
			// this.playerSprite.animations.play('move');
		}
	}
	else if (this.cursor.right) {
		if (this.cursor.up) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y -= speed;
			// this.playerSprite.animations.play('move');
		}
		else if (this.cursor.down) {
			this.playerSprite.body.x += speed;
			this.playerSprite.body.y += speed;
			// this.playerSprite.animations.play('move');
		}
		else {
			this.playerSprite.body.x += speed;
			// this.playerSprite.animations.play('move');
		}
	}
	else if (this.cursor.up) {
			this.playerSprite.body.y -= speed;
			// this.playerSprite.animations.play('move');
	}
	else if (this.cursor.down) {
		this.playerSprite.body.y += speed;
		// this.playerSprite.animations.play('move');
	}
	 if (this.cursor.fire) {
		this.fire({
			x: this.cursor.tx,
			y: this.cursor.ty
		});
		this.playerSprite.animations.play('shoot');
	}
	

    
    if (this.health === 5){
      		this.healthbar.animations.play('5health');
    }
    else if (this.health === 4){
      		this.healthbar.animations.play('4health');
    }
    else if (this.health === 3){
      		this.healthbar.animations.play('3health');
    }
    else if (this.health === 2){
      		this.healthbar.animations.play('2health');
    }
    else if (this.health === 1){
      		this.healthbar.animations.play('1health');
    }
    else if (this.health === 0){
      		this.healthbar.animations.play('0health');
    }
    
    this.healthbar.x = this.playerSprite.x;
    this.healthbar.y = this.playerSprite.y; 
    this.healthbar.anchor.setTo(.5, -5.5);
    
	this.label.x = this.playerSprite.x;       //Adding player id beneath player
    this.label.y = this.playerSprite.y;       //
    this.label.anchor.setTo(.5, -1.8);         //
    
    
    // this.hitbox.x = this.playerSprite.x;       //Adding player id beneath player
    // this.hitbox.y = this.playerSprite.y;  
    // this.hitbox.anchor.setTo(-0.3, 0.1);

	// this.reloadText.anchor.setTo(0.5, 0.5);
	this.reloadText.cameraOffset.setTo(0,0)
	this.reloadText.fixedToCamera = true;
	
};

Player.prototype.fire = function(target) {
		if (!this.playerSprite.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        	this.nextFire = this.game.time.now + game.gun.rifle.fireRate;
        
            var bullet = this.bullets.getFirstDead();
            
            // bullet reset for the rifle
            // bullet.reset((this.playerSprite.x + (73*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (73*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);
            
            // bullet reset for the handgun
            // bullet.reset((this.playerSprite.x + (45*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (45*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);

			// bullet reset for the shotgun
            bullet.reset((this.playerSprite.x + (60*Math.cos(this.playerSprite.rotation))), (this.playerSprite.y + (60*Math.sin(this.playerSprite.rotation))), this.playerSprite.rotation);

            
			bullet.rotation = this.playerSprite.rotation;      
            game.physics.arcade.velocityFromRotation(this.playerSprite.rotation, 700, bullet.body.velocity); 
            
        }
        if (this.bullets.countLiving() === 5) {
        	this.reloadText.visible = true;
        }
      
        
};

Player.prototype.damage = function(){
    console.log(this.playerSprite.id, " IS GETTING POUNDED BY ", localPlayerSprite.id);
    this.health--;

    if (this.health <= 0) {

        console.log(localPlayerSprite.id, " JUST KILLED ", this.playerSprite.id);
        console.log(this.playerSprite, " this is the playerSprite in the Player.prototype.damage function");
        
        this.death();
    }
};

Player.prototype.death = function() {
	var that= this;
	this.playerSprite.kill();
	this.healthbar.kill();
	this.label.destroy();

	
	eurecaServer.handleKeys({
		alive: false,
		exists: false,
		visible: false});
	
	// this.text = game.add.text(game.camera.width / 2, game.camera.height / 2, "U MAD?", {font: "30px Arial", fill: "#ffffff ", stroke: '#000000 ', strokeThickness: 3});
	// this.text.anchor.setTo(0.5, 0.5);
	// this.text.fixedToCamera = true;
	
	setTimeout(function() {
		
		console.log("RESPAWN TIMEOUT FUNCTION")
		that.respawn();
	}, 5000);
};

Player.prototype.respawn = function() {
	this.health = 5;
	this.playerSprite.reset(200, 200);
	this.healthbar.revive();
	this.label = game.add.text(this.playerSprite.x, this.playerSprite.y, 'CODRIN', { font: "14px Arial", fill: "#ffffff", align: "center" });
    this.label.anchor.setTo(.5, -1.8); 

    // console.log(this);
};

Player.prototype.destroy = function() {
	console.log("Destroying ", this);
	this.playerSprite.destroy();
	this.healthbar.destroy();
	this.label.destroy();
};
