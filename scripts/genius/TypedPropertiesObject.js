define(["./ClassFactory", "./setUtils"], function (ClassFactory) {
	var factory = new ClassFactory();

	factory.setObjectMethods({
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
		changedProperties: function () {
            var output = {};
            for (var x in this) {
                if (this[x].isAccessor && this[x].isDirty())
                    output[x] = this[x]();
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
		}
	});

	factory.setStaticMethods({
		fromJs: function () {
            setUtils = server;
            var resource = new this();
            resourceUtils.populateVars.call(resource, obj, innerConfig);
            setUtils = client;
            return resource;
		}
	});

	factory.setHooks({
        beforeExtend: function (typeOptions) {
            typeOptions = typeOptions || {};
            if (typeOptions.uniqKey && (field = typeOptions[typeOptions.uniqKey])) {
                if (!field.nullable())
                    throw new TypeError("Unique keys must be nullable");
                if (!utils.isNullOrUndefined(field.getDefault()))
                    throw new TypeError("Unique keys must default to undefined or null");
            }
        }
	});

	return factory.createClass();
});