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
