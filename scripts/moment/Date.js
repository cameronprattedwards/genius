define(["genius/utils"], function (utils) {
	function DateWrapper(date) {
		this.date = date;
	}

	DateWrapper.prototype = {};

	utils.extend(DateWrapper.prototype, {
		minus: function (timespan) {
			var stamp = this.date.getTime() - timespan.milliseconds;
			var date = new Date(stamp);
			return new DateWrapper(date);
		},
		plus: function (timespan) {
			var stamp = this.date.getTime() + timespan.milliseconds;
			var date = new Date(stamp);
			return new DateWrapper(date);
		}
	});

	return DateWrapper;
});