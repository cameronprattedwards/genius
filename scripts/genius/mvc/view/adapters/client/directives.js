define([
	"./directives/Each", 
	"./directives/If", 
	"./directives/Value", 
	"./directives/With", 
	"./directives/Event"
	], function (Each, If, Value, With, Event) {
	return {
		"if": If,
		"each": Each,
		"value": Value,
		"with": With,
		"event": Event
	};
});