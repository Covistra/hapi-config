/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var nconf = require('nconf'),
    fs = require('fs'),
    path = require('path'),
    Yaml = require('js-yaml'),
    _ = require('lodash');

exports.register = function (plugin, options, next) {
    plugin.log(['plugin', 'info'], "Registering the 'config' plugin");

    var overrides = {};

    // Establish the configuration
    nconf.argv().env();

    if(nconf.get('localConfig')) {
        var localCfgFile = nconf.get('localConfig');
        plugin.log(['plugin', 'info'], "Local config specified. Will override default config:"+localCfgFile);

        if(localCfgFile.indexOf('.json') !== -1) {
            _.merge(overrides, JSON.parse(fs.readFileSync(path.resolve(localCfgFile), 'utf8')));
        }
        else {
            _.merge(overrides, Yaml.safeLoad(fs.readFileSync(path.resolve(localCfgFile), 'utf8')));
        }
    }

    // Load the test configuration file only if we're running in test mode (E2E)
    if(process.env.NODE_ENV === 'test') {
        var testOverridesFile = nconf.get('testOverrides');
        if(!testOverridesFile) {
            if(fs.existsSync(path.resolve('./test-config.yaml'))) {
                testOverridesFile = './test-config.yaml';
            }
        }

        plugin.log(['plugin', 'info'], "Applying test overrides from "+testOverridesFile+ " to standard configuration");
        _.merge(overrides, Yaml.safeLoad(fs.readFileSync(path.resolve(testOverridesFile), 'utf8')));
    }

    // Make sure we grab all overrides
    nconf.overrides(overrides);

    // Load consolidated configuration file
    if(nconf.get('config')) {
        var configFile = nconf.get('config');
        plugin.log(['plugin', 'info'], "Configuration file specified. Will be loaded. " + configFile);

        if(configFile.indexOf('.json') !== -1) {
            nconf.file(configFile);
        }
        else {
            nconf.file({
                file: path.resolve(configFile),
                format: {
                    parse:function(content) {
                        return Yaml.safeLoad(content + "");
                    },
                    stringify: function(o) {
                        return Yaml.safeDump(o, { indent: 2 });
                    }
                }
            });
        }
    }

    // Provide some dyanamic configuration entries
    if(nconf.get('pkg')) {
        try {
            var serverPkgInfo=require(path.resolve(nconf.get('pkg')));
            nconf.set('server:baseUrl', process.env.NODE_ENV === 'production' ? nconf.get('server:prod:baseUrl') : 'http://localhost:'+nconf.get('server:port'));
            nconf.set('server:version', serverPkgInfo.version);
        }
        catch(err) {
            plugin.log(['plugin', 'error'], "Unable to retrieve package information");
        }
    }

    // Set a few sane defaults in case we don't have a config file
    nconf.defaults({
        server:{
            port: 5000,
            log_level: 'info'
        }
    });

    plugin.expose('CurrentConfiguration', nconf);

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
