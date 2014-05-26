define(["genius/config", "genius/utils/ajax", "./factories/Document", "./Bind"], function (config, ajax, DocumentFactory, Bind) {
	return function (template, model) {
		var node = config.get().baseNode;
		scope = {
			dom: [node],
			components: {},
			model: [model]
		};

		ajax({url: template})
			.success(function (html) {
				console.log(html);
				var doc = DocumentFactory.fromString(html, scope);
				window.doc = doc;
				Bind(node).to(doc);
			})
			.fail(function () {
				console.log("fail", arguments);
			});

	};
});