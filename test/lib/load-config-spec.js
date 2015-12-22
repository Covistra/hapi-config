var expect = require('chai').expect;

describe('loadConfig', function() {
    "use strict";

    var plugin;

    beforeEach(function(){
        plugin = require('../../.');
    });

    it('should properly load a valid config file in a new container', function(){
        var cfg = plugin.loadConfig('config.yaml');
        var serverCfg = cfg.get('server');
        expect(serverCfg).not.to.be.undefined;
        expect(serverCfg.url.host).to.equal('http://localhost');
    });

});