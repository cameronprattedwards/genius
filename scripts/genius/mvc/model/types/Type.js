define(["genius/utils", "../dirt/Observable"], function (utils, Observable) {
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
			
			utils.extend(baseBaseOptions, baseOptions);

			utils.extend(baseBaseOptions, userOptions);

			var Output = Observable.extend(baseBaseOptions);

			return {
				getInstance: function () {
					return new Output();
				}
			};
		}
	};
});