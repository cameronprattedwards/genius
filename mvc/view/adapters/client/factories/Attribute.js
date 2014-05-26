define(["genius/model/base/Class", "../nodes/Attribute", "genius/utils/string"], function (Class, Attribute, s) {
	return {
		fromKeyValue: function (key, value, scope) {
			var node = new Attribute(scope);
			node.name = key;
			node.nodeValue = value || "";
			return node;
		},
		fromString: function (string, scope) {
			string = s(string).trim();
			var equals = string.search("=");
			if (equals == -1) {
				return this.fromKeyValue(string, "");
			} else {
				var regex = /=('|")([^\1]+)\1/g,
					match = regex.exec(string);

				return this.fromKeyValue(string.replace(match[0], ""), match[2]);
			}
		}
	};
});