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

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	this.init();
}

Enemy.prototype.init = function() {
	this.x = 0 - board.colWidth;
	this.y = this.startRow() * board.rowHeight + board.enemyYOffset;
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
			this.init();
		}
	}
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
console.log("renderEnemy("+this.x+","+this.y+")");
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
console.log("enemyRow:"+enemyRow);
	return enemyRow;
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
	this.sprite = 'images/char-boy.png';
	this.row = board.playerStartRow;
	this.col = board.playerStartCol;
}

Player.prototype.update = function() {
	//ToDo
}

Player.prototype.render = function() {
	//ToDo
	ctx.drawImage(Resources.get(this.sprite), this.col * board.colWidth, this.row * board.rowHeight + board.playerYOffset);
}

Player.prototype.stillOnBoard = function(col, row) {
	return (((0 <= col) && (0 <= row)) && ((col <= board.cols - 1) && (row <= board.rows - 1)))
}

Player.prototype.handleInput = function(key) {
	//ToDo
	var newRow = this.row;
	var newCol = this.col;
	if ('left' === key) {
		newCol--;
	} else if ('right' === key) {
		newCol++;
	} else if ('up' === key) {
		newRow--;
	} else if ('down' === key) {
		newRow++;
	} else {
		console.log("got an invalid key press: " + key);
	}
	if (this.stillOnBoard(newCol,newRow)) {
		this.col = newCol;
		this.row = newRow;
	} else {
		console.log("Bump!");
	}
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var enemyIndex = 0; enemyIndex < 4; enemyIndex++) {
	allEnemies.push(new Enemy());
}
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
