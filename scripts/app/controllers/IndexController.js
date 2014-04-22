define([
	"../models/ToDo", 
	"genius/mvc/model/resource/GenericCollection",
	"genius/mvc/controller/Controller",
	"genius/mvc/model/observable/Observable"
	], 
	function (ToDo, GenericCollection, Controller, Observable) {
		return Controller.extend({
			index: function () {
				var toDo1 = new ToDo({
						text: "Get freaky",
						dueDate: new Date()
					}),
					toDo2 = new ToDo({
						text: "Get sleepy",
						dueDate: new Date(new Date().getTime() + 3600000)
					}),
					toDo3 = new ToDo({
						text: "Get grouchy",
						dueDate: new Date(new Date().getTime() + 7200000)
					});
				var ToDoCollection = GenericCollection(ToDo);

				var model = { 
					toDos: new ToDoCollection([toDo1, toDo2, toDo3]),
					unsaved: new Observable(new ToDo()),
					save: function () {
						console.log(model, "save");
						model.toDos.push(model.unsaved.get());
						model.unsaved.set(new ToDo());
					}
				};

				window.model = model;

				this.render("/scripts/app/views/index/index.html", model);
			}
		});
});