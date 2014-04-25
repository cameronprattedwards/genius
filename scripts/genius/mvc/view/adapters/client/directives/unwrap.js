define([], function () {
	return function (obj) {
		return obj.get ? obj.get() : obj;
	};
});