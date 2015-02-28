# HAPI configuration plugin
 
This plugin provides a consistent interface to access a unified configuration instance from any anywhere in the system. By using
[nconf](https://www.npmjs.com/package/nconf), we're able to unify a server environment variables, command line arguments as well
as the content of configuration files, in JSON or YAML. 

# Getting Started

You just need to install the plugin in your project: 

    npm install hapi-config --save
    
Then, you integrate the plugin in your HAPI server: 

    var Hapi = require('hapi');
    
    var server = new Hapi.Server();
    server.connection({
        port: 5000,
        router: {
            stripTrailingSlash: true
        },
        routes: {cors: true}
    });
    
    server.register({register: require('./')}, function(err){});
    server.start();

You might want to load this plugin early in your initialization process to benefit from dynamic configuration for your connection. 

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

## Accessing the configuration

You can access the configuration instance using either 

    var nconf = require('nconf');
    
or 

    var config = server.plugins['config'].CurrentConfiguration;
    
Both approach return the same object (for now). This might be different in future versions though. The prefered way, like
everywhere in Hapi, is to use the server instance to retrieve dependencies. 

## Using JSON config files

You can add a number of configuration entries directly in a single file by using the --config command line argument. 

    node sample.js --config config.json
    
You can set absolutely any structure in this file. Our defaults assume that you have a server entry with some attributes: 

    {
        "server":{
            "port": 4500
            "log": {
                "name": "my-server",
                "level": "debug"
            }
        }
    }
    
The file can also be in Yaml, which is a more convenient language for configuration files (less verbose and fragile)

    server:
        port: 4500
        log: 
            name: my-server
            level: debug
            
## Overriding configuration file entries

You can override configuration entries using the --localConfig command line argument. All configuration entries found in 
this file will override the default configuration. This is useful for development environment settings

## Overriding configuration for tests

Sometimes, you need different settings for your unit or e2e tests. You can easily override configuration values for test using
the --testOverrides command line argument. 

## Mixing environment and config entries

Some deployment environments are using environment variables for configuration. This plugin let you work with environment as if
it were a configuration entry. This way, you can have a default in any of your configuration file, and specify the environment
variable when running in production. The configuration system will merge everything and give priority to the environment variable. 

    MONGOLAB_URL=mongodb://localhost/my-db node sample.js

    // From command line
    node sample.js --MONGOLAB_URL=mongodb://localhost/my-db
   
       
