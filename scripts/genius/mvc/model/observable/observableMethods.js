define([], function () {
	return function (base) {
		return {
			init: function () {
				base.prototype.init.apply(this, arguments);
				this.listeners = {};
				this.allListeners = {};
				this.index = 0;
			},
			subscribe: function (callback, evt) {
				if (!this.listeners[event])
					this.listeners[event] = {};

				this.allListeners[this.index] = {
					cb: callback,
					evt: evt
				};

				this.listeners[event][this.index] = callback;

				return this.index++;
			},
			unsubscribe: function (id) {
				var evt = this.allListeners[id].evt;

				delete this.listeners[evt][id];
				delete this.allListeners[id];
			}
		}
	};
});