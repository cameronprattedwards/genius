define(["genius/utils"], function (utils) {
	var directives = {
		"each": function (children, element, model, modelArg) {
			var blocks = [];
			for (var i = 0; i < modelArg.length; i++) {
				for (var x = 0; x < children.length; x++) {
					element.appendChild(translate(children[x], modelArg[i]));
				}
			}
		},
		"if": function (children, element, model, conditional) {
			if (conditional)
				for (var i = 0; i < children.length; i++)
				element.appendChild(translate(children[i], model));
		}
	};

	function regexIndexOf(array, regex) {
		for (var i = 0; i < array.length; i++) {
			if (regex.test(array[i]))
				return i;
		}
	}

	function translate(child, model) {
		if (typeof child == "string") {
			if (/a/.test(child)) {
				//it's a directive
			}
			return document.createTextNode(child);
		}

		var element = document.createElement(child.tagName);

		for (var attr in child.attributes)
			element.setAttribute(attr, child.attributes[attr]);

		var kids = child.children;
		for (var i = 0; i < kids.length; i++) {
			if (matches = /\{\{#([^\}\s]+)[^\}]*\}\}/.exec(kids[i])) {
				var directiveName = matches[1];
				var closingTagIndex = regexIndexOf(kids, new RegExp("\{\{/" + directiveName + "\}\}"));
				var args = [kids.slice(i + 1, closingTagIndex), element, model];
				var methodArgs = /\{\{#[^\s]+([^\}]+)\}\}/.exec(kids[i])[1].trim().split(/\s+/);
				methodArgs = utils.map(methodArgs, function (key) {
					return model[key];
				})
				directives[directiveName].apply(window, args.concat(methodArgs));
				if (closingTagIndex !== -1)
					i = closingTagIndex + 1;
			} else {
				element.appendChild(translate(kids[i]));
			}
		}

		return element;
	};

	return translate;
});