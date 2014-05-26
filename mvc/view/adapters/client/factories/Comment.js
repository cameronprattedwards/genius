define(["../nodes/Comment"], function (Comment) {
	return {
		fromString: function (string, scope) {
			var value = /<!\-\-([^(?:\-\-\>)]*)\-\->/.exec(string)[1];
			return new Comment(value, scope);
		}
	}
});