define(["./deferred", "fs"], function (deferred, fs) {
	return function (filePath) {
		var output = deferred();

		fs.readFile(filePath, "utf8", function (err, fileContents) {
			if (err)
				return output.reject.apply(output, arguments);

			output.resolve(fileContents);
		});

		return output.promise();
	};
});