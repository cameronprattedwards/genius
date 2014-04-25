define([
	"genius/mvc/controller/Controller",
	"../models/ViewModel"
	], 
	function (Controller, ViewModel) {
		return Controller.extend({
			index: function () {
				var model = new ViewModel();
				window.model = model;

				this.render("/scripts/app/views/index/index.html", model);
			}
		});
});