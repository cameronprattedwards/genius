define("./Class", function (Class) {
	function ClassFactory() {
		this.staticMethods = null;
		this.objectMethods = null;
		this.hooks = null;
		this.baseClass = Class;
	};

	ClassFactory.prototype = {
		setStaticMethods: function (staticMethods) {
			this.staticMethods = staticMethods;
		},
		setObjectMethods: function (objectMethods) {
			this.objectMethods = objectMethods;
		},
		setHooks: function (hooks) {
			this.hooks = hooks;
		},
		setBaseClass: function (baseClass) {
			this.baseClass = baseClass;
		},
		createClass: function () {
			var Output = this.baseClass.extend(this.objectMethods, this.hooks);
			for (var x in this.staticMethods)
				Output[x] = staticMethods[x];
			return Output;
		}
	};
});