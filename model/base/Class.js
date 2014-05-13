define(["./extend"], function (extend) {
	function Class() {};

	Class.prototype.init = function () {};

	Class.extend = extend;

	return Class;
});