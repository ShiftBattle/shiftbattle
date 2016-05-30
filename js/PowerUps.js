/*global game, Phaser, checkActivePowerUps*/


	function populatePowerUps() {
	    var locs = [
		[2161, 2421],
		[2145, 1360],
		[1814, 1629],
		[1694, 1169],
		[670, 2043],
		[1022, 2421],
		[522, 1087],
		[324, 325],
		[889, 129],
		[1578, 200],
		[2261, 234],
		[1296, 815]
	];
	
	    this.game.powerUps = this.game.add.group();
	    this.game.powerUps.enableBody = true;
	    this.game.powerUps.physicsBodyType = Phaser.Physics.ARCADE;
		this.game.powerUps.createMultiple(locs.length, 'powerups', 0, false);
		this.game.powerUps.setAll('type', '');
		
		this.game.powerUps.callAll('animations.add', 'animations', 'rifle', [0], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'shotgun', [1], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'health', [2], 20, false); 
		this.game.powerUps.callAll('animations.add', 'animations', 'shield', [3], 20, false); 
		

		this.game.powerUps.children.map(function(each, index) {
			each.x = locs[index][0];
			each.y = locs[index][1];
		});
	}

	function activateThreeRandom(active) {
	    var pool = [];
	    var list = [].slice.call(arguments);
	    if (list[0] === null || !list.length) {
	        this.game.powerUps.children.forEach(function(powers, i){
            powers.visible ? null : pool.push(i);
	        })
	    }
        else{
            this.game.powerUps.children.forEach(function(powers, i){
            if (i === active[0] || i === active[1]) return;
            powers.visible ? null : pool.push(i);
        });
        }
        console.log(pool)
        
		var getNumber = function() {
			var index = Math.floor(pool.length * Math.random());
			var drawn = pool.splice(index, 1);
			return drawn[0];
		};
		
		this.game.powerUps.children[getNumber()].revive();
		this.game.powerUps.children[getNumber()].revive();
		this.game.powerUps.children[getNumber()].revive();
	}
	
	function checkActivePowerUps() {
	    console.log(this.game.powerUps.children)
	        var activePowerUps = [];
             this.game.powerUps.children.forEach(function(powers, i){
                 powers.visible ? activePowerUps.push(i) : null
             })
	        return activePowerUps;
		}