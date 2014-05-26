define(["./Node", "genius/model/observable/Computed", "genius/model/observable/Collection", "genius/utils/array"], function (Node, Computed, Collection, a) {
	var regex = /^\{\{([^\}]+)\}\}/i,
		next = /\{\{([^\}])+\}\}/i;

	return Node.extend({
		init: function (value, scope) {
			this.scope = this.makeScope(scope);
			Node.prototype.init.apply(this, arguments);
			this.nodeValue = this.interpolate(value);
			this.element = document.createTextNode(this.nodeValue.valueOf());
			var _self = this;
			this.nodeValue.subscribe(function (value) {
				_self.element.nodeValue = value;
			});
			this.realNodes = new Collection([this.element]);
		},
		broken: function (string, model, modelParents, domParents, components) {
			with (model) {
				return eval(string);
			}
		},
		interpolate: function (string) {
			var deps = [],
				pieces = [],
				match,
				thing;

			while (string.length) {
				if (match = regex.exec(string)) {
					thing = match[0];
					var dep = this.broken(match[1], this.scope.model[0], this.scope.model, this.scope.dom, this.scope.components);

					if (dep.subscribe)
						deps.push(dep);

					pieces.push(dep);
				} else {
					var myNext = string.search(next);
					if (myNext == -1) {
						thing = string;
					} else {
						thing = string.substring(0, myNext);
					}
					pieces.push(thing);
				}
				string = string.replace(thing, "");
			}

			return new Computed(deps, function () {
				return a(pieces).map(function (piece) { return piece.valueOf(); }).join("");
			});
		}
	});
});