define([], function () {
	function Event(args) {
		this.args = args;
	}

	Event.prototype = {
		compile: function (model, el) {
			var evtName,
				callback,
				_self = this;

			with (model) {
				evtName = eval(_self.args[0]);
				callback = eval(_self.args[1]);
			}

			el.addEventListener(evtName, callback);
		}
	};

	return Event;
});