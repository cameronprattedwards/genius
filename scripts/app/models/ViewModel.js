define(["genius/mvc/model/base/Class", "./ToDo", "./ToDoCollection", "genius/mvc/model/observable/Observable"], function (Class, ToDo, ToDoCollection, Observable) {
	return Class.extend({
		init: function () {
			this.toDos = new ToDoCollection();
			this.unsaved = new Observable(new ToDo());
			this.toDos.$poll();
		},
		save: function () {
			this.toDos.push(this.unsaved.get());
			this.unsaved.set(new ToDo());
		}
	});
});