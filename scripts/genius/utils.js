define({
    bind: function (fn, oThis) {
        var sliced = genius.utils.toArray(arguments).slice(1);
        if (Function.prototype.bind)
            return Function.prototype.bind.apply(fn, sliced);

        if (typeof fn !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("genius.utils.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = fn,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(fn instanceof fNOP && oThis
                                       ? fn
                                       : oThis,
                                     aArgs.concat(sliced));
            };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    },
    cascadingGet: function (propName, sources) {
        for (var i = 0; i < sources.length; i++) {
            if (sources[i] && sources[i].hasOwnProperty(propName)) {
                var output = sources[i][propName];
                return (!genius.utils.isNullOrUndefined(output) && output.isAccessor) ? output() : output;
            }
        }
    },
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
        // Handle case where array is null
		if (array) {
            for (var i = 0; i < array.length; i++) {
                copy[i] = callback.call(this, array[i]);
            }
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
    partial: function (callback) {
        return function () {
            return callback.apply(this, genius.utils.toArray(arguments).slice(1));
        };
    },
    toArray: function (iterable) {
        var arr = [];
        Array.prototype.push.apply(arr, iterable);
        return arr;
    },
    accessor: function (value) {
        var output = function () {
            if (arguments.length)
                value = arguments[0];
            return value;
        };
        output.isAccessor = true;
        return output;
    },
    extend: function (obj1, obj2) {
        for (var x in obj2) {
            obj1[x] = obj2[x];
        }
        return obj1;
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
});