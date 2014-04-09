define(["./utils", "./extend"], function (utils, extend) {
	function Class() {};

	Class.extend = extend;

	return Class;
});