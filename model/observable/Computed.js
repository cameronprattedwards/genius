define(["./Observable"], function (Observable) {
	return Observable.extend({
		init: function (dependencies, evaluator) {
			Observable.prototype.init.apply(this, arguments);

			var _self = this;

			this.get = evaluator;

			for (var i = 0; i < dependencies.length; i++) {
				dependencies[i].subscribe(function () { _self.fire.call(_self); });
			}
		}
	});
});