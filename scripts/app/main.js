requirejs.config({
	baseUrl: "scripts"
});

require(["genius/dependencies/test"], function () {
	require([
		"genius/mvc/router/MVCRouter",
		"app/controllers/IndexController", 
		"moment/Date", 
		"moment/Timespan",
		"moment/Month"
		], function (Router, IndexController, Date, Timespan, Month) {
			Router.setBaseNode(document.getElementById("container"));
			Router.registerRoute("/", {
				controller: IndexController,
				action: "index"
			});

			window.DateWrapper = Date;
			window.Timespan = Timespan;
			window.Month = Month;
	});
});