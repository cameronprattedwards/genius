define(["./Collection"], function (Collection) {
	return function (T) {
		return Collection.extend({
			addNew: function () {
				this.push(new T().valueOf());
			}
		});
	}
});