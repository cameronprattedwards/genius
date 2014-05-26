define(["./Node", "genius/model/observable/Collection", "genius/model/observable/Computed", "genius/utils/array"], function (Node, Collection, Computed, a) {
	return Node.extend({
		init: function () {
			var _self = this;

			Node.prototype.init.apply(this, arguments);
			this.realNodes = new Collection();
			this.childSubscriptions = [];
		},
		appendChild: function (child) {
			var _self = this;

			Node.prototype.appendChild.apply(this, arguments);

			var subscription = {};

			subscription.remove = child.realNodes.subscribe(function (value) {
				a(_self.realNodes).remove(value);
			}, "removed");

			subscription.add = child.realNodes.subscribe(function (realNode) {
				var index = a(_self.realNodes).indexOf(child.realNodes[a(child.realNodes).indexOf(child) - 1]);

				_self.realNodes.splice(index, 0, realNode);
			}, "added");

			this.realNodes.push.apply(this.realNodes, child.realNodes);
			this.childSubscriptions.push(subscription);
		},
		removeChild: function (child) {
			var _self = this,
				index = a(_self.realNodes).indexOf(child.realNodes[0]),
				len = child.realNodes.length,
				subscr = this.childSubscriptions[a(this.childNodes).indexOf(child)];

			Node.prototype.removeChild.apply(this, arguments);

			this.realNodes.splice(index, len);
			child.unsubscribe(subscr.remove);
			child.unsubscribe(subscr.add);
			a(this.childSubscriptions).remove(subscr);
		}
	});
});