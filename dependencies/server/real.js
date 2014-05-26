define("genius/Router", ["genius/mvc/router/adapters/server/Router"], function (Router) {
	return Router;
});

define("genius/mvc/view/compile", ["genius/mvc/view/adapters/server/compile"], function (compile) {
	return compile;
});

define("genius/Backend", ["genius/model/adapters/mongo"], function (mongo) {
	return mongo;
});