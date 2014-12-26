
/******************************************************************************
* Board class - implements the main game board and holds all relevant game
*		constants.
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
	this.playerStartRow = 5; //Always start the player in the bottom row
	this.playerStartCol = 2; //In the middle column
	this.playerYOffset = -10; //fudge factor to push player to middle of block
	this.enemyRowMin = 1;
	this.enemyRowMax = 3;
	this.enemyYOffset = -21; //Fudge factor to push enemy to middle of lane (in pixels)
	this.treasureXOffset = 25; //Fudge factor to push the treasure into the square.
	this.treasureYOffset = 35; //Fudge factor to push the treasure into the square.
	
	//Now, some things that are intended as changeable object attributes...
	this.isVisible = false;

}

/*
* Board.init - create a local canvas and context for drawing the game board.
*/
Board.prototype.init = function() {
	this.canvas = document.createElement('canvas'),
	this.ctx = this.canvas.getContext('2d'),

	this.canvas.width = this.canvasWidth;
	this.canvas.height = this.canvasHeight;
	this.show();
}

/*
* Board.show - make the game board visible on the page by splicing it
* in to the document. There is one trick here. The first time the board is
* diplayed, there is no existing statusBar, so the board is merely appended
* to the document body. But later on, after displaying the settings screen,
* the board needs to be spliced in above the statusBar.
*/
Board.prototype.show = function() {
	if (this.isVisible) { return; };
	if (undefined === statusBar.canvas) {
		document.body.appendChild(this.canvas);
	} else {
		document.body.insertBefore(this.canvas, statusBar.canvas);
	}
	this.isVisible = true;
}

/*
* Board.hide - when the user calls for the settings dialog, the board dialog
* disappears and the settings dialog shows up in its place. Don't destroy the
* board, because we'll want to show it again later, in the same state as when
* it went invisible.
*/
Board.prototype.hide = function() {
	if (!this.isVisible) { return; };
	document.body.removeChild(this.canvas);
	this.isVisible = false;
}

/*
* Board.update - Currently we don't take any action on the board itself
* on game update "ticks", but we could. For example, we could make the tide
* come in, and the water could slowly cover up the roadway. That behavior
* would happen here.
*
* Note: remember that the 'dt' parameter is a machine relative 'delta time'
* value. This function will be called many times, and you probably want to
* only change the board very infrequently.
*/
Board.prototype.update = function(dt) {
}

/*
* Board.render - draw the game board. In this case, we're filling in the squares
* of the board with one of several terrain types - water, road, or grass.
*/
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
* Enemy class - Implement all of the behavior of the 'bad guys'. In this case,
* the bad guys are bugs that scurry down the road and kill any player that they
* might come in contact with. The killing, of course, is from the player's point
* of view, the bug just keeps scurrying along. So, look for collision code over
* in the player class rather than here.
*
* This class only deals with a single bug. In order to have multiple bugs, you
* will want to create multiple instances of Enemy.
******************************************************************************/
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = new Sprite('images/enemy-bug.png');
}

/*
* Enemy.init - handles stuff that happens at the beginning of each game (IE:
* immediately upon enemy object creation. In this case, we load up the bug image.
* For everything else related to "building a better bug", see the reset function.
*/
Enemy.prototype.init = function() {
	this.sprite.init();
}

/* Enemy.reset - implements everything that happens when the bug is done doing
* what bugs do - scurrying from one side of the screen to the other. We prepare
* this bug to do its thing again - move it back to the left side of the screen,
* assign it a lane for its next run, and set its speed and delay times.
*/
Enemy.prototype.reset = function() {
	this.x = 0 - board.colWidth;
	this.row = this.startRow();
	this.y = this.row * board.rowHeight + board.enemyYOffset;
	this.speed = this.setSpeed();
	this.delay = this.setDelay();
}


