define(["./utils", "./extend"], function (utils, extend) {
	function Collection() {};

	Collection.prototype = [];

	Collection.extend = extend;

	return Collection;
});