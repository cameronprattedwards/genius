define(["./Router"], function (baseRouter) {
	function MvcRouter () {};

	MvcRouter.prototype = {
		registerRoute: function (url, obj) {
			baseRouter.registerRoute(url, function (routeParams) {
				var controller = new obj.controller();
				controller[obj.action + "Action"].call(controller, routeParams);
			});
		},
		setLocation: function () {
			return baseRouter.setLocation.apply(baseRouter, arguments);
		},
		setBaseNode: function (node) {
			this.baseNode = node;
		},
		start: function () {}
	};

	return new MvcRouter();
});