define(["genius/utils", "./Template"], function (utils, Template) {
	return function (url, node, model) {
		var promise = utils.ajax({
			url: url
		});

		promise.success(function (html) {
			var tmpl = new Template(html, node, model);
		});

		promise.fail(function () {
			console.log("AJAX failed", arguments);
		});
	}
});