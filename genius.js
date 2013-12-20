var genius = {};
(function () {
    genius.utils = {
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
    };

    function Box() {
        this.kernel = new Kernel(this);
        this.modules = {
            realDataModule: {},
            testDataModule: {}
        };
        this.kernel.add("realDataModule", this.modules.realDataModule);
    };
    Box.prototype = {
        set: function (name, resource) {
            this[name] = resource;
            return new Dependency(name, resource, this);
        }
    };
    Box.reservedKeywords = ["kernel", "modules"];
    function Kernel(box) {
        var modules = [];
        this.add = function (module) {
            if (!genius.utils.contains(modules, module)) {
                for (var x in module) {
                    if (!genius.utils.contains(Box.reservedKeywords, x)) {
                        box[x] = module[x];
                    }
                }
            }
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
    genius.box = new Box();

}());
