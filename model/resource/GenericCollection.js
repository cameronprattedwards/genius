define(["./Collection", "genius/utils/array"], function (Collection, a) {
	return function(T) {
		return Collection.extend({
			parse: function (aValue) {
				var mapped = a(aValue).map(function (value) { return new T(value); });
				return mapped;
			},
			addNew: function () {
				return this.push(new T().valueOf());
			},
			url: function () {
				return T.prototype.url();
			}
		});
	}
});