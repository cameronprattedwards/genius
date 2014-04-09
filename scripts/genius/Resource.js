define(["./ClassFactory", "./TypedPropertiesObject"], function (ClassFactory, TypedPropertiesObject) {
    var factory = new ClassFactory();

    factory.setStaticMethods({
        $query: function () {},
        $get: function () {}
    });

    factory.setObjectMethods({
        $delete: function () {},
        $save: function () {},
        toJson: function () {}
    });

    factory.setHooks({
    });

    factory.setBaseClass(TypedPropertiesObject);

    return factory.createClass();
});




define(["./config", "./utils", "./types", "./box", "./Collection", "resourceUtils"], function (config, utils, types, box, Collection, resourceUtils) {
    var initializing;
    function Resource() { };
    Resource.fromJs = function (obj) {
        setUtils = server;
        var resource = new Resource(obj);
        setUtils = client;
        return resource;
    };
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
                if (this[x].toJs) {
                    output[x] = this[x].toJs();
                }
                else if (this[x].isAccessor) {
                    output[x] = this[x]();
                    if (output[x] instanceof Resource) {
                        output[x] = output[x].toJs();
                    }
                }
            }
            return output;
        },
        toJson: function () {
            return JSON.stringify(this.toJs());
        }
    };
    Object.defineProperty(Resource.prototype, "pojo", {
        get: function () {
            return this.toJs();
        }
    });
    Resource.extend = function (typeOptions) {
        typeOptions = typeOptions || {};
        if (typeOptions.uniqKey && (field = typeOptions[typeOptions.uniqKey])) {
            if (!field.nullable())
                throw new TypeError("Unique keys must be nullable");
            if (!utils.isNullOrUndefined(field.getDefault()))
                throw new TypeError("Unique keys must default to undefined or null");
        }

        initializing = true;
        var prototype = new this();
        initializing = false;

        resourceUtils.buildPrototype(prototype, typeOptions);

        var instances = {},
            innerConfig = null;
        function Resource(options) {
            if (!initializing) {
                if (typeof this.init == "function")
                    this.init.apply(this, arguments);
                function Resource() {
                    resourceUtils.setVarTyping.call(this, typeOptions);
                    resourceUtils.populateVars.call(this, options, resourceUtils.getInnerConfig(innerConfig, options));
                    var key;
                    if (key = resourceUtils.getKey(options, typeOptions)) {
                        var instance = instances[key];
                        if (instance) {
                            resourceUtils.populateVars.call(instance, options);
                            return instance;
                        }
                        instances[key] = this;
                    }
                };
                resourceUtils.initialize.call(this, resourceUtils.getInnerConfig(innerConfig, options), options);
                Resource.prototype = this;
                return new Resource();
            }
        };

        utils.extend(Resource, {
            extend: arguments.callee,
            prototype: prototype,
            fromJs: function (obj) {
                setUtils = server;
                var resource = new this();
                resourceUtils.populateVars.call(resource, obj, innerConfig);
                setUtils = client;
                return resource;
            },
            $get: function (data) {
                var backend = box.HttpBackend(),
                    url = box.RouteProvider().createRoute(this.prototype.url(), data);

                innerConfig = {
                    isNew: false,
                    isDirty: false,
                    isLoading: true,
                    isDeleted: false
                };
                var configHolder = innerConfig;
                var output = new this(data);
                innerConfig = null;
                output.$promise = backend.get(url)
                    .done(function (response) {
                        var parsed = config.ajax.parseJson().call(this, response);
                        if (typeOptions.parseServerInput)
                            parsed = typeOptions.parseServerInput(parsed);
                        setUtils = server;
                        resourceUtils.populateVars.call(output, parsed, configHolder);
                        setUtils = client;
                        configHolder.isDirty = false;
                    })
                    .always(function () {
                        configHolder.isLoading = false;
                    });
                return output;
            },
            $query: function (data) {
                data = data || {};
                var Collection = Collection.extend({ type: types(Resource) });
                var collection = new Collection();
                var backend = box.HttpBackend();
                var url = box.RouteProvider().createRoute(this.prototype.url(), data);
                collection.$promise = backend.get(url)
                    .done(function (response) {
                        var parsed = config.ajax.parseJson().call(this, response);
                        innerConfig = {
                            isNew: false,
                            isDirty: false,
                            isLoading: false,
                            isDeleted: false
                        };
                        setUtils = server;
                        collection.concat(parsed);
                        setUtils = client;
                        innerConfig = null;
                        collection.isLoading(false);
                    });
                return collection;
            }
        });

        return Resource;
    };

    console.log("Resource: ", Resource, arguments);

    return Resource;	
});