define(["genius/mvc/model/base/Class", "./ToDo", "./ViewModel"], function (Class, ToDo, ViewModel) {
	var ViewModelFactory = Class.extend({
		dummy: function () {
			var vm = new ViewModel();
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

			vm.toDos.push(toDo1, toDo2, toDo3);

			return vm;
		}
	});

	return new ViewModelFactory();
});