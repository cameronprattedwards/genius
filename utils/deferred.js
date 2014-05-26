define([], function () {
	function deferred() {
		var state = "pending",
			always = [],
			success = [],
			fail = [],
			args,
			callback = true,
			toArray = function (args) {
				return Array.prototype.slice.call(args, 0);
			},
			callbacks = {
				pending: function () {},
				resolved: function () {
					fire(success);
				},
				rejected: function () {
					fire(fail);
				}
			},
			execute = function (array, args) {
				while (array.length) {
					array[0].apply(this, args);
					array.splice(0, 1);
				}
			},
			fire = function (array) {
				if (!callback)
					args = Array.prototype.slice.call(arguments, 1);

				execute.call(this, array, args);
				execute.call(this, always, args);
			};

		var promise = {
			always: function (callback) {
				always.push(callback);
				callbacks[state].call(this);
				return this;
			},
			success: function (callback) {
				success.push(callback);
				callbacks[state].call(this);
				return this;
			},
			fail: function (callback) {
				fail.push(callback);
				callbacks[state].call(this);
				return this;
			},
			state: function () {
				return state;
			},
			bind: {
				fail: function (deferred) {
					promise.fail(function () {
						deferred.reject.apply(deferred, arguments);
					});

					return this;
				},
				success: function (deferred) {
					promise.success(function () {
						deferred.resolve.apply(deferred, arguments);
					});

					return this;
				},
				always: function (deferred) {
					this.fail(deferred);
					this.success(deferred);

					return this;
				}
			}
		};

		function Deferred() {
			this.promise = function () {
				return promise;
			};

			this.resolve = function () {
				callback = false;
				state = "resolved";
				fire.apply(this, [success].concat(toArray(arguments)));
				callback = true;
				return this;
			};

			this.reject = function () {
				callback = false;
				state = "rejected";
				fire.apply(this, [fail].concat(toArray(arguments)));
				callback = true;
				return this;
			};

			this.state = function () {
				return state;
			}
		}

		Deferred.prototype = promise;

		return new Deferred();
	};

	return deferred;
});