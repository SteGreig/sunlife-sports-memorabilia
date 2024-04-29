window.APP = (function (module, $) {
    "use strict";

    // make it safe to use console.log always
    (function (b) { function c() { } for (var d = "assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","), a; a = d.pop() ;) { b[a] = b[a] || c } })((function () {
        try
        { console.log(); return window.console; } catch (err) { return window.console = {}; }
    })());

    /* Work around for mobile safari scaling bug */
    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
        var viewportmeta = document.querySelector('meta[name="viewport"]');
        if (viewportmeta) {
            viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
            document.body.addEventListener('gesturestart', function () {
                viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
            }, false);
        }
    }

    // for legacy browsers. add trim functionality to strings
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        }
    }

    // Pollyfill for str.contains
    if (!String.prototype.contains) {
        String.prototype.contains = function () {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }

    // Get ordinal from string - e.g. '1' would return 'st' or '1st'
    // Usage: Number.getOrdinalFor(1, true) returns 1st
    (function (o) {
        Number.getOrdinalFor = function (intNum, includeNumber) {
            return (includeNumber ? intNum : "")
              + (o[((intNum = Math.abs(intNum % 100)) - 20) % 10] || o[intNum] || "th");
        };
    })([, "st", "nd", "rd"]);


    module.HELPER = (function (module, $) { 
        var mod = {}; // mod is a submodule of helper
        

        // Create the state-indicator element. 
        // We will use this to establish what breakpoint is currently visible e.g. phone, table, desktop
        var indicator = document.createElement('div');
        indicator.className = 'state-indicator';
        document.body.appendChild(indicator);
  
        mod.device = {
            // Check for touch support usign touch & ms-pointer events
            supportsTouch: (function () {
                var isTouch = !!('ontouchstart' in window) || !!window.navigator.msMaxTouchPoints;
                if (isTouch) {
                    var htmlTag = document.getElementsByTagName('html')[0];

                    htmlTag.className = htmlTag.className.replace(/(?:^|\s)no-touch-support(?!\S)/, 'supports-touch');
                }
                return isTouch;
            })(),
            // Check for retina display. 
            isRetina: (function () {
                var isRetina = (window.devicePixelRatio > 1) ? true : false;
                if (isRetina) {
                    document.getElementsByTagName("html")[0].className += " retina";
                }
                return isRetina;
            })(),
            // Is mobile, tablet or desktop view.  
            screenLayout: function () {
                switch(indicator.clientHeight) {
                    case 3:
                        return 'desktop';
                        break;
                    case 2:
                        return 'tablet';
                        break;
                    default:
                        return 'phone';
                        break;
                }
            },
            // Is ieX or lt-ieX
            isIE: function (version) {
                var cssClass = (version) ? version : 'ie',
                    element = document.getElementsByTagName("html")[0];
                return element.className && new RegExp("(^|\\s)" + cssClass + "(\\s|$)").test(element.className);
            }
        }

        // Returns the Value from a Name-Value pair in a specified string
        mod.getParamFromString = function (name, string) {
            if (!name && !string) {
                return;
            }
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(string);
            return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        mod.isEmail = function (email) {
            var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(email);
        }

        mod.getObjSize = function (object) {
            var size = 0;

            for (var key in object) {
                if(object.hasOwnProperty(key)) {
                    size++;
                }
            }

            return size;
        }

        return mod;
        
    }(module, $));

    return module;

})(window.APP || {}, window.jQuery);
