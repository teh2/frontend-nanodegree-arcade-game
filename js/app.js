
/******************************************************************************
*
******************************************************************************/
var Board = function() {
	//These are all intended to be constants. If they get changed, things might not
	// go according to plan...
	this.canvasWidth = 505;
	this.canvasHeight = 606;
	this.rows = 6;
	this.cols = 5;
	this.colWidth = 101;
	this.rowHeight = 83;
	this.playerStartRow = 5;
	this.playerStartCol = 2;
	this.playerYOffset = -10; //fudge factor to push player to middle of block
	this.enemyRowMin = 1;
	this.enemyRowMax = 3;
	this.enemyYOffset = -21; //Fudge factor to push enemy to middle of lane (in pixels)
	this.treasureXOffset = 25; //Fudge factor to push the treasure into the square.
	this.treasureYOffset = 35; //Fudge factor to push the treasure into the square.
	
	//Now, some things that are intended as changeable object attributes...
	this.isVisible = false;

}

Board.prototype.init = function() {
	this.canvas = document.createElement('canvas'),
	this.ctx = this.canvas.getContext('2d'),

	this.canvas.width = this.canvasWidth;
	this.canvas.height = this.canvasHeight;
	this.show();
}

Board.prototype.show = function() {
	if (this.isVisible) { return; };
	if (undefined === statusBar.canvas) {
		document.body.appendChild(this.canvas);
	} else {
		document.body.insertBefore(this.canvas, statusBar.canvas);
	}
	this.isVisible = true;
}

Board.prototype.hide = function() {
	if (!this.isVisible) { return; };
	document.body.removeChild(this.canvas);
	this.isVisible = false;
}

Board.prototype.update = function(dt) {
}

Board.prototype.render = function() {
	/* This array holds the relative URL to the image used
	 * for that particular row of the game level.
	 */
	var rowImages = [
			'images/water-block.png',   // Top row is water
			'images/stone-block.png',   // Row 1 of 3 of stone
			'images/stone-block.png',   // Row 2 of 3 of stone
			'images/stone-block.png',   // Row 3 of 3 of stone
			'images/grass-block.png',   // Row 1 of 2 of grass
			'images/grass-block.png'    // Row 2 of 2 of grass
		];

	/* Loop through the number of rows and columns we've defined above
	 * and, using the rowImages array, draw the correct image for that
	 * portion of the "grid"
	 */
	for (var row = 0; row < this.rows; row++) {
		for (var col = 0; col < this.cols; col++) {
			/* The drawImage function of the canvas' context element
			 * requires 3 parameters: the image to draw, the x coordinate
			 * to start drawing and the y coordinate to start drawing.
			 * We're using our Resources helpers to refer to our images
			 * so that we get the benefits of caching these images, since
			 * we're using them over and over.
			 */
			this.ctx.drawImage(Resources.get(rowImages[row]), col * board.colWidth, row * board.rowHeight);
		}
	}

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

//Stuff that happens at the beginning of each game...
Enemy.prototype.init = function() {
	this.sprite.init();
}

//Stuff that happens each time you die (including at the beginning of the game).
Enemy.prototype.reset = function() {
	this.x = 0 - board.colWidth;
	this.row = this.startRow();
	this.y = this.row * board.rowHeight + board.enemyYOffset;
	this.speed = this.setSpeed();
	this.delay = this.setDelay();
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
			this.reset();
		}
	}
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    board.ctx.drawImage(Resources.get(this.sprite.url), this.x, this.y);
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
	this.sprite = new Sprite('images/char-boy.png');
}

//Stuff that happens at the beginning of each game...
Player.prototype.init = function() {
	this.lives = 3;
	this.score = 0;
	this.sprite.init();
}

//Stuff that happens each time you die (including at the beginning of the game).
Player.prototype.reset = function() {
	this.isDieing = false;
	this.dieingAngle = 0;
	this.deathSpiralTime = 3; //seconds to spiral before death
	this.row = board.playerStartRow;
	this.col = board.playerStartCol;
}

