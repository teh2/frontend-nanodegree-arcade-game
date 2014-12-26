frontend-nanodegree-arcade-game
===============================
LadyBugger is a class project for the Udacity frontend nanoegree.

To make it run, you will need to grab
	index.html
	./css
	./images
	./js
and put them somewhere where your local web server can see them. They don't run particularly well by just opening the index.html locally in a browser, because the project does a bunch of image manipulation, and therefore suffers from the "tainted canvas" (cross-origin) issue.

So... in an attempt to make that as easy as possible, I've also included a small file next to index.html, called server.js, which contains the code that I use locally to run this project on a node.js server. If you have a preferred web server that you use locally, feel free to skip node.js and my simple server.js file.



In the creation of this code, I used several references:
	* Most notably, I used the original project code from the git repository at:https://github.com/udacity/frontend-nanodegree-arcade-game.
	* I did some reading at the W3schools.com JavaScript reference: http://www.w3schools.com/jsref/
	* I also read the mozilla.org JavaScript reference at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
	* I read several pages at stackoverflow to understand various mysterious error messages: http://stackoverflow.com/
	* I attempted to follow the Google - Javascript guide: https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
	* And I took both of the Udacity classes leading up to this project:
		Object Oriented JavaScript: https://www.udacity.com/course/ud015
		HTML5 Canvas: https://www.udacity.com/course/ud292

----------------------------------------------------------------
The original version of this readme included the following text:

Students should use this rubric: https://www.udacity.com/course/viewer#!/c-ud015/l-3072058665/m-3072588797

for self-checking their submission.
