define(["../dirt/Collection", "genius/utils/object"], function (Collection, o) {
	console.log("Collection: ", Collection);
	return function (options) {
		var finalOptions = o({
			set: function (value) {
				this.splice.apply(this, [0, this.length].concat(value));
			},
			parse: function (value) {
				return value;
			}
		}).extend(options);

		var MyCollection = Collection.extend(finalOptions);

		return {
			getInstance: function () {
				return new MyCollection();
			}
		};
	}
});