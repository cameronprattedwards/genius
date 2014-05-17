define([], function () {
	function ArrayWrapper(array) {
		this.array = array;
	};

	ArrayWrapper.prototype = {
		map: function (callback) {
			if (Array.prototype.map)
				return Array.prototype.map.apply(this.array, arguments);

			var output = [];

			for (var i = 0; i < this.array.length; i++) {
				output.push(callback.call(this.array[i], this.array[i], i, this.array));
			}

			return output;
		},
		flatten: function () {
			var output = [];
			for (var i = 0; i < this.array.length; i++)
				output.push.apply(output, this.array[i]);
			return output;
		},
		filter: function (callback) {
			if (Array.prototype.filter)
				return Array.prototype.filter.apply(this.array, arguments);

			var output = [];

			for (var i = 0; i < this.array.length; i++) {
				if (callback.call(this.array[i], this.array[i], i, this.array))
					output.push(this.array[i]);
			}

			return output;
		},
		indexOf: function (value) {
			if (Array.prototype.indexOf)
				return Array.prototype.indexOf.apply(this.array, arguments);

			var arr = this.array;

			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === value)
					return i;
			}

			return -1;
		},
		forEach: function (callback) {
			if (Array.prototype.forEach)
				return Array.prototype.forEach.apply(this.array, arguments);

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
		},
		sync: function (array) {
			var i = 0;

			for ( ; i < array.length; i++) {
				if (this.array[i] === array[i])
					continue;

				this.array.splice(i, 0, array[i]);
			}

			this.array.splice(i, this.array.length - i);

			return this.array;
		},
		contains: function (value) {
			return this.indexOf(value) !== -1;
		},
		remove: function (value) {
			while (this.contains(value)) {
				this.array.splice(this.indexOf(value), 1);
			}
		},
		truncate: function () {
			this.array.splice(0, this.array.length);
		}
	};

	return function (array) { return new ArrayWrapper(array); };
});