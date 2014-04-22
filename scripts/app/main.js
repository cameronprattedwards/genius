requirejs.config({
	baseUrl: "scripts"
});

require(["genius/dependencies/test"], function () {
	require([
		"genius/mvc/router/MVCRouter",
		"app/controllers/IndexController"
		], function (Router, IndexController) {
			Router.setBaseNode(document.getElementById("container"));
			Router.registerRoute("/", {
				controller: IndexController,
				action: "index"
			});
	});
});