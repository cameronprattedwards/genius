define(["../observable/Observable", "./setUtils"], function (Observable, setUtils) {
	var DirtyObservable = Observable.extend({
		init: function () {
			var _self = this;
			Observable.prototype.init.apply(this, arguments);
			this.isDirty = new Observable(false);
			this.isDirty.subscribe(function () { _self.fire("dirty"); });
			this.isNew = new Observable(setUtils.current.isNew);
			this.originalValue = this.value;
		},
		set: function (value) {
			if (value && value.search && value.search("sucks") !== -1)
				console.log("setting", value);
			var oldValue = this.get();
			Observable.prototype.set.apply(this, arguments);
			setUtils.current.markDirty.call(this, oldValue, value);
		}
	});

	return DirtyObservable;
});