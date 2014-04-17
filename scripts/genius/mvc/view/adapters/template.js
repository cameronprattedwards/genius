define([], function () {
	function Node(tagName) {
		this.tagName = tagName;
		this.children = [];
		this.attributes = {};
	}

	function template (html) {
		html = html.replace(/>\s*\n*</, "><").trim();
		var outer = new Node(),
			index = 0,
			left = html;
		//Find a tag or some text
		if (!/^<[^>+]>/.test(left)) {
			//Tag is up first.
			var firstTagName = /^<([^\s>]+)>/.exec(left)[1];
			outer.children.push(new Node(firstTagName));
			left = left.slice(0, index = left.search(">"))
		} else {
			index = left.search(/^<[^>+]>/);
			outer.children.push(left.slice(0, index));
		}
		return outer;
	}
});