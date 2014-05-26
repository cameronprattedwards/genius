define(["genius/utils/fs", "genius/utils/deferred", "./processHtml"], function (fs, deferred, processHtml) {
	function compile(filePath, node, model, body) {
		var output = deferred();

		function processCallback(processed) {
			output.resolve(processed);
		}

		function successCallback(html) {
			var promise = processHtml(html, model, body);

			promise.success(processCallback);

			promise.fail(function () {
				output.reject.apply(output, arguments);
			});
		}

		fs(filePath)
			.success(successCallback)
			.bind.fail(output);

		return output.promise();
	}

	return compile;
});