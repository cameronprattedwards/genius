define(["../Directive", "./splice"], function (Directive, splice) {
	return Directive.extend({
		compile: function (model, parent) {
			var _self = this,
				conditional;

			with (model) {
				conditional = eval(_self.args[0]);
			}

			function template(model) {
				return this.children.map(function (child) {
					return child.compile(model);
				});
			}

			var compiledChildren = template(model);

			function update(value) {
				var offset = Array.prototype.indexOf.call(parent, this.compiledOpen) + 1;

				if (value) {
					splice.call(this, [parent, offset, 0].concat(compiledChildren));
				} else {
					splice(parent, offset, _self.children.length);
				}
			}

			conditional.subscribe(update);

			var output = [this.compiledOpen = this.open.compile(model)];

			if (conditional.get())
				output.push.apply(output, compiledChildren);

			output.push(this.compiledClose = this.close.compile(model));

			return output;
		}
	});
});