/* Enemy.update - On each tick of the game clock, move the bug just a little bit
* across the screen. We hope that the "ticks" are small enough that the bug's
* movement at each interval is small enough that it looks like the bug is crawling
* smoothly across the screen.
*
* Note: the 'dt' is the time between ticks, this is used in the calculations to
* tell how far across the screen the bug should move - some computers are faster
* than others and will call this function more often; in which case, we should move
* the bug less each time we get here.
*/
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	if (0 < this.delay) {
		// At first, this bug is not yet moving. Count down to when it will take off.
		this.delay -= dt;
	} else {
		this.x = this.x + this.speed * dt;
		if ((board.cols * board.colWidth) < this.x) {
			//Hey! We made it all the way across the board... let's start again...
			this.reset();
		}
	}
}

/*
* Enemy.render - Bugs are pretty simple to paint, just grab their image file, and
* slap it on top of the board at the current location calculated by the update
* function.
*/
Enemy.prototype.render = function() {
    board.ctx.drawImage(Resources.get(this.sprite.url), this.x, this.y);
}

/*
* Enemy.setSpeed - return a number of pixels per second - the speed at which the
* bug will appear to crawl across the screen. Currently, this is a pretty sedate
* one board column width per second.
*
* Future enhancments could vary the bug's speed on subsequent runs, just to make
* the game more challenging.
*/
Enemy.prototype.setSpeed = function() {
	//ToDo: make this more "interesting"
	return board.colWidth; //For now, move a constant column's width per second
}

/*
* Enemy.setDelay - return a number of seconds that this bug will hide off screen
* before taking another run across the screen. Currently, this is a random number
* between one and five seconds.
*
* Future enhancements might tune this up to make the game more or less challenging.
*/
Enemy.prototype.setDelay = function() {
	return Math.floor(Math.random() * 5) + 1;
}

/* Enemy.startRow - Helper that returns a random starting row within the bounds set
* by board.enemyRowMin and board.enemyRowMax constants (IE: put the enemy in the
* starting gate at the edge of his lane).
*/
Enemy.prototype.startRow = function() {
	var enemyRows = board.enemyRowMax - board.enemyRowMin + 1;
	var enemyRow = Math.floor((Math.random() * enemyRows) + board.enemyRowMin);
	return enemyRow;
}

/******************************************************************************
* Player class - Implement all of the behavior of the player.  In this case, the
* player is a little boy or girl who hops from square to square looking for gems
* and avoiding bugs. Part of the player's behavior is driven by the engine and
* part of it is driven by direct input from the user.
*
* In the current game implementation, there is only one player. However, there is
* no reason that this game couldn't be expanded to include an array of player
* characters all working together to outsmart the evil bugs.
******************************************************************************/

var Player = function() {
	//Currently our game always starts with the player using the image of the
	//little boy. The user can change their character image using the settings
	//dialog.
	this.sprite = new Sprite('images/char-boy.png');
}

/*
* Player.init - handles stuff that happens at the beginning of each game.
* Currently, you start with three lives and no score.
*/
Player.prototype.init = function() {
	this.lives = 3;
	this.score = 0;
	this.sprite.init();
}

/*
* Player.reset - implements everything that happens whenever the player needs
* to be regenerated - when they die, and also when they are first created.
*/
Player.prototype.reset = function() {
	this.isDieing = false; //When set, the player will go into their "death dance"
	this.dieingAngle = 0; //Player's spin around in a circle while 'dieing'.
	this.deathSpiralTime = 3; //seconds to spiral before death
	this.row = board.playerStartRow; //where the player starts out
	this.col = board.playerStartCol;
}

