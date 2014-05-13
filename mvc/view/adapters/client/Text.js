var root = "genius/model/observable";

define(["./Node", root + "/Computed", root + "/Wrapper"], function (Node, Computed, Wrapper) {
	return Node.extend({
		init: function (value) {
			this.value = value;
		},
		compile: function (model, parent) {
			return [document.createTextNode(this.value)];
		},
		bind: function (str) {
			this.compile = function (model, parent) {
				var pieces = [],
					dependencies = [];

				function update() {
					var output = "";
					for (var i = 0; i < pieces.length; i++)
						output += pieces[i].get();
					return output;
				};

				var regex = /^\{\{([^\}]+)\}\}/;
				var strCopy = str;
				while (strCopy.length) {
					if (regex.test(strCopy)) {
						var observable;
						with (model) {
							observable = eval(regex.exec(strCopy)[1]);
						}
						dependencies.push(observable);
						pieces.push(observable);
						strCopy = strCopy.slice(strCopy.search("}}") + 2, strCopy.length);
					} else {
						var nextTag = strCopy.search(/\{\{[^\}]+\}\}/);
						var toPush = nextTag !== -1 ? strCopy.slice(0, nextTag) : strCopy;
						pieces.push(new Wrapper(toPush));
						strCopy = nextTag !== -1 ? strCopy.slice(nextTag, strCopy.length) : "";
					}
				}

				var computed = new Computed(dependencies, update);
				var output = document.createTextNode(update());
				computed.subscribe(function (newVal) {
					output.nodeValue = newVal;
				});
				return [output];
			}
		}
	});
});