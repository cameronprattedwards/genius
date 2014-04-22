var root = "genius/mvc/model/observable";
define([
	"./Node", 
	root + "/Computed", 
	root + "/Wrapper", 
	"./directives"
	], function (Node, Computed, Wrapper, directives) {
	return Node.extend({
		init: function () {
			Node.prototype.init.call(this);
			this.tagName = "";
			this.domNode;
			this.attributes = {};
			this.children = [];
			this.directives = {};
		},
		splice: function (index, length, replacements) {
			this.children.splice.apply(this.children, arguments);
		},
		bind: function (directive) {
			var split = directive.trim().split(/\s+/);
			this.directives[split[0]] = split.slice(1);
		},
		compile: function (model, parent) {
			var el = document.createElement(this.tagName);
			
			for (var x in this.directives) {
				var dir = new directives[x](this.directives[x]);
				dir.compile(model, el);
			}

			for (var x in this.attributes) {
				(function () {
					var attr = this.attributes[x],
						attrName = x;

					if (/\{\{[^\}]+\}\}/.test(this.attributes[x])) {
						var dependencies = [],
							bits = [],
							regex = /^\{\{([^\}]+)\}\}/;
			
						function update() {
							var output = "";
							for (var i = 0; i < bits.length; i++)
								output += bits[i].get();
							return output;
						};

						while (attr.length) {
							if (regex.test(attr)) {
								var observable;
								with (model) {
									observable = eval(regex.exec(attr)[1]);
									dependencies.push(observable);
									bits.push(observable);
									attr = attr.slice(attr.search("}}") + 2, attr.length);
								}
							} else {
								var nextTag = attr.search(/\{\{[^\}]+\}\}/);
								var toPush = nextTag !== -1 ? attr.slice(0, nextTag) : attr;
								bits.push(new Wrapper(toPush));
								attr = nextTag !== -1 ? attr.slice(nextTag, attr.length) : "";
							}
						}

						var computed = new Computed(dependencies, update);
						el.setAttribute(x, update());
						computed.subscribe(function (newVal) {
							el.setAttribute(attrName, newVal);
						});
					} else {
						el.setAttribute(x, this.attributes[x]);
					}
				}.call(this));
			}

			for (var i = 0; i < this.children.length; i++) {
				var returned = this.children[i].compile(model, el);

				for (var x = 0; x < returned.length; x++) {
					console.log("ret ", returned[x]);
					try {
						el.appendChild(returned[x]);
					} catch (e) {
						console.log(e);
						throw e;
					}
				}
			}
			return [el];
		}
	});
});