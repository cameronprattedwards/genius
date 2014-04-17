define(["./Node", "genius/utils", "../../../utils/stackedPromise"], function (Node, utils, stackedPromise) {
	var Template = Node.extend({
		init: function (html) {
			this.children = [];
			this.layout = null;
			this.promises = [];
			this.populate(html);
		},
		layout: function (fileName) {
			var promise = utils.ajax({ url: fileName });
			promise.success(function (html) {
				var tmpl = new Template(html);
				this.layout = tmpl;
			});
			this.promises.push(promise);
		},
		populate: function (html) {
			Node.prototype.populate.call(this, html);
			return stackedPromise(this.promises);
		}
	});

	return Template;
});