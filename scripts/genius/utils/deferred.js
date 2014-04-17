define([], function () {
	return function () {
		var state = "pending",
			always = [],
			success = [],
			fail = [],
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
				var args = Array.prototype.slice.call(arguments, 1);

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
			}
		};

		function Deferred() {
			this.promise = function () {
				return promise;
			};

			this.resolve = function () {
				state = "resolved";
				fire.apply(this, [success].concat(toArray(arguments)));
				return this;
			};

			this.reject = function () {
				state = "rejected";
				fire.apply(this, [fail].concat(toArray(arguments)));
				return this;
			};

			this.state = function () {
				return state;
			}
		}

		Deferred.prototype = promise;

		return new Deferred();
	};
});