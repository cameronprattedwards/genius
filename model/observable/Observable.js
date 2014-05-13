define(["./Wrapper", "./observableMethods", "genius/utils/object"], function (Wrapper, methods, o) {
	var methods = methods(Wrapper);

	o(methods).extend({
		fire: function () {
			for (var evt in this.listeners) {
				for (var callback in this.listeners[evt]) {
					this.listeners[evt][callback].call(this, this.get());
				}
			}
		},
		set: function () {
			var value = this.value;
			Wrapper.prototype.set.apply(this, arguments);
			if (this.value !== value)
				this.fire();
		}
	});

	var Observable = Wrapper.extend(methods);

	return Observable;
});