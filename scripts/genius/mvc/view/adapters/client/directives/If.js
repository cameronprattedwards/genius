define(["../Directive"], function (Directive) {
	return Directive.extend({
		setUp: function (parent, model, conditional) {
			function template(model) {
				var output = [];
				for (var i = 0; i < this.children.length; i++) {
					output.push.apply(output, this.children[i].compile(model));
				}
				return output;
			}

			this.compiledChildren = template.call(this, model);

			return conditional.get() ? this.compiledChildren : [];
		},
		update: function (parent, model, conditional) {
			if (conditional.get()) {
				this.splice.apply(this, [0, 0].concat(this.compiledChildren));
			} else {
				this.splice(0, 0, this.compiledChildren.length);
			}
		}
	});
});