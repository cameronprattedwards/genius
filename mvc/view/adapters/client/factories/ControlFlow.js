define(["../nodes/ControlFlow", "../nodes/controlFlows"], function (ControlFlow, controlFlows) {
	var regex = /^\{\{#([A-Z][A-Z0-9]*)\b([^(?:\}\})]*)\}\}([\S\s]*?)\{\{\/\1\}\}/i;
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
			var match = regex.exec(string),
				name = match[1],
				controlFlow;

			if (controlFlows[name]) {
				controlFlow = new controlFlows[name](name, scope);
			} else {
				controlFlow = new ControlFlow(name, scope);
			}

			var args = match[2],
				realArgs = interpolate(match[2], scope);
			controlFlow.innerHtml = match[3];
			controlFlow.setup.apply(controlFlow, realArgs);

			return controlFlow;
		}
	};
});