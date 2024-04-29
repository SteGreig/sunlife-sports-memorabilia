/*!
 * jquery.lightbox.js
 * https://github.com/duncanmcdougall/Responsive-Lightbox
 * Copyright 2013 Duncan McDougall and other contributors; Licensed MIT
 */
(function ($) {

    'use strict';

    var helper = APP.HELPER; // shortcut to APP.HELPER

    $.fn.videoplayer = function (options) {
        var plugin = {

            items: [],
            container: null,
            iframe: null,

            init: function (items) {
                plugin.items = items;

                if (!plugin.container) {

                    $('body').append('<div id="video" class="popup" tabindex="-1" role="dialog" aria-labelledby="video popup" style="display:none;">' +
					  '<iframe frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen />' +
                        '<a href="#" class="close">Close</a></div>');

                    plugin.container = $("#video");
                    plugin.iframe = $("iframe", plugin.container);

                    plugin.bindEvents();
                }

                
            },

            resize: function () {
                plugin.iframe.height((plugin.iframe.width() / 16) * 9);

                if ($.fn.valign) {
                    plugin.iframe.valign({ style: "marginTop" });
                }
            },

            bindEvents: function () {
                $(plugin.items).click(function (e) {
                    var videoUrl = $(this).attr('href'),
                        videoId = helper.getParamFromString('v', videoUrl);
                    e.preventDefault();
                    plugin.container.show();
                    plugin.iframe.attr("src", "https://www.youtube.com/embed/" + videoId + "?rel=0");
                    plugin.resize();
                    plugin.container.focus();
                });

                // Close click
                $(plugin.container).on('click', '.close', function () {
                    plugin.close();
                    return false;
                });

                $(plugin.container).on('click', function () {
                    plugin.close();
                    return false;
                });

                $(window).smartresize(plugin.resize);

                // Bind Keyboard Shortcuts
                $(document).on('keydown', function (e) {

                    // Close lightbox with ESC
                    if (e.keyCode === 27) {
                        plugin.close();
                    }
                });
            },

            close: function () {
                plugin.container.fadeOut('fast', function () {
                    plugin.iframe.attr("src", "");
                });
                $('body').removeClass('blurred');
            }

        };

        if ($(this).length === 0) {
            return false;
        }

        $.extend(plugin, options);

        plugin.init(this);
    };

})(jQuery);