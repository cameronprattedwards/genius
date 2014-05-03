define(["genius/utils/object"], function (o) {
	var config = {};

	return {
		get: function () {
			return config;
		},
		set: function (configObj) {
			o(config).extend(configObj);
		}
	};
});