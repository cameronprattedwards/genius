define([
	"genius/mvc/controller/Controller",
	"../models/ViewModelFactory"
	], 
	function (Controller, ViewModelFactory) {
		return Controller.extend({
			index: function () {
				var model = ViewModelFactory.dummy();
				window.model = model;

				this.render("/scripts/app/views/index/index.html", model);
			}
		});
});