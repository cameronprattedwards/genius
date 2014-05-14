define(["genius/config", "genius/utils/deferred"], function (config, deferred) {
	function FirebaseAdapter() {
		this.url = config.get().db.url();
		this.fb = new Firebase(this.url);
	};

	FirebaseAdapter.prototype = {
		create: function (url, data) {
			var output = deferred();
			this.fb.child(url).push(data);
			//How do I get the name for the thing?
		},
		read: function () {},
		update: function () {},
		del: function () {}
	};

	return new FirebaseAdapter();
});