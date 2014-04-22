define(["../Directive", "./splice"], function (Directive, splice) {
	return Directive.extend({
		compile: function (model, parent) {
			var indexOf = Array.prototype.indexOf.call,
				cached = [],
				_self = this;

			model = model[this.args[0]];

			function template(model) {
				var output = [];
				for (var i = 0; i < this.children.length; i++) {
					output.push.apply(output, this.children[i].compile(model));
				}
				return output;
			}

			function domIndexFn(offset, i, kids) {
				return offset + (i * kids.length);
			}

			function update(array) {
				var i = 0,
					offset = Array.prototype.indexOf.call(parent.childNodes, _self.compiledOpen) + 1,
					domIndex = domIndexFn(offset, i, _self.children);

				for (; i < array.length; i++) {
					var entry = array[i],
						entryInCached,
						entryEls,
						domIndex = domIndexFn(offset, i, _self.children);

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
					splice.apply(parent, [parent, domIndex, 0].concat(entryEls));
				}

				var extraLength = cached.length - array.length;
				cached.splice(i, extraLength);
				splice(parent, domIndex, extraLength * _self.children.length);
			}

			model.subscribe(update);

			var output = this.open.compile();
			this.compiledOpen = output[0];

			for (var i = 0; i < model.length; i++) {
				cached.push(model[i]);
				output.push.apply(output, template.call(this, model[i]));
			}

			var compiledCloseArray = this.close.compile();
			this.compiledClose = compiledCloseArray[0];
			output.push(this.compiledClose);

			return output;
		}
	});
});