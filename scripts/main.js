define(
	[
		"genius/box",
		"genius/Collection",
		"genius/config",
		"genius/deferred",
		"genius/FakeHttpBackend",
		"genius/RealHttpBackend",
		"genius/Resource",
		"genius/RouteProvider",
		"genius/setUtils",
		"genius/types",
		"genius/utils",
		"genius/XHR"
	],
	function (box, Collection, config, deferred, Resource, types, utils) {
		console.log(arguments);

        box.modules.register("realDataModule", {
            HttpBackend: box.kernel.dependency(box.RealHttpBackend)
        });
        box.modules.register("testDataModule", {
            HttpBackend: box.kernel.dependency(box.FakeHttpBackend)
        });
        box.kernel.add(box.modules.realDataModule);

        window.setTimeout(function () {
        	window.genius = {
	        	box: box,
	        	Collection: Collection,
	        	config: config,
	        	deferred: deferred,
	        	Resource: require("genius/Resource"),
	        	types: require("genius/types"),
	        	utils: utils
	        } 
	    });
	}
);