Player.prototype.checkEnemyCollision = function() {
	for (var enemyIndex in allEnemies) {
		var enemy = allEnemies[enemyIndex];
		var eMinX = enemy.x + enemy.sprite.extents.minx;
		var eMaxX = enemy.x + enemy.sprite.extents.maxx;
		var pMinX = this.col * board.colWidth + this.sprite.extents.minx;
		var pMaxX = this.col * board.colWidth + this.sprite.extents.maxx;
		if (this.row === enemy.row) {
			if ((eMinX <= pMinX && pMinX <= eMaxX) ||
				(eMinX <= pMaxX && pMaxX <= eMaxX)) {
				return true;
			}
		}
	}
	return false;
}

Player.prototype.doDeathSpiral = function(dt) {
	this.deathSpiralTime -= dt;
	if (this.deathSpiralTime <= 0) {
		//dead... start over.
		this.lives--;
		if (0 === this.lives) {
			theEngine.reset();
			this.init();
		} else {
			this.reset();
		}
	}
}

Player.prototype.checkTreasureCollision = function() {
	if (!treasure.isVisible) { return false;};
	return ((treasure.col === this.col) &&
		(treasure.row === this.row));
}

Player.prototype.update = function(dt) {
	//We're going to implement collisions here, because the only collisions that we care
	// about are collisions that involve the player... at least, for now.
	if (!this.isDieing) {
		if (this.checkEnemyCollision()) {
			this.isDieing = true;
		} else if (this.checkTreasureCollision()) {
			this.score++;
			treasure.lifetime = 0;
		}
	} else {
		//Dieing...
		this.doDeathSpiral(dt);
	}
}

//render - draw the player character. Currently, there are two ways to display the character.
//Either, the character is live and playing, or
//they are in a death spiral - dieing.
Player.prototype.render = function() {
	var x = this.col * board.colWidth;
	var y = this.row * board.rowHeight + board.playerYOffset;
	if (!this.isDieing) {
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y);
	} else {
		//Dieing... spin the character on each tick of the game clock.
		board.ctx.save();
		var spriteWidth = this.sprite.extents.maxx - this.sprite.extents.minx;
		var spriteHeight = this.sprite.extents.maxy - this.sprite.extents.miny;
		x += this.sprite.extents.minx + spriteWidth/2;
		y += this.sprite.extents.miny + spriteHeight/2;
		board.ctx.translate(x, y);
		board.ctx.rotate(this.dieingAngle);
		this.dieingAngle += Math.PI / 8;
		x = -(this.sprite.extents.minx + spriteWidth/2);
		y = -(this.sprite.extents.miny + spriteHeight/2);
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y);
		board.ctx.restore();
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
// Treasures our player must pick up
var Treasure = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for this treasure, this uses
    // a helper we've provided to easily load images
	this.sprite = new Sprite(this.pickGem());
}

//Stuff that happens at the beginning of each game...
Treasure.prototype.init = function() {
	this.sprite.init();
}

//Stuff that happens each time you die (including at the beginning of the game).
Treasure.prototype.reset = function() {
// console.log("treasure.reset");
	this.lifetime = this.setLifetime();
	this.delay = this.setDelay();
	this.isVisible = true;
	//Randomly drop the treasure on a square where the enemies might go...
	this.col = Math.floor(Math.random() * board.cols);
	this.row = Math.floor(Math.random() * (board.enemyRowMax - board.enemyRowMin)) + 1 + board.enemyRowMin;
	this.sprite.url = this.pickGem();
// console.log("treasure.reset("+this.row+","+this.col+")");
}


// Countdown the lifetime of the treasure until its time for it to disappear...
// Parameter: dt, a time delta between ticks
Treasure.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	if (this.isVisible) {
		this.lifetime -= dt;
		if (this.lifetime < 0) {
			this.isVisible = false;
		}
	} else { //Not visible... decrement delay
		this.delay -= dt;
		if (this.delay < 0) {
			this.reset();
		}
	}
}

