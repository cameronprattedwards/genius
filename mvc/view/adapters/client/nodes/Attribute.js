define(["./Node"], function (Node) {
	return Node.extend({
		init: function (scope) {
			this.scope = this.makeScope(scope);
			Node.prototype.init.apply(this, arguments);
			this.name = "";
		}
	});
});