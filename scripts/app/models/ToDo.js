var root = "genius/mvc/model";
define([root + "/resource/Resource", root + "/types/String", root + "/types/Date"], function (Resource, String, Date) {
	return Resource.extend({
		text: String(),
		dueDate: Date()
	});
});