// Draw the treasure on the screen, required method for game
Treasure.prototype.render = function() {
	if (this.isVisible) {
		var x = this.col * board.colWidth + board.treasureXOffset;
		var y = this.row * board.rowHeight + board.treasureYOffset;
		var img = Resources.get(this.sprite.url);
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y, img.width/2, img.height/2);
	}
}

Treasure.prototype.pickGem = function() {
	var whichGem = Math.floor(Math.random() * 3);
console.log("whichGem:"+whichGem);
	var url = 'images/Gem Orange.png'
	if (0 === whichGem) {
		url = 'images/Gem Blue.png';
	} else if (1 === whichGem) {
		url = 'images/Gem Green.png';
	}
	return url;
}

//Helper that calculates the lifetime of the treasure
// lifetime is a number of seconds that the treasure will be visible...
Treasure.prototype.setLifetime = function() {
	//ToDo: make this more "interesting"
	return Math.floor(Math.random() * 5) + 1; //For now, a random number of seconds - up to 5.
}

//Helper that sets the delay before this treasure shows up again.
// delay is in seconds.
//For now, it's simply a random number from 1 to 5
Treasure.prototype.setDelay = function() {
	return Math.floor(Math.random() * 5) + 1;
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
	var spriteCtx = eCanvas.getContext('2d');
	spriteCtx.drawImage(img, 0, 0);
	var imgData = spriteCtx.getImageData(0,0,img.width,img.height);
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

//Stuff that happens at the beginning of each game...
StatusBar.prototype.init = function() {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.width = board.canvas.width;
    this.canvas.height = 70;
    document.body.appendChild(this.canvas);
	this.heartSprite.init();
}

//Stuff that happens each time you die (including at the beginning of the game).
StatusBar.prototype.reset = function() {
	//Currently - nothing happens when the player dies... it's all automatic.
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

//Stuff that happens at the beginning of each game...
Settings.prototype.init = function() {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

	//Make this the same size as the board, so that it looks good when
	//we replace the board with it. This gives us too much real-estate,
	//but the intent is to later have more settings to manage, like
	//sound volumes, difficulty levels, etc...
	this.canvas.width = board.canvasWidth;
	this.canvas.height = board.canvasHeight;

	this.curCharIndex = 0;
	for (var charIndex = 0; charIndex < this.chars.length; charIndex++) {
		if (player.sprite.url === this.chars[charIndex]) {
			this.curCharIndex = charIndex;
		}
	}
}

//Stuff that happens each time you die (including at the beginning of the game).
Settings.prototype.reset = function() {
	//Currently - nothing happens when the player dies... it's all automatic.
}
Settings.prototype.render = function() {
	this.ctx.fillStyle = "yellow";
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.strokeStyle = "green";
	this.ctx.strokeWidth = 5;
	this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
	//draw char sprite...
	var img = Resources.get(this.chars[this.curCharIndex]);
	this.ctx.drawImage(img, 10, 10);
	//Draw Instructions.
	//Prepare to draw text:
	this.ctx.font = "20pt Impact";
	this.ctx.textAlign="left";
	this.ctx.fillStyle = "black";
	this.ctx.lineWidth = "1";
	//draw text: left or right to select...
	this.ctx.fillText("left and right arrows to select", 10 + img.width + 10, 100);
	//draw text: esc to cancel, enter to accept...
	this.ctx.fillText("Enter to accept, ESC to cancel", 10 + img.width + 10, 125);
}

Settings.prototype.show = function() {
	if (this.isVisible) { return; };
	board.hide();

	if (undefined === statusBar.canvas) {
		document.body.appendChild(this.canvas);
	} else {
		document.body.insertBefore(this.canvas, statusBar.canvas);
	}
	theEngine.pause();

	this.isVisible = true;
}

Settings.prototype.hide = function() {
	if (!this.isVisible) { return; };
	document.body.removeChild(this.canvas);
	board.show();
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
var treasure = new Treasure();
var player = new Player();
var board = new Board();
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
