define(["./HTMLElement", "./BestNodeGetter"], function (HTMLElement, bestNode) {
	return function (html, model) {
		var el = new HTMLElement();

		var body = /^<([^>]+)>/.exec(html[0])[1];

		el.tagName = /^([^\s]+)/.exec(body)[1];

		var attrs = /^[^\s]+(.*)/.exec(body)[1].trim().split(/\s+/);

		for (var attr in attrs) {
			var bits = attr.split("="),
				key = bits[0],
				value = "";

			if (bits.length > 1)
				value = bits[1].replace(/^("|')/, "").replace(/("|')$/, "");

			el.attributes[key] = value;
		}

		var endOfOpeningTag = html[0].search(">") + 1;
		html[0] = html[0].slice(endOfOpeningTag, html.length);

		var closingTag = new RegExp("<\\/" + el.tagName + "\\s*>");

		//Does the factory need to handle populating the children?

		while (html[0].length && !closingTag.test(html)) {
			var children = bestNode(html, model);
			el.splice.apply(el, [0].concat(children));
		}

		return [el];
	};
});