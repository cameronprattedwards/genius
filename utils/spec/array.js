requirejs(["assert", "utils/array"], function (assert, a) {
	describe("a", function () {
		describe("#constructor()", function () {
			it("wraps its input", function () {
				var inner = [1,2,3];
				var wrapped = a(inner);
				assert.equal(inner, wrapped.array);
			});
		});

		describe("#map()", function () {
			var inner = [1,2,3],
				arr = a(inner),
				returnedValue = a([1,2,3]).map(function (val) { return val; });

			describe("return value", function () {
				it("is an array", function () {
					assert.equal(true, returnedValue instanceof Array);
				});

				it("is the result of calling .push() on the copy with result of the callback at each array value", function () {
					var incremented = arr.map(function (val) { return val + 1; });
					
					for (var i = 0; i < incremented.length; i++) {
						assert.equal(incremented[i], inner[i] + 1);
					}

					var multiplied = arr.map(function (val) { return val * 2; });
					
					for (var i = 0; i < multiplied.length; i++) {
						assert.equal(multiplied[i], inner[i] * 2);
					}
				});

			});


			it("does not modify the original array", function () {
				assert.notStrictEqual(inner, returnedValue);
			});

			// It accepts a single parameter, which is a callback.

			describe("callback parameters", function () {
				describe("first parameter", function () {
					it("is the array value at the current index", function () {
						var copy = [];
						arr.map(function (val) { copy.push(val); return val; });

						for (var i = 0; i < copy.length; i++) {
							assert.equal(inner[i], copy[i]);
						}
					});
				});

				describe("second parameter", function () {
					it("is the current index", function () {
						var copy = [];
						arr.map(function (val, index) { copy.push(index); return val; });

						for (var i = 0; i < copy.length; i++) {
							assert.equal(copy[i], i);
						}
					});
				});

				describe("third parameter", function () {
					it("is the wrapped array", function () {
						var copy = [];
						arr.map(function (val, index, array) { copy.push(array); return val; });

						for (var i = 0; i < copy.length; i++) {
							assert.strictEqual(copy[i], inner);
						}
					});
				});
			});

			it("executes the callback for each array entry", function () {
				var i = 0;
				arr.map(function (val) { i += val; return val; });
				assert.equal(i, 6);
			});
		});

		describe("#filter()", function () {
			var inner = [1,2,3,4,5],
				arr = a(inner),
				returnedValue = arr.filter(function (val) { return val % 2 !== 0 });

			describe("return value", function () {
				it("is an array", function () {
					assert.equal(true, returnedValue instanceof Array);
				});

				it("is a collection of array entries for which the callback returns true", function () {
					for (var i = 0; i < returnedValue.length; i++) {
						assert.equal(true, returnedValue[i] % 2 !== 0);
					}
				});
			});

			it("does not modify the original array", function () {
				assert.notStrictEqual(returnedValue, inner);
			});

			describe("callback parameters", function () {
				describe("first parameter", function () {
					it("is the array value at the current index", function () {
						var copy = [];
						arr.filter(function (val) { copy.push(val); return true; });

						for (var i = 0; i < copy.length; i++) {
							assert.equal(inner[i], copy[i]);
						}
					});
				});

				describe("second parameter", function () {
					it("is the current index", function () {
						var copy = [];
						arr.filter(function (val, index) { copy.push(index); return true; });

						for (var i = 0; i < copy.length; i++) {
							assert.equal(copy[i], i);
						}
					});
				});

				describe("third parameter", function () {
					it("is the wrapped array", function () {
						var copy = [];
						arr.filter(function (val, index, array) { copy.push(array); return true; });

						for (var i = 0; i < copy.length; i++) {
							assert.strictEqual(copy[i], inner);
						}
					});
				});
			});

			it("executes the callback for each array entry", function () {
				var i = 0;
				arr.filter(function (val) { i += val; return true; });
				assert.equal(i, 15);
			});			
		});
	});
});