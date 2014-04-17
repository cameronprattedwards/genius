define(["./BestNodeGetter"], function (bestNode) {
	return function (Directive) {
		return function (html, model) {
			var dir = new Directive(),
				openingTag = /^\{\{#([^\}]+)\}\}/.exec(html[0])[1];

			dir.name = /^([^\s]+)/.exec(openingTag)[1];
			dir.args = /[\s]+(.*)/.exec(openingTag)[1].trim().split(/\s+/);

			var openComment = new Comment(openingTag);
			var closeComment = new Comment("/" + dir.name);

			dir.open = openComment;
			dir.close = closeComment;

			var closingTag = new RegExp("^\{\{\/" + dir.name + "\}\}");

			while(html[0].length && !closingTag.test(html)) {
				dir.splice.apply(dir, [dir.children.length + 1, 0].concat(bestNode(html, model)));
			}

			dir.children.push(dir.close);
			dir.children.unshift(dir.open);

			return [dir];
		}
	}
});