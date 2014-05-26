define(["./Node", "genius/model/observable/Collection"], function (Node, Collection) {
	return Node.extend({
		init: function (value, scope) {
			this.scope = this.makeScope(scope);
			Node.prototype.init.apply(this, arguments);
			this.nodeValue = value;
			this.element = document.createComment(value);
			this.realNodes = new Collection([this.element]);
		}
	});
});