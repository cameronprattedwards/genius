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
	factory(1, "Eat", new Date()),
	factory(2, "Sleep", new Date(new Date().getTime() + 86400000)),
	factory(3, "Seek shelter", new Date(new Date().getTime() + 3600000))
];

var router = express.Router();

router.param('todo', function (req, resp, next, id) {
	var todo = toDos.filter(function (val) {
		return val.id == id;
	});

	req.todo = todo;
	next();
})

// router.use(function (req, resp, next) {
// 	console.log("router", req.method, req.url);
// 	next();
// });

router.get("/todos", function (req, resp) {
	resp.send(JSON.stringify(toDos));
});

router.get("/todos/:id", function (req, resp, next) {
	var obj = toDos.filter(function (val) { return val.id == req.params.id })[0];

	var str = JSON.stringify(obj);
	resp.send(str);
});

express()
	.use(function (req, resp, next) {
		console.log(req.method, req.url);
		next();
	})
    .use('/api', router)
    .use(connect.static(__dirname))
	.listen(port);




