define([
	"genius/mvc/model/resource/GenericCollection", 
	"./ToDo",
	"genius/mvc/model/observable/Computed"
	], function (GenericCollection, ToDo, Computed) {
	var BaseCollection = GenericCollection(ToDo);
	return BaseCollection.extend({
		init: function () {
			BaseCollection.prototype.init.apply(this, arguments);
			var _self = this;
			this.computedLength = new Computed([this], function () {
				return _self.length;
			});
		}
	});
});