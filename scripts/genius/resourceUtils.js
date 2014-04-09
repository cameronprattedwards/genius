define(["./utils"], function (utils) {
    var resourceUtils = {
        getKey: function (options, typeOptions) {
            options = options || {};
            if (typeOptions.uniqKey) {
                var key = resourceUtils.drillDown.call(this, options, typeOptions.uniqKey);
                return key;
            }
        },
        getUrl: function () { },
        buildPrototype: function (prototype, typeOptions) {
            for (var x in typeOptions) {
                if (typeof typeOptions[x] == "function") {
                    prototype[x] = typeOptions[x];
                }
            }
            prototype.url = typeof typeOptions.url == "function" ?
                typeOptions.url :
                function () { return typeOptions.url || ""; };
        },
        setVarTyping: function (hash) {
            for (var x in hash) {
                if (x !== "uniqKey" && x !== "url")
                    this[x] = hash[x];
            }
        },
        populateVar: function (x, value, innerConfig) {
            var toCamel = config.ajax.transformToCamelCase();
            if (toCamel) {
                if (utils.cases.isCapitalized(x)) {
                    var camellized = utils.cases.pascalToCamel(x);
                    resourceUtils.populateVar.call(this, camellized, value);
                    if (this[x])
                        this[x] = this[camellized];
                    return;
                }
                if (typeof value == "object")
                    value = utils.cases.camelObject(value);
            }
            if (this[x] && this[x].getInstance) {
                this[x] = this[x].getInstance().initialize(value).accessor();
                this[x].subscribe(function () { innerConfig.isDirty = true; });
            } else if (typeof value == "function") {
                this[x] = value;
            } else if (this[x] && this[x].backdoor) {
                this[x].backdoor(value);
            } else if (this[x] && this[x].isAccessor) {
                this[x](value);
            } else {
                this[x] = types.dynamic({ nullable: true }).getInstance().initialize(value).accessor();
            }

        },
        populateVars: function (options, innerConfig) {
            for (var x in options) {
                resourceUtils.populateVar.call(this, x, options[x], innerConfig);
            }
            for (var x in this) {
                if (typeof this[x].getInstance == "function") {
                    this[x] = this[x].getInstance().accessor();
                    this[x].subscribe(function () { innerConfig.isDirty = true; });
                }
                if (this[x].isAccessor && this[x]() && this[x]().backdoor) {
                    var placeholder = this[x];
                    this[x].backdoor = utils.bind(function () {
                        return this().backdoor.apply(this(), arguments);
                    }, placeholder);
                }
            }
        },
        drillDown: function (obj, str) {
            var split = str.split(".");
            var output = obj[split[0]];
            for (var i = 1; i < split.length; i++) {
                if (!output[split[i]])
                    return;
                output = output[split[i]].isAccessor ? output[split[i]]() : output[split[i]];
            }
            return output;
        },
        getInnerConfig: function (innerConfig, options) {
            if (innerConfig) {
                innerConfig.optionsHash = options;
                return innerConfig;
            } else {
                return {
                    isDirty: true,
                    isNew: true,
                    isLoading: false,
                    isDeleted: false,
                    optionsHash: options
                };
            }
        },
        initialize: function (innerConfig, options) {
            var callbacks = { none: {} }, index = 0,
                subscribe = function (event, callback) {
                    if (!callbacks[event])
                        callbacks[event] = {};
                    callbacks[event][index] = callback;
                    return index++;
                },
                fire = function (event) {
                    var set;
                    if (set = callbacks[event]) {
                        for (var x in set) {
                            set[x].apply(this, utils.toArray(arguments).slice(1));
                        }
                    }
                };

            utils.extend(this, {
                subscribe: function (event, callback) {
                    switch (arguments.length) {
                        case 1:
                            return subscribe("none", event);
                        case 2:
                            return subscribe(event, callback);
                    }
                },
                unsubscribe: function (id) {
                    var output = false;
                    for (var x in callbacks) {
                        if (callbacks[x][id]) {
                            output = true;
                            delete callbacks[x][id];
                            break;
                        }
                    }
                    return output;
                },
                isDirty: function () { return innerConfig.isDirty; },
                isNew: function () { return innerConfig.isNew; },
                isDeleted: function () { return innerConfig.isDeleted; },
                isLoading: function () { return innerConfig.isLoading; },
                optionsHash: function () { return innerConfig.optionsHash; },
                $delete: function () {
                    fire("delete");
                    function clearMe() {
                        for (var x in this)
                            if (this[x] && this[x].isAccessor)
                                delete this[x];
                    }
                    if (innerConfig.isNew) {
                        clearMe.call(this);
                        innerConfig.isDeleted = true;
                    } else {
                        var url = box.RouteProvider().createRoute(this.url(), this, false);
                        var _self = this;
                        innerConfig.isLoading = true;
                        box.HttpBackend()
                            .del(url)
                            .done(function () { innerConfig.isDeleted = true; clearMe.call(_self); })
                            .always(function () { innerConfig.isLoading = false; });
                    }
                    return null;
                },
                $save: function () {
                    if (innerConfig.isDeleted)
                        throw new ReferenceError("You cannot save a deleted resource.");
                    if (innerConfig.isDirty) {
                        var provider = box.RouteProvider(),
                            url = provider.createRoute(this.url(), this, false),
                            _self = this;
                        innerConfig.isLoading = true;
                        box.HttpBackend()[innerConfig.isNew ? "post" : "put"](url, this.toJson())
                            .done(function (response) {
                                response = config.ajax.parseJson().call(this, response);
                                setUtils = server;
                                for (var x in response) {
                                    if (_self[x] && _self[x].backdoor) {
                                        _self[x].backdoor(response[x]);
                                        _self[x].isDirty(false);
                                    } else if (_self[x] && _self[x].isAccessor) {
                                        _self[x](response[x]);
                                        _self[x].isDirty(false);
                                    }
                                }
                                innerConfig.isDirty = innerConfig.isNew = false;
                            })
                            .always(function () { innerConfig.isLoading = false; });
                    }
                }
            });

        }
    };

    return resourceUtils;	
});