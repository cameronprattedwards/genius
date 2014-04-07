define(["./deferred", "./box"], function (deferred, box) {
	function RealBackend() { };
    
    function req(url, method, body) {
        var def = deferred();
        var xhr = box.XHR();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Accepts", "application/json");
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                def.resolve(xhr.responseText);
            }
        };
        xhr.send(body);
        return def.promise();
    };
    
    RealBackend.prototype = {
        get: function (url) {
            return req(url, "GET");
        },
        put: function (url, body) {
            return req(url, "PUT", body);
        },
        post: function (url, body) {
            return req(url, "POST", body);
        },
        del: function (url, body) {
            return req(url, "DELETE", body);
        }
    };
    
    box.set("RealHttpBackend", function () { return new RealBackend(); });
});