define([], function () {
	function Value(args) {
		this.args = args;
	};

	Value.prototype = {
		compile: function (model, element) {
			var observable,
				_self = this;

			with (model) {
				observable = eval(_self.args[0]);
			}

			element.addEventListener("keyup", function () {
				observable.set(this.value);
			});

			element.value = observable.get();

			function update(newValue) {
				if (element.value !== newValue)
					element.value = newValue;
			}

			observable.subscribe(update);
		}
	};

	return Value;
});