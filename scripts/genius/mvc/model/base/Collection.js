define(["genius/utils", "./extend"], function (utils, extend) {
	function Collection() {};

	Collection.prototype = [];

	Collection.prototype.init = function () {};

	Collection.extend = extend;

	return Collection.extend({
		init: function (value) {
			if (value)
				Array.prototype.splice.apply(this, [0, this.length].concat(value));
		}
	});
});