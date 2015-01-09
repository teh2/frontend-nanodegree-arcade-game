/******************************************************************************
* Sprite class - Implement behavior required by sprite images. Currently, we hold
* a pointer to our image in the Resources cache. And we calculate the visible
* boundaries of the image, not counting the transparent parts (used for collision
* detection).
*
* It turns out that in the context of the current game, the visible extents are
* probably not, strictly speaking, necessary, because row and column comparison
* would probably have been "good enough", but this method is more accurate, and
* turned out to be an interesting learning experience.
******************************************************************************/
var Sprite = function (url) {
	this.url = url;
	// Pre-initalize the extents to be "backwards", so that we have a min/max
	//value to compare against later when calculating the extent.
	this.extents = {
		"minx": 9999,
		"miny": 9999,
		"maxx": 0,
		"maxy": 0
	};
};

/*
* Sprite.init - handle stuff that needs doing when the Sprite is first created.
* IE: we only need to calculate the visible extents once. They don't change.
*/
Sprite.prototype.init = function () {
	this.setVisibleExtents();
};

/*
* Sprite.setVisibleExtents - calculate the part of the image data that is acutally
* visible, and store both the minimums and maximums for both x and y. This is done
* by creating a hidden canvas/context, throwing the image on it, pulling the image
* data from the hidden canvas, iterating through the image data, look at the alpha
* channel of each pixel, and save the smallest and largest x and y number.
*/
Sprite.prototype.setVisibleExtents = function () {
	//Grab the pixels:
	var img = Resources.get(this.url),
		eCanvas = document.createElement('canvas'),
		spriteCtx = eCanvas.getContext('2d'),
		imgData,
		minx,
		miny,
		maxx,
		maxy,
		pixelData,
		x,
		y;
	spriteCtx.drawImage(img, 0, 0);
	imgData = spriteCtx.getImageData(0,0,img.width,img.height);
	//start out with min's as big as possible:
	minx = img.width - 1;
	miny = img.height - 1;
	//and max's as small as possible:
	maxx = 0;
	maxy = 0;

	//Loop through every pixel,
	var pixelData = imgData.data;
	for (y = 0; y < img.height; y++) {
		for (x = 0; x < img.width; x++) {
			//The fourth byte of the pixel is the alpha channel, is it greater than zero?
			if (0 < pixelData[(x * 4) + (y * 4 * img.width) + 3]) {
				//visible pixel, adjust the extents if necessary:
				if (x < minx) {minx = x;};
				if (y < miny) {miny = y;};
				if (maxx < x) {maxx = x;};
				if (maxy < y) {maxy = y;};
			}
		}
	};
	//Store the extents for later:
	this.extents.minx = minx;
	this.extents.miny = miny;
	this.extents.maxx = maxx;
	this.extents.maxy = maxy;
};

