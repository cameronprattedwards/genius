define(["genius/utils", "genius/mvc/model/base/Class"], function (utils, Class) {
	var Timespan = Class.extend({
		init: function (milliseconds) {
			this.milliseconds = milliseconds;
		}
	});

	utils.extend(Timespan, {
		fromMilliseconds: function (milliseconds) {
			return new Timespan(milliseconds);
		},
		fromSeconds: function (seconds) {
			return new Timespan(seconds * 1000);
		},
		fromMinutes: function (minutes) {
			return new Timespan(minutes * 60000);
		},
		fromHours: function (hours) {
			return new Timespan(hours * 3600000);
		},
		fromDays: function (days) {
			return new Timespan(days * 86400000)
		},
		fromWeeks: function (weeks) {
			return new Timespan((weeks * 86400000) * 7);
		}
	});

	return Timespan;
});