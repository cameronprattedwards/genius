define([
	"./HTMLFactory", 
	"./DirectiveFactory", 
	"./TextFactory",
	"./directives"
	], function (HTMLFactory, DirectiveFactory, TextFactory, directives) {
	var bestNode = function (html) {
		if (/^<[^>]+>/.test(html[0]))
			return HTMLFactory(html, bestNode);

		if (/^\{\{#[^\}]+\}\}/.test(html[0])) {
			var tagName = /\{\{#([^\s]+)[^\}]*\}\}/.exec(html)[1];
			return DirectiveFactory(directives[tagName])(html, bestNode);
		}

		return TextFactory(html, bestNode);
	};

	return bestNode;
});