define(["../../factories/Html", "../Node"], function (HtmlFactory, Node) {
	describe("Html", function () {
		var node = HtmlFactory.fromString("<span id=\"myId\" class=\"myClass\"></span>");

		it("inherits from Node", function () {
			expect(node instanceof Node).toBe(true);
		});

		describe("#getAttribute()", function () {
			it("returns the string value of the attribute", function () {
				expect(node.getAttribute("id")).toBe("myId");
				expect(node.getAttribute("class")).toBe("myClass");
			});
		});

		describe("#setAttribute()", function () {
			it("sets the string value of the attribute", function () {
				expect(node.attributes.length).toBe(2);
				node.setAttribute("id", "anotherid");
				expect(node.attributes.length).toBe(2);
			});

			it("adds an attribute if necessary", function () {
				expect(node.attributes.length).toBe(2);
				node.setAttribute("myattr", "anotherattr");
				expect(node.attributes.length).toBe(3);
				expect(node.attributes[2].nodeValue).toBe("anotherattr");
			});
		});
	});
});