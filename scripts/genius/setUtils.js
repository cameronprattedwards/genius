define(function () {
    var client = {
        parse: function (value, options) { return value; },
        set: function (value, options) {
            options.value = value;
            options.isDirty = options.current !== options.value;
            return options.value;
        }
    },
    server = {
        parse: function (value, options) {
            return options.parseServerInput.call(this, value, options.constr);
        },
        set: function (value, options) {
            options.value = value;
            options.isDirty = false;
            return options.value;
        }
    };

    return {
        client: client,
        server: server,
        current: client
    }
})
