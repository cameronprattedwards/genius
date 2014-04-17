define([], function () {
	function toArray () {
		return Array.prototype.slice.call(this, 0);
	};

	function arrayWrap (element) {
		function MyClass () {
			var noMutateMethods = [
				"concat", 
				"every", 
				"filter", 
				"forEach", 
				"indexOf", 
				"lastIndexOf",
				"map",
				"reduce",
				"reduceRight",
				"slice",
				"some"
			];

			for (var i = 0; i < noMutateMethods.length; i++) {
				var methodName = noMutateMethods[i];
				this[methodName] = function (methodName) {
					var output = toArray.call(this);
					return output[methodName].apply(output, toArray.call(arguments).slice(1));
				}.bind(this, methodName);
			}

			this.pop = function () {
				return element.removeChild(element.lastChild);
			};

			this.push = function () {
				for (var i = 0; i < arguments.length; i++) {
					element.appendChild(arguments[i]);
				}
				return this.length;
			};

			this.reverse = function (start, end) {
				if (typeof start == "undefined" || typeof end == "undefined")
					return this.reverse(0, this.length - 1);
				if (start >= end)
					return;
				var temp = this[start];
				element.insertBefore(this[end], this[start]);
				element.insertBefore(temp, this[end + 1]);
				this.reverse(++start, --end);
				return this;
			};

			this.shift = function () {
				var output = this[0];
				element.removeChild(output);
				return output;
			};

			this.splice = function (index, length, replacements) {
				var output = [];

				while (length-- > 0)
					output.push(element.removeChild(this[index]));

				for (var i = arguments.length - 1; i >= 2; i--) {
					element.insertBefore(arguments[i], this[index]);
				}

				return output;
			};

			this.unshift = function (node) {
				element.insertBefore(node, this[0]);
				return this.length;
			};
		};

		MyClass.prototype = element.childNodes;

		return new MyClass();
	}

	return arrayWrap;
});