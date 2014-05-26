define(["../Component", "../components"], function (Component, components) {
	var Value = Component.extend({
		setup: function (model) {
			var el = this.element;

			el.addEventListener("keyup", function () {
				model.set(el.value);
			});

			model.subscribe(function (value) {
				if (el.value !== value)
					el.value = value;
			});

			el.setAttribute("value", model.valueOf());
		}
	});	

	components["value"] = Value;

	return Value;
});