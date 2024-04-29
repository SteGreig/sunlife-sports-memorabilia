window.APP = (function (module, $) {
    "use strict";

    module.SLD = (function (module, $) {

        var mod = {}; // mod is a submodule of SLD

        // configuration of popup windows
        mod.popupwindows = function () {
            //   $('[data-popup]').popwindow({ CSSprefix: 'text' });
            //$("[class='jspopupwindow']").popwindow({ CSSprefix: 'text' });
            $('.jspopupwindow').popwindow({ CSSprefix: 'text' });
        }

        mod.dobAlert = function () {
            $('.dobAlert').on('click', function () {
                var retVal = confirm("Do you want to change your date of birth? Because your quote is based on your age, we will need to take you back to your quote.");
                if (retVal == true) {
                    return true;
                } else {
                    return false;
                }
            })
        };

        mod.cookiePanel = function () {

            var cookie = APP.HELPERS.cookie;

            var checkCookie = function () {
                var username = cookie.getCookie('axacookie');
                if (!username) {
                    $('.cookie-panel').addClass("no-cookie");
                }
                else
                {
                    $('.cookie-panel').removeClass("no-cookie");
                }
            };

            var setCookie = function () {
                var exdays = 30;
                cookie.setCookie('axacookie', "accepted", { expires: exdays, path: "/" });
            };
                  
            checkCookie();

            $('.cookie-panel a.btn').on('click', function (e) {
                e.preventDefault();
                $('.cookie-panel').removeClass("no-cookie");
                setCookie();
                $('.cookie-panel').slideUp(function () {
                    APP.EQTR.footerPosition();
                });
                $('.offset-cookie').animate({ 'padding-bottom': 0 }, 400, function () {
                    $(this).removeAttr('style').removeClass('offset-cookie');
                });
            });

            var cookiePosition = function () {
                if ($('.nav-control').is(':visible') && $('.cookie-panel').is(':visible')) {
                    var cookiePanelH = $('.cookie-panel').outerHeight();

                    $('.page').addClass('offset-cookie').css({ paddingBottom: cookiePanelH });
                }
                else {
                    $('.page').removeAttr('style').removeClass('offset-cookie');
                }
            }
            cookiePosition();

            $(window).smartresize(cookiePosition);
        }

        mod.printSection = function () {
            $("a[name=linkPrint]").on("click", function (e) {
                e.preventDefault();
               var printContents = $('#printDiv').html();
                var printWindow = window.open("", "PrintDirectDebit");
                printWindow.document.write('<html><head><title>Print</title>');
                printWindow.document.write('<link rel="stylesheet" href="/source/css/eqtr/print.css" type="text/css" />');
                printWindow.document.write('</head><body >');
                printWindow.document.write(printContents);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            });
        }

        mod.livePersonHandlers = function () {
            $('.tab-link').on('click', function () {
                sendFAQTermsConditionsVarsOnClick();
            });
            
            $('#SaveQuoteButton').on('click', function () {
                sendQuoteSavedVarsOnClick();
            });

            $('.tooltip-error').on('click', function () {
                alert('11');
            });

            var currentTabbedPanel = $(".detail-group");
            $('.detail-tabs ul li', currentTabbedPanel).on("click", function (e) {
                e.preventDefault();

                var selectedIndex = $(this).index() + 1,
                fn = window['sendFuneralPlanTab' + selectedIndex + 'VarsOnClick'];

                if (typeof fn === 'function') {
                    fn();
                }
            });
        }

        // Display an inactivity pop up window when user is inactive on transcational pages for a while
        mod.inactivityWindow = function () {
            
            var inactivityPopup = function () {
                var height = 700;
                var width = 1100;
                var left = (screen.width / 2) - (width / 2);
                var top = (screen.height / 2) - (height / 2);
                window.open('/inactive/', '_blank', 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left + '');
            }

            if (typeof stayOnPageAlert != 'undefined') {
                // Set inactivity timeout
                var inactivityTimeout = 600000;
                window.setTimeout(inactivityPopup, inactivityTimeout);
            }
        }

        return mod;

    }(module, $));

    return module;

})(window.APP || {}, window.jQuery);