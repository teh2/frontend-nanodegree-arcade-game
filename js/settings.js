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
	this.canvas.width = board.CANVAS_WIDTH;
	this.canvas.height = board.CANVAS_HEIGHT;
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


