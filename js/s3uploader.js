var S3Uploader = function() {
	this.reqQueue = [];

	self.addEventListener('message', this.msgHandler.bind(this), false);
};

S3Uploader.prototype.msgHandler = function(e) {
	switch(e.data) {
	case 'upload':
		this.upload(e.data);
		break;
	case 'echo':
		self.postMessage(e.data);
		break;
	}
};

S3Uploader.prototype.upload = function(d) {
	this.reqQueue.push(d);
};

new S3Uploader();
