define(["../base/Class"], function (Class) {
	var Wrapper = Class.extend({
		init: function (value) {
			this.value = value;
		},
		get: function () {
			return this.value;
		},
		set: function (value) {
			this.value = value;
		}
	});

	return Wrapper;
});