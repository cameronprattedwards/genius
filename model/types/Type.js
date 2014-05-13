define(["genius/utils/object", "../dirt/Observable"], function (o, Observable) {
	return function (baseOptions) {
		return function (userOptions) {
			var baseBaseOptions = {
				init: function (value) {
					Observable.prototype.init.apply(this, arguments);
					if (!value)
						this.set(this.defaultTo());
				},
				defaultTo: function () {},
				parse: function (value) {
					return value;
				}
			};
			
			o(baseBaseOptions).extend(baseOptions);

			o(baseBaseOptions).extend(userOptions);

			var Output = Observable.extend(baseBaseOptions);

			return {
				getInstance: function () {
					return new Output();
				}
			};
		}
	};
});