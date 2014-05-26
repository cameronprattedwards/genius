define(["../Document", "../../nodes/Document", "../../nodes/Html"], function (DocumentFactory, Document, Html) {
	describe("DocumentFactory", function () {
		describe("#fromString()", function () {
			it("returns a document", function () {
				var doc = DocumentFactory.fromString("");
				expect(doc instanceof Document).toBe(true);
			});

			it("sets all the template nodes as its children", function () {
				var doc = DocumentFactory.fromString("<link /><div></div><p></p><span></span>");
				expect(doc.childNodes.length).toBe(4);
			});

			it("makes html tags into Html nodes", function () {
				var doc = DocumentFactory.fromString("<a></a><div></div>");
				expect(doc.childNodes.length).toBe(2);
				expect(doc.childNodes[0] instanceof Html).toBe(true);
				expect(doc.childNodes[0].tagName).toBe("A");
				expect(doc.childNodes[1] instanceof Html).toBe(true);
				expect(doc.childNodes[1].tagName).toBe("DIV");
			});
		});
	});
});