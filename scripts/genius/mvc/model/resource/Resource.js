define(["../dirt/Class", "genius/utils", "genius/Backend", "./GenericCollection", "../dirt/setUtils"], function (Class, utils, Backend, Collection, setUtils) {
	var Resource = Class.extend({
		init: function () {
			for (var x in this.properties) {
				this[x] = this.properties[x].getInstance();
			}

			Class.prototype.init.apply(this, arguments);
		},
		$del: function (parent) {
			Backend.del(this.url(parent), this[this.uniqKey].get());
			this.fire("delete");
		},
		$populateCollection: function (collection) {
			return collection.$poll(this);
		},
		$poll: function (parent) {
			var promise = Backend.read(this.url(parent), this[this.uniqKey].get());
			var _self = this;
			promise.success(function (value) {
				setUtils.current = setUtils.server;
				_self.set(value);
				setUtils.current = setUtils.client;
				_self.isDirty.set(false);
			});
			return promise;
		},
		$save: function (parent) {
			var _self = this,
				promise;

			if (this.isNew()) {
				promise = Backend.create(this.url(parent), this.toJson());
			} else {
				promise = Backend.update(this.url(parent), this.dirtyProperties());
			}
			promise.success(function (value) {
				setUtils.current = setUtils.server;
				_self.set(value);
				setUtils.current = setUtils.client;
				_self.isNew.set(false);
				_self.isDirty.set(false);
			});

			return promise;
		},
		url: function (parent) {
			return parent.url() + "";
		},
		set: function (value) {
			for (var x in value) {
				this[x].set(value[x]);
			}
		},
		uniqKey: "id"
	});

	var statics = {
		$get: function (key) {
			var output = new this();
			var promise = Backend.read(this.prototype.url(), key);
			promise.success(function (value) {
				setUtils.current = setUtils.server;
				output.set(value);
				setUtils.current = setUtils.client;
				output.isNew.set(false);
				output.isDirty.set(false);
			});
			return output;
		},
		$query: function () {
			var output = new Collection(this)();
			var promise = Backend.read(this.prototype.url());
			promise.success(function (value) {
				setUtils.current = setUtils.server;
				output.set(output.parse(value));
				setUtils.current = setUtils.client;
				output.isNew.set(false);
				output.isDirty.set(false);
			});
			return output;
		}
	};

	var initializing = false;

	Resource.extend = function (properties) {
		initializing = true;
		var prototype = new this();
		initializing = false;

		var trueProperties = {};

		for (var x in properties) {
			if (!properties[x].getInstance) {
				prototype[x] = properties[x];
				delete properties[x];
			}
		}

		prototype.properties = utils.extend({}, prototype.properties, properties);

		function Resource() {
			if (!initializing)
				this.init.apply(this, arguments);
		}

		Resource.prototype = prototype;

		Resource.extend = arguments.callee;

		utils.extend(Resource, statics);

		return Resource;
	};

	utils.extend(Resource, statics);

	return Resource;
});