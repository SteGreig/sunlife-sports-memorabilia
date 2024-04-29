
(function ($) {

    'use strict';

    var helper = APP.HELPER; // shortcut to APP.HELPER

    $.fn.popwindow = function (options, callback) {

        // Default Options
        var settings = {
            closeBtnText: 'close',
            CSSprefix: 'text'
        };

        $.extend(settings, options);
        var container;
        var template = '<div class="popup-window" tabindex="-1" role="dialog" aria-labelledby="popup window">\
                            <a href="#" class="close"><span class="close-btn"></span></a>\
                            <div class="popup-window-content-holder"></div>\
                        </div><div class="modal"></div>';



        return this.each(function () {

            // vars within scope of current popup link
            var popupLink = $(this),
                popupContent = $(popupLink.attr('href')).html(),
                closeBtnText = settings.closeBtnText,
                CSSprefix = settings.CSSprefix + '-popup',
                documentHeight = $(window).height(),
                popupCSSclass,
                modal;

            // show/hide the popup
            var togglePopup = {

                show: function () {

                    popupCSSclass = 'popup-window-active ' + CSSprefix;

                    $("html").addClass("popup-enabled");

                    // get the height of the popup
                    var popupHeight = container.addClass(popupCSSclass).css({ display: 'block' }).outerHeight(),
                        topMargin = (documentHeight / 2) - (popupHeight / 2) + $(window).scrollTop();

                    // make the popup full page if the height is greater than the viewport
                    if ((popupHeight + (popupHeight / 2)) > documentHeight) {

                        popupHeight = container.addClass('popup-full-page-active').css({ display: 'block' }).outerHeight(),
                        topMargin = (documentHeight / 2) - (popupHeight / 2) + $(window).scrollTop();

                        var headerHeight = $('.popup-content-header', container).outerHeight(),
                            textContainerHeight = popupHeight - headerHeight;

                        $('.popup-content-text', container).outerHeight(textContainerHeight);

                    }

                    container.css({ display: 'none' });

                    container.css({ top: topMargin }).fadeIn(function () {
                        $(this).focus();
                    });
                    modal.fadeIn();
                },
                hide: function () {

                    container.fadeOut(function () {

                        $("html").removeClass("popup-enabled");

                        $(this).removeClass(popupCSSclass).removeAttr('style');
                        $('.popup-content-text', container).removeAttr('style');
                    });
                    modal.fadeOut();
                }

            };


            // add new content to the popup
            var updateContent = function () {
                $('.close-btn', container).text(closeBtnText);
                $('.popup-window-content-holder', container).html(popupContent);

                togglePopup.show();
            }

            // event handlers
            var bindEvents = function () {

                // popup link
                popupLink.on('click', function (e) {
                    e.preventDefault();

                    updateContent();
                });

                // close button
                container.on('click', '.close', function (e) {
                    e.preventDefault();
                    togglePopup.hide();
                });

                // modal layer
                modal.on('click', function () {
                    togglePopup.hide();
                });

                // Bind Keyboard Shortcuts
                $(document).on('keydown', function (e) {
                    // Close lightbox with ESC
                    if (e.keyCode === 27 && container.is(':visible')) {
                        togglePopup.hide();
                    }
                });

            }

            // initialisation
            var init = function () {
                if (!container) {
                    $('form').append(template);
                    container = $('.popup-window');

                }
                modal = $('.modal');
                bindEvents();
            }

            init();

            // optional callback function
            if (callback)
                callback();
        });
    };

})(jQuery);