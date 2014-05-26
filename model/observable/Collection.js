define(["../base/Collection", "./observableMethods", "genius/utils/object", "../base/arrayChangeMethods", "genius/utils/array"], function (Collection, methods, o, arrayChangeMethods, a) {
	var methods = methods(Collection);

	o(methods).extend({
		fire: function (evt, value) {
			for (var x in this.listeners[evt])
				this.listeners[evt][x].call(this, value || this);
		}
	});

	a(arrayChangeMethods).forEach(function (method) {
		var base = Collection.prototype[method];
		
		methods[method] = function () {
			var output = base.apply(this, arguments);
			this.fire();
			return output;
		}
	});

	for (var i = 0; i < arrayChangeMethods.length; i++) {
		(function () {
			var method = arrayChangeMethods[i],
				base = Collection.prototype[method];
			
			methods[method] = function () {
				var output = base.apply(this, arguments);
				this.fire();
				return output;
			}
		}());
	}


	//methods where things are added or removed
	o(methods).extend({
		pop: function () {
			var last = this[this.length - 1];
			Collection.prototype.pop.apply(this, arguments);
			if (last) {
				this.fire("removed", last);
				this.fire();
			}
		},
		push: function () {
			var _self = this;

			a(arguments).forEach(function (arg) {
				Collection.prototype.push.call(_self, arg);
				_self.fire("added", arg);
				_self.fire();
			});

			return this.length;
		},
		shift: function () {
			var first = this[0];
			Collection.prototype.shift.apply(this, arguments);
			if (first) {
				this.fire("removed", first);
				this.fire();
			}
		},
		splice: function (index, length) {
			var output = [],
				_self = this;

			while (length-- > 0) {
				var removed = Collection.prototype.splice.call(index, 1)[0];
				if (removed) {
					output.push(removed);
					this.fire("removed", removed);
					this.fire();
				}
			}

			a(arguments).slice(2, arguments.length).forEach(function (arg) {
				Collection.prototype.splice.call(_self, index++, 0, arg);
				_self.fire("added", arg);
				_self.fire();
			});

			return output;
		},
		unshift: function () {},
	});

	var ObservableCollection = Collection.extend(methods);

	return ObservableCollection;
});