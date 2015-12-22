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
   
       
## Recursive Replacement

While this is interesting to mix environment variables with configuration and command line arguments, it's even better to be able to
use environment variables inside your configuration entries. This way, you can make change at a single place when deploying your server (or Docker image)
and get the right value everywhere.

    database:
        uri: $MONGOLAB_URL
    MONGOLAB_URL=mongodb://localhost/my-db

In this example, the $MONGOLAB_URL will be replace by ```mongodb://localhost/my-db```.

You can use variable replacement inside string, object fields (recursively) and array.

    hosts:
        - host1:
            url:
                host: $MY_HOST
                path: my_path1
        - host2:
            url:
                host: $MY_HOST2
                path: my_path2
    MY_HOST: localhost
    MY_HOST2: 127.0.0.1

All object in this array configuration will get the right value.

## Loading arbitrary config files

If, as part of your server implementation, you need to load arbitrary config files, starting with
version 0.1.6, you can use the exposed loadConfig method, specifying the relative path of the file you
want to load:

```
var cfg = server.plugins['hapi-config'].loadConfig('./my-wonderful-cfg.json');
```
or
```
var cfg = server.plugins['hapi-config'].loadConfig('./my-wonderful-cfg.yaml');
```

This will produce a valid config object, with all replacement logic applied.

## Wrapping an object as a config

Sometimes, you want to provide only a subset of the configuration to your plugin. This is
achieved using the following approach:

```
var cfg = server.plugins['hapi-config'].CurrentConfiguration;
var pluginCfg = server.plugins['hapi-config'].wrapAsConfig(cfg.get('plugin1'));
```

The resulting ```pluginCfg``` object is a nconf object, with all placeholder replacements
performed.
