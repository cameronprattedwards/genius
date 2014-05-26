define(
	["../observable/observableMethods", "../base/Class", "genius/utils/object", "./setUtils", "../observable/Observable"], 
	function (observableMethods, Class, o, setUtils, Observable) {
		var methods = observableMethods(Class);

		var holder = methods.init;

		var methods = o(methods).extend({
			init: function (properties) {
				holder.apply(this, arguments);

				this.propertySubscriptions = {};

				for (var x in properties) {
					if (!this.hasOwnProperty(x))
						this.createProperty(x, properties[x]);
					else
						this[x].set(properties[x]);
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

				this.propertySubscriptions[name] = observable.subscribe(function () {
					_self.isDirty.set(true);
				}, "dirty");

				this[name] = observable;
			},
			deleteProperty: function (name) {
				this[name].unsubscribe(this.propertySubscriptions[name]);
				delete this[name];
			},
			dirtyProperties: function () {
				var output = {};
				for (var x in this) {
					if (this.hasOwnProperty(x) && this[x].isDirty && this[x].isDirty.get())
						output[x] = this[x].get()
				}
				return output;
			},
			fire: function () {
				for (var evt in this.listeners) {
					for (var callback in this.listeners[evt]) {
						this.listeners[evt][callback].call(this, this);
					}
				}
			}
		});

		return Class.extend(methods);
	}
);