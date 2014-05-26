define(["../Component", "../components"], function (Component, components) {
	var Evt = Component.extend({
		setup: function (evtName, callback) {
			this.element.addEventListener(evtName, callback);
		}
	});

	components["event"] = Evt;

	return Evt;
});