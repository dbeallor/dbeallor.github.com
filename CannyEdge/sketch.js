var img;
var filepaths = ['guitar.png', 'mandrill.jpg', 'lion.png', 'skyline.jpg']; 
var min_thresholds = [10, 70, 35, 35];
var max_thresholds = [510, 190, 185, 235];
var images = [];
var grads = [];
var weak = [];
var strong = [];
var keepers = [];
var thresh_strong = 1700;
var prev_thresh_strong;
var thresh_weak = 800;
var prev_thresh_weak;
var strong_fill = 200;
var weak_fill = 80;
var display_edges = false;
var strong_slider;
var weak_slider;
var img_ctr = 0;
var link = [];
var ready = false;
var started = false;

function preload(){
	for (var i = 0; i < filepaths.length; i++)
		images[i] = loadImage(filepaths[i]);
}

function setup() {
	if (img_ctr == 0)
		createCanvas(512, 512);

	img_num = img_ctr % images.length;
	img = images[img_num];

	strong_slider = createSlider(min_thresholds[img_num], max_thresholds[img_num], 180, 5);
	weak_slider = createSlider(min_thresholds[img_num], max_thresholds[img_num], 70, 5);

	strong_slider.position(15, 25);
	weak_slider.position(15, 60);
	
	draw();

	getGradients();
	keepMaximizers();
	applyThresholds();
	keepChains();
}

function draw() {
	push();
		translate(width/2, height/2);
		imageMode(CENTER);
		image(img, 0, 0);
	pop();

	prev_thresh_strong = thresh_strong;
	thresh_strong = strong_slider.value();

	prev_thresh_weak = thresh_weak;
	thresh_weak = weak_slider.value();

	if (ready & (thresh_weak != prev_thresh_weak || thresh_strong != prev_thresh_strong)){
		ready = false;
		applyThresholds();
		keepChains();
	}

	if (!display_edges){
		strong_slider.hide();
		weak_slider.hide();
	}

	if (ready && display_edges) {
		showEdges();
		strong_slider.show();
		weak_slider.show();
		push();
			translate(width/2, height/2);
			stroke(255);
			rectMode(CENTER);
			fill(0);
			rect(-width / 2 + 85, -height / 2 + 45, 150, 70);
			noStroke();
			fill(255);
			text('Strong Threshold', -width / 2 + 15, -height / 2 + 25);
			text('Weak Threshold', -width / 2 + 15, -height / 2 + 60);
		pop();
	}

	if (ready && !started){
		push();
			translate(width/2, height/2);
			stroke(255);
			rectMode(CENTER);
			fill(0);
			rect(0, 0, 110, 30);
			noStroke();
			fill(255);
			textAlign(CENTER, CENTER);
			text('click to start', 0, 0);
		pop();
	}

	if (ready && started){
		push();
			translate(width/2, height/2);
			stroke(150);
			fill(0);
			rectMode(CENTER);
			rect(width / 2 - 100, height / 2 - 22, 190, 38);
			noStroke();
			fill(255);
			text('press < e > to toggle edge display', width / 2 - 190, height / 2 - 25);
			text('press < s > to switch images', width / 2 - 175, height / 2 - 10);
		pop();
	}
}

function keepChains(){
	for (var i = 0; i < width; i++){	
		link[i] = [];
		for (var j = 0; j < height; j++){
			link[i][j] = 0;
		}
	}

	for (var i = 0; i < width; i++){
		for (var j = 0; j < height; j++){
			if (strong[i][j] == 1){
				for (var x = -2; x <= 2; x++){
					for (var y = -2; y <= 2; y++){
						if (i + x >= 0 && j + y >= 0 && i + x < width && j + y < height){
							if (weak[i + x][j + y] == 1 && link[i + x][j + y] == 0)
								ripple(i + x, j + y);
						}
					}
				}
			}
		}
	}

	ready = true;
}

function ripple(i, j){
	link[i][j] = 1;

	for (var x = -2; x <= 2; x++){
		for (var y = -2; y <= 2; y++){
			if (i + x >= 0 && j + y >= 0 && i + x < width && j + y < height){
				if (weak[i + x][j + y] == 1 && link[i + x][j + y] == 0)
					ripple(i + x, j + y);
			}
		}
	}
}

function showEdges(){
	loadPixels();
	for (var i = 0; i < width; i++){
		for (var j = 0; j < height; j++){
			if (strong[i][j] == 1)
				setPixel(i, j, strong_fill);
			else if (link[i][j] == 1)
				setPixel(i, j, weak_fill);
			else
				setPixel(i, j, 0);
		}
	}
	updatePixels();
}

function applyThresholds(){
	for (var i = 0; i < width; i++){
		strong[i] = [];
		weak[i] = [];	
		for (var j = 0; j < height; j++){
			if (keepers[i][j] == 1 && grads[i][j][0] >= thresh_strong){
				strong[i][j] = 1;
				weak[i][j] = 0;
			}
			else if (keepers[i][j] == 1 && grads[i][j][0] >= thresh_weak){
				strong[i][j] = 0;
				weak[i][j] = 1;
			}
			else{
				strong[i][j] = 0;
				weak[i][j] = 0;
			}
		}
	}
}

function keyPressed(){
	if (started && key == 'E')
		display_edges ? display_edges = false : display_edges = true;

	if (started && key == 'S') {
		img = images[img_ctr++ % images.length];
		ready = false;
		display_edges ? display_edges = false : null;
		strong_slider.remove();
		weak_slider.remove();
		setup();
	}
}

