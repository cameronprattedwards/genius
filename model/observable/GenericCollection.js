define(["./Collection"], function (Collection) {
	return function (T) {
		return Collection.extend({
			addNew: function () {
				return this.push(new T().valueOf());
			}
		});
	}
});