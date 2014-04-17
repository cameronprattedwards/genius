define(["./Node", "./directives"], function (Node, directives) {
	var Directive = Node.extend({
		init: function (name, parent) {
			this.name = name;
			this.childNodes = [];
			this.args = [];
			this.parent = parent;
		},
		appendChild: function () {},
		populate: function (html) {
			var body = /\{\{#([^\}]+)\}\}/.exec(html)[1];

			this.name = /^([^\s]+)/.exec(body)[1];

			var openPlaceholder = document.createComment(body);
			this.parent.appendChild(openPlaceholder);

			this.args = /^[^\s]+([^\}]+)/.exec(body)[1].trim().split(/\s+/);

			var closingTag = new RegExp("\\{\\{\/" + this.name + "\\}\\}");

			while (!closingTag.test(html) && html.length) {
				var newNode = direct(html);
				html = newNode.populate(html);
				this.splice(newNode);
			}

			return html;
		},
		compile: function () {
			directives[this.name].call(this);
		}
	});
});