function keepMaximizers(){
	for (var i = 0; i < width; i++){
		keepers[i] = [];
		for (var j = 0; j < height; j++){
			grad = grads[i][j];

			neighbours = getNeighbours(grad[1], i, j);

			if(neighbours[0][0] >= 0 && neighbours[0][1] >= 0 && neighbours[0][0] < width && neighbours[0][1] < height)
				grad1 = grads[neighbours[0][0]][neighbours[0][1]][0];
			else
				grad1 = -1;

			if(neighbours[1][0] >= 0 && neighbours[1][1] >= 0 && neighbours[1][0] < width && neighbours[1][1] < height)
				grad2 = grads[neighbours[1][0]][neighbours[1][1]][0];
			else
				grad2 = -1;

			if (grad[0] > grad1 && grad[0] > grad2)
				keepers[i][j] = 1;
			else
				keepers[i][j] = 0;
		}
	}
}

function mousePressed(){
	if (!started && mouseX >= 0 && mouseY >= 0 && mouseX < width && mouseY < height)
		started = true;
}

function getNeighbours(angle, i, j) {
	var neighbours = [];
	switch(angle){
		case -Math.PI:
			neighbours[0] = [i + 1, j];
			neighbours[1] = [i - 1, j];
			break;
		case -3 * Math.PI / 4:
			neighbours[0] = [i + 1, j - 1];
			neighbours[1] = [i - 1, j + 1];
			break;
		case -Math.PI / 2:
			neighbours[0] = [i, j - 1];
			neighbours[1] = [i, j + 1];
			break;
		case -Math.PI / 4:
			neighbours[0] = [i - 1, j - 1];
			neighbours[1] = [i + 1, j + 1];
			break;
		case 0:
			neighbours[0] = [i - 1, j];
			neighbours[1] = [i + 1, j];
			break;
		case Math.PI / 4:
			neighbours[0] = [i - 1, j + 1];
			neighbours[1] = [i + 1, j - 1];
			break;
		case Math.PI / 2:
			neighbours[0] = [i, j + 1];
			neighbours[1] = [i, j - 1];
			break;
		case 3 * Math.PI / 4:
			neighbours[0] = [i + 1, j + 1];
			neighbours[1] = [i - 1, j - 1];
			break;
		case Math.PI:
			neighbours[0] = [i + 1, j];
			neighbours[1] = [i - 1, j];
			break;
	}
	return neighbours
}

function getGradients() {
	blur();
	var gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
	var gy = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]];
	loadPixels();
	for (var i = 0; i < width; i++) {
		grads[i] = []
		for (var j = 0; j < height; j++) {
			grad_x = 0;
			grad_y = 0;
			for (var x = 0; x <= 2; x++) {
				for (var y = 0; y <= 2; y++) {
					if (i + x - 1 >= 0 && i + x - 1 < width && j + y - 1 >= 0 && j + y - 1 < height) {
						pix = getPixelVal(i + x - 1, j + y - 1);
						grad_x += gx[x][y] * pix;
						grad_y += gy[x][y] * pix;
					}
				}
			}
			magnitude = Math.sqrt(Math.pow(grad_x, 2) + Math.pow(grad_y, 2));
			if (grad_y == 0)
				theta = 0;
			else
				theta = Math.floor(Math.atan(grad_x / grad_y) / (Math.PI / 4)) * (Math.PI / 4);
			grads[i][j] = [magnitude, theta];
		}
	}
}

function blur(){
	var g = 
	[[1.0/273, 4.0/273, 7.0/273, 4.0/273, 1.0/273],
	 [4.0/273, 16.0/273, 26.0/273, 16.0/273, 4.0/273],
	 [7.0/273, 26.0/273, 41.0/273, 26.0/273, 7.0/273],
	 [4.0/273, 16.0/273, 26.0/273, 16.0/273, 4.0/273],
	 [1.0/273, 4.0/273, 7.0/273, 4.0/273, 1.0/273]];

	var val;

	loadPixels();
	for (var i = 0; i < width; i++){
		for (var j = 0; j < height; j++){
			val = 0;
			for (var x = 0; x < 5; x++){
				for (var y = 0; y < 5; y++){
					if (i + x - 2 >= 0 && j + y - 2 >= 0 && i + x - 2 < width && j + y - 2 < height)
						val += int(g[x][y] * getPixelVal(i + x - 2, j + y - 2));
				}
			}
			val > 255 ? val = 255 : null;
			setPixel(i, j, val);
		}
	}
	updatePixels();
}

function getPixelVal(i, j) {
	var d = pixelDensity();
	var avg = 0;
	for (var m = 0; m < d; m++) {
	  for (var n = 0; n < d; n++) {
	    // loop over
	    idx = 4 * ((j * d + n) * width * d + (i * d + m));
	    avg += pixels[idx];
	    avg += pixels[idx + 1];
	    avg += pixels[idx + 2];
	  }
	}
	return avg * 1.0 / (3 * pow(d, 2))
}

function setPixel(i, j, fill) {
	var d = pixelDensity();
	for (var m = 0; m < d; m++) {
	  for (var n = 0; n < d; n++) {
	    // loop over
	    idx = 4 * ((j * d + n) * width * d + (i * d + m));
	    pixels[idx] = fill;
	    pixels[idx + 1] = fill;
	    pixels[idx + 2] = fill;
	  }
	}
}