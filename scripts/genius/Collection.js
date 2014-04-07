define(["./setUtils", "./utils", "./Resource", "require"], function (setUtils, utils, Resource, require) {
    function Collection(options) {
        options = options || {};
        this.push = function (val) {
            if (options.type) {
                val = options.type.getInstance().initialize(val).accessor().call();
            }
            if (options.unique && utils.contains(this, val))
                return this.length;
            var output = (!options.unique || !utils.contains(this, val)) ?
                Array.prototype.push.call(this, val) :
                this.length;
            return output;
        };
        this.addNew = function () {
            if (options.type) {
                if (constr = options.type.constr())
                    this.push(new constr());
                else
                    this.push(options.type.getInstance().accessor().call());
            } else {
                this.push({});
            }
        };
        this.concat = function (arr) {
            if (options.type)
                arr = utils.map(arr, function (val) {
                    return options.type.getInstance().initialize(val).accessor().call();
                });
            return Array.prototype.push.apply(this, arr);
        };
        this.removeAll = function () {
            this.splice(0);
        };
        this.remove = function (val) {
            var index;
            while ((index = utils.indexOf(this, val)) !== -1) {
                this.splice(index, 1);
            }
        };
    };
    Collection.prototype = [];
    Collection.fromJs = function (arr) {
        var collection = new Collection();
        collection.concat(arr);
        return collection;
    };
    var initializing = false;
    Collection.extend = function (configOptions) {
        configOptions = configOptions || {};
        initializing = true;
        var prototype = new this();
        initializing = false;

        var type = configOptions.type,
            unique = configOptions.unique;

        prototype.toJs = function () {
            return utils.map(this, function (val) { return val.toJs ? val.toJs() : val; }).slice(0, this.length);
        };
        prototype.initialize = function (arr) {
            markDirty = false;
            this.concat(arr);
            markDirty = true;
            return this;
        };
        prototype.accessor = function () {
            var _self = this;
            var output = function () {
                if (arguments.length) {
                    _self.removeAll();
                    _self.concat(arguments[0]);
                    _self.isDirty(true);
                }
                return _self;
            }
            output.isAccessor = true;
            output.subscribe = this.subscribe;
            output.isDirty = this.isDirty;
            output.toJs = this.toJs.bind(this);
            return output;
        };
        prototype.addNew = function () {
            if (type) {
                if (constr = type.constr())
                    this.push(new constr());
                else
                    this.push(type.getInstance().accessor().call());
            } else {
                this.push({});
            }
        };

        prototype.push = function (val) {
            var Resource = require("Resource");

            if (type) {
                val = type.getInstance().initialize(val).accessor().call();
            }
            if (unique && utils.contains(this, val))
                return this.length;
            if (val instanceof Resource) {
                var _self = this;
                val.subscribe("delete", function () {
                    _self.remove(val);
                });
            }
            var output = (!unique || !utils.contains(this, val)) ?
                Array.prototype.push.call(this, val) :
                this.length;
            return output;
        };

        if (concat = Array.prototype.concat) {
            var Resource = require("Resource");
            prototype.concat = function (arr) {
                if (type)
                    arr = utils.map(arr, function (val) {
                        val = type.getInstance().initialize(val).accessor().call();
                        if (val instanceof Resource) {
                            var _self = this;
                            val.subscribe("delete", function () {
                                _self.remove(val);
                            });
                        }
                        return val;
                    });
                return Array.prototype.push.apply(this, arr);
            };
        }

        for (var x in configOptions) {
            if (typeof configOptions[x] == "function" && x !== "type")
                prototype[x] = configOptions[x];
        }

        function Collection(options) {
            if (!initializing) {
                options = options || {};
                if (typeof this.init == "function")
                    this.init.apply(this, arguments);

                if (options.type)
                    type = options.type;
                if (options.unique)
                    unique = options.unique;
                this.isLoading = utils.accessor(true);
                this.type = function () { return type; };
                this.isDirty = utils.accessor(false);
                var changeCallbacks = {}, index = 0;
                this.subscribe = function (callback) {
                    changeCallbacks[index] = callback;
                    return index++;
                };
                this.backdoor = function (arr) {
                    if (type)
                        arr = utils.map(arr, function (val) {
                            return type.getInstance().initialize(val).accessor().call();
                        });
                    var args = [0, this.length];
                    args.push.apply(args, arr);
                    this.splice.apply(this, args);
                };
                this.fire = function () { };
            }
        };
        Collection.fromJs = function (arr) {
            var collection = new Collection();
            setUtils.current = setUtils.server;
            var mapped = utils.map(arr, function (val) {
                return type.getInstance().initialize(val).accessor().call();
            });
            collection.concat(arr);
            setUtils.current = setUtils.client;
            return collection;
        };
        Collection.prototype = prototype;
        Collection.extend = arguments.callee;
        return Collection;
    };

    return Collection;
});