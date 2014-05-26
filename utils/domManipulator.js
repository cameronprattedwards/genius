define([], function () {
	function D(el){
		this.el = el;
	};

	D.prototype = {
		addClass: function (className) {
			var current = this.el.getAttribute("class") || "";

			if (!current || current.search(className) == -1) {
				this.el.setAttribute("class", current + " " + className);
			}
			return this;
		},
		removeClass: function (className) {
			var current = this.el.getAttribute("class");
	
			if (current)
				this.el.setAttribute("class", current.replace(className, ""));
	
			return this;
		}
	};

	return function (el) { return new D(el); };
});