/*
* Player.checkEnemyCollision - Has the player been touched by a bug?
*
* This code is fairly complex because of the differences in the nature of bug
* movement as compared to player movement and quirks in both of their images.
* Bugs move smoothly across the screen while characters hop from square to
* square all at once. In addition, while the raw images of the bugs and characters
* are rectangular, the visible part of the images is not quite as wide as the
* image rectangle. So, this code uses the visible extent of the bug/player image
* rather than the full size of the image file when calculating collisions. One
* final quirk of bugs (they stay in their lanes as they scurry across the screen)
* makes the row collision calculation much simpler than the column calculation.
*/
Player.prototype.checkEnemyCollision = function() {
	//Loop through each enemy
	for (var enemyIndex in allEnemies) {
		var enemy = allEnemies[enemyIndex];
		//Check to see if player and enemy are even in the same row
		if (this.row === enemy.row) {
			//Calculate where the enemy is (left to right)
			var eMinX = enemy.x + enemy.sprite.extents.minx;
			var eMaxX = enemy.x + enemy.sprite.extents.maxx;
			//Calculate where the player is (left to right)
			var pMinX = this.col * board.colWidth + this.sprite.extents.minx;
			var pMaxX = this.col * board.colWidth + this.sprite.extents.maxx;
			//Now, check to see if they overlap (from left to right)
			if ((eMinX <= pMinX && pMinX <= eMaxX) ||
				(eMinX <= pMaxX && pMaxX <= eMaxX)) {
				//If there is overlap, then they've collided
				return true;
			}
		}
	}
	//If none of the bugs overlap with the player, then there's no collision!
	return false;
}

/*
* Player.doDeathSpiral - helper that handles updating the player attributes
* if the player is in the process of dieing. In short: continue the spinning,
* check to see if there's been enough spinning, if it's time, die, and regenerate.
*/
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

/*
* Player.checkTreasureCollision - did the player manage to hop into the same
* square as the currently visible gem stone?
*/
Player.prototype.checkTreasureCollision = function() {
	if (!treasure.isVisible) { return false;}; //Can't pick it up if you can't see it!
	return ((treasure.col === this.col) &&
		(treasure.row === this.row));
}

/*
* Player.update - perform all necessary calculations for a single tick of the game
* clock. In this case, if we're not dieing, check for collisions and take appropriate
* actions. If we are dieing, continue our "death dance".
*
* Note: in the current design of the game, this is the best place to check collisions
* because the only collisions we care about are when the player collides with
* something. If we decided to have interactions between the bugs and the gems,
* then we'd need to implement those collisions elsewhere.
*/
Player.prototype.update = function(dt) {
	if (!this.isDieing) {
		if (this.checkEnemyCollision()) {
			this.isDieing = true;
		} else if (this.checkTreasureCollision()) {
			this.score++;
			//Stop the player from picking up the same gem more than once:
			treasure.lifetime = 0;
		}
	} else {
		//Dieing...
		this.doDeathSpiral(dt);
	}
}

/*
* Player.render - draw the player character. Currently, there are two ways to
* display the character: Either, the character is live and playing, or they are
* in a death spiral - dieing.
*/
Player.prototype.render = function() {
	//First, convert player position from rows and columns to pixels:
	var x = this.col * board.colWidth;
	var y = this.row * board.rowHeight + board.playerYOffset;
	if (!this.isDieing) {
		//Normal case - drop the player on the board:
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y);
	} else {
		//Dieing... spin the character on each tick of the game clock.
		//First things first, save the state of the context:
		board.ctx.save();
		//We want to spin the character around their center, so we need to find it:
		var spriteWidth = this.sprite.extents.maxx - this.sprite.extents.minx;
		var spriteHeight = this.sprite.extents.maxy - this.sprite.extents.miny;
		x += this.sprite.extents.minx + spriteWidth/2;
		y += this.sprite.extents.miny + spriteHeight/2;
		//Move the context origin to the center of the character:
		board.ctx.translate(x, y);
		//rotate the context to the next angle that we want to display the character:
		board.ctx.rotate(this.dieingAngle);
		//increment the angle for next time:
		this.dieingAngle += Math.PI / 8;
		//Now that the context is all twisted, drop the character image on it:
		x = -(this.sprite.extents.minx + spriteWidth/2);
		y = -(this.sprite.extents.miny + spriteHeight/2);
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y);
		//Put the context back the way we found it so as not to mess up further drawing:
		board.ctx.restore();
	}
}

/*
* Player.stillOnBoard - is a helper that checks whether or not the given board
* coordinates are within the bounds of the board (as defined in the board constants)
* or not. Return - true if still on the board, false - if not.
*
* We need to keep the player from wandering off the board, right?
*/
Player.prototype.stillOnBoard = function(col, row) {
	return (((0 <= col) && (0 <= row)) && ((col <= board.cols - 1) && (row <= board.rows - 1)))
}

