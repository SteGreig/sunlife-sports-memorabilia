window.APP = (function(module, $){
    "use strict";


    module.HELPERS = (function (module, $) { 

        var mod = {}; // mod is a submodule of helper

        mod.cookie = {
            getCookie: function (name) {

                var i, x, y, cookies = document.cookie.split(";");
                for (i = 0; i < cookies.length; i++) {
                    x = cookies[i].substr(0, cookies[i].indexOf("="));
                    y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                    x = x.replace(/^\s+|\s+$/g, "");
                    if (x === name) {
                        return unescape(y);
                    }
                }

            },

            setCookie: function (key, value, options) {
                options = $.extend({}, options);

                if (typeof options.expires === 'number') {
                    var days = options.expires, t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }

                document.cookie = [
                    key,
                    '=',
                    value,
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join('');

            }
        }

        return mod;

    }(module, $));

    return module;

})(window.APP || {}, window.jQuery)