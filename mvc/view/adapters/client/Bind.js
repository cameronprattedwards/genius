define(["genius/utils/array"], function (a) {
	function Bind(el) {
		if (!(this instanceof Bind))
			return new Bind(el);

		this.element = el;
	};

	Bind.prototype = {
		to: function (doc) {
			var _self = this,
				el = this.element;

			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}

			doc.realNodes.subscribe(function (realNode) {
				var indexInDoc = a(doc.realNodes).indexOf(realNode),
					afterInDoc = doc.realNodes[indexInDoc + 1],
					afterInEl = el.childNodes[a(el.childNodes).indexOf(afterInDoc)];

				el.insertBefore(realNode, afterInEl);
			}, "added");

			doc.realNodes.subscribe(function (realNode) {
				el.removeChild(realNode);
			}, "removed");

			a(doc.realNodes).forEach(function (realNode) {
				el.appendChild(realNode);
			});
		}
	}

	return Bind;
});