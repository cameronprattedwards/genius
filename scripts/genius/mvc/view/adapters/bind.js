define(["./domArray", "../../router/Router"], function (arrayWrap, Router) {
	function Binder (element) {
		this.element = element;
	};

	Binder.prototype = {
		empty: function () {
			var children = this.element.childNodes;

			while (children.length)
				this.element.removeChild(children[0]);

			return this;
		},
		text: function (observable) {
			var obsVal = observable.get(),
				textNode = this.empty().element.appendChild(document.createTextNode(obsVal));

			observable.subscribe(function (newVal) {
				textNode.nodeValue = newVal;
			});
		},
		value: function (observable) {
			var obsVal = observable.get(),
				el = this.element,
				subscription;

			el.value = obsVal;

			el.addEventListener("keyup", function () {
				observable.set(this.value);
			});

			subscription = observable.subscribe(function (newVal) {
				if (el.value !== newVal)
					el.value = newVal;
			});
		},
		forEach: function (array, template) {
			//We have a cached array, which reflects the data represented in the DOM.
			//Each time the array updates, we simply have to update the cached array, and
			//correspondingly, the wrapped element.

			var el = this.element,
				parent = el.parentNode,
				cached = [],
				wrapped = arrayWrap(parent);

			dl(parent).empty();

			for (var i = 0; i < array.array.length; i++) {
				var newEl = el.cloneNode(true);
				template.call(newEl, array.array[i]);

				cached.push(array.array[i]);
				parent.appendChild(newEl);
			}

			function update(arrayValue) {
				var i = 0;

				for ( ; i < arrayValue.length; i++) {
					var entry = arrayValue[i],
						entryInCached,
						entryEl;

					if (cached[i] === entry)
						continue;

					if (cached.indexOf(entry) !== -1) {
						while (indexInCached = cached.indexOf(entry) !== -1) {
							var indexInCached = cached.indexOf(entry);
							entryInCached = cached.splice(indexInCached, 1)[0];
							entryEl = wrapped.splice(indexInCached, 1)[0];
						}
					} else {
						entryInCached = entry;
						entryEl = el.cloneNode(true);
						template.call(entryEl, entry);
					}

					cached.splice(i, 0, entryInCached);
					wrapped.splice(i, 0, entryEl);
				}

				var extraLength = cached.length - arrayValue.length;
				cached.splice(i, extraLength);
				wrapped.splice(i, extraLength);

				for (var i = 0; i < arrayValue.length; i++)
					if (arrayValue[i] !== cached[i])
						throw "No matchie " + i;
			}

			array.subscribe(update);
		},
		link: function () {
			function callback(e) {
				e.preventDefault();
				Router.setLocation(this.href);
			}
			var el = this.element;
			if (el.addEventListener) {
				el.addEventListener("click", callback);
			} else if (el.attachEvent) {
				el.attachEvent("onclick", callback);
			} else {
				el.onclick = callback;
			}
		}
		
	};

	return function (element) { return new Binder(element); }
});