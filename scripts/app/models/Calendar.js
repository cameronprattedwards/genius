define([
	"genius/mvc/model/base/Class", 
	"genius/mvc/model/observable/Observable",
	"genius/mvc/model/observable/Computed"
	], function (Class, Observable, Computed) {
	return Class.extend({
		init: function (date) {
			var _self = this;

			this.start = new Observable(date);

			this.weeks = new Computed([this.start], function () {
				var start = _self.start
			});
		}
	});
});