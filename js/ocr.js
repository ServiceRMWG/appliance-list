var Ocr = function() {
	this.canvas = document.getElementById('bgImage');
	this.ctx = this.canvas.getContext('2d');

	this.canvas.width = this.canvas.height = 0;

	this.fgImage = document.getElementById("fgImage");
	this.fgContext = fgImage.getContext("2d");

	this.fgImage.style.opacity = 0.4;
	this.fgContext.fillStyle = "rgb(180,0,0)";

	this.fgImage.addEventListener("touchstart", this.touchStartHandler.bind(this), false);
	this.fgImage.addEventListener("touchmove", this.touchMoveHandler.bind(this), false);
	this.fgImage.addEventListener("touchend", this.touchEndHandler.bind(this), false);

	this.isDragging = false;

	this.debug('-------- debug print --------');
};

Ocr.prototype.loadFile = function(file) {
	var reader = new FileReader();
	this.fgContext.clearRect(0, 0, this.fgImage.width, this.fgImage.height);
	reader.onload = function() {
		var image = new Image();
		image.onload = function() {
			var w = 320, h = 240;
			if (w/h > image.width/image.height) {
				h = parseInt(w*image.height/image.width);
			} else {
				w = parseInt(h*image.width/image.height);
			}

			console.log({w: w, h: h});

			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.canvas.width = w;
			this.canvas.height = h;
			this.ctx.drawImage(image, 0, 0, w, h);

			this.debug("orig: " + image.width + " " + image.height);

			var img = this.ctx.getImageData(0, 0, w, h);
			Tesseract.recognize(img, {progress: this.progress.bind(this)}, function(err, result) {
				console.log(result);
				document.getElementById('transcription').innerText = result.text;
			});
		}.bind(this);
		image.src = reader.result;
	}.bind(this);
	reader.readAsDataURL(file);
};

Ocr.prototype.getCanvasPosition = function(e) {
	if (e.touches.length > 0) {
		var b = this.fgImage.getClientRects()[0];
		return {x: parseInt(e.touches[0].clientX - b.left),
				y: parseInt(e.touches[0].clientY - b.top)};
	}
	return undefined;
};

Ocr.prototype.touchStartHandler = function(e) {
	this.dragStart = this.getCanvasPosition(e);
	this.isDragging = true;
	e.preventDefault();
};

Ocr.prototype.touchEndHandler = function(e) {
	if (this.isDragging) {
		this.isDragging = false;
	}

	var w = this.dragEnd.x - this.dragStart.x;
	var h = this.dragEnd.y - this.dragStart.y;
	var img = this.ctx.getImageData(this.dragStart.x, this.dragStart.y, w, h);
	Tesseract.recognize(img, {progress: this.progress.bind(this)}, function(err, result) {
		console.log(result);
		document.getElementById('transcription').innerText = result.text;
	});
	e.preventDefault();
};

Ocr.prototype.touchMoveHandler = function(e) {
	if (this.isDragging) {
		this.dragEnd = this.getCanvasPosition(e);
		var w = this.dragEnd.x - this.dragStart.x;
		var h = this.dragEnd.y - this.dragStart.y;
		this.fgContext.clearRect(0, 0, this.fgImage.width, this.fgImage.height);
		this.fgContext.fillRect(this.dragStart.x, this.dragStart.y, w, h);
	}
	e.preventDefault();
};

Ocr.prototype.debug = function(s) {
	document.getElementById('debug').innerText += s + '\n';
};

Ocr.prototype.progress = function(progress) {
	console.log(progress);
	if (progress.recognized !== undefined) {
		document.getElementById('progress').innerText = progress.recognized;
	} else {
		document.getElementById('progress').innerText = JSON.stringify(progress);
		this.debug(JSON.stringify(progress));
	}
};
