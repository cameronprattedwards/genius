define(["../Directive", "./splice"], function (Directive, splice) {
	return Directive.extend({
		setUp: function (parent, model, conditional) {
			function template(model) {
				var output = [];
				for (var i = 0; i < this.children.length; i++) {
					output.push.apply(output, this.children[i].compile(model));
				}
				return output;
			}

			var compiledChildren = template.call(this, model);
		}

		compile: function (model, parent) {
			var _self = this,
				conditional;

			with (model) {
				conditional = eval(_self.args[0]);
			}

			function template(model) {
				var output = [];
				for (var i = 0; i < this.children.length; i++) {
					output.push.apply(output, this.children[i].compile(model));
				}
				return output;
			}

			var compiledChildren = template.call(this, model);

			function update(value) {
				var offset = Array.prototype.indexOf.call(parent.childNodes, _self.compiledOpen) + 1;

				if (value) {
					splice.apply(this, [parent, offset, 0].concat(compiledChildren));
				} else {
					splice(parent, offset, _self.children.length);
				}
			}

			conditional.subscribe(update);

			var output = this.open.compile(model);

			this.compiledOpen = output[0];

			if (conditional.get())
				output.push.apply(output, compiledChildren);

			var compiledCloseArray = this.close.compile(model);
			this.compiledClose = compiledCloseArray[0];
			output.push(this.compiledClose);

			return output;
		}
	});
});