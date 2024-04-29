
(function ($) {

    'use strict';

    var helper = APP.HELPER; // shortcut to APP.HELPER

    $.fn.popwindow = function (options, callback) {

        // Default Options
        var settings = {
            closeBtnText: 'close'
        };

        $.extend(settings, options);
        var container = $('.popup-window'),
			modal = $('.modal');
        var template = '<div class="popup-window" tabindex="-1" role="dialog" aria-labelledby="popup window">\
                            <a href="#" class="close"><span class="close-btn"></span></a>\
                            <div class="popup-window-content-holder"></div>\
                        </div><div class="modal"></div>';

        if ($('.popup-window').length == 0) {
            $('form').append(template);
            container = $('.popup-window'),
			modal = $('.modal');
        }

        return this.each(function () {

            // vars within scope of current popup link
            var popupLink = $(this),
                popupContent = $(popupLink.attr('href')).html(),
                closeBtnText = settings.closeBtnText,
                isVisible = false;

            // show/hide the popup
            var togglePopup = {

                show: function () {


                    var setLayout = function () {

                        var viewportHeight = $(window).height(),
                        documentHeight = $('html').height(),
                        isPhoneView = helper.device.screenLayout() == 'phone',
                        positionTop = $(window).scrollTop();

                        // Tablet or Desktop screen size
                        if (!isPhoneView) {

                            var popupWindowHeight = container.css({ display: 'block' }).outerHeight(); // get the height of the popup window

                            // If the popup window contents is greater than the total height of the page 
                            if (popupWindowHeight > viewportHeight) {

                                container.addClass('scrollable-popup');
                                popupWindowHeight = (viewportHeight / 100) * 90;

                                var headerHeight = $('.popup-content-header', container).outerHeight(),
                                    popupBodyHeight = popupWindowHeight - headerHeight - 2;

                                $('.popup-content-text', container).outerHeight(popupBodyHeight);


                            }
                                // If the popup window contents is greater than the total height of the viewport 
                                //else if (popupWindowHeight > viewportHeight) {
                                //    container.css({ top: '10%' });
                                //}
                            else {
                                container.css({ top: '50%', marginTop: -(popupWindowHeight / 2) });
                            }

                            container.css({ display: 'none' });
                            displayPopup();
                        }
                        else {
                            container.removeAttr('style');
                            displayPopup();
                        }

                        isVisible = true;
                    }
                    setLayout();

                    $(window).smartresize(function () {
                        if (isVisible == true) {
                            setLayout();
                        }
                    });

                    function displayPopup() {
                        var scrollPosition = $(window).scrollTop();
                        $("html").addClass("popup-enabled");

                        // set transition of popup
                        container.fadeIn(function () {
                            $(this).focus();
                            $(window).scrollTop(scrollPosition); // set the window scroll position after focus of popup window to prevent page jumping scroll postion
                            // optional callback function
                            if (callback) {
                                callback();
                            }
                        });
                        modal.fadeIn();
                    }

                },
                hide: function () {

                    container.fadeOut(function () {
                        $("html").removeClass("popup-enabled");
                        $(this).removeAttr('style').removeClass('scrollable-popup');
                        isVisible = false;
                    });
                    modal.fadeOut();
                }

            };


            // add new content to the popup
            var updateContent = function () {
                $('.close-btn', container).text(closeBtnText);
                $('.popup-window-content-holder', container).html(popupContent);

                container.imagesLoaded(function () {
                    togglePopup.show();
                });
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
                bindEvents();
            }

            init();

        });
    };

})(jQuery);