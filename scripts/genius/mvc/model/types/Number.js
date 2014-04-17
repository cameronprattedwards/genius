define(["./Type"], function (Type) {
	return Type({
		parse: function (value) {
			return parseFloat(value);
		},
		defaultTo: function () {
			return 0;
		}
	});
});