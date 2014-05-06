define(["assert", "utils/fs"], function (assert, fs) {
	describe("fs", function () {
		var returned = fs("utils/spec/test.txt");

		it("is a function", function () {
			assert.equal("function", typeof fs);
		});

		describe("return value", function () {
			it("is a promise", function () {
				//Does duck typing
				var promiseMethods = ["success", "fail", "always"];

				for (var i = 0; i < promiseMethods.length; i++) {
					assert.equal("function", typeof returned[promiseMethods[i]]);
				}
			});
		});

		describe("returned promise", function () {
			it("resolves with the file's contents", function (done) {
				returned.success(function (fileContents) {
					assert.equal(fileContents, "This is text.");
					done();
				});

				returned.fail(function (errorMessage) {
					assert.fail(errorMessage, undefined, "This FS call should not fail.");
					done();
				});
			});

			it("rejects with an error", function () {
				var returned = fs("utils/spec/notfound.txt");

				returned.fail(function (errorMessage) {
					assert.equal("object", typeof errorMessage);
				});
			});
		});
	});
});