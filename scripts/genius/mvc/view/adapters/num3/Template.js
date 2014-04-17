define(["genius/mvc/model/base/Class", "./BestNodeGetter"], function (Class, bestNode) {
	return Class.extend({
		init: function (html, compile, root) {
			this.children = [];
			html = [html];
			while (html[0].length) {
				Array.prototype.push.apply(this.children, bestNode(html), this);
			}
			this.children = this.children.map(function (child) {
				return child.compile(model, root);
			});
		}
	});
});