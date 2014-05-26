define(["genius/model/base/Class", "genius/utils/array", "genius/model/observable/Collection"], function (Class, a, Collection) {
	var Node = Class.extend({
		init: function () {
			this.parentNode = null;
			this.childNodes = new Collection();
			this.nodeValue = null;
		},
		appendChild: function (child) {
			if (!(child instanceof Node)) {
				throw new Error("Failed to execute 'appendChild' on 'Node': The new child element is null.");
			}

			if (a(this.childNodes).contains(child))
				this.removeChild(child);

			child.parentNode = this;
			this.childNodes.push(child);
		},
		removeChild: function (child) {
			if (!a(this.childNodes).contains(child))
				throw new Error("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
			child.parentNode = null;
			a(this.childNodes).remove(child);
		},
		insertBefore: function (newItem, existingItem) {
			if (!(newItem instanceof Node)) {
				throw new Error("Failed to execute 'insertBefore' on 'Node': The new child element is null.");
			}

			if (existingItem) {
				if (!a(this.childNodes).contains(existingItem))
					throw new Error("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");
				a(this.childNodes).remove(newItem);
				var index = a(this.childNodes).indexOf(existingItem);
				this.childNodes.splice(index, 0, newItem);
				newItem.parentNode = this;
			} else {
				this.appendChild(newItem);
			}
		},
		makeScope: function (scope) {
			return Object.create(scope);
		}
	});

	return Node;
});