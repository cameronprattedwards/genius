define(["../Directive", "./splice"], function (Directive, splice) {
	return Directive.extend({
		compile: function (model, parent) {
			var indexOf = Array.prototype.indexOf.call,
				cached = [],
				_self = this;

			model = model[this.args[0]];

			function template(model) {
				return this.children.map(function (child) {
					return child.compile(model);
				});
			}

			function update(array) {
				var i = 0,
					offset = indexOf(parent.childNodes, _self.compiledOpen) + 1;

				for (; i < array.length; i++) {
					var entry = array[i],
						entryInCached,
						entryEls,
						domIndex = (i + offset) * _self.children.length;

					if (cached[i] === entry)
						continue;

					if (cached.indexOf(entry) !== -1) {
						while (cached.indexOf(entry) !== -1) {
							var indexInCached = cached.indexOf(entry);
							entryInCached = cached.splice(indexInCached, 1)[0];
							entryEls = splice(parent, indexInCached + offset, _self.children.length);
						}
					} else {
						entryInCached = entry;
						entryEls = template.call(_self, entry);
					}

					cached.splice(i, 0, entryInCached);
					splice(parent, domIndex, 0, entryEls);
				}

				var extraLength = cached.length - arrayValue.length;
				cached.splice(i, extraLength);
				wrapped.splice(domIndex, extraLength * _self.children.length);
			}

			model.subscribe(update);

			var output = [this.compiledOpen = this.open.compile()];

			for (var i = 0; i < model.length; i++) {
				cached.push(model[i]);
				output.push.apply(output, translate.call(this, model[i]));
			}

			output.push(this.compiledClose = this.close.compile());
			return output;
		}
	});
});