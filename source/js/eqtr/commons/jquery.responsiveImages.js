(function ($) {

    $.fn.responsiveImage = function (options) {
        var plugin = this;
        var settings = $.extend({}, $.fn.responsiveImage.defaultOptions, options);
        var helper = APP.HELPER;
        var ResponsiveImage = function () {

            $(plugin).each(function () {

                var $this = $(this),
                    imgSrc = $this.data('rspimg'), // the src of the responsive image
                    imgWidth = $this.parent().width(), // The optimal width
                    imgClass = $this.data('rspimgclass'), // optional css class to be applied to image
                    imgRel = $this.data('rspimgrel'), // optional rel attr of image
                    maxWidth = settings.maxWidth,
                    screenTarget = getScreenTarget(maxWidth),
                    imgRequestSrc = imgSrc + '?targetTypeID=' + screenTarget + 'w'; // the image src used to request the responsive image

                    if (imgSrc.contains('?')) {
                        imgRequestSrc = imgSrc + '&targetTypeID=' + screenTarget + 'w'; // the image src used to request the responsive image
                    }

                    //ie8/7 needs this (pre load)
                    var imgS = new Image();
                    imgS.src = imgRequestSrc;

                    // create image
                    var img = $('<img alt="">');

                    // apply image attributes if specified
                    if (imgRel) {
                        img.attr('rel', imgRel);
                    }
                    if (imgClass) {
                        img.attr('class', imgClass);
                    }

                    // specify image src 
                    img.attr('src', imgRequestSrc);

                    if ($this.is('noscript')) {
                        // replace noscript tag with new image
                        $this.before(img);
                        $this.remove();
                    }
                    else {
                        if ($('img', $this).length)
                            $('img', $this).remove(img);

                        $this.append(img);
                    }
                    var updateImage = function () {
                        screenTarget = getScreenTarget(maxWidth),
                        imgRequestSrc = imgSrc + '?targetTypeID=' + screenTarget + 'w'; // the image src used to request the responsive image

                        var Img = $('img', $this).attr('src', imgRequestSrc);
                    }

                $(window).smartresize(function () {
                    //  ResponsiveImage();
                    updateImage();
                });
            });
            
        }

        ResponsiveImage();
        

        function getScreenTarget(maxWidth) {
            var size = maxWidth;

            switch (helper.device.screenLayout()) {
                case 'phone':
                    return size = '480';
                    break;
                case 'tablet':
                    return size = '768';
                    break;
            }
            return size;
        }
       
    }

    // Default options
    $.fn.responsiveImage.defaultOptions = {
        maxWidth: 1023
    };

})(jQuery);