/*!
 * jquery.valign.js

Description: Vertically align elements inside their containers.

Dependancies: jQuery

Example usage:

$('.item').valign();

 */


(function ($) {

    /*  
        Elements should probably be hidden via CSS until this function is complete.
        e.g 
        .element {
	        visibility:hidden;        
        }
        .valign {
	        visibility:visible;
        }
    */

    $.fn.valign = function (options) {
        var settings = $.extend({}, $.fn.valign.defaultOptions, options);

        return this.each(function () {
            var elem = $(this);

            elem.css(settings.style, "0");
            var container = elem.parent(),
                elemHeight = elem.outerHeight(),
                containerHeight = container.height(),
                topMargin = (containerHeight - elemHeight) / 2,
                spacingTop = settings.style;
      
            if (topMargin + elemHeight < containerHeight)
                elem.css(spacingTop, Math.floor(topMargin)).addClass('valign');
        });

    };

    $.fn.valign.defaultOptions = {
        style: 'paddingTop'
    };

})(jQuery);