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

