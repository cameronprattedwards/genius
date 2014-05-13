define([], function () {
	return function (base) {
		return {
			init: function () {
				this.listeners = {};
				this.allListeners = {};
				this.index = 0;
				base.prototype.init.apply(this, arguments);
			},
			subscribe: function (callback, evt) {
				if (!this.listeners[evt])
					this.listeners[evt] = {};

				this.allListeners[this.index] = {
					cb: callback,
					evt: evt
				};

				this.listeners[evt][this.index] = callback;

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