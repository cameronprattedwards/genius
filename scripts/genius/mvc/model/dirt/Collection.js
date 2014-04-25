define(
	["../observable/Collection", "./setUtils", "../base/arrayChangeMethods", "../observable/Observable"], 
	function (Collection, setUtils, arrayChangeMethods, Observable) {
		var methods = {
			init: function () {
				var _self = this;
				this.isDirty = new Observable(false);
				this.isDirty.subscribe(function () { _self.fire("dirty"); });
				this.subscriptions = [];
				Collection.prototype.init.apply(this, arguments);
			}
		};

		for (var i = 0; i < arrayChangeMethods.length; i++) {
			(function () {
				var method = arrayChangeMethods[i],
					base = Collection.prototype[method];

				methods[method] = function () {
					var oldValue = Array.prototype.slice.call(this, 0);
					var output = base.apply(this, arguments);
					setUtils.current.markDirtyCollection.call(this, oldValue, this);
					return output;
				};
			}());
		}

		return Collection.extend(methods);
	}
);