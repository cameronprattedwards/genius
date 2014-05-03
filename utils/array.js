define([], function () {
	function ArrayWrapper(array) {
		this.array = array;
	};

	ArrayWrapper.prototype = {
		map: function (callback) {
			var output = [];

			for (var i = 0; i < this.array.length; i++) {
				output.push(callback.call(this.array[i], this.array[i], i, this.array));
			}

			return output;
		},
		filter: function (callback) {
			var output = [];

			for (var i = 0; i < this.array.length; i++) {
				if (callback.call(this.array[i], this.array[i], i, this.array))
					output.push(this.array[i]);
			}

			return output;
		}
	};

	return function (array) { return new ArrayWrapper(array); };
});