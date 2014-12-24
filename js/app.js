// board definition constants:
var board = {
	"canvas": {
		"width": 505,
		"height": 606
	},
	"rows": 6,
	"cols": 5,
	"colWidth": 101,
	"rowHeight": 83,
	"playerStartRow": 5,
	"playerStartCol": 2,
	"playerYOffset": -10, //fudge factor to push player to middle of block
	"enemyRowMin": 1,
	"enemyRowMax": 3,
	"enemyYOffset": -21 //Fudge factor to push enemy to middle of lane (in pixels)
}

/******************************************************************************
*
******************************************************************************/
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = new Sprite('images/enemy-bug.png');
}

Enemy.prototype.init = function() {
	this.x = 0 - board.colWidth;
	this.row = this.startRow();
	this.y = this.row * board.rowHeight + board.enemyYOffset;
	this.speed = this.setSpeed();
	this.delay = this.setDelay();
	this.sprite.init();
}


// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	if (0 < this.delay) {
		this.delay -= dt;
	} else {
		this.x = this.x + this.speed * dt;
		if ((board.cols * board.colWidth) < this.x) {
			//Hey! We made it all the way across the board... let's start again...
			this.init();
		}
	}
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite.url), this.x, this.y);
}

//Helper that calculates the enemy's speed
// speed is denoted in pixels per second
Enemy.prototype.setSpeed = function() {
	//ToDo: make this more "interesting"
	return board.colWidth; //For now, move a constant column's width per second
}

//Helper that sets the delay before this enemy repeats its' trek across the screen
// delay is in seconds.
//For now, it's simply a random number from 1 to 5
Enemy.prototype.setDelay = function() {
	return Math.floor(Math.random() * 5) + 1;
}

// Helper that returns a random starting row within the bounds set by board.enemyRowMin and board.enemyRowMax constants.
// IE: put the enemy in the starting gate at the edge of his lane.
Enemy.prototype.startRow = function() {
	var enemyRows = board.enemyRowMax - board.enemyRowMin + 1;
	var enemyRow = Math.floor((Math.random() * enemyRows) + board.enemyRowMin);
	return enemyRow;
}

/******************************************************************************
*
******************************************************************************/
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
	this.lives = 3;
	this.score = 1234;
	this.sprite = new Sprite('images/char-boy.png');
}

Player.prototype.init = function() {
	this.isDieing = false;
	this.dieingAngle = 0;
	this.deathSpiralTime = 3; //seconds to spiral before death
	this.row = board.playerStartRow;
	this.col = board.playerStartCol;
	this.sprite.init();
}

Player.prototype.update = function(dt) {
	//We're going to implement collisions here, because the only collisions that we care
	// about are collisions that involve the player... at least, for now.
	if (!this.isDieing) {
		for (var enemyIndex in allEnemies) {
			var enemy = allEnemies[enemyIndex];
			var eMinX = enemy.x + enemy.sprite.extents.minx;
			var eMaxX = enemy.x + enemy.sprite.extents.maxx;
			var pMinX = this.col * board.colWidth + this.sprite.extents.minx;
			var pMaxX = this.col * board.colWidth + this.sprite.extents.maxx;
			if (this.row === enemy.row) {
				if ((eMinX <= pMinX && pMinX <= eMaxX) ||
					(eMinX <= pMaxX && pMaxX <= eMaxX)) {
					this.isDieing = true;
				}
			}
		}
	} else {
		//Dieing...
		this.deathSpiralTime -= dt;
		if (this.deathSpiralTime <= 0) {
			//dead... start over.
			return true;
		}
	}
}

//render - draw the player character. Currently, there are two ways to display the character.
//Either, the character is live and playing, or
//they are in a death spiral - dieing.
Player.prototype.render = function() {
	var x = this.col * board.colWidth;
	var y = this.row * board.rowHeight + board.playerYOffset;
	if (!this.isDieing) {
		ctx.drawImage(Resources.get(this.sprite.url), x, y);
	} else {
		//Dieing... spin the character on each tick of the game clock.
		ctx.save();
		var spriteWidth = this.sprite.extents.maxx - this.sprite.extents.minx;
		var spriteHeight = this.sprite.extents.maxy - this.sprite.extents.miny;
		x += this.sprite.extents.minx + spriteWidth/2;
		y += this.sprite.extents.miny + spriteHeight/2;
		ctx.translate(x, y);
		ctx.rotate(this.dieingAngle);
		this.dieingAngle += Math.PI / 8;
		x = -(this.sprite.extents.minx + spriteWidth/2);
		y = -(this.sprite.extents.miny + spriteHeight/2);
		ctx.drawImage(Resources.get(this.sprite.url), x, y);
		ctx.restore();
	}
}

