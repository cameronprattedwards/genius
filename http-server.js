var connect = require('connect');
var express = require('express');
var port = process.argv.length > 2 ? process.argv[2] : 8080;

function ToDo() {
	this.text = "";
	this.dueDate = new Date();
	this.id = 0;
}

function factory(id, text, dueDate) {
	var toDo = new ToDo();
	toDo.text = text;
	toDo.dueDate = dueDate;
	toDo.id = id;
	return toDo;
}

var toDos = [
	factory("Eat", new Date(), 1),
	factory("Sleep", new Date(new Date().getTime() + 86400000), 2),
	factory("Seek shelter", new Date(new Date().getTime() + 3600000), 3)
];

var router = express.Router();

router.param('todo', function (req, resp, next, id) {
	var todo = toDos.filter(function (val) {
		return val.id == id;
	});

	req.todo = todo;
})

express()
    .use(connect.static(__dirname))
    .use('/api', router)
	.listen(port);

router.get("/api/todos/:todo", function (req, resp) {
	resp.write(JSON.stringify(req.todo));
	console.log(arguments);
});


