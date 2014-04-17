define(["app/views/index/index", "../models/Person"], function (indexView, Person) {
	function IndexController () {};

	IndexController.prototype = {
		index: function (routeParams) {
			console.log("I'm the index controller.");
			indexView.call(document.body, new Person())
		}
	};

	return IndexController;
});