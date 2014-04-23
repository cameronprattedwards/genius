define(["../Directive", "./unwrap"], function (Directive, unwrap) {
	function renderTemplate(model, parent, filePath, modelToPass) {
		require(["../compile"], function (compile) {
		});
	}

	return Directive.extend({
		setUp: function () {},
		update: function () {}
		compile: function (model, parent) {
			var filePath,
				modelToPass,
				_self = this;

			with (model) {
				filePath = eval(_self.args[0]);
				modelToPass = eval(_self.args[1]);
			}

			
		}
	});
});