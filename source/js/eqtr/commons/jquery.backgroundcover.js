/*!
 * jquery.backgroundcover.js
 * https://github.com/duncanmcdougall/jQuery-Background-Cover
 * Copyright 2013 Duncan McDougall and other contributors; Licensed MIT
 */
; (function ($) {

    'use strict';

    $.fn.backgroundCover = function (options) {
        var plugin = this;
        var settings = $.extend({}, $.fn.backgroundCover.defaultOptions, options);
        var cover = function () {
            $(plugin).each(function (idx, item) {
                var imageContainer = $(item).parent();

                if (settings.imageContainer != null) {
                    imageContainer = $(item).closest(settings.imageContainer);
                }
                
                $(item).css({ 'position': 'absolute', 'max-width': 'none', 'display': 'block' });
                if ($(item).parents().length < 3) {
                    $(item).css("zIndex", "-1");
                }
                imageContainer.css({ 'position': 'relative', 'overflow': 'hidden' });
                var cW = imageContainer.outerWidth();
                var cH = imageContainer.outerHeight();
                var iW = $(item).attr("width");
                var iH = $(item).attr("height");

                if (typeof iW == "undefined") {
                    iW = item.width;
                }

                if (typeof iH == "undefined") {
                    iH = item.height;
                }

                var ratio, shift;
                // If image is to narrow scale to match container width
                if (iW < cW) {
                    ratio = cW / iW;
                    iW = cW;
                    iH = iH * ratio;
                }

                // If image is too short scale to match container height
                if (iH < cH) {
                    ratio = cH / iH;
                    iH = cH;
                    iW = iW * ratio;
                }

                // If image is bigger in both dimensions scale down to match an edge
                if (iW > cW && iH > cH) {
                    var widthRatio = cW / iW;
                    var heightRatio = cH / iH;

                    if (widthRatio > heightRatio) {
                        iW = cW;
                        iH = iH * widthRatio;
                    } else {
                        iH = cH;
                        iW = iW * heightRatio;
                    }
                }

                $(item).width(iW).height(iH);

                if (iH > cH) {
                    shift = (iH - cH) / 2;
                    $(item).css('top', -shift);
                } else {
                    $(item).css('top', '');
                }

                if (iW > cW) {
                    shift = (iW - cW) / 2;
                    $(item).css('left', -shift);
                } else {
                    $(item).css('left', '');
                }

                $(window).trigger('backgroundCover');
            });
        };

        cover();
        $(window).resize(function () {
            cover();
        });

    };

    // Default options
    $.fn.backgroundCover.defaultOptions = {
        imageContainer: null
    };

})(jQuery);