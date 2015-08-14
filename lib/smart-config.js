var _ = require('lodash');

module.exports = function(nconf) {

    /**
     * Override get to provide a default value and to recursively replace
     * @param key
     * @param defaultValue
     */
    nconf._get = nconf.get;
    nconf.get = function(key, defaultValue) {
        var _this = this;
        var val = nconf._get(key);
        if(val) {
            if(_.isString(val)) {
                return val.replace(/([^\/.:]+)/g, function(v) {
                    if(v.indexOf('$') === 0) {
                        return _this.get(v.substring(1));
                    }
                    else
                        return v;
                });
            }
            else {
                return val;
            }
        }
        else {
            return defaultValue;
        }
    };

    return nconf;
};

