define(["./deferred", "./box"], function (deferred, box) {
    function RequestExpectation(backend, action, url) {
        this.toReturn = function (data) {
            backend.expectations[action + "-" + url] = data;
        };
    };

    function FakeBackend() {
        this.expectations = {};
        this.pendingRequests = {};
    };

    FakeBackend.prototype = (function () {
        function fakeRequest(action, url) {
            if (!this.expectations[action + "-" + url])
                throw new ReferenceError("Unexpected request for " + url);
            var def = deferred();
            this.pendingRequests[action + "-" + url] = def;
            return def.promise();
        }
        
        return {
            get: function (url) {
                return fakeRequest.call(this, "get", url);
            },
            put: function (url) {
                return fakeRequest.call(this, "put", url);
            },
            post: function (url) {
                return fakeRequest.call(this, "post", url);
            },
            flush: function () {
                for (var x in this.pendingRequests) {
                    this.pendingRequests[x].resolve(this.expectations[x]);
                    delete this.pendingRequests[x];
                }
            },
            expectGet: function (url) {
                return new RequestExpectation(this, "get", url);
            },
            expectPost: function (url) {
                return new RequestExpectation(this, "post", url);
            },
            expectPut: function (url) {
                return new RequestExpectation(this, "put", url);
            },
            expectDelete: function (url) {
                return new RequestExpectation(this, "delete", url);
            }
        };
    }());
    
    box.set("FakeHttpBackend", function () { return new FakeBackend(); }).singleton();
});