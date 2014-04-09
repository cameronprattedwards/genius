define(["./ClassFactory", "./TypedPropertiesObject"], function (ClassFactory, TypedPropertiesObject) {
    var factory = new ClassFactory(TypedPropertiesObject);

    factory.setStaticMethods({
        $query: function () {
            data = data || {};
            var Collection = genius.Collection.extend({ type: genius.types(Resource) });
            var collection = new Collection();
            var backend = genius.box.HttpBackend();
            var url = genius.box.RouteProvider().createRoute(this.prototype.url(), data);
            collection.$promise = backend.get(url)
                .done(function (response) {
                    var parsed = genius.config.ajax.parseJson().call(this, response);
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
        },
        $get: function () {
            var backend = genius.box.HttpBackend(),
                url = genius.box.RouteProvider().createRoute(this.prototype.url(), data);

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
                    var parsed = genius.config.ajax.parseJson().call(this, response);
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
        }
    });

    factory.setObjectMethods({
        toJson: function () {
            return JSON.stringify(this.toJs());
        }
    });

    factory.setHooks({
    });

    factory.setBaseClass(TypedPropertiesObject);

    var Resource = factory.createClass();

    Object.defineProperty(Resource.prototype, "pojo", {
        get: function () {
            return this.toJs();
        }
    });

    return Resource;
});

define(["./config", "./utils", "./types", "./box", "./Collection", "resourceUtils"], function (config, utils, types, box, Collection, resourceUtils) {
    var initializing;
    function Resource() { };
    Resource.extend = function (typeOptions) {
        typeOptions = typeOptions || {};

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

        return Resource;
    };

    console.log("Resource: ", Resource, arguments);

    return Resource;	
});