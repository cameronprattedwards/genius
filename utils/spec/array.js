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
			var arr = a([1,2,3]);
			it("returns an array", function () {
				assert.equal(typeof a([1,2,3]))
			});
		});
	});
});