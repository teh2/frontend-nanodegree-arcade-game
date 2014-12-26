/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * All of your app's interactions with the engine come in one of three forms.
 * 1) The engine has pre-defined points where you can call functions in your objects.
 *    these are defined in the functions below who's names look like xxxEntities.
 * 2) Resources.load() contains an array pointing to each of the resources (images)
 *    that you want the engine to pre-load for you before it starts up your game.
 * 3) The engine makes specific functions available to your app through the
 *    'theEngine' variable. For example, your app can pause, unpause, or reset the
 *    game engine, based upon conditions in the game itself.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope.
     *
     * Note that in this updated version of the engine, we no longer define a single
	 * canvas for the entire game. That's handled by various objects in the app
     * which define their own individual canvases for various purposes.
     */
    var doc = global.document,
        win = global.window,
        lastTime,
		engineID = 0;

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        engineID = win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
		initEntities();
        main();
    }

	/*
	 * This function initializes all of your game entities. Each entity in your
	 * game will need to provide an init function, and you will need to add a
	 * call to it here.
	 */
	function initEntities() {
        allEnemies.forEach(function(enemy) {
            enemy.init();
			enemy.reset();
        });
		treasure.init();
		player.init();
        reset();
		board.init();
		statusBar.init();
	}

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * entities in your game  and calls their update() methods. These update
	 * methods should focus purely on updating the data/properties related to
	 * the object. Do your drawing in your render methods.
     */
    function updateEntities(dt) {
		board.update(dt);
		statusBar.update();
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
		treasure.update(dt);
        player.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on all of your entities within app.js.
     */
    function renderEntities() {
		board.render();
		statusBar.render();

        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
		treasure.render();
        player.render();
    }

    /* This function resets the game state, putting everything back to the way
     * it was at the beginning of the game. Note that in addition to being called
	 * automatically from the init function, it is also made available to your
	 * app.js in the form of "theEngine.reset()" so that you can end a game and
	 * restart it when necessary.
     */
    function reset() {
		resetEntities();
    }

	/*
	 * resetEntities is where you will call the reset function of each of your
	 * game objects that needs to be reset when the game restarts.
	 */
	function resetEntities() {
		treasure.reset();
        player.reset();
	}

	/*
	 * The pause function halts the game engine without changing any game state.
	 * You can make this available to your users so that they can answer the phone
	 * without being killed in the game.
	 */
	function pause() {
		cancelAnimationFrame(engineID);
	}

	/*
	 * Of course, when your user is done talking on the phone, they will want to 
	 * resume their game, and this function - unpause is tailor-made for that.
	 */
	function unpause() {
        lastTime = Date.now();
		main();
	}

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
	 *
	 * You add or remove images to this list based on what you are actually
	 * using in your game. If you aren't using an image, remove it from this
	 * list because it's just slowing down game startup...
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Heart.png',
		'images/Gem Blue.png',
		'images/Gem Green.png',
		'images/Gem Orange.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    // global.ctx = ctx;
	window.theEngine = {
		pause: pause,
		unpause: unpause,
		reset: reset
	};
})(this);
