define(["../Node"], function (Node) {
	describe("Node", function () {
		describe("#constructor()", function () {
			var parent = new Node();
			var node = new Node(parent);
		
			it("creates childNodes list", function () {
				assert.equal(true, node.childNodes instanceof Array);
			});

			it("accepts and stores a parent", function () {
				assert.equal(node.parent, parent);
			});
		});
	});
});