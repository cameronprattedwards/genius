define(["./Node", "genius/model/observable/Collection", "genius/utils/array", "../factories/Attribute"], function (Node, Collection, a, AttributeFactory) {
	return Node.extend({
		init: function (tagName, scope) {
			this.element = document.createElement(tagName);
			this.components = {};
			this.scope = this.makeScope(scope);
			Node.prototype.init.apply(this, arguments);

			try {
				this.tagName = tagName.toUpperCase();
			} catch (e) {
				throw "Failed to instantiate HTML node: 1 argument required, only 0 present.";
			}

			this.attributes = new Collection();
			this.attributesMap = {};
			this.realNodes = new Collection([this.element]);
			this.childSubscriptions = new Collection();
		},
		appendChild: function (child) {
			Node.prototype.appendChild.apply(this, arguments);
			var _self = this;

			a(child.realNodes).forEach(function (child) {
				_self.element.appendChild(child);
			});

			var subscription = {};

			subscription.remove = child.realNodes.subscribe(function (value) {
				_self.element.removeChild(value);
			}, "removed");

			subscription.add = child.realNodes.subscribe(function (child) {
				var afterIndex = a(_self.element.childNodes).indexOf(child) + 1,
					afterChild = _self.element.childNodes[afterIndex];

				_self.element.insertBefore(child, afterChild);
			}, "added");

			this.childSubscriptions.push(subscription);
		},
		removeChild: function (child) {
			var index = a(this.childNodes).indexOf(child),
				subscription = this.childSubscriptions[index];

			Node.prototype.removeChild.apply(this, arguments);

			child.realNodes.unsubscribe(subscription.remove);
			child.realNodes.unsubscribe(subscription.add);
			a(this.childSubscriptions).remove(subscription);
		},
		getAttribute: function (key) {
			return this.attributesMap[key].nodeValue;
		},
		createAttribute: function (key, value) {
			var node = AttributeFactory.fromKeyValue(key, value, this.scope),
				_self = this;
				
			this.attributes.push(node);
			this.attributesMap[key] = node;
		},
		setAttribute: function (key, value) {
			if (!this.attributesMap[key]) {
				this.createAttribute(key, value);
			} else {
				this.attributesMap[key].nodeValue = value;
			}

			this.element.setAttribute(key, value);
		},
		makeScope: function (scope) {
			scope = Node.prototype.makeScope.apply(this, arguments);
			scope.dom.unshift(this.element);
			scope.components = Object.create(scope.components);

			return scope;
		}
	});
});