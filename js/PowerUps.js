/*global game, Phaser, checkActivePowerUps*/


	function populatePowerUps() {
	
	    this.game.powerUps = this.game.add.group();
	    this.game.powerUps.enableBody = true;
	    this.game.powerUps.physicsBodyType = Phaser.Physics.ARCADE;
		this.game.powerUps.createMultiple(5, 'powerups', 0, false);
		this.game.powerUps.setAll('type', '');
		
		this.game.powerUps.callAll('animations.add', 'animations', 'rifle', [0], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'shotgun', [1], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'health', [2], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'shield', [3], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'rocket', [4], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'two-guns', [5], 20, false); 
		
	}
	