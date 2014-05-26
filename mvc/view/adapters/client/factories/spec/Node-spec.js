define([
	"../Node", 
	"../../nodes/Html", 
	"../../nodes/Text", 
	"../../nodes/Comment", 
	"../../nodes/ControlFlow"], 
	function (NodeFactory, Html, Text, Comment, ControlFlow) {
		describe("NodeFactory", function () {
			describe("#fromString()", function () {
				it("returns Html nodes", function () {
					var node = NodeFactory.fromString("<div>This is a div.<p>It has a baby.</p></div>");
					expect(node instanceof Html).toBe(true);
					expect(node.tagName).toBe("DIV");
					expect(node.childNodes.length).toBe(2);
					expect(node.childNodes[1].tagName).toBe("P");
				});

				it("returns Text nodes", function () {
					var node = NodeFactory.fromString("Just a plain ol' string.");
					expect(node instanceof Text).toBe(true);
					expect(node.nodeValue).toBe("Just a plain ol' string.");
				});

				it("returns Comment nodes", function () {
					var node = NodeFactory.fromString("<!--a comment-->");
					expect(node instanceof Comment).toBe(true);
					expect(node.nodeValue).toBe("a comment");
				});

				it("returns ControlFlow nodes", function () {
					var node = NodeFactory.fromString("{{#each 'everything'}}Do this thing{{/each}}");
					expect(node instanceof ControlFlow).toBe(true);
					expect(node.name).toBe("each");
					expect(node.innerHtml).toBe("Do this thing");
				});
			});
		});
	}
);