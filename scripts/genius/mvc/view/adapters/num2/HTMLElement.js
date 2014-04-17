define(["./Node"], function (Node) {
	return Node.extend({
		init: function () {
			this.childNodes = [];
			this.tagName = "";
			this.attributes = {};
		},
		populate: function (html) {
			var openTag = /<([^>\s]+)[^>]+>/;
			this.tagName = openTag.exec(html)[1];
			var attrs = /<[^>\s]+([^>]+)>/.exec(html)[1].trim().split(/\s+/);
			for (var i = 0; i < attrs.length; i++) {
				var bits = attrs[i].split("="),
					key = bits[0],
					value = "";

				if (bits.length > 1)
					value = bits[1].replace(/^("|')/, "").replace(/("|')$/);

				this.attrs[key] = value;
			}

			var endOfOpenTag = html.search(">") + 1;

			var placeholder = html.slice(endOfOpenTag, html.length);

			if (/^<[^>]+\/>/.test(html.slice(0, endOfOpenTag)));
				return placeholder;
			else
				html = placeholder;

			var closingTag = new RegExp("</" + this.tagName + "\\s*>");

			while (!closingTag.test(html) && html.length) {
				var newNode = direct(html);
				html = newNode.populate(html);
				this.childNodes.push(newNode);
			}

			return html;
		},
		compile: function () {
			var element = document.createElement(this.tagName);
			for (var attr in this.attributes) {
				element.setAttribute(attr, this.attributes[attr]);
			}
			for (var i = 0; i < this.childNodes.length; i++) {
				element.appendChild(this.childNodes[i].compile());
			}
			return element;
		}
	});
});