define(["./config", "./setUtils", "./Collection", "./utils"], function (config, setUtils, Collection, utils) {
    var output;

    function TypeConfigSet() {
        this.boolean = new TypeConfig(false, false);
        this.string = new TypeConfig(false, "");
        this.date = new TypeConfig(true, function () { return new Date(); }, {
            parseServerInput: function (val) {
                var regex = /^\d{4}\-\d{2}\-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z$/;
                if (typeof val == "string" && regex.test(val)) {
                    val = utils.trim(val.replace(/[^\d]/g, " "));
                    var split = utils.map(val.split(/\s+/), parseInt);
                    return new Date(split[0], split[1] - 1, split[2], split[3], split[4], split[5]);
                }
                return val;
            },
            toQuery: function (val) {
                return val.toISOString();
            }
        });
        this.collection = new TypeConfig(false, function (options) {
            var Collection = Collection.extend({ type: options.genericType });
            return new Collection();
        }, {
            parseServerInput: function (val, type) {
                return type.fromJs(val);
            }
        });
        this.number = new TypeConfig(false, 0);
        this.dynamic = new TypeConfig(true, null);
        this.custom = new TypeConfig(true, null, {
            parseServerInput: function (val, type) {
                var output = new type();
                for (var x in val) {
                    if (output[x]) {
                        if (output[x].backdoor) {
                            output[x].backdoor(val[x]);
                        } else if (output[x].isAccessor) {
                            output[x](val[x]);
                        } else if (typeof output[x] !== "function") {
                            output[x] = val[x];
                        }
                    } else {
                        output[x] = genius
                            .types
                            .dynamic()
                            .getInstance()
                            .initialize(val[x])
                            .accessor();
                    }
                }
                return output;
            }
        });
    };
    TypeConfigSet.permanentProperties = ["bool", "string", "date", "number", "dynamic", "custom", "add", "reset"];

    TypeConfigSet.prototype = {
        add: function (name, constr, options) {
            options = options || {};
            var camellized = utils.cases.pascalToCamel(name);
            var config = this[camellized] = new TypeConfig(true, null, options);
            output[camellized] = function () {
                return new PlatonicType(options, constr, camellized, throwItClass);
            };
        },
        reset: function (options) {
            var deleteExtras = options && options.hard;
            for (var x in this) {
                if (deleteExtras && !utils.contains(TypeConfigSet.permanentProperties, x))
                    delete this[x];
                else if (this[x].reset)
                    this[x].reset();
            }
            TypeConfigSet.call(this);
        }
    };

    var parseDefault = function (val) { return val; },
        toDefault = function (val) { return val; };
    function TypeConfig(nullable, defaultTo, options) {
        options = options || {};
        this.nullable = utils.accessor(nullable);
        this.defaultTo = utils.accessor(defaultTo);
        this.parseServerInput = utils.accessor(options.parseServerInput || parseDefault);
        this.toQuery = utils.accessor(options.toQuery || toDefault);
        this.toJs = utils.accessor(options.toJs || toDefault);
        this.toJson = utils.accessor(options.toJson || toDefault);

        var orig = [this.nullable(), this.defaultTo(), this.parseServerInput(), this.toQuery(), this.toJs(), this.toJson()];
        this.reset = function () {
            this.nullable(orig[0]);
            this.defaultTo(orig[1]);
            this.parseServerInput(orig[2]);
            this.toQuery(orig[3]);
            this.toJs(orig[4]);
            this.toJson(orig[5]);
        };
    };

    config.types = new TypeConfigSet();

    function TypeOptions(options, constr, typeName, filter) {
        options = options || {};
        typeName = typeName || "custom";
        var config = config.types[typeName];

        this.nullable = utils.cascadingGet("nullable", [options, config]);
        if (typeof this.nullable == "undefined")
            this.nullable = true;

        var defaultTo = utils.cascadingGet("defaultTo", [options, config]);
        this.defaultTo = typeof defaultTo == "function" ? defaultTo : function () { return defaultTo; };

        this.parseServerInput = utils.cascadingGet("parseServerInput", [options, config]);

        this.typeName = typeName;
        this.constr = constr;
        this.toQuery = options.toQuery || config.toQuery;
        this.initialize = options.initialize || function () { return parseDefault; };
        this.filter = filter;
        this.value = this.defaultTo;
        this.genericType = options.type;
    };

    function PlatonicType(options, constr, typeName, filter) {
        options = new TypeOptions(options, constr, typeName, filter);
        options.filter(options.defaultTo(options), options, true);
        this.getInstance = function () {
            return new PlatonicInstance(utils.extend({}, options));
        };
        this.nullable = function () { return options.nullable; };
        this.getDefault = options.defaultTo;
        this.constr = function () { return options.constr };
    };

    function accessor(options) {
        options.filter(options.value, options);
        options.isDirty = false;
        options.current = options.value;
        options.changeCallbacks = {};
        var output = function () {
            if (arguments.length) {
                arguments[0] = setUtils.current.parse(arguments[0], options);
                options.filter(arguments[0], options);
                setUtils.current.set(arguments[0], options);
                if (options.current !== options.value) {
                    for (var x in options.changeCallbacks)
                        options.changeCallbacks[x].call(this, options.current, options.value);
                    options.current = options.value;
                }
            }
            return options.value;
        };

        var index = 0;
        utils.extend(output, {
            subscribe: function (callback) {
                options.changeCallbacks[index] = callback;
                return index++;
            },
            unsubscribe: function (id) {
                delete options.changeCallbacks[id];
            },
            toQuery: function () {
                return options.toQuery().call(this, options.value);
            },
            isAccessor: true,
            nullable: function () {
                return options.nullable;
            },
            defaultTo: options.defaultTo,
            isDirty: function () { return options.isDirty; }
        });
        return output;
    };

    function PlatonicInstance(options) {
        var _self = this;
        options.value = options.defaultTo(options);
        this.accessor = utils.once(function () {
            return accessor(options);
        });
        this.initialize = utils.once(function (value) {
            value = setUtils.current.parse(value, options);
            options.filter(value, options);
            options.value = options.current = value;
            return _self;
        });
    };

    function throwItType(value, options, nullable) {
        if (typeof value == options.typeName) return;
        // Sometimes this throws when value is a string, other times when value is an object
    // This handles both cases. Not sure if this is the best way to handle it.
    if (typeof value == options.typeName) return;
        if ((options.nullable || nullable) && utils.isNullOrUndefined(value)) return;
        throw new TypeError("Value must be of type " + options.typeName + (options.nullable ? ", null, or undefined" : ""));
    };
    function throwItClass(value, options, nullable) {
        if (value instanceof options.constr) return;
        if ((options.nullable || nullable) && utils.isNullOrUndefined(value)) return;
        throw new TypeError("Value must be of custom type " + options.constr.name + (options.nullable ? ", null, or undefined" : ""));
    };
    function throwItNull(value, options, nullable) {
        if (nullable)
            return;
        if (!options.nullable && utils.isNullOrUndefined(value))
            throw new TypeError("Dynamic value cannot be null or undefined");
    };

    output = function (constr, options) {
        return new PlatonicType(options, constr, "custom", throwItClass);
    };

    utils.extend(output, {
        string: function (options) {
            return new PlatonicType(options, String, "string", throwItType);
        },
        boolean: function (options) {
            return new PlatonicType(options, Boolean, "boolean", throwItType);
        },
        number: function (options) {
            return new PlatonicType(options, Number, "number", throwItType);
        },
        date: function (options) {
            return new PlatonicType(options, Date, "date", throwItClass);
        },
        collection: function (options) {
            return new PlatonicType({ type: options }, Collection, "collection", throwItClass);
        },
        dynamic: function (options) {
            return new PlatonicType(options, function () { }, "dynamic", throwItNull);
        }
    });

    console.log("types: ", output);

    return output;
});