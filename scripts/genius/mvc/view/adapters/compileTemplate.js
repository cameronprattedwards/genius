define(["genius/utils", "./TemplateClass", "./translate"], function (utils, Template, translate) {
	return function (fileName, baseNode, model) {
		var promise = utils.ajax({ url: fileName });
		promise.success(function (html) {
			while (baseNode.firstChild)
				baseNode.removeChild(baseNode.firstChild);

			var tmpl = new Template(html);

			for (var i = 0; i < tmpl.children.length; i++) {
				baseNode.appendChild(translate(tmpl.children[i], model));
			}
		});
	}
});