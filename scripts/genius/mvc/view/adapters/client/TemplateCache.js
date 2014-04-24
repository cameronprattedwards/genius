define(["genius/utils", "genius/utils/deferred"], function (utils, deferred) {
	var templates = {};

	return function (url) {
		var output = deferred();

		if (templates[url]) {
			output.resolve(templates[url]);
		} else {
			var promise = utils.ajax({ url: url });

			promise.success(function (html) {
				templates[url] = PseudoDomFactory(html);
				output.resolve(templates[url]);
			});

			promise.fail(function () {
				output.reject.apply(output, arguments);
			});
		}

		return output.promise();
	}
});