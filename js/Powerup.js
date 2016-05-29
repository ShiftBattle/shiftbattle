	this.powerUps = game.add.group();
	this.powerUps.enableBody = true;
	this.powerUps.physicsBodyType = Phaser.Physics.ARCADE;
		//in case you need to change powerup locations, here they are

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
	]

	function populatePowerUps() {

		this.powerUps.createMultiple(locs.length, 'shotgunPowerup', 0, false); //


		this.powerUps.children.map(function(each, index) {
			each.x = locs[index][0]
			each.y = locs[index][1]
		});
	}

	function activateThreeRandom() {

		var pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		var getNumber = function() {
			if (pool.length == 0) {
				throw "No numbers left";
			}
			var index = Math.floor(pool.length * Math.random());
			var drawn = pool.splice(index, 1);
			return drawn[0];
		};
		
		this.powerUps.children[getNumber()].revive();
		this.powerUps.children[getNumber()].revive();
		this.powerUps.children[getNumber()].revive();
	}

	populatePowerUps();
	activateThreeRandom();