define(["../dirt/Collection", "genius/utils"], function (Collection, utils) {
	console.log("Collection: ", Collection);
	return function (options) {
		var MyCollection = Collection.extend(utils.extend({
			set: function (value) {
				this.splice.apply(this, [0, this.length].concat(value));
			},
			parse: function (value) {
				return value;
			}
		}, options));

		return {
			getInstance: function () {
				return new MyCollection();
			}
		};
	}
});