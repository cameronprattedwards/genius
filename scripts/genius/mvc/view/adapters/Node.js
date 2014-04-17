define(["genius/mvc/model/base/Class"], function (Class) {
	var Node = Class.extend({
		init: function (tagName) {
			this.tagName = tagName;
			this.children = [];
			this.attributes = {};
		},
		setAttributes: function (html) {
			var attrRegex = /^<[^\s>]+\s([^>\/]+)/;

			if (attrRegex.test(html)) {
				var attrStr = attrRegex.exec(html)[1].trim();
				var attributes = attrStr.split(/\s/);

				for (var i = 0; i < attributes.length; i++) {
					var str = attributes[i],
						bits = str.split("="),
						key = bits[0],
						value = "";
					if (bits.length > 1)
						value = bits[1].replace(/^("|')/, "").replace(/("|')$/, "");
					this.attributes[key] = value;
				}
			}
		},
		pushTag: function (html) {
			var tagName = /^<([^\s>]+)[^>]*>/.exec(html)[1],
				newNode = new Node(tagName);

			newNode.setAttributes(html);

			if (!/^<[^>]+\/>/.test(html))
				html = newNode.populate(html.slice(html.search(">") + 1), html.length);
			else
				html = html.slice(html.search(">") + 1, html.length);

			this.children.push(newNode);
			return html;
		},
		pushText: function (html) {
			this.children.push(html.slice(0, html.search(/<[^>]+>/)));
			return html.slice(html.search(/<[^>]+>/), html.length);
		},
		pushDirective: function () {
			var dirName = /a/.exec(html)[1],
				newDir = new Directive(dirName);

			newDir.setArgs(html);

			html = newDir.populate(html.slice(html.search("}}") + 2), html.length);
			this.children.push(newDir);
			return html;
		},
		populate: function (html) {
			var closingTag = new RegExp("^</" + this.tagName + "\\s*>");

			while (html.length && !closingTag.test(html)) {
				if (/^<[^>]+>/.test(html)) {
					html = this.pushTag(html);
				} else if (/\{\{#[\}]+\}\}/.test(html)) {
					html = this.pushDirective(html);
				} else {
					html = this.pushText(html);
				}
			}

			return html.replace(closingTag, "");
		}
	});

	return Node;
});