var genius = {};
(function () {
    genius.utils = {
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
            var index = genius.utils.indexOf(haystack, needle);
            return index !== -1;
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
        }
    };

    function TypeConfig(nullable, defaultTo) {
        this.nullable = genius.utils.accessor(nullable);
        this.defaultTo = genius.utils.accessor(defaultTo);
    };

    genius.config = {
        types: {
            bool: new TypeConfig(false, false),
            string: new TypeConfig(false, ""),
            date: new TypeConfig(true, function () { return new Date(); }),
            number: new TypeConfig(false, 0),
            dynamic: new TypeConfig(true, null),
            custom: new TypeConfig(true, null)
        }
    };

    function Dependency(name, resource, box) {
        this.singleton = function () {
            var called = false,
                instance;
            box[name] = function () {
                if (!called) {
                    called = true;
                    instance = resource();
                }
                return instance;
            };
        };
        this.service = function () { };
        this.valueOf = resource;
    };

    Object.reservedKeywords = (function () {
        var obj = {};
        var output = [];
        for (var x in obj) {
            output.push(x);
        }
        return output;
    }());

    function Modules() {
        this.register = function (name, module) {
            this[name] = module;
        };
    }

    Modules.reservedKeywords = ["register"].concat(Object.reservedKeywords);

    function Box() {
        this.kernel = new Kernel(this);
        this.modules = new Modules();
        this.modules.register("realDataModule", {});
        this.modules.register("testDataModule", {});
        this.kernel.add(this.modules.realDataModule);
    };
    Box.prototype = {
        set: function (name, resource) {
            this[name] = resource;
            return new Dependency(name, resource, this);
        }
    };
    Box.reservedKeywords = ["kernel", "modules"].concat(Object.reservedKeywords);
    function Kernel(box) {
        var modules = [];
        this.add = function (module) {
            if (!genius.utils.contains(modules, module)) {
                for (var x in module) {
                    if (!genius.utils.contains(Box.reservedKeywords, x)) {
                        box[x] = module[x].valueOf; 
                    }
                }
            }
        };
        this.dependency = function (resource) {
            var output = {
                service: function () { resource.valueOf = resource; return resource; },
                singleton: function () {
                    var called = false, instance;
                    var output = function () {
                        if (!called) {
                            called = true;
                            instance = resource();
                        }
                        return instance;
                    }
                    output.valueOf = output;
                    return output;
                }
            };
            output.valueOf = resource;
            return output;
        };
        this.wipe = function () {
            for (var x in box) {
                if (!genius.utils.contains(Box.reservedKeywords, x)) {
                    delete box[x];
                }
            }
        };
        this.reset = function () {
            this.wipe();
            Box.call(box);
        };
    };

    (function () {
        function TypeOptions(options) {
            this.defaultSpecified = options && options.hasOwnProperty("defaultTo");
            this.nullableSpecified = options && options.hasOwnProperty("nullable");
            options = options || {};
            this.defaultTo = typeof options.defaultTo == "function" ? options.defaultTo : function () { return options.defaultTo } || function () { };
            this.nullable = !(!options.nullable);
        };
        function isNullOrUndefined(value) {
            return typeof value == "undefined" || (typeof value == "object" && !value);
        }
        function throwItType(value, desiredTypeString, nullable) {
            if (typeof value == desiredTypeString) return;
            if (nullable && isNullOrUndefined(value)) return;
            throw new TypeError("Value must be of type " + desiredTypeString + (nullable ? ", null, or undefined" : ""));
        };
        function throwItClass(value, constructor, nullable) {
            if (value instanceof constructor) return;
            if (nullable && isNullOrUndefined(value)) return;
            throw new TypeError("Value must be of custom type " + constructor.name + (nullable ? ", null, or undefined" : ""));
        }

        function BoolType(options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.bool.nullable();
            var dflt = options.defaultSpecified ? options.defaultTo() : genius.config.types.bool.defaultTo();
            throwItType(dflt, "boolean", true);
            this.accessor = function () {
                var value = dflt;
                var output = function () {
                    if (arguments.length > 0) {
                        throwItType(arguments[0], "boolean", nullable);
                        value = arguments[0];
                    }
                    return value;
                };
                output.isAccessor = true;
                return output;
            }
        };
        function StringType(options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.string.nullable();
            var dflt = options.defaultSpecified ? options.defaultTo() : genius.config.types.string.defaultTo();
            throwItType(dflt, "string", true);
            this.accessor = function () {
                var value = dflt;
                var output = function () {
                    if (arguments.length) {
                        throwItType(arguments[0], "string", nullable);
                        value = arguments[0];
                    }
                    return value;
                };
                output.isAccessor = true;
                return output;
            };
        };
        function NumberType(options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.number.nullable();
            var dflt = options.defaultSpecified ? options.defaultTo() : genius.config.types.number.defaultTo();
            throwItType(dflt, "number", true);
            this.accessor = function () {
                var value = dflt;
                var output = function () {
                    if (arguments.length) {
                        throwItType(arguments[0], "number", nullable);
                        value = arguments[0];
                    }
                    return value;
                };
                output.isAccessor = true;
                output.throwIt = function () {
                    throwItType(value, "number", nullable);
                }
                return output;
            };
        };
        function DateType(options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.date.nullable();
            var dflt;
            if (options.defaultSpecified) {
                dflt = options.defaultTo();
            } else {
                var dflt = genius.config.types.date.defaultTo();
                (typeof dflt == "function")
                dflt = dflt();
            }
            throwItClass(dflt, Date, true);
            this.accessor = function () {
                var value = dflt;
                var output = function () {
                    if (arguments.length) {
                        throwItClass(arguments[0], Date, nullable);
                        value = arguments[0];
                    }
                    return value;
                };
                output.isAccessor = true;
                output.throwIt = function () {
                    throwItClass(value, Date, nullable);
                }
                return output;
            };
        };
        function DynamicType(options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.dynamic.nullable();
            var dflt = options.defaultSpecified ? options.defaultTo() : genius.config.types.dynamic.defaultTo();

            this.accessor = function () {
                var value = dflt;
                var output = function () {
                    if (arguments.length) {
                        if (!nullable && isNullOrUndefined(arguments[0]))
                            throw new TypeError("Dynamic value cannot be null or undefined");
                        value = arguments[0];
                    }
                    return value;
                };
                output.isAccessor = true;
                output.throwIt = function () {
                    if (!nullable && isNullOrUndefined(value))
                        throw new TypeError("Dynamic value cannot be null or undefined");
                }
                return output;
            };
        };
        function CustomType(type, options) {
            var nullable = options.nullableSpecified ? options.nullable : genius.config.types.custom.nullable();
            var dflt = options.defaultSpecified ? options.defaultTo() : genius.config.types.custom.defaultTo();
            throwItClass(dflt, type, true);
            this.accessor = function () {
                var value = dflt;
                var output = function () {
                    if (arguments.length) {
                        throwItClass(arguments[0], type, true);
                        value = arguments[0];
                    }
                    return value;
                };
                output.isAccessor = true;
                output.throwIt = function () {
                    throwItClass(value, type, nullable);
                }
                output.customType = type;
                return output;
            };
        };

        genius.types = function (type, options) { return new CustomType(type, new TypeOptions(options)); };

        genius.utils.extend(genius.types, {
            bool: function (options) { return new BoolType(new TypeOptions(options)); },
            string: function (options) { return new StringType(new TypeOptions(options)); },
            number: function (options) { return new NumberType(new TypeOptions(options)); },
            dynamic: function (options) { return new DynamicType(new TypeOptions(options)); },
            date: function (options) { return new DateType(new TypeOptions(options)); }
        });
    }());

    var Resource;
    (function () {
        function initializeFlags() {
            var isDirty = true,
                isNew = true,
                isLoading = true;
            genius.utils.extend(this, {
                isDirty: function () { return isDirty; },
                isNew: function () { return isNew; },
                isLoading: function () { return isLoading; },
                $save: function () {
                    if (isDirty)
                        genius.box.HttpBackend()[isNew ? "post" : "put"](this.url(), this.toJson())
                            .done(function (response) { this.parse(response); })
                            .done(function () { isLoading = false; });
                }
            });
        };
        function setVarTyping(hash) {
            for (var x in hash) {
                this[x] = hash[x].accessor ? hash[x].accessor() : hash[x];
            }
        };
        function populateTypedVars(options) {
            for (var x in options) {
                if (this[x] && this[x].isAccessor) {
                    if (this[x].customType) {
                        var newed = new this[x].customType(options[x]);
                        populateTypedVars.call(newed, options[x]);
                        this[x](newed);
                    } else {
                        this[x](options[x]);
                    }
                } else if (typeof options[x] == "function") {
                    this[x] = options[x];
                } else {
                    this[x] = genius.types.dynamic({ nullable: true }).accessor();
                    this[x](options[x]);
                }
            }
            for (var x in this) {
                if (typeof this[x].throwIt == "function")
                    this[x].throwIt();
            }
        }
        var initializing = false;
        Resource = function () {};
        Resource.extend = function (typeOptions) {
            initializing = true;
            var prototype = new this();
            initializing = false;

            for (var x in typeOptions) {
                if (typeof typeOptions[x] == "function")
                    prototype[x] = typeOptions[x];
            }

            var Resource = function (options) {
                if (!initializing) {
                    if (typeof this.init == "function")
                        this.init.apply(this, arguments);
                    setVarTyping.call(this, typeOptions);
                    initializeFlags.call(this);
                    populateTypedVars.call(this, options);
                }
            };

            Resource.prototype = prototype;
            Resource.extend = arguments.callee;
            return Resource;
        };
    }());

    genius.box = new Box();
    genius.Resource = Resource;
}());
