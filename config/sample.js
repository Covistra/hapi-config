var Hapi = require('hapi');

var server = new Hapi.Server();

server.register({register: require('./')}, function() {

    var config = server.plugins['config'].CurrentConfiguration;

    server.connection({
        port: config.get('server:port'),
        router: {
            stripTrailingSlash: true
        },
        routes: {cors: true}
    });

    server.start(function() {
        console.log("Server has been started on port "+server.info.port);
    });
});
