define(["genius/base/Class", "./router"], function (Class, router) {
	return Class.extend({
		init: function () {
			this.children = [];
		},
		populate: function (html) {
			while (html.length && !this.closingTag.test(html))
				html = router.direct.call(this, html);
		}
	});
});