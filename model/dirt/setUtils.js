define([], function () {
	function dirtyCollectionBase (oldVal, newVal, removed, added) {
		var _self = this,
			i = 0;
		if (!this.added) {
			this.added = [],
			this.removed = [];
		}
		var added = this.added,
			removed = this.removed;

		for ( ; i < newVal.length; i++) {
			if (oldVal[i] == newVal[i])
				continue;

			// I'm subscribed and I should be.
			if (oldVal.length > i && oldVal.indexOf(newVal[i]) !== -1) {
				var index;
				while ((index = oldVal.indexOf(newVal[i])) !== -1) {
					var id = this.subscriptions[index];
					this.subscriptions.splice(index, 1);
					oldVal.splice(index, 1);
				}
			// I'm not subscribed and I should be.
			} else {
				var id = newVal[i].subscribe(function (newVal) {
					_self.isDirty.set(true);
				}, "dirty");
				added.push(newVal[i]);
			}

			// I'm subscribed and I shouldn't be.
			if (oldVal.length > i && newVal.indexOf(oldVal[i]) == -1) {
				removed.push(oldVal[i]);
				oldVal[i].unsubscribe(this.subscriptions[i]);
				this.subscriptions.splice(i, 1);
				oldVal.splice(i, 1);
			}

			this.subscriptions.splice(i, 0, id);
			oldVal.splice(i, 0, newVal[i]);
		}

		while (i < oldVal.length) {
			this.removed.push(oldVal[i]);
			oldVal[i].unsubscribe(this.subscriptions[i]);
			this.subscriptions.splice(i, 1);
			oldVal.splice(i, 1);
		}
	}	

	var server = {
		markDirty: function () {
			this.isDirty.set(false);
		},
		markDirtyCollection: function (oldVal, newVal) {
			dirtyCollectionBase.call(this, oldVal, newVal, [], []);
			this.isDirty.set(false);
		},
		isNew: false
	};

	var client = {
		markDirty: function (oldVal, newVal) {
			this.isDirty.set(this.originalValue !== newVal);
		},
		markDirtyCollection: function (oldVal, newVal) {
			dirtyCollectionBase.call(this, oldVal, newVal, this.removed, this.added);
			this.isDirty.set(!this.removed.length && !this.added.length);
		},
		isNew: true
	};
	
	return {
		server: server,
		client: client,
		current: client
	};
});