define(["./Collection", "genius/utils"], function (Collection, utils) {
	return function(T) {
		return Collection.extend({
			parse: function (aValue) {
				return utils.map(aValue, function (value) { return new T(value); });
			},
			addNew: function () {
				return this.push(new T().valueOf());
			}
		});
	}
});