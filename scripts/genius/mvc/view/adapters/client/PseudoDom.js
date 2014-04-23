define(["genius/utils"], function (utils) {
	function PseudoDom() {
		this.children = [];
	}

	PseudoDom.prototype = {
		compile: function (model, parent) {
			function callback(child) {
				return child.compile(model, parent);
			}

			var mapped = utils.map(this.children, callback);

			var flattened = utils.flatten(mapped);

			return flattened;
		}
	};

	return PseudoDom;
});