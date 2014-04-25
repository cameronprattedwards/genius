define(["../base/Collection", "./observableMethods", "genius/utils", "../base/arrayChangeMethods"], function (Collection, methods, utils, arrayChangeMethods) {
	var methods = methods(Collection);

	utils.extend(methods, {
		fire: function (evt) {
			for (var x in this.listeners[evt])
				this.listeners[evt][x].call(this, this);
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

	var ObservableCollection = Collection.extend(methods);

	return ObservableCollection;
});