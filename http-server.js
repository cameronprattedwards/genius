var connect = require('connect');
var port = process.argv.length > 2 ? process.argv[2] : 8080;

connect()
    .use(connect.query())
    .use(connect.bodyParser())
    .use(connect.methodOverride())
    .use(connect.static(__dirname))
    .listen(port);