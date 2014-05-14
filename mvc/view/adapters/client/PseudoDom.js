define(["genius/utils/array"], function (a) {
	function PseudoDom() {
		this.children = [];
	}

	PseudoDom.prototype = {
		compile: function (model, parent) {
			function callback(child) {
				return child.compile(model, parent);
			}

			var mapped = a(this.children).map(callback);

			var flattened = a(mapped).flatten();

			return flattened;
		}
	};

	return PseudoDom;
});