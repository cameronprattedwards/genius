define(["../Directive", "./splice"], function (Directive, splice) {
	return Directive.extend({
		init: function () {
			Directive.prototype.init.apply(this, arguments);

			this.cached = [];
		},
		template: function (model) {
			var output = [];
			for (var i = 0; i < this.children.length; i++) {
				output.push.apply(output, this.children[i].compile(model));
			}
			return output;
		},
		setUp: function (model, parent, array) {
			var output = [];
			for (var i = 0; i < array.length; i++) {
				this.cached.push(array[i]);
				output.push.apply(output, this.template.call(this, array[i]));
			}
			return output;
		},
		update: function (model, parent, array) {
			var i = 0,
				domIndex = 0;

			for (; i < array.length; i++) {
				var entry = array[i],
					entryInCached,
					entryEls,
					domIndex = i * this.children;

				if (this.cached[i] === entry)
					continue;

				if (this.cached.indexOf(entry) !== -1) {
					while (this.cached.indexOf(entry) !== -1) {
						var indexInCached = this.cached.indexOf(entry);
						entryInCached = this.cached.splice(indexInCached, 1)[0];
						entryEls = this.splice(indexInCached, this.children.length);
					}
				} else {
					entryInCached = entry;
					entryEls = this.template(entry);
				}

				this.cached.splice(i, 0, entryInCached);
				this.splice.apply(this, [domIndex, 0].concat(entryEls));
			}

			var extraLength = this.cached.length - array.length;

			this.cached.splice(i, extraLength);
			this.splice(domIndex, extraLength * this.children.length);
		}
	});
});