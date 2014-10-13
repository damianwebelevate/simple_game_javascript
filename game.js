;(function(){

	var Game = function(canvasId){
		var canvas = document.getElementById(canvasId);

		var screen = canvas.getContext('2d');

		var size = { x: canvas.width, y: canvas.height};

		// load all of the game dependancies like player, aliens, bullets etc
		this.bodies = createInvaders(this).concat(new Player(this, size));
		var self = this;

		loadSound("lasergun.wav", function(shootSound) {
			self.shootSound = shootSound;
		var tick = function(){
			self.update();
			self.draw(screen, size);
			// to have the tick function update 60times per sec browser api requestAnimationFrame passing the tick() function
			requestAnimationFrame(tick);

		};

		tick();
		});
	}; // close var Game

	Game.prototype = {
		update: function(){

		var bodies = this.bodies;
		var notColliding = function(b1){
			return bodies.filter(
				function(b2) {
				return colliding(b1, b2); }).length === 0;
			};

		this.bodies = this.bodies.filter(notColliding);
		

		for(var i = 0; i < this.bodies.length; i++){
			this.bodies[i].update();
			};

		},
		draw: function(screen, size){
			// test
			// screen.fillRect(30, 30, 40, 60);
			screen.clearRect(0, 0, size.x, size.y);
			
			for(var i = 0; i < this.bodies.length; i++){
				drawRect(screen, this.bodies[i]);
			}
		},
		addBody: function(body){
			this.bodies.push(body);
		},
		invadersBelow: function(invader){
			return this.bodies.filter(function(b) {
				return b instanceof Invader &&
				b.center.y > invader.center.y &&
				b.center.x - invader.center.x < invader.size.x;
			}).length > 0;
		}
	}; // close Game prototype

// Player 
	var Player = function(game, size){
		this.game = game;
		this.size = { x: 15, y: 15};
		this.center = { x: size.x / 2, y: size.y - this.size.x };
		this.Keyboarder = new Keyboarder();

	};

	Player.prototype = {
		update: function(){
			// CHECK THIS IS CALLED
			// console.log("here");
			if(this.Keyboarder.isDown(this.Keyboarder.KEYS.LEFT)){
				this.center.x -= 2;
			}else if(this.Keyboarder.isDown(this.Keyboarder.KEYS.RIGHT)){
				this.center.x += 2;
			}
			if(this.Keyboarder.isDown(this.Keyboarder.KEYS.SPACE)){
				var bullet = new Bullet(
					// relationship to player
					{ x : this.center.x, y: this.center.y - this.size.x / 2 },
					// velocity
					{ x: 0, y: -6 }
					);
				this.game.addBody(bullet);
				this.game.shootSound.load();
				this.game.shootSound.play();

			}
		}
	}; // close Player proto

// Bullet
	var Bullet = function(center, velocity){
		this.size = { x: 3, y: 3};
		this.center = center;
		this.velocity = velocity;
	};

	Bullet.prototype = {
		update: function(){
			this.center.x += this.velocity.x;
			this.center.y += this.velocity.y;
		}
	};// close bullet

// invader

	var Invader = function(game, center){
		this.game = game;
		this.size = { x: 15, y: 15};
		this.center = center;
		this.patrolX = 0;
		this.speedX = 0.3;
	};

	Invader.prototype = {

		update: function(){
			if (this.patrolX < 0 || this.patrolX > 40){
				this.speedX = -this.speedX;
			}
			this.center.x += this.speedX;
			this.patrolX += this.speedX;

			if(Math.random() > 0.995 && !this.game.invadersBelow(this)){
			var bullet = new Bullet(
					{ x : this.center.x, y: this.center.y + this.size.x / 2 },
					{ x : Math.random() - 0.5, y: 2 }
					);
				this.game.addBody(bullet);
				loadSound("shoot.wav", 
					function(fireBack){ 
						Invader.fireBack = fireBack; 
						fireBack.load(); 
						fireBack.play();
						});
				}
			}
	};// close invader proto

// invaders array 
	var createInvaders = function(game){
		var invaders = [];
		// creates 24 invaders
		for(var i = 0; i < 24; i++){
			var x = 30 + (i % 8) * 30;
			var y = 30 + (i % 3) * 30;
			invaders.push(new Invader( game, { x: x, y: y } ));
  		}
		return invaders;
	};

	var drawRect = function(screen, body){
		screen.fillRect(body.center.x - body.size.x / 2,
						body.center.y - body.size.y / 2,
						body.size.x, body.size.y);
	}; // close drawRect funct

	// handle keyboard input
	var Keyboarder = function(){
		var keyState = {};

		window.onkeydown = function(e){
			keyState[e.keyCode] = true;
		};

		window.onkeyup = function(e){
			keyState[e.keyCode] = false;
		};

		this.isDown = function(keyCode){
			return keyState[keyCode] === true;
		};

		this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32};
	};// close handle keyboard

// detect collisions takes two bodies 
	var colliding = function(b1, b2){
		// if they are equal then they are not colliding
		// if any of the sides are above/below any of the other sides then they are not colliding
		return !(b1 === b2 || 
				 b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
				 b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
				 b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
				 b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2   
				 );
	};

	
	var loadSound = function(url, callback){
		var loaded = function(){
			callback(sound);
			sound.removeEventListener('canplaythrough', loaded);
		};

		var sound = new Audio(url);
		sound.addEventListener('canplaythrough', loaded);
		sound.load();
	};

	window.onload = function(){
		new Game("game");
	};// auto load the game when the canvas and js file are ready

})();