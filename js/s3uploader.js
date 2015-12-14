self.addEventListener('message', function(e) {
	console.log('hoge');
	self.postMessage(e.data);
}, false);
