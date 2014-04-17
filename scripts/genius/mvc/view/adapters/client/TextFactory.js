define(["./Text"], function (Text) {
	return function (html) {
		var nextNodeIndex = html[0].search(/<[^>]+>|\{\{[^\}]+\}\}/),
			txt;

		if (nextNodeIndex !== -1) {
			html[0] = html[0].slice(nextNodeIndex, html[0].length);
			txt = new Text(html[0].slice(0, nextNodeIndex));
		} else {
			txt = new Text(html[0]);
		}

		return [txt];
	}
});