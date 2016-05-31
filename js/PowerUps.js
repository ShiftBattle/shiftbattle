/*global game, Phaser, checkActivePowerUps*/


	function populatePowerUps() {
	
	    this.game.powerUps = this.game.add.group();
	    this.game.powerUps.enableBody = true;
	    this.game.powerUps.physicsBodyType = Phaser.Physics.ARCADE;
		this.game.powerUps.createMultiple(3, 'powerups', 0, false);
		this.game.powerUps.setAll('type', '');
		
		this.game.powerUps.callAll('animations.add', 'animations', 'rifle', [0], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'shotgun', [1], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'health', [2], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'shield', [3], 20, false); 
		
	}
	
	// function activateThreeRandom(active) {
	//     var pool = [];
	//     var list = [].slice.call(arguments);
	//     if (list[0] === null || !list.length) {
	//         this.game.powerUps.children.forEach(function(powers, i){
 //           powers.visible ? null : pool.push(i);
	//         })
	//     }
 //       else{
 //           this.game.powerUps.children.forEach(function(powers, i){
 //           if (i === active[0] || i === active[1]) return;
 //           powers.visible ? null : pool.push(i);
 //       });
 //       }
 //       console.log(pool)
        
	// 	var getNumber = function() {
	// 		var index = Math.floor(pool.length * Math.random());
	// 		var drawn = pool.splice(index, 1);
	// 		return drawn[0];
	// 	};
		
	// 	this.game.powerUps.children[getNumber()].revive();
	// 	this.game.powerUps.children[getNumber()].revive();
	// 	this.game.powerUps.children[getNumber()].revive();
	// }
	
	// function checkActivePowerUps() {
	//     console.log(this.game.powerUps.children)
	//         var activePowerUps = [];
 //            this.game.powerUps.children.forEach(function(powers, i){
 //                powers.visible ? activePowerUps.push(i) : null
 //            })
	//         return activePowerUps;
	// 	}