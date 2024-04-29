// Basic debugging script. used for widths and heights
// toggle is ctrl + shift + x

(function () {
    // don't show this code if the parent is an iframe (i.e. responsive tester)
    if (self != top) return;

    var is_debugging = false,
        debug_output = null;

    $(document).keyup(function (event) {
        var code = event.keyCode || event.which;
        if (event.ctrlKey && event.shiftKey && code == 88) {
            setDebuggger();
        }
    });

    function setDeviceDimensions() {
        debug_output.find("p").html("W = " + $(window).width() + "px<br/>" + "H = " + $(window).height() + "px");
    }

    function setDebuggger() {
        if (is_debugging) {
            debug_output.hide();
            $(window).unbind("resize.debug");
        } else {
            if (!debug_output) {
                debug_output = $('<div id="debug_deviceDimensions" style="position:fixed;top:0;left:0;border:1px solid #666;background:white;padding:5px;z-index:100000;font-family:courier new,monospace;font-size:12px;"><p style="color:black"></p><a style="text-decoration:underline;" target="responsive" href="/assets/js/commons/responsive-tester.html?' + location.href + '">Responsive</a></div>');

                $(function () {
                    $("body").append(debug_output);
                });

            }
            $(window).bind("resize.debug", setDeviceDimensions).resize();
            debug_output.show();
        }

        is_debugging = !is_debugging;

        if (supportsStorage) {
            localStorage["debugging"] = is_debugging;
        }
    }

    function supportsStorage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    if (supportsStorage()) {
        if (localStorage["debugging"] === 'true') {
            setDebuggger();
        }
    }

})();