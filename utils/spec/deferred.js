define(["assert", "utils/deferred"], function (assert, deferred) {
	describe("deferred", function () {
		var myDeferred = deferred(),
			promiseMethods = ["success", "fail", "always"],
			deferredMethods = ["resolve", "reject"];

		it("is a function", function () {
			assert.equal("function", typeof deferred);
		});

		describe("return value", function () {
			it("is a Deferred object", function () {
				assert.equal("object", typeof myDeferred);

				var allMethods = promiseMethods.concat(deferredMethods);

				for (var i = 0; i < allMethods.length; i++) {
					var method = allMethods[i];
					assert.equal("function", typeof myDeferred[method]);
				}
			});
		});

		describe("#state()", function () {
			it("returns pending for unresolved/unrejected object", function () {
				var newDeferred = deferred();
				assert.equal("pending", newDeferred.state());
			});

			it("returns resolved for resolved object", function () {
				var newDeferred = deferred();
				newDeferred.resolve();
				assert.equal("resolved", newDeferred.state());
			});

			it("returns rejected for rejected object", function () {
				var newDeferred = deferred();
				newDeferred.reject();
				assert.equal("rejected", newDeferred.state());
			});
		});

		describe("#promise()", function () {
			describe("return value", function () {
				var promise = myDeferred.promise();

				it ("is an object", function () {
					assert.equal("object", typeof promise);
				});

				it ("is stripped of resolve() and reject()", function () {
					assert.equal("undefined", typeof promise.resolve);
				});

				//here's a fun detail: the prototype of each deferred is a promise.
				it("is the prototype of its deferred", function () {
					assert.equal(true, promise.isPrototypeOf(myDeferred));
				});

				it("has all methods for attaching success and failure callbacks", function () {
					for (var i = 0; i < promiseMethods.length; i++) {
						var method = promiseMethods[i];
						assert.equal("function", typeof promise[method]);
					}
				});
			});
		});

		describe("#success()", function () {
			it("attaches a success callback", function () {
				var newDeferred = deferred();
				var testString = "";
				newDeferred.success(function () {
					testString = "I succeeded";
				});
				newDeferred.resolve();
				assert.equal("I succeeded", testString);
			});

			it("immediately executes the callback if the deferred is already resolved", function () {
				var newDeferred = deferred(),
					testString = "";
				newDeferred.resolve();
				newDeferred.success(function () {
					testString = "I succeeded";
				});
				assert.equal("I succeeded", testString);
			});

			it("passes the resolution arguments to the callback", function () {
				var newDeferred = deferred(),
					testString = "";

				newDeferred.success(function (a, b, c) {
					testString = a + " " + b + " " + c;
				});

				newDeferred.resolve("I'm", "a", "success");

				assert.equal("I'm a success", testString);
			});
		});

		describe("#fail()", function () {
			it("attaches a failure callback", function () {
				var newDeferred = deferred();
				var testString = "";
				newDeferred.fail(function () {
					testString = "I failed";
				});
				newDeferred.reject();
				assert.equal("I failed", testString);
			});

			it("immediately executes the callback if the deferred is already rejected", function () {
				var newDeferred = deferred(),
					testString = "";
				newDeferred.reject();
				newDeferred.fail(function () {
					testString = "I failed";
				});
				assert.equal("I failed", testString);
			});

			it("passes the rejection arguments to the callback", function () {
				var newDeferred = deferred(),
					testString = "";

				newDeferred.fail(function (a, b, c) {
					testString = a + " " + b + " " + c;
				});

				newDeferred.reject("I'm", "a", "failure");

				assert.equal("I'm a failure", testString);
			});
		});

		describe("#always()", function () {
			it("attaches a callback for completion, regardless of success or failure", function () {
				var successDeferred = deferred();
				var testString = "";

				successDeferred.always(function () {
					testString = "I'm complete, one way or the other";
				});

				successDeferred.resolve();

				assert.equal("I'm complete, one way or the other", testString);

				var failDeferred = deferred();
				var anotherTestString = "";

				failDeferred.always(function () {
					anotherTestString = "I'm complete, one way or the other";
				});

				failDeferred.reject();

				assert.equal("I'm complete, one way or the other", anotherTestString);
			});
		});

		describe("#resolve()", function () {
			it("sets its state to resolved", function () {
				var newDeferred = deferred();
				newDeferred.resolve();
				assert.equal("resolved", newDeferred.state());
			});

			it("executes all success and always callbacks", function () {
				var newDeferred = deferred(),
					str1,
					str2,
					str3;

				newDeferred.always(function () {
					str3 = "this always happens";
				});

				newDeferred.success(function () {
					str1 = "I";
				})

				newDeferred.success(function () {
					str2 = "succeeded";
				});

				newDeferred.resolve();

				assert.equal("I", str1);
				assert.equal("succeeded", str2);
				assert.equal("this always happens", str3);
			});
		});

		describe("#reject()", function () {
			it("sets its state to rejected", function () {
				var newDeferred = deferred();
				newDeferred.reject();
				assert.equal("rejected", newDeferred.state());
			});

			it("executes all fail and always callbacks", function () {
				var newDeferred = deferred(),
					str1,
					str2,
					str3;

				newDeferred.always(function () {
					str3 = "this always happens";
				});

				newDeferred.fail(function () {
					str1 = "I";
				})

				newDeferred.fail(function () {
					str2 = "failed";
				});

				newDeferred.reject();

				assert.equal("I", str1);
				assert.equal("failed", str2);
				assert.equal("this always happens", str3);
			});
		});
	});
});







































