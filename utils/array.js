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
		},
		indexOf: function (value) {
			var arr = this.array;

			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === value)
					return i;
			}

			return -1;
		},
		forEach: function (callback) {
			var arr = this.array;

			for (var i = 0; i < arr.length; i++) {
				callback.apply(arr[i], [arr[i], i, arr]);
			}

			return this;
		},
		some: function (callback) {
			var arr = this.array;

			for (var i = 0; i < arr.length; i++) {
				if (callback.apply(arr[i], [arr[i], i, arr]))
					return true;
			}

			return false;
		},
		every: function (callback) {
			var arr = this.array;

			for (var i = 0; i < arr.length; i++) {
				if (!callback.apply(arr[i], [arr[i], i, arr]))
					return false;
			}

			return true;
		},
		reduce: function (callback, initialValue) {
			var i = initialValue ? 0 : 1;

			initialValue = initialValue || this.array[0];

			var arr = this.array;

			for ( ; i < arr.length; i++) {
				initialValue = callback.call(arr[i], initialValue, arr[i], i, arr);
			}

			return initialValue;
		}
	};

	return function (array) { return new ArrayWrapper(array); };
});