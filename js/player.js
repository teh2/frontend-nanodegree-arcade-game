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

var Player = function () {
	//Currently our game always starts with the player using the image of the
	//little boy. The user can change their character image using the settings
	//dialog.
	this.sprite = new Sprite('images/char-boy.png');
};

/*
* Player.init - handles stuff that happens at the beginning of each game.
* Currently, you start with three lives and no score.
*/
Player.prototype.init = function () {
	this.lives = 3;
	this.score = 0;
	this.sprite.init();
};

/*
* Player.reset - implements everything that happens whenever the player needs
* to be regenerated - when they die, and also when they are first created.
*/
Player.prototype.reset = function () {
	this.isDieing = false; //When set, the player will go into their "death dance"
	this.dieingAngle = 0; //Player's spin around in a circle while 'dieing'.
	this.deathSpiralTime = 3; //seconds to spiral before death
	this.row = board.PLAYER_START_ROW; //where the player starts out
	this.col = board.PLAYER_START_COL;
};

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
Player.prototype.checkEnemyCollision = function () {
	var enemyIndex = 0,
		enemy,
		eMinX,
		eMaxX,
		pMinX,
		pMaxX;

	//Loop through each enemy
	for (enemyIndex = 0; enemyIndex < allEnemies.length; allEnemies++) {
		enemy = allEnemies[enemyIndex];
		//Check to see if player and enemy are even in the same row
		if (this.row === enemy.row) {
			//Calculate where the enemy is (left to right)
			eMinX = enemy.x + enemy.sprite.extents.minx;
			eMaxX = enemy.x + enemy.sprite.extents.maxx;
			//Calculate where the player is (left to right)
			pMinX = this.col * board.COL_WIDTH + this.sprite.extents.minx;
			pMaxX = this.col * board.COL_WIDTH + this.sprite.extents.maxx;
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
};

/*
* Player.doDeathSpiral - helper that handles updating the player attributes
* if the player is in the process of dieing. In short: continue the spinning,
* check to see if there's been enough spinning, if it's time, die, and regenerate.
*/
Player.prototype.doDeathSpiral = function (dt) {
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
};

/*
* Player.checkTreasureCollision - did the player manage to hop into the same
* square as the currently visible gem stone?
*/
Player.prototype.checkTreasureCollision = function () {
	if (!treasure.isVisible) { return false; }; //Can't pick it up if you can't see it!
	return ((treasure.col === this.col) &&
		(treasure.row === this.row));
};

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
Player.prototype.update = function (dt) {
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
};

/*
* Player.render - draw the player character. Currently, there are two ways to
* display the character: Either, the character is live and playing, or they are
* in a death spiral - dieing.
*/
Player.prototype.render = function () {
	//First, convert player position from rows and columns to pixels:
	var x = this.col * board.COL_WIDTH,
		y = this.row * board.ROW_HEIGHT + board.PLAYER_Y_OFFSET,
		spriteWidth,
		wpriteHeight;

	if (!this.isDieing) {
		//Normal case - drop the player on the board:
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y);
	} else {
		//Dieing... spin the character on each tick of the game clock.
		//First things first, save the state of the context:
		board.ctx.save();
		//We want to spin the character around their center, so we need to find it:
		spriteWidth = this.sprite.extents.maxx - this.sprite.extents.minx;
		spriteHeight = this.sprite.extents.maxy - this.sprite.extents.miny;
		x += this.sprite.extents.minx + spriteWidth / 2;
		y += this.sprite.extents.miny + spriteHeight / 2;
		//Move the context origin to the center of the character:
		board.ctx.translate(x, y);
		//rotate the context to the next angle that we want to display the character:
		board.ctx.rotate(this.dieingAngle);
		//increment the angle for next time:
		this.dieingAngle += Math.PI / 8;
		//Now that the context is all twisted, drop the character image on it:
		x = -(this.sprite.extents.minx + spriteWidth / 2);
		y = -(this.sprite.extents.miny + spriteHeight / 2);
		board.ctx.drawImage(Resources.get(this.sprite.url), x, y);
		//Put the context back the way we found it so as not to mess up further drawing:
		board.ctx.restore();
	}
};

/*
* Player.stillOnBoard - is a helper that checks whether or not the given board
* coordinates are within the bounds of the board (as defined in the board constants)
* or not. Return - true if still on the board, false - if not.
*
* We need to keep the player from wandering off the board, right?
*/
Player.prototype.stillOnBoard = function (col, row) {
	return (((0 <= col) && (0 <= row)) && ((col <= board.COLS - 1) && (row <= board.ROWS - 1)));
};

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
Player.prototype.handleInput = function (keyCode) {
    var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
		},
		key = allowedKeys[keyCode],
		newRow,
		newCol;

	//If we get sent something we're not equipped to handle, then return right away.
	if (undefined === key) { return false; };

	// The player can't move while dieing...
	if (this.isDieing) {
		return true;
	};
	//We're not dieing, let's see which way the player wants to move...
	//First, we need a place to hold the new location:
	newRow = this.row;
	newCol = this.col;
	//Change the new location appropriately:
	if ('left' === key) { newCol--; }
	else if ('right' === key) { newCol++; }
	else if ('up' === key) { newRow--; }
	else if ('down' === key) { newRow++; }
	else { return false; } //Double check for invalid key (shouldn't ever get here).

	//Make sure this movement wouldn't take us off the board:
	if (this.stillOnBoard(newCol, newRow)) {
		this.col = newCol; //Success! Move the player to the new location.
		this.row = newRow;
	} else {
		console.log("Bump!"); //Ouch, we hit our head on the edge of the board!
	}
	return true;
};

