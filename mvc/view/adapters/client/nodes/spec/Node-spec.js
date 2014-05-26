define(["../Node", "genius/utils/array"], function (Node, a) {
	describe("Node", function () {
 		var node = new Node(),
			child = new Node();

		describe("#constructor()", function () {
			it("creates childNodes list", function () {
				expect(node.childNodes instanceof Array).toBe(true);
			});

			it("has a parentNode property", function () {
				expect(node.hasOwnProperty("parentNode")).toBe(true);
			});
		});

		describe("#appendChild()", function () {
			node.appendChild(child);

			it("sets the child's parentNode to itself", function () {
				expect(node).toBe(child.parentNode);
			});

			it("pushes the child onto #childNodes", function () {
				expect(a(node.childNodes).contains(child)).toBe(true);
			});

			it("moves the child to the end of #childNodes if it is already in #childNodes", function () {
				var otherKid1 = new Node(),
					otherKid2 = new Node(),
					otherKid3 = new Node();

				expect(a(node.childNodes).indexOf(child)).toBe(0);
				node.appendChild(child);
				expect(a(node.childNodes).indexOf(child)).toBe(node.childNodes.length - 1);
			});

			it("accepts a node", function () {
				expect(function () { node.appendChild(null); }).toThrow();
			});
		});

		describe("#removeChild()", function () {
			it("accepts one of its own childNodes as a parameter", function () {
				var otherChild = new Node();
				node.appendChild(otherChild);
				expect(function () { node.removeChild(otherChild); }).not.toThrow();
				expect(function () { node.removeChild({}); }).toThrow();
			});

			it("removes the child from #childNodes", function () {
				expect(a(node.childNodes).indexOf(child)).toBe(0);
				node.removeChild(child);
				expect(a(node.childNodes).indexOf(child)).toBe(-1);
			});

			it("sets the child's parentNode to null", function () {
				node.appendChild(child);
				expect(child.parentNode).toBe(node);
				node.removeChild(child);
				expect(child.parentNode).toBe(null);
			});
		});

		describe("#insertBefore", function () {
			it("accepts a toInsert node and a currentlyInserted node", function () {
				expect(function () { node.insertBefore(null, null); }).toThrow();
				expect(function () { node.insertBefore(new Node(), new Node()); }).toThrow();
			});

			it("inserts toInsert before currentlyInserted (if !null)", function () {
				var current = new Node(),
					another = new Node();

				node.appendChild(current);
				node.insertBefore(another, current);
				expect(a(node.childNodes).indexOf(another)).toBe(a(node.childNodes).indexOf(current) - 1);
				expect(another.parentNode).toBe(node);
			});

			it("appends toInsert if currentlyInserted is null", function () {
				var oneMore = new Node();
				node.insertBefore(oneMore, null);
				expect(a(node.childNodes).indexOf(oneMore)).toBe(node.childNodes.length - 1);
			});
		});
	});
});









