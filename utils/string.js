define([], function () {
	function StringWrapper(string) {
		this.string = string;
	};

	StringWrapper.prototype = {
		splice: function(index, length, replacement) { 
			var str = this.string;

			return str.substring(0, index)
			+ replacement
			+ str.substring(index + length, str.length);
		},
		truncate: function (length) {
			var str = this.string;

			if (str.length > length && str.charAt(length) !== " ")
				length = str.lastIndexOf(" ");

			var output = str.substring(0, length);
			if (str.length > length) {
				output += "...";
			}

			return output;
		},
		trim: function () {
			return this.string.replace(/^\s*/, "").replace(/\s*$/, "");
		}
	};

	var output = function (string) { 
		return new StringWrapper(string); 
	};

	return output;
});