/*
* Player.handleInput - move the character around using the keyboard cursor keys.
*
* this is completely different from the way the bugs move around, because the
* player is under the control of the user and should not move until the user says
* to move!
*
* Note that this function is called as part of a chain of input handlers. It needs
* to return an indication of whether or not it has handled the current input so
* that the next handler in the chain can either be called, or not depending...
*/
Player.prototype.handleInput = function(keyCode) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
	var key = allowedKeys[keyCode];
	//If we get sent something we're not equipped to handle, then return right away.
	if (undefined === key) { return false;};
	
	// The player can't move while dieing...
	if (this.isDieing) {
		return true;
	};
	//We're not dieing, let's see which way the player wants to move...
	//First, we need a place to hold the new location:
	var newRow = this.row;
	var newCol = this.col;
	//Change the new location appropriately:
	if ('left' === key) { newCol--;}
	else if ('right' === key) { newCol++;}
	else if ('up' === key) { newRow--;}
	else if ('down' === key) { newRow++;}
	else { return false;} //Double check for invalid key (shouldn't ever get here).

	//Make sure this movement wouldn't take us off the board:
	if (this.stillOnBoard(newCol,newRow)) {
		this.col = newCol; //Success! Move the player to the new location.
		this.row = newRow;
	} else {
		console.log("Bump!"); //Ouch, we hit our head on the edge of the board!
	}
	return true;
}

/******************************************************************************
* Treasure class - Implement all of the behavior associated with the gem stones.
* Basically, gem stones pop up in random locations on the board, stay there for
* a little while, and then go away. Once they've gone away, there's a delay before
* they will pop up again.
*
* Clearly, they must be valuable, and our player needs to grab as many of them
* as possible, without getting run over by a bug in the process.
******************************************************************************/

var Treasure = function() {
	//Grab the image of the gem:
	this.sprite = new Sprite(this.pickGem());
}

/*
* Treasure.init - handle stuff that needs doing whenever a gem is first generated.
* In this case, flesh out our sprite object so that we can use it later.
*/
Treasure.prototype.init = function() {
	this.sprite.init();
}

/*
* Treasure.reset - implement everything that happens whenever a gem is ready to
* be made available on the board.
*/
//Stuff that happens each time you die (including at the beginning of the game).
Treasure.prototype.reset = function() {
	this.lifetime = this.setLifetime(); //How long will it stay on the board?
	this.delay = this.setDelay(); //When it goes away, how long before it will appear again?
	this.isVisible = true; // Start out visible
	//Randomly drop the treasure on a square where the enemies might go... we don't
	// want to create any "free" gems on safety squares.
	this.col = Math.floor(Math.random() * board.cols);
	this.row = Math.floor(Math.random() * (board.enemyRowMax - board.enemyRowMin)) + 1 + board.enemyRowMin;
	this.sprite.url = this.pickGem(); //Pick a random gem color
}


/*
* Treasure.update - implement gem behavior for each tick of the game clock.
*
* In this case, countdown the lifetime of the treasure until its time for it to
* disappear...
*
* Note: the dt parameter is a delta time between calls to the update function. Use
* it to keep track of the remaining lifetime of the gem, or the delay until it is
* made visible again.
*/
Treasure.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	if (this.isVisible) { //Visible, decrement the remaining lifetime...
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

/*
*  Treasure.render - Draw the treasure on the screen.
*/
Treasure.prototype.render = function() {
	if (this.isVisible) {
		//convert from row/column to pixels:
		var x = this.col * board.colWidth + board.treasureXOffset;
		var y = this.row * board.rowHeight + board.treasureYOffset;
		var img = Resources.get(this.sprite.url);
		//The original gem image is too big to fit in a board square, shrink it by half:
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y, img.width/2, img.height/2);
	}
}

/*
* Treasure.pickGem - pick a random gem image so that the different colors all show up
*/
Treasure.prototype.pickGem = function() {
	var whichGem = Math.floor(Math.random() * 3);
	var url = 'images/Gem Orange.png'
	if (0 === whichGem) {
		url = 'images/Gem Blue.png';
	} else if (1 === whichGem) {
		url = 'images/Gem Green.png';
	}
	return url;
}

