define(["./Node"], function (Node) {
	return Node.extend({
		init: function (element, scope) {
			this.element = element;
			this.scope = scope;
		},
		setup: function () {},
		update: function () {}
	});
});