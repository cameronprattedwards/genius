define([], function () {
	function D(el){
		this.el = el;
	};

	D.prototype = {
		addClass: function (className) {
			var current = this.el.getAttribute("class");
			if (current.search(className) == -1) {
				this.el.setAttribute("class", current + " " + className);
			}
			return this;
		},
		removeClass: function (className) {
			this.el.setAttribute("class", this.el.getAttribute("class").replace(className, ""));
			return this;
		}
	};

	return function (el) { return new D(el); };
});