requirejs.config({
	baseUrl: "scripts"
});

require(["genius/dependencies/test"], function () {
	require(["genius/mvc/router/MvcRouter", "app/controllers/IndexController", "genius/mvc/view/adapters/compileTemplate"], function (router, IndexController, compileTemplate) {
		router.registerRoute("/", {
			controller: IndexController,
			action: "index"
		});

		compileTemplate(
			"/scripts/app/views/index/index.html", 
			document.getElementById("container"), 
			{ paragraphs: [1, 2, 3], sleeping: true }
		);
	});
});