var S3Uploader = function() {
	self.addEventListener('message', function(e) {
		self.postMessage(e.data);
	}, false);
};

new S3Uploader();
