define([
	"./directives/Each", 
	"./directives/If", 
	"./directives/Value", 
	"./directives/With", 
	"./directives/Event",
	"./directives/Template"
	], function (Each, If, Value, With, Event, Template) {

	return {
		"if": If,
		"each": Each,
		"value": Value,
		"with": With,
		"event": Event,
		"template": Template
	};

});