define(["./Node", "genius/model/observable/Collection"], function (Node, Collection) {
	return Node.extend({
		init: function (name, scope) {
			this.scope = this.makeScope(scope);
			Node.prototype.init.apply(this, arguments);
			this.name = name;
			this.innerHtml = "";
			this.args = [];
			this.open = document.createComment(this.name);
			this.close = document.createComment("/" + this.name);
			this.realNodes = new Collection([this.open, this.close]);
			this.childSubscriptions = [];
		},
		splice: function (index, len) {
			index++;
			return this.realNodes.splice.apply(this.realNodes, arguments);
		},
		appendChild: function (child) {
			var subscription,
				_self;

			Node.prototype.appendChild.apply(this, arguments);
			subscription = {};

			subscription.remove = child.realNodes.subscribe(function (node) {
				a(_self.realNodes).remove(node);
			}, "removed");

			subscription.add = child.realNodes.subscribe(function (node) {
				if (child.realNodes.length)
					var index = a(child.realNodes).indexOf(node) - 1;
				else
					var index = 0;

				var myIndexOfNode = a(_self.realNodes).indexOf(child.realNodes[index]) + 1;

				_self.realNodes.splice(myIndexOfNode, 0, node);
			}, "added");

			this.childSubscriptions.push(subscription);
			var args = [this.realNodes.length - 1, 0];
			args.push.apply(args, child.realNodes);
			this.realNodes.splice.apply(this.realNodes, args);
		},
		removeChild: function (child) {
			var _self = this,
				index = a(this.childNodes).indexOf(child),
				subscription = this.childSubscriptions[index];

			Node.prototype.removeChild.apply(this, arguments);

			a(child.realNodes).forEach(function (node) {
				a(_self.realNodes).remove(node);
			});

			child.realNodes.unsubscribe(subscription.remove);
			child.realNodes.unsubscribe(subscription.add);
			a(this.childSubscriptions).remove(subscription);
		},
		setup: function () {},
		name: "controlFlow"
	});
});