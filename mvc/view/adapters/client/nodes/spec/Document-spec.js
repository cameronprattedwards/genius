define(["../Document", "../Node"], function (Document, Node) {
	describe("#construct()", function () {
		it("returns instance of Node", function () {
			expect(new Document() instanceof Node).toBe(true);
		});
	});
});