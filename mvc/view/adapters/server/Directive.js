define(["genius/base/Class", "genius/utils/deferred", "require", "./processHtml", "./registry"], function (Class, deferred, require, processHtml, registry) {
	var Directive = Class.extend({
		init: function (content) {
			this.content = content;
			this.args = [];
		},
		compile: function (model) {
			return require("./processHtml")(this.content, deferred(), model);
		}
	});

	var placeholder = Directive.extend;

	Directive.extend = function (string, properties) {
		return registry[string] = placeholder.call(Directive, properties);
	}

	return Directive;
});