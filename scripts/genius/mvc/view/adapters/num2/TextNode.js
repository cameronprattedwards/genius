define(["./Node"], function (Node) {
	return Node.extend({
		init: function () {
			this.value;
		},
		populate: function (html) {
			//until /<tag>|{{#directive}}/
			var end = html.search(/<[^>]+>|\{\{#[^\}]+]\}\}/);
			this.value = html.slice(0, end);
			return html.slice(end, html.length);
		},
		compile: function () {
			return document.createTextNode(this.value);
		}
	});
});