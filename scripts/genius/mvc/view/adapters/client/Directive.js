define(["./Node"], function (Node) {
	return Node.extend({
		init: function () {
			this.name = "";
			this.args = [];
			this.children = [];
			this.compiledChildren = [];
			this.open = null;
			this.close = null;
		},
		compile: function (model, parent) {
			this.compiledChildren = this.children.map(function (child) {
				return child.compile(model, parent);
			});

			return this.compiledChildren;
		}
	});
});