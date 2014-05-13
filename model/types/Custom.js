define(["./Type", "genius/utils/object"], function (Type, o) {
	return function (T, options) {
		var myOptions = {
			defaultTo: function () {
				return new T({});
			},
			parse: function (value) {
				return new T(value);
			}
		};

		o(myOptions).extend(options);

		return (Type(myOptions))({});
	}
});