define(["../nodes/components", "../nodes/Component", "genius/utils/string"], function (components, Component, s) {
	function split(string, model, domParents, modelParents, components) {
		with (model) {
			return eval("[" + string + "]");
		}
	}

	function interpolate(string, scope) {
		return split(string, scope.model[0], scope.dom, scope.model, scope.components);
	}
	
	return {
		fromString: function (string, scope) {
			var regex = compRegex = /\{\{#(([A-Za-z][A-Za-z0-9]*)([^(?:\}\})]*)?)\}\}/gi;
			var match = regex.exec(string);
			var args = interpolate(s(match[3]).trim(), scope),
				name = match[2],
				comp = components[name] ? new components[name](scope.dom[0], scope) : new Component(scope.dom[0], scope);

			console.log("match:", match);

			comp.setup.apply(comp, args);

			return comp;
		}
	};
});