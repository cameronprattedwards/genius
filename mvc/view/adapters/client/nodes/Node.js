define(["genius/utils/Class"], function (Class) {
	return Class.extend({
		init: function () {
			this.parent = null;
			this.childNodes = [];
		}
	});
});