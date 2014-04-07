define(["./utils"], function (utils) {
    function AttachedDependency(name, resource, box) {
        this.singleton = function () {
            box[name] = utils.once(resource);
        };
        this.service = function () { };
        this.value = resource;
    };

    function DetachedDependency(resource) {
        this.service = function () { resource.value = resource; return resource; };
        this.singleton = function () {
            var output = utils.once(resource);
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
            if (!utils.contains(modules, module)) {
                for (var x in module) {
                    if (!utils.contains(Box.reservedKeywords, x)) {
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
                if (!utils.contains(Box.reservedKeywords, x) && box[x] == module[x].value) {
                    delete box[x];
                }
            }
        };
        this.reset = function () {
            this.wipe();
        };
    };

    return new Box();
});