/*
* Treasure.setLifetime - calculate the lifetime of the treasure. Lifetime is a
* number of seconds that the treasure will be visible...
*/
Treasure.prototype.setLifetime = function() {
	//ToDo: make this more "interesting"
	return Math.floor(Math.random() * 5) + 1; //For now, a random number of seconds - up to 5.
}

/*
* Treasure.setDelay - Set the delay before this treasure shows up again. delay
* is in seconds.
*/
Treasure.prototype.setDelay = function() {
	//ToDo: make this more "interesting"
	return Math.floor(Math.random() * 5) + 1; //For now, it's simply a random number from 1 to 5
}

/******************************************************************************
* Sprite class - Implement behavior required by sprite images. Currently, we hold
* a pointer to our image in the Resources cache. And we calculate the visible
* boundaries of the image, not counting the transparent parts (used for collision
* detection).
*
* It turns out that in the context of the current game, the visible extents are
* probably not, strictly speaking, necessary, because row and column comparison
* would probably have been "good enough", but this method is more accurate, and
* turned out to be an interesting learning experience.
******************************************************************************/
var Sprite = function(url) {
	this.url = url;
	// Pre-initalize the extents to be "backwards", so that we have a min/max
	//value to compare against later when calculating the extent.
	this.extents = {
		"minx":9999,
		"miny":9999,
		"maxx":0,
		"maxy":0};
}
/*
* Sprite.init - handle stuff that needs doing when the Sprite is first created.
* IE: we only need to calculate the visible extents once. They don't change.
*/
Sprite.prototype.init = function() {
	this.setVisibleExtents();
}

/*
* Sprite.setVisibleExtents - calculate the part of the image data that is acutally
* visible, and store both the minimums and maximums for both x and y. This is done
* by creating a hidden canvas/context, throwing the image on it, pulling the image
* data from the hidden canvas, iterating through the image data, look at the alpha
* channel of each pixel, and save the smallest and largest x and y number.
*/
Sprite.prototype.setVisibleExtents = function() {
	//Grab the pixels:
	var img = Resources.get(this.url);
	var eCanvas = document.createElement('canvas');
	var spriteCtx = eCanvas.getContext('2d');
	spriteCtx.drawImage(img, 0, 0);
	var imgData = spriteCtx.getImageData(0,0,img.width,img.height);
	//start out with min's as big as possible:
	var minx = img.width - 1;
	var miny = img.height - 1;
	//and max's as small as possible:
	var maxx = 0;
	var maxy = 0;

	//Loop through every pixel,
	var pixelData = imgData.data;
	for (var y = 0; y < img.height; y++) {
		for (var x = 0; x < img.width; x++) {
			//The fourth byte of the pixel is the alpha channel, is it greater than zero?
			if (0 < pixelData[(x * 4) + (y * 4 * img.width) + 3]) {
				//visible pixel, adjust the extents if necessary:
				if (x < minx) {minx = x;};
				if (y < miny) {miny = y;};
				if (maxx < x) {maxx = x;};
				if (maxy < y) {maxy = y;};
			}
		}
	};
	//Store the extents for later:
	this.extents.minx = minx;
	this.extents.miny = miny;
	this.extents.maxx = maxx;
	this.extents.maxy = maxy;
}

/******************************************************************************
* StatusBar class - is a separate canvas that appears below the game board and
* displays statistics about the current game state - how many lives you have left
* and how much score you've racked up.
*
* It behaves much like any other entity in the game - it gets rendered at every
* tick of the game clock.
******************************************************************************/

var StatusBar = function() {
	// We need a heart image to represent remaining lives:
	this.heartSprite = new Sprite('images/Heart.png');
}

/*
* StatusBar.init - Stuff that happens at the beginning of each game...
* Because the status bar is independent of the actual game board, we need to
* create its' canvas here and put it into the document so the user can see it.
*/
StatusBar.prototype.init = function() {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.width = board.canvas.width;
    this.canvas.height = 70;
    document.body.appendChild(this.canvas);
	this.heartSprite.init();
}

