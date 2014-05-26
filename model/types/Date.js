define(["./Type"], function (Type) {
	return Type({
		defaultTo: function () {
			return new Date();
		},
		parse: function (value) {
			return new Date(value);
		}
	});
});