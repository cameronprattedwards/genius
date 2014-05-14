define([], function () {
	function XHR() {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	};

	return function (options) {
		var base = {
			contentType: "text/html",
			url: "",
			method: "GET",
			body: "",
			accepts: "text/html"
		};
		
		this.extend(base, options);

		var def = deferred();

		var xhr = XHR();

		xhr.open(base.method, base.url, true);
        xhr.setRequestHeader("Accepts", options.accepts);
        xhr.setRequestHeader("Content-type", options.contentType);

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200)
					def.resolve(xhr.responseText);
				else
					def.reject(xhr.statusText);
			}
		}

		xhr.send(base.body);

		return def.promise();
	};
});
