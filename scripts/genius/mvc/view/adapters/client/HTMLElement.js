define(["./Node"], function (Node) {
	return Node.extend({
		init: function () {
			Node.prototype.init.call(this);
			this.tagName = "";
			this.domNode;
			this.attributes = {};
			this.children = [];
		},
		splice: function (index, length, replacements) {
			this.children.splice.apply(this.children, arguments);
		},
		compile: function (model, parent) {
			var el = document.createElement(this.tagName);

			for (var x in this.attributes) {
				el.setAttribute(x, this.attributes[x]);
			}

			for (var i = 0; i < this.children.length; i++) {
				var returned = this.children[i].compile(model, el);

				for (var x = 0; x < returned.length; x++) {
					el.appendChild(returned[x]);
				}
			}
			return [el];
		}
	});
});