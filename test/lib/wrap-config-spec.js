var expect = require('chai').expect;

describe('wrapConfig', function() {
    "use strict";

    var plugin;

    beforeEach(function(){
        plugin = require('../../.');
    });

    it('should properly wrap an object as a smart config', function(){
        var cfg = plugin.wrapAsConfig({
            HOST:'my-host',
            url: 'http://$HOST:5000'
        });
        expect(cfg.get('url')).to.equal('http://my-host:5000');
    });

});