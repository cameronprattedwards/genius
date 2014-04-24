define(["genius/utils/deferred"], function (deferred) {
	function transport() {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}

	function AjaxAdapter() {};

	function callback(method, url, body) {
		var def = deferred(),
			xhr = transport();

		xhr.open(method, url, true);
        xhr.setRequestHeader("Accepts", "application/json");
        xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200)
					def.resolve(JSON.parse(xhr.responseText));
				else
					def.reject(xhr.statusText);
			}
		}

        xhr.send(JSON.stringify(body));
        return def.promise();
	};

	AjaxAdapter.prototype = {
		create: function (url, data) {
			return callback("POST", url, data);
		},
		read: function (url) {
			return callback("GET", url, "");
		},
		update: function (url, data) {
			return callback("PUT", url, data);
		},
		del: function () {
			return callback("DELETE", url, "");
		}
	};

	return new AjaxAdapter();
});