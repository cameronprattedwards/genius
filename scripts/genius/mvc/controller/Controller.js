define(["genius/mvc/model/base/Class", "genius/mvc/view/adapters/client/compile"], function (Class, compile) {
	return Class.extend({
		render: function (filePath, model) {
			compile(filePath, document.body, model);
		}
	});
});