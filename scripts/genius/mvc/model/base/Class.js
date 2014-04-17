define(["genius/utils", "./extend"], function (utils, extend) {
	function Class() {};

	Class.prototype.init = function () {};

	Class.extend = extend;

	return Class;
});