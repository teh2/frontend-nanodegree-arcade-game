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

