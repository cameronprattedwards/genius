define(function () {
    function Deferred() {
        var doneCallbacks = [],
            failCallbacks = [],
            alwaysCallbacks = [],
            state = "pending";

        function Promise() {
            this.done = function (callback) {
                if (typeof callback == "function") {
                    if (state == "resolved") {
                        callback.apply(this, arguments);
                        return this;
                    }
                    doneCallbacks.push(callback);
                }
                return this;
            };
            this.fail = function (callback) {
                if (typeof callback == "function") {
                    if (state == "rejected") {
                        callback.apply(this, arguments);
                        return this;
                    }
                    failCallbacks.push(callback);
                }
                return this;
            };
            this.always = function (callback) {
                if (typeof callback == "function") {
                    if (state !== "pending") {
                        callback.apply(this, arguments);
                        return this;
                    }
                    alwaysCallbacks.push(callback);
                }
                return this;
            };
            this.state = function () { return state; };
        };
        function fire(arr, args) {
            for (var i = 0; i < arr.length; i++) {
                arr[i].apply(this, args);
            }
            for (var i = 0; i < alwaysCallbacks.length; i++) {
                alwaysCallbacks[i].apply(this, args);
            }
        };

        this.resolve = function () {
            state = "resolved";
            fire.call(this, doneCallbacks, arguments);
        };
        this.reject = function () {
            state = "rejected";
            fire.call(this, failCallbacks, arguments);
        };
        var promise = new Promise();
        this.promise = function () { return promise; };
    };
    Deferred.prototype = {
        done: function () {
            return this.promise().done.apply(this, arguments);
        },
        fail: function () {
            return this.promise().fail.apply(this, arguments);
        },
        always: function () {
            return this.promise().always.apply(this, arguments);
        }
    };

    return function () { return new Deferred(); };
});