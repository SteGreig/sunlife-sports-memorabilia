(function ($) {

    $.fn.showHide = function (options, callback) {
        var isToggleClass = "isToggle";

        // Default Options
        var settings = {
            toggleSummary: '.toggle-heading',
            toggleDetail: '.toggle-content',
            toggleLinkText: 'Show more, Show less',
            openByDefault: false,
            clickableSummary: false
        };

        $.extend(settings, options);

        return this.each(function () {
            var toggleComponent = $(this),
				toggleLinkText = settings.toggleLinkText.split(","),
				toggleSummary = $(settings.toggleSummary, toggleComponent),
				toggleDetail = $(settings.toggleDetail, toggleComponent),
                openByDefault = settings.open || toggleDetail.is(':visible'),
                clickableSummary = settings.clickableSummary;



            var init = function () {
                toggleComponent.addClass('show-hide');
                var toggletxt = (openByDefault) ? toggleLinkText[1] : toggleLinkText[0];
                if (toggleComponent.hasClass('open')) {
                    $('<div class="toggle-txt"><a class="toggle-link" href="#">' + toggleLinkText[1] + '</a></div>').appendTo(toggleSummary);
                } else {
                    $('<div class="toggle-txt"><a class="toggle-link" href="#showHide">' + toggletxt + '</a></div>').appendTo(toggleSummary);
                }

                eventHandlers();
            }

            var eventHandlers = function () {
                var toggleElement = (clickableSummary) ? toggleSummary : $('.toggle-link', toggleComponent);


                toggleElement.on('click', function (e) {
                    e.preventDefault();

                    if (!toggleDetail.is(':visible')) {
                        bindEvent.open();
                    }
                    else {
                        bindEvent.close();
                    }

                });
            }

            var bindEvent = {
                open: function () {
                    toggleComponent.trigger("onOpenStart");

                    toggleDetail.slideDown(function () {
                        $('.toggle-link', toggleComponent).text(toggleLinkText[1]);
                        toggleComponent.addClass('open');

                        toggleComponent.trigger("onOpenComplete");
                    });
                },
                close: function () {
                    toggleComponent.trigger("onCloseStart");

                    toggleDetail.slideUp(function () {
                        $('.toggle-link', toggleComponent).text(toggleLinkText[0]);
                        toggleComponent.removeClass('open');

                        toggleComponent.trigger("onCloseComplete");
                    });
                }
            }

            init();

            // optional callback function
            if(callback)  
                callback();

        });

    };

})(jQuery);