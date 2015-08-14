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

        function processString(val) {
            return val.replace(/([^\/.:]+)/g, function(v) {
                if(v.indexOf('$') === 0) {
                    return _this.get(v.substring(1));
                }
                else
                    return v;
            });
        }

        function processObject(obj) {
            _.forEach(_.keys(obj), function(fieldKey) {
                if( (_.isString(obj[fieldKey]) && obj[fieldKey].indexOf('$') !== -1)) {
                    obj[fieldKey] = obj[fieldKey].replace(/([^\/.:]+)/g, function(v) {
                        if(v.indexOf('$') === 0) {
                            return _this.get(v.substring(1));
                        }
                        else
                            return v;
                    });
                }
                else if(_.isObject(obj[fieldKey])) {
                    return processObject(obj[fieldKey]);
                }
            });
            return val;
        }

        function processArray(array) {
            return _.map(array, function(item) {
                if(_.isString(item) && item.indexOf('$') !== -1) {
                    return processString(item);
                }
                else if(_.isObject(item)) {
                    return processObject(item);
                }
                else if(_.isArray(item)) {
                    return processArray(item);
                }
                else
                    return item;
            });
        }

        var val = nconf._get(key);
        if(val) {
            if(_.isString(val) && val.indexOf('$') !== -1) {
                return processString(val);
            }
            else if(_.isObject(val)) {
                return processObject(val);
            }
            else if(_.isArray(val)) {
                return processArray(val);
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

