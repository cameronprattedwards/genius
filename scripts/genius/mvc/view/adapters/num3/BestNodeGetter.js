define([
	"./HTMLFactory", 
	"./DirectiveFactory", 
	"./TextFactory",
	"./directives"
	], function (HTMLFactory, DirectiveFactory, TextFactory, directives) {
	return function (html) {
		if (/^<[\>]+>/.test(html))
			return HTMLFactory;

		if (/^\{\{#[^\}]+\}\}/.test(html)) {
			var tagName = /\{\{#([^\s]+)[^\}]*\}\}/.exec(html)[1];
			return DirectiveFactory(directives[tagName]);
		}

		return TextFactory;
	};
});