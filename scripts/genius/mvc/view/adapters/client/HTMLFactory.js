define(["./HTMLElement", "./bestNode", "require"], function (HTMLElement, bestNode, require) {
	return function (html, bestNode) {
		var el = new HTMLElement();

		var body = /^<([^>]+)>/.exec(html[0])[1];

		el.tagName = /^([^\s]+)/.exec(body)[1];

		var attrString = /^[^\s]+(.*)/.exec(body.replace(/\/\s*$/, ""))[1].trim();

		var individualAttrRegex = /^[^"'\s=\{]+(=("[^"]*")|('[^']*'))?\s*/,
			dirRegex = /^\{\{([^\}]+)\}\}\s*/;

		if (attrString) {
			var attrs = [],
				match;

			while (attrString.length) {
				if (match = individualAttrRegex.exec(attrString)) {
					var attr = match[0];
					attrs.push(attr.trim());
					attrString = attrString.replace(attr, "");
				} else if (match = dirRegex.exec(attrString)) {
					var dir = match[1].trim();
					el.bind(dir);
					attrString = attrString.replace(match[0], "");
				} else {
					throw new Error("Incorrectly formatted HTML tag");
				}
			}

			for (var attr in attrs) {
				var bits = attrs[attr].split("="),
					key = bits[0],
					value = "";

					if (!key)
						console.log("empty: ", attrString, attrString.length, body);

				if (bits.length > 1)
					value = bits[1].replace(/^("|')/, "").replace(/("|')$/, "");

				el.attributes[key] = value;
			}
		}

		var endOfOpeningTag = html[0].search(">") + 1;
		var selfClosing = /^<[^>]+\/>/.test(html[0]);
		html[0] = html[0].slice(endOfOpeningTag, html[0].length);

		if (!selfClosing) {
			var closingTag = new RegExp("^<\\/" + el.tagName + "\\s*>");

			//Does the factory need to handle populating the children?

			var i = 0;
			while (html[0].length && !closingTag.test(html[0])) {
				var children = require("./bestNode")(html);
				el.children.push.apply(el.children, children);
			}

			if (closingTag.test(html[0]))
				html[0] = html[0].slice(html[0].search(">") + 1);
		}

		return [el];
	};
});