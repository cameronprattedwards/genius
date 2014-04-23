define(["../Directive", "./unwrap", "genius/utils"], function (Directive, unwrap, utils) {
	return Directive.extend({
		setUp: function (model, parent, filePath, modelToPass) {
			var _self = this;
			// AJAX - Get the template
			var promise = utils.ajax({
				url: unwrap(filePath)
			});
			promise.success(function (html) {
				//Run the template through a factory to get a pseudo-DOM
				_self.children = PseudoDomFactory.create(html);
				_self.compiledChildren = _self.children.reduce(function (prev, curr, index, array) { return prev.concat(curr.compile(modelToPass)) }, []);

				//Compile the pseudo-DOM into a DOM.
				_self.splice.apply(_self, [0, 0].concat(_self.compiledChildren));
			});
			return [];
		},
		update: function (model, parent, filePath, modelToPass) {
			//Unless a dependency fires before the AJAX request returns, we should have our pseudo-DOM ready to go already
			this.splice(0, this.compiledChildren.length);
			this.setUp.apply(this, arguments);
		}
	});
});

//Is there any way to do this without circular dependencies?
//The core function:
//AJAX-Get a template
//Run the template through a factory to get a pseudo-DOM
//Compile the pseudo-DOM into a DOM.