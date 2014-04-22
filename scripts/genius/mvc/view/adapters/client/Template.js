define(["genius/mvc/model/base/Class", "./BestNodeGetter"], function (Class, bestNode) {
	return Class.extend({
		init: function (html, root, model) {
			this.children = [];
			html = [html];
			while (html[0].length) {
				Array.prototype.push.apply(this.children, bestNode(html), this);
			}
			var compiledChildren = [];
			for (var i = 0; i < this.children.length; i++) {
				compiledChildren.push.apply(compiledChildren, this.children[i].compile(model, root));
			}
			this.children = compiledChildren;
			while (root.firstChild)
				root.removeChild(root.firstChild);

			for (var i = 0; i < this.children.length; i++) {
				root.appendChild(this.children[i]);
			}
		}
	});
});