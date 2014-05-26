define(["../nodes/Text"], function (Text) {
	return {
		fromString: function (string, scope) {
			var node = new Text(string, scope);
			return node;
		}
	};
});