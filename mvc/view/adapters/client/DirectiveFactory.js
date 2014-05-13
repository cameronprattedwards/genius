define(["./bestNode", "./Comment", "require"], function (bestNode, Comment, require) {
	return function (Directive) {
		return function (html, bestNode) {
			var dir = new Directive(),
				openingTag = /^\{\{#([^\}]+)\}\}/.exec(html[0])[1];

			dir.name = /^([^\s]+)/.exec(openingTag)[1];
			dir.args = /[\s]+(.*)/.exec(openingTag)[1].trim().split(/\s+/);

			var openComment = new Comment(openingTag);
			var closeComment = new Comment("/" + dir.name);

			dir.open = openComment;
			dir.close = closeComment;

			var closingTag = new RegExp("^\{\{\/" + dir.name + "\}\}");

			html[0] = html[0].slice(html[0].search("}}") + 2, html[0].length);

			while(html[0].length && !closingTag.test(html[0])) {
				dir.children.push.apply(dir.children, require("./bestNode")(html));
			}

			html[0] = html[0].slice(html[0].search("}}") + 2);

			return [dir];
		}
	}
});