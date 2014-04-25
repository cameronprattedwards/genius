define(["./Type", "genius/utils"], function (Type, utils) {
	return function (T, options) {
		var myOptions = {
			defaultTo: function () {
				return new T({});
			},
			parse: function (value) {
				return new T(value);
			}
		};

		utils.extend(myOptions, options);

		return Type(myOptions)({});
	}
});