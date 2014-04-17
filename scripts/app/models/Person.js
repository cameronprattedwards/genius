var root = "genius/mvc/model/";
var deps = [
	root + "resource/Resource",
	root + "types/Number",
	root + "types/String",
	root + "types/Collection",
	root + "types/Boolean"
];
define(deps, function (Resource, Number, String, Collection, Boolean) {
	return Resource.extend({
		id: Number(),
		name: String(),
		url: function () {
			return "/api/person/" + this.id();
		},
		paragraphs: Collection(),
		sleeping: Boolean()
	});
});