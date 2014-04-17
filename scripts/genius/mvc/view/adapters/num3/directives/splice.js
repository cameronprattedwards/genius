define([], function () {
	return function splice(el, index, length) {
		var output = [];

		while (length-- > 0)
			output.push(el.removeChild(el.childNodes[index]));

		for (var i = arguments.length - 1; i >= 2; i--)
			el.insertBefore(arguments[i], el.childNodes[index]);

		return output;
	}
});