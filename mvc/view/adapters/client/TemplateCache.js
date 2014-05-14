define(["genius/utils/ajax", "genius/utils/deferred", "./PseudoDomFactory"], function (ajax, deferred, PseudoDomFactory) {
	var templates = {};

	return function (url) {
		var output = deferred();

		if (templates[url]) {
			output.resolve(templates[url]);
		} else {
			var promise = ajax({ url: url });

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