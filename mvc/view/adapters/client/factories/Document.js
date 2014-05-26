define(["genius/model/base/Class", "../nodes/Document", "./Node"], function (Class, Document, NodeFactory) {
	return {
		fromString: function (string, scope) {
			var aString = [string],
				output = new Document(scope);
			while (aString[0].length) {
				output.appendChild(NodeFactory.fromString(aString[0], scope, aString));
			}
			return output;
		}
	};
});