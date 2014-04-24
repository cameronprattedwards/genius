define(["../TemplateCache", "./unwrap", "../Directive"], function (TemplateCache, unwrap, Directive) {
	return Directive.extend({
		setUp: function (model, parent, filePath, modelToPass) {
			var _self = this;

			TemplateCache(unwrap(filePath))
				.success(function (pseudoDom) {
					_self.compiledChildren = pseudoDom.compile(modelToPass, parent);
					_self.splice(0, 0, _self.compiledChildren);
				});

			return [];
		},
		update: function () {
			this.splice(0, this.compiledChildren.length);
			this.setUp.apply(this, arguments);
		}
	});
});