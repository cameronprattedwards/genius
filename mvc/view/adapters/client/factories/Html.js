define(["genius/model/base/Class", "../nodes/Html", "genius/utils/string", "./Node", "require", "./Attribute", "./Component", "genius/utils/object"], function (Class, Html, s, NodeFactory, require, AttributeFactory, ComponentFactory, o) {
	var tagRegex = /^<([A-Z][A-Z0-9]*)\b([^>]*)>(.*?)<\/\1>/i,
		attrRegex = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
		compRegex = /\{\{#(([A-Z][A-Z0-9]*)([^(?:\}\})]*)?)\}\}/gi;

	return {
		fromString: function (string, scope) {
			NodeFactory = require("./Node");

			var match = tagRegex.exec(string),
				node = new Html(match[1], scope),
				attrMatch;

			var counter = [match[3]],
				attrBody = s(match[2]).trim();

			while (compMatch = compRegex.exec(attrBody)) {
				var comp = ComponentFactory.fromString(compMatch[0], node.scope);

				node.components[compMatch[2]] = comp;
				attrBody = attrBody.replace(compMatch[0], "");
			}
			
			o(node.scope.components).extend(node.components);

			while (attrMatch = attrRegex.exec(attrBody)) {
				node.setAttribute(attrMatch[1], attrMatch[2] || attrMatch[3], node.scope);
			}

			while (counter[0].length) {
				var newNode = NodeFactory.fromString(counter[0], node.scope, counter);
				node.appendChild(newNode);
			}

			return node;
		}
	};
});