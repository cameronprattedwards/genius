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

			var args = [parent, model];
			for (var i = 0; i < this.args.length; i++) {
				with (model) {
					args.push(eval(this.args[i]));
				}
			}

			this.setUp.apply(this, args);

			return this.compiledChildren;
		},
		setUp: function () {

		}
	});
});