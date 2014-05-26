define(["../Html", "../../nodes/Html", "../../nodes/Text", "../../nodes/ControlFlow"], function (HtmlFactory, Html, Text, ControlFlow) {
	describe("HtmlFactory", function () {
		describe("#fromString()", function () {
			it("returns an Html node", function () {
				var node = HtmlFactory.fromString("<div></div>");
				expect(node instanceof Html).toBe(true);
			});

			it("sets the tag name", function () {
				var node = HtmlFactory.fromString("<div></div>");
				expect(node.tagName).toBe("DIV");
			});

			it("creates an attribute tree", function () {
				var node = HtmlFactory.fromString("<div id='slip' class='hip' selected></div>");
				expect(node.attributes.length).toBe(3);
				expect(node.attributes[0].name).toBe("id");
				expect(node.attributes[0].nodeValue).toBe("slip");
				expect(node.attributes[1].name).toBe("class");
				expect(node.attributes[1].nodeValue).toBe("hip");
				expect(node.attributes[2].name).toBe("selected");
				expect(node.attributes[2].nodeValue).toBe("");
			});

			it("adds child nodes", function () {
				var node = HtmlFactory.fromString("<p><span>I'm a span</span>I'm text{{#each 'arg'}}controlFlow contents{{/each}}</p>");
				expect(node.childNodes.length).toBe(3);
				expect(node.childNodes[0] instanceof Html).toBe(true);
				expect(node.childNodes[0].tagName).toBe("SPAN");
				expect(node.childNodes[1] instanceof Text).toBe(true);
				expect(node.childNodes[1].nodeValue).toBe("I'm text");
				expect(node.childNodes[2] instanceof ControlFlow).toBe(true);
				expect(node.childNodes[2].name).toBe("each");
				expect(node.childNodes[2].innerHtml).toBe("controlFlow contents");
			});
		});
	});
});