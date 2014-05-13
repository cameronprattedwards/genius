define(["genius/model/base/Wrapper", "genius/model/observable/Computed"], function (Wrapper, Computed) {
	function Factory() {};

	Factory.prototype = {
		create: function (html) {
			var dependencies;
			function update() {
				var output = "";
				for (var i = 0; i < dependencies.length; i++)
					output += dependencies[i].get();
				return output;
			}

			var regex = /^\{\{([^\}]+)\}\}/;

			while (html.length) {
				if (regex.test(html)) {
					//create observable
					//add it to dependencies
					//splice html to the end of the tag
				} else {
					//create wrapper
					//add it to pieces
					//splice html to the next tag OR to the end of itself
				}
			}
		}
	};

	return Factory;

	return function (html) {
		var dependencies = [];
		while (html.length)
			if (/^\{\{([^\}]+)\}\}/.test(html)) {

			}
	}
});