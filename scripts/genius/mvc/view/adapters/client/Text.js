define(["./Node"], function (Node) {
	return Node.extend({
		init: function (value) {
			this.value = value;
		},
		compile: function (model, parent) {
			return document.createTextNode(this.value);
		}
	});
});