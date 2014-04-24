define(["./Node", "./directives/splice"], function (Node, splice) {
	return Node.extend({
		init: function () {
			this.name = "";
			this.args = [];
			this.children = [];
			this.compiledChildren = [];
			this.open = null;
			this.close = null;
		},
		splice: function (index, length) {
			var offset = Array.prototype.indexOf.call(this.parent.childNodes, this.compiledOpen) + 1;
			var args = Array.prototype.slice.call(arguments, 2);
			return splice.apply(this, [this.parent, index + offset, length].concat(args));
		},
		compile: function (model, parent) {
			this.parent = parent;
			var _self = this;

			var args = [parent, model];
			for (var i = 0; i < this.args.length; i++) {
				with (model) {
					args.push(eval(this.args[i]));
				}
			}

			var output = this.setUp.apply(this, args);

			for (var i = 0; i < args.length; i++)
				if (args[i].subscribe)
					args[i].subscribe(function () { _self.update.apply(_self, args); });

			this.compiledOpen = this.open.compile(model)[0];
			this.compiledClose = this.close.compile(model)[0];

			output.unshift(this.compiledOpen);
			output.push(this.compiledClose);

			return output;
		},
		setUp: function (parent, model) {
			this.compiledChildren = this.children.map(function (child) {
				return child.compile(model, parent);
			});

			return this.compiledChildren;
		},
		update: function () {}
	});
});