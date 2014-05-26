define(["genius/model/base/Class", "./ControlFlow", "./Html", "./Comment", "./Text", "require", "genius/utils/array"], function (Class, ControlFlowFactory, HtmlFactory, CommentFactory, TextFactory, require, a) {
	return {
		fromString: function (string, scope, counter) {
			var match, 
				output,
				toSplice,
				counter = counter || [""];

			if (match = this.controlFlow.exec(string))
				output = ControlFlowFactory.fromString(toSplice = match[0], scope);

			else if (match = this.html.exec(string))
				output = require("./Html").fromString(toSplice = match[0], scope);

			else if (match = this.comment.exec(string))
				output = CommentFactory.fromString(toSplice = match[0], scope);

			else
				output = TextFactory.fromString(toSplice = this.getText(string), scope);

			counter[0] = counter[0].replace(toSplice, "");

			return output;
		},
		getText: function (string) {
			var comment = /<!\-\-([^(?:\-\-\>)]*)\-\->/,
				html = /<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/i,
				controlFlow = /\{\{#([A-Z][A-Z0-9]*)\b[^\}]*\}\}([\S\s]*?)\{\{\/\1\}\}/gi;

			var cf = string.search(controlFlow),
				html = string.search(html),
				com = string.search(comment),
				all = a([cf, html, com]).filter(function (val) { 
					return val !== -1;
				});

			return string.substring(0, Math.min.apply(Math, all.concat([string.length])));
		},
		interpolate: function (str) {

		},
		comment: /^<!\-\-([^(?:\-\-\>)]*)\-\->/,
		html: /^<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/i,
		controlFlow: /^\{\{#([A-Z][A-Z0-9]*)\b[^(?:\}\})]*\}\}([\S\s]*?)\{\{\/\1\}\}/i
	};
});