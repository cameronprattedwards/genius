define(["./Text"], function (Text) {
	return function (html) {
		var nextNodeIndex = html[0].search(/<[^>]+>|\{\{(#|\/)[^\}]+\}\}/),
			txt,
			value;

		if (nextNodeIndex !== -1) {
			value = html[0].slice(0, nextNodeIndex);
			txt = new Text(value);
			html[0] = html[0].slice(nextNodeIndex, html[0].length);
		} else {
			value = html[0];
			txt = new Text(value);
			html[0] = "";
		}

		var varRe = /\{\{([^\}\/#]+)\}\}/;

		if (varRe.test(value)) {
			txt.bind(value);
		}

		return [txt];
	}
});