define(["genius/base/Class", "genius/view/compile", "./registry"], function (Class, compile, registry) {
	var Controller = Class.extend({
		init: function (req, resp) {
			this.req = req;
			this.resp = resp;
		},
		render: function (filePath, node, model) {
			var _self = this;

			compile(filePath, node, model)
				.success(function (html) { _self.resp.send(html) })
				.fail(function () { console.log("something went wrong:", arguments)});
		}
	});

	var placeholder = Controller.extend;

	Controller.extend = function (string, properties) {
		return registry[string] = placeholder.call(Controller, properties);
	}

	return Controller;
});