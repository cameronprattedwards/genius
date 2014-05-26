define(["../Attribute"], function (AttributeFactory) {
	describe("AttributeFactory", function () {
		describe("#fromKeyValue()", function () {
			it("returns an attribute with the key and value", function () {
				var node = AttributeFactory.fromKeyValue("id", "myId");
				expect(node.name).toBe("id");
				expect(node.nodeValue).toBe("myId");
			});
		});

		describe("#fromString()", function () {
			it("returns an attribute matching key and value", function () {
				var node = AttributeFactory.fromString("id=\"myId\"");
				expect(node.name).toBe("id");
				expect(node.nodeValue).toBe("myId");
			});

			it("accepts a key with no value", function () {
				var node = AttributeFactory.fromString("selected");
				expect(node.name).toBe("selected");
				expect(node.nodeValue).toBe("");
			});
		});
	});
});