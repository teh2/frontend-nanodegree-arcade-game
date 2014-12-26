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
	this.col = Math.floor(Math.random() * board.COLS);
	this.row = Math.floor(Math.random() * (board.ENEMY_ROW_MAX - board.ENEMY_ROW_MIN)) + 1 + board.ENEMY_ROW_MIN;
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
		var x = this.col * board.COL_WIDTH + board.TREASURE_X_OFFSET;
		var y = this.row * board.ROW_HEIGHT + board.TREASURE_Y_OFFSET;
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

