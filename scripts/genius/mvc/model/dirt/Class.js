define(
	["../observable/observableMethods", "../base/Class", "genius/utils", "./setUtils", "../observable/Observable"], 
	function (observableMethods, Class, utils, setUtils, Observable) {
		var methods = observableMethods(Class);

		var holder = methods.init;

		var methods = utils.extend(methods, {
			init: function (properties) {
				holder.apply(this, arguments);

				this.properties = {};

				for (var x in properties) {
					this.createProperty(x, properties[x]);
				}

				var _self = this;

				this.isDirty = new Observable(false);
				this.isDirty.subscribe(function () {
					_self.fire("dirty");
				});

				this.isNew = new Observable(setUtils.current.isNew);

			},
			createProperty: function (name, property) {
				var _self = this;

				var observable = new Observable(property);

				this.properties[name] = observable.subscribe(function () {
					_self.isDirty.set(true);
				}, "dirty");

				this[name] = observable;
			},
			deleteProperty: function (name) {
				this[name].unsubscribe(this.properties[name]);
				delete this[name];
			}
		});

		return Class.extend(methods);
	}
);