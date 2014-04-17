define(["genius/base/Class"], function (Class) {
	return Class.extend({
		init: function (name, parent) {
			this.parent = parent;
			this.children = [];
			this.args = [];
			this.name = name;
		},
		populate: function () {},
		compile: function () {},
		"each": function () {},
		"if": function () {}
	});
});