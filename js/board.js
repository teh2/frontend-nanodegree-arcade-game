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