/*
* StatusBar.reset - Implement stuff that happens every time the player dies.
* In this case, the StatusBar doesn't actually care, because all state is held
* in the player instead of here, so there isn't anything specific to do at reset.
* This function is just here for future enhancement purposes, when the StatusBar
* has state of its own...
*/
StatusBar.prototype.reset = function() {
}

/*
* StatusBar.update - Implement state changes that happen on a tick of the game
* clock. In this case, the StatusBar doesn't really care, because it has no
* "state" of its' own. In the future, the StatusBar might need to have its' own
* state information, and that would get updated here.
*/
StatusBar.prototype.update = function() {
}

/*
* StatusBar.render - draw the status bar. outline it, give it a background. Then,
* pull info from the player object and render that information in helper methods.
*
* In short, draw hearts on the left, and numbers on the right...
*/
StatusBar.prototype.render = function() {
	this.ctx.fillStyle = "lime";
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.strokeStyle = "green";
	this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
	//Helpers to render player state:
	this.renderLives();
	this.renderScore();
}

/*
* StatusBar.renderLives - grab the number of lives remaining from the player and
* draw a heart for each one. Note that this algorithm is set up to draw seven
* hearts on a row, and then drop down and draw some more. If the player can
* somehow rack up more than 14 lives, then the excesss will be drawn below the
* bottom of the status bar, and will be invisible...
*/
StatusBar.prototype.renderLives = function() {
	//The source coordinates are consistent, pulling the same pixels from the
	//original image every time:
	var sx = this.heartSprite.extents.minx;
	var sy = this.heartSprite.extents.miny;
	var sw = this.heartSprite.extents.maxx - this.heartSprite.extents.minx;
	var sh = this.heartSprite.extents.maxy - this.heartSprite.extents.miny;
	// for each life...
	for (var life = 0; life < player.lives; life++) {
		//calculate where the heart should end up on the status bar:
		var dx = 5 + ((life % 7) * (this.heartSprite.extents.maxx - this.heartSprite.extents.minx + 5)) / 3;
		var dy = 5
				+ (Math.floor(life/7) * (this.heartSprite.extents.maxy - this.heartSprite.extents.miny + 5))/3;
		var dw = (this.heartSprite.extents.maxx - this.heartSprite.extents.minx) / 3;
		var dh = (this.heartSprite.extents.maxy - this.heartSprite.extents.miny) / 3;
		//copy the source heart to the destination location:
		this.ctx.drawImage(Resources.get(this.heartSprite.url), sx, sy, sw, sh, dx, dy, dw, dh);
	};
}

/*
* StatusBar.renderScore - grab the player's score, draw it on the StatusBar, on
* the right, with an outline.
*/
StatusBar.prototype.renderScore = function() {
	this.ctx.font = "50pt Impact";
	this.ctx.textAlign="right";
	this.ctx.strokeStyle = "red";
	this.ctx.fillStyle = "DarkOrange";
	this.ctx.lineWidth = "3";
	this.ctx.fillText(player.score, this.canvas.width - 5, this.canvas.height - 5);
	this.ctx.strokeText(player.score, this.canvas.width - 5, this.canvas.height - 5);
}
/******************************************************************************
* Settings class - Implement a dialog box that pops up in place of the game board
* and allows the user to choose the image of their player character.
*
* Future enhancements will bring more functionality to this dialog - difficulty
* levels, background music selector, volume controls for background music and
* sound effects, etc...
******************************************************************************/
var Settings = function() {
	this.isVisible = false; //Toggle to keep track of whether or not the dialog is currently visible.
	this.paused = false; //Toggle to keep track of whether or not we're currently paused.
	this.chars = [ //List of character images to choose from
		'images/char-boy.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png'
		];
	this.init();
}

