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
		}
	};

	var output = function (string) { 
		return new StringWrapper(string); 
	};

	return output;
});