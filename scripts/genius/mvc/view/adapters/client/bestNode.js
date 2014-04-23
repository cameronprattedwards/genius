define([
	"./HTMLFactory", 
	"./DirectiveFactory", 
	"./TextFactory",
	"./directives"
	], function (HTMLFactory, DirectiveFactory, TextFactory, directives) {
	var bestNode = function (html) {
		if (/^<[^>]+>/.test(html[0]))
			return require("./HTMLFactory")(html, bestNode);

		if (/^\{\{#[^\}]+\}\}/.test(html[0])) {
			var tagName = /\{\{#([^\s]+)[^\}]*\}\}/.exec(html)[1];
			return require("./DirectiveFactory")(directives[tagName])(html, bestNode);
		}

		return require("./TextFactory")(html, bestNode);
	};

	return bestNode;
});