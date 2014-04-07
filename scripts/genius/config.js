define(["./utils"], function (utils) { 
    var config;

    function Config() {
        this.ajax = {
            transformToCamelCase: utils.accessor(false),
            parseJson: utils.accessor(function (response) {
                return config.ajax.parseJs().call(this, JSON.parse(response));
            }),
            parseJs: utils.accessor(function (response) {
                return response;
            }),
            reset: function () {
                this.transformToCamelCase(false);
                this.parseJson(function (response) {
                    return config.ajax.parseJs().call(this, JSON.parse(response));
                });
                this.parseJs(function (response) {
                    return response;
                });
            }
        };
    };

    Config.prototype = {
        reset: function (options) {
            this.types.reset(options);
            this.ajax.reset(options);
        }
    };

    config = new Config();

    return config;
});