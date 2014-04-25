define(["./utils/deferred"], function (deferred) {
	function XHR() {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}

	return {
		map: function (array, callback) {
			var output = [];
			for (var i = 0; i < array.length; i++) {
				output.push(callback.call(array[i], array[i], i));
			}
			return output;
		},
		flatten: function (arrayOfArrays) {
			var output = [];
			for (var i = 0; i < arrayOfArrays.length; i++)
				output.push.apply(output, arrayOfArrays[i]);
			return output;
		},
		extend: function (obj1, obj2) {
			var orig  = arguments[0];

			for (var i = 0; i < arguments.length; i++) {
				for (var x in arguments[i])
					orig[x] = arguments[i][x];
			}

			return orig;
		},
		map: function (array, callback) {
			var output = [];
			for (var i = 0; i < array.length; i++)
				output.push(callback.call(array, array[i], i));
			return output;
		},
		ajax: function (options) {
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
	        // xhr.setRequestHeader("Accepts", options.accepts);
	        // xhr.setRequestHeader("Content-type", options.contentType);

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
		}
	};
});