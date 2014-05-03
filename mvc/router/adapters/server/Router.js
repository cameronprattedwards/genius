define([
	"express", 
	"genius/base/Class", 
	"module", 
	"genius/mvc/controller/registry",
	"genius/utils/object",
	"passport",
	"passport-http",
	"app/credentials",
	"body-parser"
	], function (express, Class, module, registry, o, passport, passHttp, credentials, bodyParser) {
	
	var router = express.Router();
	var app = express();

	app.use(bodyParser());

	app.use(function (req, resp, next) {
		next();
	});

	app.use("/", router);

	router.param("controller", function (req, resp, next, controller) {
		if (registry[controller])
			req.controller = registry[controller];
		next();
	});

	passport.use(new passHttp.BasicStrategy(function (username, password, done) {
		if (username !== credentials.username && password !== credentials.password)
			return done("Bad credentials");
		else
			return done(null, {});
	}));

	router.use(passport.initialize());

	router.use("/admin", passport.authenticate("basic", { session: false }));

	function getController(defaults, req, resp) {
		var match;

		if (req.controller)
			return new req.controller(req, resp);
		if (match = registry[req.controller])
			return new match(req, resp);
		if (match = registry[defaults.controller])
			return new match(req, resp);
	}

	return {
		registerRoute: function (route, defaults) {
			router.all(route, function (req, resp, next) {
				var controller = getController(defaults, req, resp, next);

				if (!controller) {
					return next();
				}

				var params = o({}).extend(defaults, req.params, req.query, req.body);

				if (!params.action)
					return next();

				var action = params.action + "Action";

				if (controller[action])
					return controller[action](params);
				else
					return next();
			});
		},
		start: function () {
			router.use(express.static(process.cwd() + "/app/www"));
			app.listen(4000);
		}
	};
});