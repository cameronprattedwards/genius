define(["./Wrapper", "./observableMethods", "genius/utils"], function (Wrapper, methods, utils) {
	var methods = methods(Wrapper);

	utils.extend(methods, {
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