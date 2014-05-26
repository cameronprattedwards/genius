define(["../ControlFlow", "../controlFlows", "../../factories/Node"], function (ControlFlow, controlFlows, NodeFactory) {
	var With = ControlFlow.extend({
		setup: function (withArg) {
			this.scope.model = this.scope.model.slice(0, this.scope.model.length);
			this.scope.model.unshift(withArg);

			var counter = [this.innerHtml];

			while (counter[0].length) {
				this.appendChild(NodeFactory.fromString(counter[0], this.scope, counter));
			}
		}
	});

	controlFlows["with"] = With;

	return With;
});