// stillOnBoard - is a helper that checks whether or not the given board coordinates are
// within the bounds of the board (as defined in the board constants, up top) or not.
// returns - true if still on the board, false - if not.
Player.prototype.stillOnBoard = function(col, row) {
	return (((0 <= col) && (0 <= row)) && ((col <= board.cols - 1) && (row <= board.rows - 1)))
}

// handleInput - move the character around using the keyboard cursor keys.
Player.prototype.handleInput = function(keyCode) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
	var key = allowedKeys[keyCode];
	if (undefined === key) { return false;};
	
	//Can't move while dieing...
	if (this.isDieing) {
		return true;
	};
	//Not dieing, let's see which way the player wants to move...
	var newRow = this.row;
	var newCol = this.col;
	if ('left' === key) { newCol--;}
	else if ('right' === key) { newCol++;}
	else if ('up' === key) { newRow--;}
	else if ('down' === key) { newRow++;}
	else { return false;}

	if (this.stillOnBoard(newCol,newRow)) {
		this.col = newCol;
		this.row = newRow;
	} else {
		console.log("Bump!");
	}
	return true;
}

/******************************************************************************
*
******************************************************************************/
var Sprite = function(url) {
	this.url = url;
	this.extents = {
		"minx":9999,
		"miny":9999,
		"maxx":0,
		"maxy":0};
}

Sprite.prototype.init = function() {
	this.setVisibleExtents();
}

Sprite.prototype.setVisibleExtents = function() {
	var img = Resources.get(this.url);
	var eCanvas = document.createElement('canvas');
	var ctx = eCanvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	var imgData = ctx.getImageData(0,0,img.width,img.height);
	var minx = img.width - 1;
	var miny = img.height - 1;
	var maxx = 0;
	var maxy = 0;
	
			var pixelData = imgData.data;
			for (var y = 0; y < img.height; y++) {
				for (var x = 0; x < img.width; x++) {
					if (0 < pixelData[(x * 4) + (y * 4 * img.width) + 3]) {
						if (x < minx) {minx = x;};
						if (y < miny) {miny = y;};
						if (maxx < x) {maxx = x;};
						if (maxy < y) {maxy = y;};
					}
				}
			};
	this.extents.minx = minx;
	this.extents.miny = miny;
	this.extents.maxx = maxx;
	this.extents.maxy = maxy;
}

/******************************************************************************
*
******************************************************************************/

var StatusBar = function(player) {
	this.heartSprite = new Sprite('images/Heart.png');
	this.player = player;
}

StatusBar.prototype.init = function() {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // canvas.width = 505;
    // canvas.height = 606;
    this.canvas.width = board.canvas.width;
    this.canvas.height = 70;
    document.body.appendChild(this.canvas);
	this.heartSprite.init();
}

StatusBar.prototype.update = function() {
}

StatusBar.prototype.render = function() {
	//draw hearts on the left, and numbers on the right...
	this.ctx.fillStyle = "lime";
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.strokeStyle = "green";
	this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
	
	this.renderLives();
	this.renderScore();
}

StatusBar.prototype.renderLives = function() {
	for (var life = 0; life < this.player.lives; life++) {
		var sx = this.heartSprite.extents.minx;
		var sy = this.heartSprite.extents.miny;
		var sw = this.heartSprite.extents.maxx - this.heartSprite.extents.minx;
		var sh = this.heartSprite.extents.maxy - this.heartSprite.extents.miny;
		var dx = 5 + (life * (this.heartSprite.extents.maxx - this.heartSprite.extents.minx + 5)) / 3;
		var dy = 5
				+ (Math.floor(this.player.lives/7) * (this.heartSprite.extents.maxy - this.heartSprite.extents.miny + 5))/3;
		var dw = (this.heartSprite.extents.maxx - this.heartSprite.extents.minx) / 3;
		var dh = (this.heartSprite.extents.maxy - this.heartSprite.extents.miny) / 3;
		
		this.ctx.drawImage(Resources.get(this.heartSprite.url), sx, sy, sw, sh, dx, dy, dw, dh);
	};
}

