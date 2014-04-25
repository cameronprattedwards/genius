var root = "genius/mvc/model";
define([root + "/resource/Resource", root + "/types/String", root + "/types/Date", root + "/types/Number"], function (Resource, String, Date, Number) {
	return Resource.extend({
		text: String(),
		dueDate: Date(),
		id: Number(),
		url: function () { 
			return "/api/todos/" + (this.id ? this.id.get() : "");
		}
	});
});