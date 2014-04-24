define(["./directives/Template", "./Comment"], function (Template, Comment) {
	return function (url, node, model) {
		var promise = TemplateCache(url);

		promise.success(function (pseudoDom) {
			var children = pseudoDom.compile(model, parent);
			for (var i = 0; i < children.length; i++)
				node.appendChild(children[i]);
		});
	}
});