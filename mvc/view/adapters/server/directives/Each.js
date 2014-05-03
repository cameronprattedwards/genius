define([
	"../Directive", 
	"../processHtml", 
	"genius/utils/stackedPromise", 
	"require",
	"genius/utils/deferred"
	], function (Directive, processHtml, stackedPromise, require, deferred) {
	return Directive.extend("each", {
		compile: function (model, iterable) {
			var processHtml = require("../processHtml");

			var compiled = [],
				promises = [],
				output = deferred();

			for (var i = 0; i < iterable.length; i++) {
				(function (i) {
					var promise = processHtml(this.content, iterable[i], null, i, [model]);
					promise.success(function (html) {
						compiled[i] = html;
					});
					promises.push(promise);
				}.call(this, i));
			}

			var stacked = stackedPromise(promises);

			stacked.success(function () {
				output.resolve(compiled.join(""));
			});

			stacked.bind.fail(output);

			return output;
		}
	});
});