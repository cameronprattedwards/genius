define(["./Text"], function (Text) {
	return Text.extend({
		compile: function () {
			return [document.createComment(this.value)];
		}
	});
});