StatusBar.prototype.renderScore = function() {
	this.ctx.font = "50pt Impact";
	this.ctx.textAlign="right";
	this.ctx.strokeStyle = "red";
	this.ctx.fillStyle = "DarkOrange";
	this.ctx.lineWidth = "3";
	this.ctx.fillText(this.player.score, this.canvas.width - 5, this.canvas.height - 5);
	this.ctx.strokeText(this.player.score, this.canvas.width - 5, this.canvas.height - 5);
}
/******************************************************************************
*
******************************************************************************/
//The Settings object manages the settable game options...
var Settings = function() {
	this.node;  //holds the node object so we can insert and remove the settings from the document
	this.isVisible = false;
	this.paused = false;
	this.chars = [
		'images/char-boy.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png'
		];
	this.init();
}

Settings.prototype.init = function() {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

	//Make this the same size as the board, so that it looks good when
	//we replace the board with it. This gives us too much real-estate,
	//but the intent is to later have more settings to manage, like
	//sound volumes, difficulty levels, etc...
	this.canvas.width = board.canvas.width;
	this.canvas.height = board.canvas.height;

	this.curCharIndex = 0;
	for (var charIndex = 0; charIndex < this.chars.length; charIndex++) {
		if (player.sprite.url === this.chars[charIndex]) {
			this.curCharIndex = charIndex;
		}
	}
}

Settings.prototype.render = function() {
	this.ctx.fillStyle = "yellow";
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.strokeStyle = "green";
	this.ctx.strokeWidth = 5;
	this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
	//draw char sprite...
	this.ctx.drawImage(Resources.get(this.chars[this.curCharIndex]), 10, 10);
	//ToDo: draw text: left or right to select...
	//ToDo: draw text: esc to cancel, enter to accept...
}

Settings.prototype.show = function() {
console.log("in show");
	if (this.isVisible) { return; };
	//first time is a special case... need to generate the node
	if (undefined === this.node) {
		this.node = document.body.appendChild(this.canvas);
	} else {
		this.node = document.body.appendChild(this.node);
	}
	theEngine.pause();
	this.isVisible = true;
}

Settings.prototype.hide = function() {
	if (!this.isVisible) { return; };
    this.node = document.body.removeChild(this.node);
	theEngine.unpause();
	this.isVisible = false;
}

Settings.prototype.handleInput = function(keyCode) {
    var allowedKeys = {
		80: 'pause',
		83: 'settings',
        37: 'left',
        39: 'right',
		13: 'enter',
		27: 'esc'
    };
	var theKey = allowedKeys[keyCode];
	if (undefined === theKey) { return false;};

	if ('pause' === theKey) {
		if (this.paused) {
			theEngine.unpause();
			this.paused = false;
		} else {
			theEngine.pause();
			this.paused = true;
		}
		return true;
	} else if ('settings' === theKey) {
		if (!this.isVisible) {
			//Can I replace the board and status with this canvas and later restore them?
			//this.init();
			this.render();
			this.show();
		} else {
			this.hide();
		}
		return true;
	};
	if (!this.isVisible) { return false;};
	if ('left' === theKey) {
		//show previous character sprite
		if (0 < this.curCharIndex) { this.curCharIndex--;}
		else { this.curCharIndex = this.chars.length - 1; };
		this.render();
		return true;
	} else if ('right' === theKey) {
		//show next character sprite
		if (this.curCharIndex < this.chars.length - 1) { this.curCharIndex++;}
		else { this.curCharIndex = 0; };
		this.render();
		return true;
	} else if ('esc' === theKey) {
		//Hide settings and restore the board and status...
		this.hide();
		return true;
	} else if ('enter' === theKey) {
		//Change player's sprite.
		player.sprite.url = this.chars[this.curCharIndex];
		//Hide settings and restore the board and status...
		this.hide();
		return true;
	}
	return false;
}


/******************************************************************************
*
******************************************************************************/
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var enemyIndex = 0; enemyIndex < 4; enemyIndex++) {
	allEnemies.push(new Enemy());
}
var player = new Player();
var statusBar = new StatusBar(player);
var settings = new Settings();

// This listens for key presses and sends the keys to your
// handleInput() methods. handleInput methods work in a chain.
// If the first one handles the input, then the rest of them
// don't fire. If the first one refuses the input, then the next
// one is given a chance... until one of them handles it, or they
// all fail, at which point, it's an invalid keypress. Because
// of this chaining, the individual handleInput methods must
// return true if they handled the key, and false if they didn't.
// Additionally, if there is overlap (multiple handlers using the
// same key) then the order of handlers is important.
document.addEventListener('keyup', function(e) {
	if (settings.handleInput(e.keyCode)) { return;};
    if (player.handleInput(e.keyCode)) { return;};
	console.log("Invalid key:"+ e.keyCode);
});
