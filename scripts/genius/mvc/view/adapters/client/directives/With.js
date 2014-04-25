define(["../Directive", "./splice"], function (Directive, splice) {
	return Directive.extend({
		compile: function (model, parent) {
			var outer,
				inner,
				_self = this;

			with (model) {
				outer = eval(this.args[0]);
			}

			function update(newVal) {
				var offset = Array.prototype.indexOf.call(parent.childNodes, _self.compiledOpen) + 1;
				splice(parent, offset, _self.children.length);
				
				var output = [];
				for (var i = 0; i < _self.children.length; i++) {
					splice.apply(parent, [parent, offset++, 0].concat(_self.children[i].compile(newVal, parent)));
				}
			}

			if (typeof outer.get == "function") {
				inner = outer.get();
				outer.subscribe(update);
			} else {
				inner = outer;
			}

			var output = this.open.compile();
			this.compiledOpen = output[0];
			for (var i = 0; i < this.children.length; i++) {
				output.push.apply(output, this.children[i].compile(inner));
			}

			var compiledCloseArray = this.close.compile();
			this.compiledClose = compiledCloseArray[0];
			output.push(this.compiledClose);

			return output;
		}
	});
});