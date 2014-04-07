define(["./utils", "./Resource", "./box"], function (utils, Resource, box) {
    function param(data) {
        var pairs = [];
        for (var x in data) {
            if (data[x])
                pairs.push(x + "=" + (data[x].toQuery ? data[x].toQuery() : data[x]));
        }
        return pairs.length ? "?" + pairs.join("&") : "";
    };

    function RouteProvider() { };

    RouteProvider.prototype = {
        createRoute: function (pattern, data, addQuery) {
            var regex = /\:([^\/\.\-]+)/gi;
            var match, output = pattern, alreadyMatched = [];
            while (match = regex.exec(pattern)) {
                var capture = match[1], replacement;
                if (data[capture])
                    replacement = data[capture].isAccessor && data[capture]() ? data[capture]() : (typeof data[capture] !== "function" ? data[capture] : "");
                else
                    replacement = "";
                output = output.replace(match[0], replacement);
                alreadyMatched.push(match[1]);
            }
            while (/\/$/.test(output))
                output = output.substr(0, output.length - 1);
            if (addQuery !== false)
                output += param(utils.except(data instanceof Resource ? data.properties() : data, alreadyMatched));
            return output;
        }
    };

    box.set("RouteProvider", function () { return new RouteProvider(); }).singleton();

    return new RouteProvider();
});