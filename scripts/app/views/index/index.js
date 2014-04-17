define(["genius/mvc/view/adapters/bind"], function (bind) {
	return function (model) {
		window.model = model;

		console.log(model);

		var p1 = document.createElement("p");
		var input1 = document.createElement("input");
		input1.setAttribute("type", "text");
		bind(input1).value(model.id);
		p1.appendChild(document.createTextNode("Modify the headline: "));
		p1.appendChild(input1);
		var a = document.createElement("a");
		a.appendChild(document.createTextNode("A link to nowhere."));
		a.href = "/link/somewhere";
		bind(a).link();
		p1.appendChild(a);
		document.body.appendChild(p1);

		var p2 = document.createElement("p");
		var input = document.createElement("input");
		input.setAttribute("type", "text");
		bind(input).value(model.name);
		p2.appendChild(document.createTextNode("Modify the content: "));
		p2.appendChild(input);
		document.body.appendChild(p2);

		var h1 = document.createElement("h1");
		bind(h1).text(model.id);

		var p = document.createElement("p");
		bind(p).text(model.name);

		this.appendChild(h1);
		this.appendChild(p);
	};
});