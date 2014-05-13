define(["../TemplateCache", "./unwrap", "../Directive", "require"], function (TemplateCache, unwrap, Directive, require) {
	return Directive.extend({
		setUp: function (model, parent, filePath, modelToPass) {
			var _self = this;

			require("../TemplateCache")(unwrap(filePath))
				.success(function (pseudoDom) {
					_self.compiledChildren = pseudoDom.compile(modelToPass, parent);
					_self.splice.apply(_self, [0, 0].concat(_self.compiledChildren));
				});

			return [];
		},
		update: function () {
			this.splice(0, this.compiledChildren.length);
			this.setUp.apply(this, arguments);
		}
	});
});