define([
	"genius/utils/deferred", 
	"./compile", 
	"./Directive", 
	"genius/utils/stackedPromise",
	"require",
	"./registry",
	"./directives/Each",
	"genius/utils/string"], function (deferred, compile, directive, stackedPromise, require, registry, each, s) {
	var layoutRegex = /\{\{\#layout\s\"([^\"]+)\"\s\/\}\}/g,
		bodyRegex = /\{\{#doBody\s([^\/]*)\/\}\}/g,
		varRegex = /\{\{([^\}#]+)\}\}/g,
		dirRegex = /\{\{\#([^\s\/]+)\s([^\}\/]+)\}\}/g;

	return function (html, model, body, $index, parents) {
		var output = deferred(),
			promises = [],
			doBody,
			dirMatch,
			varMatch,
			layoutMatch,
			marker = 0;

		if (doBody = bodyRegex.exec(html)) {
			html = html.replace(doBody[0], body);
		}

		while (dirMatch = dirRegex.exec(html.substring(marker, html.length))) {
			(function () {
				var startIndex = html.search(dirMatch[0]) + dirMatch[0].length,
					closingTag = "{{/" + dirMatch[1] + "}}",
					closeIndex = html.search(closingTag),
					content = html.substring(startIndex, closeIndex),
					dir = new registry[dirMatch[1]](content),
					args = dirMatch[2].trim().split(/\s+/),
					innerMatch = dirMatch[0];

				dir.content = content;

				marker = closeIndex + closingTag.length;

				for (var i = 0; i < args.length; i++) {
					with (model) {
						var thing = eval(args[i]);
						dir.args.push(thing);
					}
				}

				var promise = dir.compile.apply(dir, [model].concat(dir.args));

				promise.success(function (content) {
					var start = html.search(innerMatch);
					var end = html.search(closingTag) + closingTag.length;

					html = s(html)
						.splice(start, end - start, content);
				});

				promises.push(promise);
			}());
		}

		var matches = [],
			compiled = [];

		while (varMatch = varRegex.exec(html)) {
			var toInsert;
			matches.push(varMatch);

			with (model) {
				toInsert = eval(varMatch[1]);
			}

			compiled.push(toInsert);
		}

		for (var i = 0; i < matches.length; i++) {
			if (typeof compiled[i] == "undefined")
				console.log(matches[i]);
			html = html.replace(matches[i][0], compiled[i].valueOf());
		}

		var stacked = stackedPromise(promises);

		if (layoutMatch = layoutRegex.exec(html)) {
			var fileName = layoutMatch[1].trim().replace(/^('|")/, "").replace(/("|')$/, "");
			html = html.replace(layoutMatch[0], "");

			stacked.success(function () {
				var compile = require("./compile");
				var promise = compile(fileName, null, model, html);
				promise
					.success(function (wrapped) {
						output.resolve(wrapped);
					})
					.fail(function () {
						output.reject.apply(output, arguments);
					});
			});
		} else {
			stacked.success(function () {
				output.resolve(html);
			});
		}

		stacked.fail(function () {
			output.reject.apply(output, arguments);
		});

		return output.promise();
	}
});