/*
Genius JavaScript Library v0.0.1
(c) Cameron Edwards - http://www.geniusjs.com
License: GNU 3.0 (http://opensource.org/licenses/GPL-3.0)
*/

var genius = {};
(function () {
    //Utils
    (function () {
        genius.utils = {
            cases: {
                camelObject: function (obj) {
                    var copy = {};
                    for (var x in obj) {
                        var value = obj[x];
                        copy[genius.utils.cases.pascalToCamel(x)] =
                            typeof value == "object" ?
                                genius.utils.cases.camelObject(value) :
                                value;
                    }
                    return copy;
                },
                isCapitalized: function (str) {
                    return /[A-Z]/.test(str.charAt(0));
                },
                pascalToCamel: function (str) {
                    return str.charAt(0).toLowerCase() + str.substr(1);
                }
            },
            trim: function (str) {
                return str.replace(/^\s+/, "").replace(/\s+$/, "");
            },
            except: function (obj, exceptions) {
                var output = {};
                for (var x in obj) {
                    if (!genius.utils.contains(exceptions, x))
                        output[x] = obj[x];
                }
                return output;
            },
            random: function (min, max) {
                return (Math.random() * (max - min)) + min;
            },
            map: function (array, callback) {
                var copy = [];
                for (var i = 0; i < array.length; i++) {
                    copy[i] = callback.call(this, array[i]);
                }
                return copy;
            },
            isNullOrUndefined: function (value) {
                return typeof value == "undefined" || (typeof value == "object" && !value);
            },
            trace: function (depth) {
                var output = arguments.callee.caller;
                for (var i = 0; i < depth; i++) {
                    output = output.arguments.callee.caller;
                }
                console.log(output.toString());
            },
            partial: function(callback){
                return function () {
                    return callback.apply(this, genius.utils.toArray(arguments).slice(1));
                };
            },
            toArray: function (iterable) {
                var arr = [];
                for (var i = 0; i < iterable.length; i++) {
                    arr.push(iterable[i]);
                }
                return arr;
            },
            accessor: function (value) {
                return function () {
                    if (arguments.length)
                        value = arguments[0];
                    return value;
                };
            },
            extend: function (obj1, obj2) {
                for (var x in obj2) {
                    obj1[x] = obj2[x];
                }
            },
            contains: function (haystack, needle) {
                return genius.utils.indexOf(haystack, needle) !== -1;
            },
            indexOf: function (haystack, needle) {
                if (Array.prototype.indexOf) {
                    return Array.prototype.indexOf.call(haystack, needle);
                } else {
                    for (var i = 0; i < haystack.length; i++) {
                        if (haystack[i] === needle)
                            return i;
                    }
                    return -1;
                }
            },
            once: function (func) {
                var called = false, result;
                var output = function (one, two, three) {
                    if (!called) {
                        called = true;
                        result = func.apply(this, arguments);
                    }
                    return result;
                };
                return output;
            }
        };
    }());

    //Config
    (function () {
        var Config = function () {
            this.ajax = {
                transformToCamelCase: genius.utils.accessor(false),
                parseJson: genius.utils.accessor(function (response) {
                    return genius.config.ajax.parseJs().call(this, JSON.parse(response));
                }),
                parseJs: genius.utils.accessor(function (response) {
                    return response;
                }),
                reset: function () {
                    this.transformToCamelCase(false);
                }
            };
        };
        Config.prototype = {
            reset: function (options) {
                this.types.reset(options);
                this.ajax.reset(options);
            }
        };
        genius.config = new Config();
    }());

    //Dependency Injection
    (function () {
        function AttachedDependency(name, resource, box) {
            this.singleton = function () {
                box[name] = genius.utils.once(resource);
            };
            this.service = function () { };
            this.value = resource;
        };

        function DetachedDependency(resource) {
            this.service = function () { resource.value = resource; return resource; };
            this.singleton = function () {
                var output = genius.utils.once(resource);
                output.value = output;
                return output;
            };
            this.value = resource;
        };

        Object.reservedKeywords = (function () {
            var obj = {};
            var output = [];
            for (var x in obj) {
                output.push(x);
            }
            return output;
        }());

        function Modules() { }

        Modules.prototype = {
            register: function (name, module) {
                this[name] = module;
            }
        };

        Modules.reservedKeywords = ["register"].concat(Object.reservedKeywords);

        function Box() {
            this.kernel = new Kernel(this);
            this.modules = new Modules();
            var _self = this;
            this.kernel.add(this.modules.realDataModule);
        };
        Box.prototype = {
            set: function (name, resource) {
                this[name] = resource;
                return new AttachedDependency(name, resource, this);
            }
        };
        Box.reservedKeywords = ["kernel", "modules", "RouteProvider"].concat(Object.reservedKeywords);
        function Kernel(box) {
            var modules = [];
            this.add = function (module) {
                if (!genius.utils.contains(modules, module)) {
                    for (var x in module) {
                        if (!genius.utils.contains(Box.reservedKeywords, x)) {
                            box[x] = module[x].value;
                        }
                    }
                }
            };
            this.dependency = function (resource) {
                return new DetachedDependency(resource);
            };
            this.wipe = function (module) {
                for (var x in module) {
                    if (!genius.utils.contains(Box.reservedKeywords, x) && box[x] == module[x].value) {
                        delete box[x];
                    }
                }
            };
            this.reset = function () {
                this.wipe();
//                Box.call(box);
            };
        };
        genius.box = new Box();
    }());

    var markDirty = true, cleanDirties = false;
    //Types
    (function () {
        function TypeConfigSet() {
            this.bool = new TypeConfig(false, false);
            this.string = new TypeConfig(false, "");
            function dateParseJs(val) {
                if (val instanceof Date)
                    return val;
                var regex = /^\d{4}\-\d{2}\-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z$/;
                if (typeof val == "string" && regex.test(val.replace(/^"/, "").replace(/$"/, ""))) {
                    val = genius.utils.trim(val.replace(/[^\d]/g, " "));
                    var split = genius.utils.map(val.split(/\s+/), parseInt);
                    return new Date(split[0], split[1] - 1, split[2], split[3], split[4], split[5]);
                }
                return val;
            }
            this.date = new TypeConfig(true,
                function () { return new Date(); },
                dateParseJs,
                dateParseJs,
                function (val) { return val.toISOString(); });
            this.number = new TypeConfig(false, 0);
            this.dynamic = new TypeConfig(true, null);
            this.custom = new TypeConfig(true, null, function (val, type) {
                return val;
                //if (val instanceof type)
                //    return val;
                //else
                //    return new type(val);
            }, function (val, type) {
                if (val instanceof type)
                    return val;
                var output = new type(val);
                for (var x in val)
                    if (!output[x])
                        output[x] = genius.types.dynamic().getInstance().initialize(val[x]).accessor();
                return output;
            });
        };
        TypeConfigSet.permanentProperties = ["bool", "string", "date", "number", "dynamic", "custom", "add", "reset"];
        TypeConfigSet.prototype = {
            add: function (name, type, options) {
                options = options || {};
                var camellized = genius.utils.cases.pascalToCamel(name);
                var config = this[camellized] = new TypeConfig(true, null, options.parseJs);
                genius.types[camellized] = function () {
                    return {
                        getInstance: function (options) {
                            return new Class(new TypeOptions(options), type, "custom", true);
                        }
                    }
                };
            },
            reset: function (options) {
                var deleteExtras = options && options.hard;
                for (var x in this) {
                    if (deleteExtras && !genius.utils.contains(TypeConfigSet.permanentProperties, x))
                        delete this[x];
                    else if (this[x].reset)
                        this[x].reset();
                }
                TypeConfigSet.call(this);
            }
        };

        var parseDefault = function (val) { return val; };
        function TypeConfig(nullable, defaultTo, parseJs, parseInit, toQuery) {
            this.nullable = genius.utils.accessor(nullable);
            this.defaultTo = genius.utils.accessor(defaultTo);
            this.parseJs = genius.utils.accessor(parseJs || parseDefault);
            this.parseInit = genius.utils.accessor(parseInit || parseDefault);
            this.toQuery = genius.utils.accessor(toQuery || parseDefault);
            var myParse = this.parseJs();
            this.parseJson = genius.utils.accessor();
            var orig = [this.nullable(), this.defaultTo(), this.parseJs(), this.parseJson(), this.parseInit()];
            this.reset = function () {
                this.nullable(orig[0]);
                this.defaultTo(orig[1]);
                this.parseJs(orig[2]);
                this.parseJson(orig[3]);
                this.parseInit(orig[4]);
            };
        };

        genius.config.types = new TypeConfigSet();

        function TypeOptions(options) {
            options = options || {};
            this.defaultSpecified = options.hasOwnProperty("defaultTo");
            this.nullableSpecified = options.hasOwnProperty("nullable");
            this.defaultTo = typeof options.defaultTo == "function" ? options.defaultTo : function () { return options.defaultTo } || function () { };
            this.toQuery = options.toQuery;

            this.nullable = !(!options.nullable);
            this.parseInit = options.parseInit;
            this.parseJs = options.parseJs;
        };
        function getDefault(str, options) {
            if (options.defaultSpecified)
                return options.defaultTo();
            var def = genius.config.types[str].defaultTo();
            return typeof def == "function" ? def() : def;
        };
        function throwItType(value, desiredTypeString, nullable) {
            if (typeof value == desiredTypeString) return;
            if (nullable && genius.utils.isNullOrUndefined(value)) return;
            throw new TypeError("Value must be of type " + desiredTypeString + (nullable ? ", null, or undefined" : ""));
        };
        function throwItClass(value, constructor, nullable) {
            if (value instanceof constructor) return;
            if (nullable && genius.utils.isNullOrUndefined(value)) return;
            throw new TypeError("Value must be of custom type " + constructor.name + (nullable ? ", null, or undefined" : ""));
        }

        function setFromServer(value, current, filter, parse, changeCallbacks) {
            //parsing modes need to be different. parseSet vs parseFromServer, perhaps?
            value = parse(value);
            filter(value);
            if (value !== current) {
                for (var x in changeCallbacks) {
                    changeCallbacks[x].call(this, value, current);
                }
            }
            return value;
        };
        function setFromClient(value, current, filter, parse) {
            value = parse(value);
            filter();
        };
        var set = setFromClient;

        function accessor(value, filter, parse, toQuery) {
            var isDirty = false, current = value, changeCallbacks = {};
            var output = function () {
                if (arguments.length) {
                    arguments[0] = parse(arguments[0]);
                    filter(arguments[0]);
                    value = arguments[0];
                    if (value !== current) {
                        if (markDirty)
                            isDirty = true;
                        for (var x in changeCallbacks) {
                            changeCallbacks[x].call(this, value, current);
                        }
                    }
                }
                return value;
            };
            var index = 0;
            genius.utils.extend(output, {
                subscribe: function (callback) {
                    changeCallbacks[index] = callback;
                    return index++;
                },
                unsubscribe: function (id) {
                    delete changeCallbacks[id];
                },
                isDirty: function () {
                    if (arguments.length && cleanDirties) {
                        isDirty = arguments[0];
                    }
                    return isDirty;
                },
                throwIt: function () {
                    filter(value);
                },
                toQuery: function () {
                    return toQuery.call(this, value);
                }
            });
            output.isAccessor = true;
            return output;
        };

        function Type(options, geniusTypeName, typeName) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types[geniusTypeName].nullable();
            var dflt = getDefault(geniusTypeName, options);
            this.default = function () { return dflt; };
            this.nullable = function () { return nullable; };
            throwItType(dflt, typeName, true);
            function parseJs(val) {
                if (options.parseJs)
                    return options.parseJs.call(window, val);
                return genius.config.types[geniusTypeName].parseJs().call(window, val);
            };
            var initParser = genius.utils.once(function () {
                return options.parseInit ? options.parseInit : genius.config.types[geniusTypeName].parseInit();
            });
            var _self = this;
            this.initialize = genius.utils.once(function (val) {
                var placeholder = initParser().call(window, val);
                throwItType(placeholder, typeName, nullable);
                dflt = placeholder;
                return _self;
            });
            this.accessor = genius.utils.once(function () {
                return accessor(dflt,
                    function (val) { throwItType(val, typeName, nullable); },
                    parseJs, options.toQuery || genius.config.types[geniusTypeName].toQuery());
            });
        };

        function Class(options, type, geniusTypeName, custom) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types[geniusTypeName].nullable();
            var dflt = getDefault(geniusTypeName, options);
            this.default = function () { return dflt; };
            this.nullable = function () { return nullable; };
            throwItClass(dflt, type, true);
            var initParser = genius.utils.once(function () {
                return options.parseInit ? options.parseInit : genius.config.types[geniusTypeName].parseInit();
            });
            var parseJs = function (val) {
                if (options.parseJs)
                    return options.parseJs.call(window, val, type);
                if (val instanceof type)
                    return val;
                else if (config = genius.config.types[geniusTypeName])
                    return config.parseJs().call(window, val, type);
                else
                    return new type(val);
            };
            var throwIt = function (val) { throwItClass(val, type, nullable); };
            var _self = this;
            this.initialize = genius.utils.once(function (val) {
                var placeholder = initParser().call(window, val, type);
                throwIt(placeholder);
                dflt = placeholder;
                return _self;
            });
            this.accessor = genius.utils.once(function () {
                var output = accessor(dflt, throwIt, parseJs, options.toQuery || genius.config.types[geniusTypeName].toQuery());
                if (custom)
                    output.customType = type;
                return output;
            });
        };

        function DynamicType(options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.dynamic.nullable();
            var dflt = getDefault("dynamic", options);
            this.default = function () { return dflt; };
            this.nullable = function () { return nullable; };
            var initParser = genius.utils.once(function () {
                return options.parseInit ? options.parseInit : genius.config.types.dynamic.parseInit();
            });
            function parseJs(val) {
                return options.parseJs ? options.parseJs.call(window, val) : genius.config.types.dynamic.parseJs().call(window, val);
            };
            var _self = this;
            this.initialize = genius.utils.once(function (val) {
                var placeholder = initParser().call(this, val);
                throwItNull(placeholder);
                dflt = placeholder;
                return _self;
            });
            function throwItNull(val) {
                if (!nullable && genius.utils.isNullOrUndefined(val))
                    throw new TypeError("Dynamic value cannot be null or undefined");
            };
            this.accessor = genius.utils.once(function () {
                return accessor(dflt, throwItNull, parseJs, options.toQuery || genius.config.types.dynamic.toQuery());
            });
        };

        function PlatonicType(options, typeName, geniusTypeName) {
            options = new TypeOptions(options);
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.bool.nullable();
            var dflt = getDefault(geniusTypeName, options);
            throwItType(dflt, typeName, true);
            this.getInstance = function () {
                return new Type(options, geniusTypeName, typeName);
            };
            this.nullable = function () { return nullable; };
            this.getDefault = function () { return dflt };
        };

        genius.types = function (type, options) { return { getInstance: function () { return new Class(new TypeOptions(options), type, "custom", true); }, customType: type } };

        genius.utils.extend(genius.types, {
            collection: function (type) {
                var Collection = genius.Collection.extend({ type: type });
                return {
                    getInstance: function () {
                        return new Collection();
                    }
                };
            },
            bool: function (options) {
                return new PlatonicType(options, "boolean", "bool");
            },
            string: function (options) {
                return new PlatonicType(options, "string", "string");
            },
            number: function (options) {
                return new PlatonicType(options, "number", "number");
            },
            dynamic: function (options) {
                options = new TypeOptions(options);
                var nullable = options.nullableSpecified ? options.nullable : genius.config.types.bool.nullable();
                var dflt = getDefault("dynamic", options);
                return {
                    getInstance: function () { return new DynamicType(options); },
                    nullable: function () { return nullable; },
                    getDefault: function () { return dflt; }
                };
            },
            date: function (options) {
                options = new TypeOptions(options);
                var nullable = options.nullableSpecified ? options.nullable : genius.config.types.date.nullable();
                var dflt = getDefault("date", options);
                throwItClass(dflt, Date, true);
                return {
                    getInstance: function () { return new Class(options, Date, "date"); },
                    nullable: function () { return nullable; },
                    getDefault: function () { return dflt; }
                };
            }
        });
    }());

    //Resource
    (function () {
        var noInitialize = false, globalIsNew = true;
        function initializeFlags(options) {
            var callbacks = { none: {} };
            var isDirty = !noInitialize,
                isNew = globalIsNew,
                isLoading = noInitialize,
                isDeleted = false,
                callbackIndex = 0;
            function fire(event) {
                var set;
                if (set = callbacks[event]) {
                    for (var x in set) {
                        set[x].apply(this, genius.utils.toArray(arguments).slice(1));
                    }
                }
            }
            genius.utils.extend(this, {
                subscribe: function (event, callback) {
                    event = typeof event == "string" ? event : "change";
                    callback = typeof event == "string" ? callback : event;
                    if (!callbacks[event]) callbacks[event] = {};
                    callbacks[event][callbackIndex++] = callback;
                },
                unsubscribe: function (callbackId) {
                    var output = false;
                    for (var x in callbacks) {
                        if (callbacks[x][callbackId]) {
                            output = true;
                            delete callbacks[x][callbackId];
                            break;
                        }
                    }
                    return output;
                },
                isDirty: function () { return isDirty; },
                isNew: function () { return isNew; },
                isLoading: genius.utils.accessor(isLoading),
                isDeleted: function () { return isDeleted; },
                $delete: function () {
                    fire("delete");
                    function clearMe() {
                        for (var x in this)
                            if (this[x] && this[x].isAccessor)
                                delete this[x];
                    }
                    if (isNew) {
                        clearMe.call(this);
                        isDeleted = true;
                    } else {
                        var url = genius.box.RouteProvider().createRoute(this.url(), this, false);
                        var _self = this;
                        this.isLoading(true);
                        genius.box.HttpBackend()
                            .del(url)
                            .done(function () { isDeleted = true; clearMe.call(_self); })
                            .always(function () { _self.isLoading(false); });
                    }
                    return null;
                },
                $save: function () {
                    if (isDeleted)
                        throw new ReferenceError("You cannot save a deleted resource.");
                    if (isDirty) {
                        var provider = genius.box.RouteProvider(),
                            url = provider.createRoute(this.url(), this, false),
                            _self = this;
                        this.isLoading(true);
                        genius.box.HttpBackend()[isNew ? "post" : "put"](url, this.toJson())
                            .done(function (response) {
                                response = genius.config.ajax.parseJson().call(this, response);
                                markDirty = false;
                                cleanDirties = true;
                                for (var x in response) {
                                    console.log(x);
                                    if (x == "favoriteToy")
                                        console.log("I'm a toy.");
                                    if (_self[x] && _self[x].isAccessor) {
                                        _self[x](response[x]);
                                        _self[x].isDirty(false);
                                    }
                                }
                                markDirty = true;
                                cleanDirties = true;
                                isDirty = false;
                            })
                            .always(function () { _self.isLoading(false); });
                    }
                },
                optionsHash: function () {
                    return options;
                }
            });
            return function (val) { if (markDirty) isDirty = val; };
        };
        function setVarTyping(hash) {
            for (var x in hash) {
                if (x !== "uniqKey" && x !== "url")
                    this[x] = hash[x];
            }
        };
        function populateTypedVar(x, value, dirtyAccessor) {
            var toCamel = genius.config.ajax.transformToCamelCase();
            if (toCamel && genius.utils.cases.isCapitalized(x)) {
                var camellized = genius.utils.cases.pascalToCamel(x);
                populateTypedVar.call(this, camellized, value, dirtyAccessor);
                if (this[x])
                    this[x] = this[camellized];
                return;
            }
            if (typeof value == "object" && toCamel) {
                value = genius.utils.cases.camelObject(value);
            }
            if (this[x] && this[x].getInstance) {
                this[x] = this[x].getInstance().initialize(value).accessor();
                this[x].subscribe(function () { dirtyAccessor(true); });
            } else if (typeof value == "function") {
                this[x] = value;
            } else {
                this[x] = genius.types.dynamic({ nullable: true }).getInstance().initialize(value).accessor();
            }
        };
        function populateTypedVars(options, dirtyAccessor) {
            for (var x in options) {
                populateTypedVar.call(this, x, options[x], dirtyAccessor);
            }
            for (var x in this) {
                if (typeof this[x].getInstance == "function") {
                    this[x] = this[x].getInstance().accessor();
                    this[x].subscribe(function () { dirtyAccessor(true); });
                }
                if (typeof this[x].throwIt == "function") {
                    try {
                        this[x].throwIt();
                    } catch (e) {
                        throw e;
                    }
                }
            }
        }
        var initializing = false;
        var Resource = function () { };
        Resource.prototype = {
            changedProperties: function () {
                var output = {};
                for (var x in this) {
                    if (this[x].isAccessor && this[x].isDirty())
                        output[x] = this[x]();
                }
                return output;
            },
            properties: function () {
                var output = {};
                for (var x in this) {
                    if (this[x].isAccessor)
                        output[x] = this[x];
                    else
                        continue;
                    if (output[x]() instanceof Resource)
                        output[x] = output[x].properties();
                }
                return output;
            },
            toJs: function () {
                var output = {};
                for (var x in this) {
                    if (this[x].toJs)
                        output[x] = this[x].toJs();
                    else if (this[x].isAccessor)
                        output[x] = this[x]();
                    else
                        continue;
                    if (output[x] instanceof Resource)
                        output[x] = output[x].toJs();
                }
                return output;
            },
            toJson: function () {
                return JSON.stringify(this.toJs());
            }
        };
        function drillDown(str) {
            var split = str.split(".");
            var output = this[split[0]];
            for (var i = 1; i < split.length; i++) {
                if (!output[split[i]])
                    return;
                output = output[split[i]].isAccessor ? output[split[i]]() : output[split[i]];
            }
            return output;
        };
        Resource.extend = function (typeOptions) {
            var dirtyAccessor;
            if (typeOptions.uniqKey && (field = typeOptions[typeOptions.uniqKey])) {
                if (!field.nullable())
                    throw new TypeError("Unique keys must be nullable");
                if (!genius.utils.isNullOrUndefined(field.getDefault()))
                    throw new TypeError("Unique keys must default to undefined or null");
            }
            var instances = {};
            function getKey(options) {
                if (typeOptions.uniqKey) {
                    var key = drillDown.call(options, typeOptions.uniqKey);
                    return key;
                }
            };
            var myUrl = typeof typeOptions.url == "function" ? typeOptions.url : function () { return typeOptions.url || ""; };

            initializing = true;
            var prototype = new this();
            initializing = false;

            for (var x in typeOptions) {
                if (typeof typeOptions[x] == "function")
                    prototype[x] = typeOptions[x];
            }
            prototype.url = myUrl;

            var Resource = function (options) {
                if (!initializing) {
                    if (typeof this.init == "function")
                        this.init.apply(this, arguments);
                    dirtyAccessor = initializeFlags.call(this, options);
                    function Resource() {
                        var key = getKey(options || {});
                        if (key) {
                            var instance = instances[key];
                            if (instance) {
                                populateTypedVars.call(instance, options);
                                return instance;
                            }
                            instances[key] = this;
                        }
                        setVarTyping.call(this, typeOptions);
                        if (!noInitialize)
                            populateTypedVars.call(this, options, dirtyAccessor);
                    };
                    Resource.prototype = this;
                    return new Resource();
                }
            };

            Resource.prototype = prototype;
            Resource.extend = arguments.callee;
            Resource.$query = function (data) {
                data = data || {};
                var Collection = genius.Collection.extend({ type: genius.types(Resource) });
                var collection = new Collection();
                var backend = genius.box.HttpBackend();
                var url = genius.box.RouteProvider().createRoute(myUrl(), data);
                collection.$promise = backend.get(url)
                    .done(function (response) {
                        globalIsNew = false;
                        var parsed = genius.config.ajax.parseJson().call(this, response);
                        collection.concat(parsed);
                        globalIsNew = true;
                        collection.isLoading(false);
                    });
                return collection;
            };

            Resource.$get = function (data) {
                var backend = genius.box.HttpBackend();
                var url = genius.box.RouteProvider().createRoute(myUrl(), data);

                noInitialize = true;
                globalIsNew = false;
                var output = new this();
                for (var x in data) {
                    if (output[x] && output[x].getInstance)
                        output[x] = output[x].getInstance().initialize(data[x]).accessor();
                }
                noInitialize = false;
                globalIsNew = true;

                var dirtyPlaceholder = dirtyAccessor;

                var promise = backend.get(url)
                    .done(function (response) {
                        var parsed = genius.config.ajax.parseJson().call(this, response);
                        if (typeOptions.parseJs)
                            parsed = typeOptions.parseJs(parsed);
                        populateTypedVars.call(output, parsed, dirtyPlaceholder);
                    })
                    .done(function () {
                        output.isLoading(false);
                    });
                output.$promise = promise;
                return output;
            };
            return Resource;
        };
        genius.Resource = Resource;
    }());

    //Collection
    (function () {
        function Collection(options) {
            options = options || {};
            this.push = function (val) {
                if (options.type) {
                    val = options.type.getInstance().initialize(val).accessor().call();
                }
                if (options.unique && genius.utils.contains(this, val))
                    return this.length;
                var output = (!options.unique || !genius.utils.contains(this, val)) ?
                    Array.prototype.push.call(this, val) :
                    this.length;
                return output;
            };
            this.concat = function (arr) {
                if (options.type)
                    arr = genius.utils.map(arr, function (val) {
                        return options.type.getInstance().initialize(val).accessor().call();
                    });
                return Array.prototype.push.apply(this, arr);
            };
            this.removeAll = function () {
                this.splice(0);
            };
            this.remove = function (val) {
                var index;
                while ((index = genius.utils.indexOf(this, val)) !== -1) {
                    this.splice(index, 1);
                }
            };
        };
        Collection.prototype = [];
        var initializing = false;
        Collection.extend = function (configOptions) {
            configOptions = configOptions || {};
            initializing = true;
            var prototype = new this();
            initializing = false;
            
            var type = configOptions.type,
                unique = configOptions.unique;

            prototype.toJs = function () {
                return genius.utils.map(this, function (val) { return val.toJs ? val.toJs() : val; }).slice(0, this.length);
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

            prototype.push = function (val) {
                if (type) {
                    val = type.getInstance().initialize(val).accessor().call();
                }
                if (unique && genius.utils.contains(this, val))
                    return this.length;
                if (val instanceof genius.Resource) {
                    var _self = this;
                    val.subscribe("delete", function () {
                        _self.remove(val); 
                    });
                }
                var output = (!unique || !genius.utils.contains(this, val)) ?
                    Array.prototype.push.call(this, val) :
                    this.length;
                return output;
            };

            if (concat = Array.prototype.concat) {
                prototype.concat = function (arr) {
                    if (type)
                        arr = genius.utils.map(arr, function (val) {
                            val = type.getInstance().initialize(val).accessor().call();
                            if (val instanceof genius.Resource) {
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
                    this.isLoading = genius.utils.accessor(true);
                    this.type = function () { return type; };
                    this.isDirty = genius.utils.accessor(false);
                    var changeCallbacks = {}, index = 0;
                    this.subscribe = function (callback) {
                        changeCallbacks[index] = callback;
                        return index++;
                    };
                    this.fire = function () { };
                }
            };
            Collection.prototype = prototype;
            Collection.extend = arguments.callee;
            return Collection;
        };
        genius.Collection = Collection;
    }());

    //Deferred
    (function () {
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
        genius.deferred = function () { return new Deferred(); };
    }());

    //Fake Backend
    (function () {
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
                var def = genius.deferred();
                this.pendingRequests[action + "-" + url] = def;
                return def.promise();
            }
            return {
                get: function (url) {
                    return fakeRequest.call(this, "get", url);
                },
                put: function (url) {
                    return fakeRequest.call(this, "put",  url);
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
        genius.box.set("FakeHttpBackend", function () { return new FakeBackend(); }).singleton();
    }());

    //Real Backend
    (function () {
        function RealBackend() { };
        function req(url, method, body) {
            var def = genius.deferred();
            var xhr = genius.box.XHR();
            xhr.open(method, url, true);
            xhr.setRequestHeader("Accepts", "application/json");
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function () {
                console.log("state change: ", xhr.readyState, xhr.status);
                if (xhr.readyState == 4 && xhr.status == 200) {
                    def.resolve(xhr.responseText);
                }
            };
            xhr.send(body);
            return def.promise();
        };
        RealBackend.prototype = {
            get: function (url) {
                return req(url, "GET");
            },
            put: function (url, body) {
                return req(url, "PUT", body);
            },
            post: function (url, body) {
                return req(url, "POST", body);
            },
            del: function (url, body) {
                return req(url, "DELETE", body);
            }
        };
        genius.box.set("RealHttpBackend", function () { return new RealBackend(); });
    }());

    //AsyncQueue
    (function () {
        function AsyncQueue(func) {
            var running = false;
            var _self = this;
            var action = function () {
                func.call().always(function () {
                    if (running)
                        setTimeout(action, _self.buffer());
                });
            };

            this.start = function () { if (!running) { running = true; action(); } };
            this.stop = function () { running = false; };
            this.buffer = genius.utils.accessor(0);
        };
        genius.box.set("AsyncQueue", function () { return new AsyncQueue(); }).service();
    }());

    //RouteProvider
    (function () {
        function param(data) {
            var pairs = [];
            for (var x in data) {
                pairs.push(x + "=" + (data[x].toQuery ? data[x].toQuery() : data[x]));
            }
            return pairs.length ? "?" + pairs.join("&") : "";
        };
        function RouteProvider() { };
        RouteProvider.prototype = {
            createRoute: function (pattern, data, addQuery) {
                var regex = /\:([^\/\.\-]+)/gi;
                var match, output = pattern, alreadyMatched = [];
                while (match = regex.exec(pattern)) { 
                    var capture = match[1], replacement;
                    if (data[capture])
                        replacement = data[capture].isAccessor && data[capture]() ? data[capture]() : (typeof data[capture] !== "function" ? data[capture] : "");
                    else
                        replacement = "";
                    output = output.replace(match[0], replacement);
                    alreadyMatched.push(match[1]);
                }
                if (/\/$/.test(output))
                    output = output.substr(0, output.length - 1);
                if (addQuery !== false)
                    output += param(genius.utils.except(data instanceof genius.Resource ? data.properties() : data, alreadyMatched));
                return output;
            }
        };
        genius.box.set("RouteProvider", function () { return new RouteProvider(); }).singleton();
    }());

    //XHR Object
    (function () {
        if (window.XMLHttpRequest) {
            genius.box.set("XHR", function () { return new XMLHttpRequest(); });
        } else if (window.ActiveXObject) {
            genius.box.set("XHR", function () { return new ActiveXObject("Microsoft.XMLHTTP"); });
        }

    }());

    //Setup
    (function () {
        genius.box.modules.register("realDataModule", {
            HttpBackend: genius.box.kernel.dependency(genius.box.RealHttpBackend)
        });
        genius.box.modules.register("testDataModule", {
            HttpBackend: genius.box.kernel.dependency(genius.box.FakeHttpBackend)
        });
        genius.box.kernel.add(genius.box.modules.realDataModule);
        genius.config.types.date.parseInit();
    }());

}());