/*
* Settings.init - Stuff that happens at the beginning of each game...
* Because the Settings dialog is a separate canvas from the actual game board,
* we need to create its' canvas here, but we don't immediately put it into the
* document because we don't want the user to see it until they ask for it.
*/
Settings.prototype.init = function() {

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

	//Make this the same size as the board, so that it looks good when
	//we replace the board with it. This gives us too much real-estate,
	//but the intent is to later have more settings to manage, like
	//sound volumes, difficulty levels, etc...
	this.canvas.width = board.canvasWidth;
	this.canvas.height = board.canvasHeight;
	// Figure out which char image the player is currently using, so that we
	// can display the correct image when the dialog pops up.
	this.curCharIndex = 0;
	for (var charIndex = 0; charIndex < this.chars.length; charIndex++) {
		if (player.sprite.url === this.chars[charIndex]) {
			this.curCharIndex = charIndex;
		}
	}
}

/*
* Settings.reset - Implement behavior associated with each player death. In this
* case, there isn't anything to do for the settings when the player dies, so
* this function is for consistency and future enhancements.
*/
Settings.prototype.reset = function() {
}

/*
* Settings.render - draw the contents of the dialog. Currently, there is an image
* of the currently chosen player character image, and some text instructions that
* describe how to change it.
*/
Settings.prototype.render = function() {
	//Draw the outline and background of the dialog:
	this.ctx.fillStyle = "yellow";
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.strokeStyle = "green";
	this.ctx.strokeWidth = 5;
	this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
	//draw the currently chosen character sprite...
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

/*
* Settings.show - This helper gets called when the user asks for the settings dialog.
* There is one trick here. The first time the dialog is
* diplayed, there may not be an existing statusBar. If so the dialog is merely
* appended to the document body. But later on, the board needs to be spliced in
* above the statusBar. Currently, this isn't a problem, but in the future, the
* settings dialog might get used as a "game intro" screen, and then this would be
* a problem.
*/
Settings.prototype.show = function() {
	//It's a toggle function, so if we're already shown, hide us.
	if (this.isVisible) { return; };
	//While we're looking at the settings, we need to hide the board:
	board.hide();
	//Here's the placement trick mentioned above:
	if (undefined === statusBar.canvas) {
		document.body.appendChild(this.canvas);
	} else {
		document.body.insertBefore(this.canvas, statusBar.canvas);
	}
	//Stop the engine so the bugs won't run rampant while we aren't looking:
	theEngine.pause();

	this.isVisible = true;
}

/*
* Settings.hide - This helper hides the settings dialog when the user is done
* with it.
*/
Settings.prototype.hide = function() {
	//If we're not visible, there's nothing to do.
	if (!this.isVisible) { return; };
	//Pull us out of the document:
	document.body.removeChild(this.canvas);
	//Put the board back into the document:
	board.show();
	//turn the bugs loose!
	theEngine.unpause();
	this.isVisible = false;
}

/*
* Settings.handleInput - Take in input to allow the user to modify the game
* settings. In addition, this is currently a good place to handle "global" game
* commands like pause and unpause. If there are more global commands in the future,
* they may need to be split out into their own class. The user drives this
* interaction rather than the engine.
*
* Note that this function is called as part of a chain of input handlers. It needs
* to return an indication of whether or not it has handled the current input so
* that the next handler in the chain can either be called, or not depending...
*/

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
	if (undefined === theKey) { return false;}; //If it's not valid input, ignore it

	if ('pause' === theKey) { //This implements the global pause toggle
		if (this.paused) {
			theEngine.unpause();
			this.paused = false;
		} else {
			theEngine.pause();
			this.paused = true;
		}
		return true;
	} else if ('settings' === theKey) { //This global command displays the Settings
		if (!this.isVisible) {
			this.render();
			this.show();
		} else {
			this.hide();
		}
		return true;
	};
	//If we're not visible, we can't handle anything else
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
		//Hide settings and restore the board and status... without saving changes.
		this.hide();
		return true;
	} else if ('enter' === theKey) {
		//Hide settings and restore the board and status... while saving changes.
		//Change player's sprite.
		player.sprite.url = this.chars[this.curCharIndex];
		this.hide();
		return true;
	}
	return false;
}


/******************************************************************************
* App - global logic. Build all of the entities used in the LadyBugger app.
* Wire up the user input event listener.
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
var statusBar = new StatusBar();
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

