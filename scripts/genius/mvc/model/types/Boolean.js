define(["./Type"], function (Type) {
	return Type({
		parse: function (value) {
			return !(!value);
		},
		defaultTo: function () {
			return false;
		}
	});
});