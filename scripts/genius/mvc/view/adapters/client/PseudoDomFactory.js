define(["genius/utils", "./PseudoDom"], function (utils, PseudoDom) {
	function bestNode(mutable) {

	}

	return function (html) {
		var pseudoDom = new PseudoDom(),
			children = pseudoDom.children,
			mutable = [html];

		while (mutable[0].length) {
			children.push.apply(children, bestNode(mutable));
		}

		return pseudoDom;
	};
});