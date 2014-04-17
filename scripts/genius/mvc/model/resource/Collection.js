define(["../dirt/Collection", "genius/Backend", "../dirt/setUtils"], function (Collection, Backend, setUtils) {
	var Collection = Collection.extend({
		url: function (parent) {
			return parent.url() + "";
		},
		parse: function (value) {
			return value;
		},
		set: function (value) {
			this.splice.apply(this, [0, this.length].concat(value));
		},
		$save: function (parent) {
			var url = this.url(parent);
			for (var i = 0; i < this.added.length; i++) {
				Backend.create(url, this.added[i].toJs());
			}

			for (var i = 0; i < this.removed.length; i++) {
				Backend.del(url, this.added[i].toJs());
			}
		},
		$poll: function (parent) {
			var promise = Backend.read(this.url(parent));
			var _self = this;

			promise.success(function (value) {
				setUtils.current = setUtils.server;
				_self.set(_self.parse(value));
				setUtils.current = setUtils.client;
				_self.isDirty.set(false);
			});
			return promise;
		}
	});

	return Collection;
});