var root = "genius/mvc/model/observable/"
define(["./Date", "./Timespan", root + "Observable", root + "Computed"], function (Date, Timespan, Observable, Computed) {
	function Month(start) {
		var _self = this;

		this.start = new Observable(new Date(start).minus(Timespan.fromDays(start.getDate() - 1)));

		this.weeks = new Computed([this.start], function () {
			var output = [];
			var startVal = _self.start.get();
			var start = startVal.minus(Timespan.fromDays(startVal.date.getDay() + 1));
			var current = start,
				currentMonth = startVal.date.getMonth();

			var i = 0;
			while (current.date.getMonth() <= currentMonth) {
				var week = [];
				for (i = 0; i < 7; i++) {
					current = current.plus(Timespan.fromDays(1));
					week.push(current);
				}
				output.push(week);
			}

			return output;
		});
	};

	return Month;
});