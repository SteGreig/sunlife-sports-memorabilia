
window.APP = (function (module, $) {
    "use strict";

    var helper = APP.HELPER; // shortcut to APP.HELPER
    var device = helper.device; // shortcut to feature detection


    module.EQTR = (function (module, $) {
        var mod = {}; // mod is a submodule of EQTR
        var shouldScroll = true; // used for backtotop on mobile view
        // Create navigation for sections within the page
        mod.pageSectionNav = function () {

            var $pageNav = $('.page-section-nav');

            if ($pageNav.length == 0 || device.isIE('ie7')) {
                return;
            }

            $pageNav.addClass('page-nav-enhanced');

            var sections = $('.sector[id]'),
                sectionPosArr = [],
                isTouchDevice = device.supportsTouch && $('.page-nav-enhanced').css('position') === 'fixed';// touch device larger than mobile size


            // always position the nav below the page banner on pageload
            var initialPosition = function () {
                var offsetVerticalPosition = 0;
                if (isTouchDevice) {
                    offsetVerticalPosition = -$pageNav.outerHeight() / 2;
                }
                else if ($('.page-intro-sector').length && $('.page-banner').length) {
                    offsetVerticalPosition = -$('.page-intro-sector').outerHeight();
                }

                function setMarginTop() {
                    $pageNav.css({ marginTop: offsetVerticalPosition });
                }

                function removeMarginTop() {
                    if (isTouchDevice)
                        return;

                    $pageNav.removeAttr('style');
                }

                return {
                    set: setMarginTop,
                    remove: removeMarginTop
                }
                
            }();

            initialPosition.set();

            // On touch devices. Show links on first tap/touch
            if (isTouchDevice) {
                $pageNav.on('click', function (e) {
                    e.preventDefault();

                    if(!$(this).hasClass('expand-nav')) {
                        $(this).addClass('expand-nav');
                    }
                    
                });
                $pageNav.on('click', '.page-section-link,.page-section-tab', function (e) {
                    e.preventDefault();
                    
                    if ($pageNav.hasClass('expand-nav')) {
                        e.stopPropagation();
                        
                        sectionLinkClick(this);

                        $pageNav.removeClass('expand-nav');
                    }
                });
                $(document).on('touchstart', function () {
                    $pageNav.removeClass('expand-nav');
                });
                $('.page-section-link,.page-section-tab', $pageNav).on('touchstart', function (e) {
                    e.stopPropagation();
                });

            }
            else {
                $pageNav.on('click', '.page-section-link,.page-section-tab', function (e) {
                    e.preventDefault();

                    sectionLinkClick(this);
                });
            }

            // scroll to the appropriate section when the page-section-link is clicked
            function sectionLinkClick(thisLink) {
                var $link = $(thisLink),
                    sectionId;

                if ($(thisLink).hasClass("page-section-tab")) {
                    var href = $(thisLink).attr('href');
                    var sector = $(href).closest('.sector');

                    sectionId = '#' + sector.attr('id');

                    $(href).trigger('click', {open: true});
                }
                else {
                    
                    sectionId = $link.attr('href');
                }

                shouldScroll = false;

                // scroll page to section
                mod.scrollPage($(sectionId), 0, 1000,
                    function () {
                        // update browser history on scrollEnd
                        location.hash = sectionId;
                        shouldScroll = true;
                        if (!$link.hasClass('active')) {
                            $('.active', $pageNav).removeClass('active');
                            $link.addClass('active');
                        }
                    }
                );
            }

            window.onhashchange = function () {
                // if user presses browser back button and hash value returns '', reset page nav to first item selected.
                if (location.hash == '') {
                    $('.active', $pageNav).removeClass('active');
                    $('li', $pageNav).eq(0).find('a').addClass('active');
                }

                if ($(location.hash).length) {

                    $(window).scrollTop($(location.hash).offset().top);
                }
                else {
                    $(window).scrollTop(0);
                }
            };

            // set min-heights on page sections
            var setPageSectionHeights = function () {
                var windowHeight = $(window).outerHeight();

                sections.find('.sector-inner').css('min-height', windowHeight);
            }
            //setPageSectionHeights();

            // Create an Array for storing top position of each section
            var getPositions = {
                initialPos: function () { return $pageNav.offset().top - 160 },
                stopPos: function () { return $('.footer').offset().top - $pageNav.outerHeight() },
                sectionsPos: function () {
                    sections.each(function (i) {
                        var topPos = $(this).offset().top;

                        // Store the top position of each panel
                        sectionPosArr.push(topPos);
                    });
                    return sectionPosArr;
                }
            }
            getPositions.sectionsPos();

            // On window resize get the new position of page sections
            $(window).smartresize(function () {
                sectionPosArr = [];
                getPositions.sectionsPos();
                //setPageSectionHeights();               
            });

            // make page nav sticky 
            var positionSectionNav = function () {

                var pageNavH = $pageNav.outerHeight(),
                    initialPos = getPositions.initialPos(),
                    stopPos = getPositions.stopPos();

                $(window).bind('scroll.pageNavScroll', function () {

                    var scrollPos = $(this).scrollTop();
                        //currentSection = getCurrentSection(scrollPos);

                    if (scrollPos > initialPos) {
                        $pageNav.addClass('sticky-nav');
                        initialPosition.remove();
                        //if (currentSection >= 0) {
                        //    $('.active', $pageNav).removeClass('active');
                        //    $('.page-section-link:eq(' + currentSection + ')', $pageNav).addClass('active');
                        //}
                    }
                    else {
                        $pageNav.removeClass('sticky-nav');
                        initialPosition.set();
                    }
                });
            }
            positionSectionNav();

            // Returns the index of the current visible section
            function getCurrentSection(scrollPos) {
                var currentSection,
                    i = 0;

                while (scrollPos + 300 >= sectionPosArr[i]) {
                    currentSection = i;
                    i++;
                }

                return currentSection;
            }

        }

        // Placeholder ATTR pollyfill
        mod.placeholderAttr = function () {
            // Set placeholder text on text fields in browsers without support
            $.support.placeholder = false;
            var test = document.createElement('input');
            if ('placeholder' in test) $.support.placeholder = true;
            if (!$.support.placeholder) {
                $("input[placeholder]:not(.prevent-Placeholder)").setPlaceholder();
            }
        }

        // Video lightbox configuration
        mod.videoLightbox = function () {
            $('a[rel=video]').videoplayer();
        };

        // configuration of equal height components
        mod.equalHeights = function () {

            // Product promo
            var productSetHeights = function (onWindowResize) {
                if (device.screenLayout() != 'phone') {
                    $('.product-list').equalHeights({ target: '.product-promo .title', onResize: onWindowResize });
                    $('.product-list').equalHeights({ target: '.product-promo .content', onResize: onWindowResize });
                }
                else {
                    $('.product-list .set-height').removeClass('set-height').removeAttr('style');
                }
            }

            productSetHeights(false);
            $(window).smartresize(function () { productSetHeights(true) });

            // Feature promo
            var featureSetHeights = function (onWindowResize) {
                if (device.screenLayout() != 'phone') {
                    $('.feature-sector').equalHeights({ target: '.component-heading', onResize: onWindowResize });
                    $('.feature-sector').equalHeights({ target: '.component-content', onResize: onWindowResize });
                }
                else {
                    $('.feature-sector .set-height').removeClass('set-height').removeAttr('style');
                }
            }

            featureSetHeights(false);
            $(window).smartresize(function () { featureSetHeights(true) });

        }

        // Adding classes to the first and last page-content sectors
        mod.sectorTagging = function () {
            $(".page-content .sector:first").addClass("first-sector");

            $(".page-content .sector:last").addClass("last-sector");


            if ($('.breadcrumbs').length && $('.page-banner').length == 0) {

                $('.first-sector').addClass('offset-breadcrumbs')
            }
        };

        // Adding classes to the first and last specified components
        mod.productPromoComponents = function () {
            var productList = $(".product-list");

            if (productList.length == 0) {
                return;
            }

            // Adding classes to the first and last specified components
            $('.product-promo:first', productList).addClass("first-product-promo");
            $('.product-promo:last', productList).addClass("last-product-promo");

            var clickablePromoHeaders = function () {

                // On click of the promo component header show/hide the promo content (on small screens only)
                productList.on('click', '.product-promo .component-header', function (e) {
                    if ($(window).width() <= 690) {
                        e.preventDefault();

                        var promoComponent = $(this).parents('.product-promo'),
                            promoContentPanel = promoComponent.find('.content'),
                            promoCTAPanel = promoComponent.find('.cta-panel');

                        if (!promoContentPanel.is(':visible')) {
                            promoContentPanel.slideDown(function () {
                                promoComponent.addClass('product-promo-active');
                                mod.scrollPage(promoComponent, 0, 1000);
                                $(this).removeAttr('style');
                            });
                            promoCTAPanel.slideDown(function () {
                                $(this).removeAttr('style');
                            });
                        }
                        else {
                            promoContentPanel.slideUp(function () {
                                promoComponent.removeClass('product-promo-active');
                                $(this).removeAttr('style');
                            });
                            promoCTAPanel.slideUp(function () {
                                $(this).removeAttr('style');
                            });
                        }
                    }
                });
            }
            clickablePromoHeaders();

        };

        // Toggle the height of the page intro component
        mod.pageIntro = function () {
            var introArea = $('.page-intro-sector');

            if (introArea.length == 0) {
                return;
            }

            var introPanel = $('.page-intro', introArea);

            var setIntroToggle = {
                init: function () {
                    var btnText = introPanel.data('togglebtntext'),
                        closeText = 'Close',
                        btnTemplate = '<div class="btn-bar"><div class="btn-container"><a class="toggle-btn" href="/">{buttontext}</a></div></div>',
                        btnHTML = btnTemplate.replace('{buttontext}', btnText);

                    if (!btnText) {
                        return;
                    }
                    introPanel.addClass('toggle-intro').append(btnHTML).find('.richtext').addClass('toggle-content')
                    $(".page-content .sector:first").addClass('offset-pageintro');

                    this.bindEvents(btnText, closeText);
                },
                bindEvents: function (btnText, closeText) {
                    var togglePanel = $('.toggle-content', introPanel),
                        btnStartHeight = setIntroToggle.btnStartHeight(togglePanel),
                        title = $('.main-title', introPanel)

                    $(window).smartresize(function () {
                        btnStartHeight = btnStartHeight;
                    });

                    introPanel.on('click', '.toggle-btn', function (e) {
                        var button = $(this);

                        e.preventDefault();

                        if (!introPanel.hasClass('open-panel')) {

                            var togglePanelH = togglePanel.css({ height: 'auto' }).height();

                            togglePanel.removeAttr('style');


                            togglePanel.animate({
                                height: togglePanelH
                            }, 400, function () {
                                mod.scrollPage(title, 0, 1000);
                                introPanel.addClass('open-panel');
                                togglePanel.css({ height: 'auto' });
                                button.text(closeText);
                            });


                        }
                        else {
                            togglePanel.animate({
                                height: btnStartHeight
                            }, 400, function () {
                                togglePanel
                                introPanel.removeClass('open-panel');
                                togglePanel.removeAttr('style');
                                button.text(btnText);
                            });
                        }

                    });
                },
                btnStartHeight: function (togglePanel) {
                    return togglePanel.height()
                }

            }
            setIntroToggle.init();


        }

        // Show/Hide plugin configuration
        mod.showHide = function () {
            $('.footer .show-hide')
                .showHide({
                    clickableSummary: true
                })
                .on('onOpenStart', function () {
                    mod.scrollPage($('.footer .supplement-sector'), 0, 400);
                }
            );
        }

        // configuration of responsive images
        mod.responsiveImages = function () {

        }

        // configuration of popup windows
        mod.popupwindows = function () {
            $('[data-popup]').popwindow(null, mod.productTable);
        }

        mod.isLiveChatOnline = function () {

            if(typeof lpMTagConfig === "undefined" ) {
                return;
            }

            return lpMTagConfig.dynButton0.buttonState == 'online';
        }

        mod.pageBanner = function () {
            var banner = $('.page-banner'),
				initialWindowWidth = 0,
                hasImage;

            if (banner.length == 0) {
                return;
            }

            if ($('.product-list').length) {
                $('html').addClass('offset-header');
            }
            if ($('.page-intro').length && ($('.text', banner).length || $('.quote-component', banner).length)) {
                banner.addClass('offset-intro');
            }
            if ($('.breadcrumbs').length) {
                banner.addClass('offset-breadcrumbs');
            }
           

            // Scale the banner image to cover the container
            var setupBanner = function () {

                var hasText = $('.page-banner-content .quote-component', banner).length > 0 || $('.page-banner-content .text', banner).length > 0;


                banner.find('.image').remove();

                // if on larger screens - create an image
                if ($('.page-banner-state-indicator').is(':visible')) {
                    $('.page-banner[data-rspimg]').responsiveImage({ maxWidth: 1800 });
                }

                if (hasText) {
                    banner.addClass('banner-with-text');
                }
        
                // if a banner image exists, adjust the heights & positioning of banner elements
                if ($('.image', banner).length) {
                    banner.addClass('banner-with-image');

                    $("img", banner).imagesLoaded(function () {
                        if (hasText) {
                            var contentHeight = $('.page-banner-content').outerHeight(true);
                          //  banner.height(contentHeight);
                        }

                        $('img', banner).backgroundCover();
                    });
                }
                else {
                    banner.removeAttr('style');
                }
            }

            // postition banner elements on pageload and window resize
            setupBanner();
                
        }

        mod.responsiveNav = function () {
            $('<div class="responsive-nav"><div class="container"></div></div>').insertBefore('.wrapper');

            if ($('.main-nav-sector').length == 0) {
                $('html').addClass('quote-process');
            }

           // if (!mod.isLiveChatOnline()) $('#lpButtonDiv-topbanner').remove();

            // Add navigation lists to reponsive nav holder
            $('.main-nav-sector [role="navigation"]').clone().addClass('main navlist').appendTo('.responsive-nav .container');
            $('.utility [role="navigation"]').clone().addClass('utility navlist').find('#lpButtonDiv-topbanner').remove().end().appendTo('.responsive-nav .container');

            // Add some headers 
            $('<h5 class="navlist-title">Main sections</h5>').insertBefore('.responsive-nav .main');
            $('<h5 class="navlist-title utility-title">Additional links</h5>').insertBefore('.responsive-nav .utility');

            // Menu toggle control
            $("<div class='btn btn-icon-left btn-burger-menu'><span class='btn-inner'><span class='icon-burger-menu' aria-hidden='true'></span><a class='nav-control' href='#'>Menu</a></span></div>").prependTo('.responsive-nav');

            $('.btn-burger-menu').on('click', function (e) {
                e.preventDefault();

                if (!$('html').hasClass('show-menu')) {
                    $('html').addClass('show-menu');
                }
                else {
                    $('html').removeClass('show-menu');
                }
            });

        }

        // NO LONGER USED - moved to /sld/app.js
        mod.cookiePanel = function () {
            $('.cookie-panel .btn').on('click', function (e) {
                e.preventDefault();
                $('.cookie-panel').slideUp(function () {
                    mod.footerPosition();
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

        // lazy load the print stylesheet
        mod.printStyles = function () {
            var headID = document.getElementsByTagName("head")[0],
                cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = '/source/css/eqtr/print.css';
            cssNode.media = 'print';
            headID.appendChild(cssNode);
        }

        // If the combined page content is shorter than the window height 
        // add a class to position the footer at the bottom of the page
        mod.footerPosition = function () {
            var footerPosition = function () {

                var cookieHeight = ($('.cookie-panel').is(':visible')) ? $('.cookie-panel').outerHeight() : 0,
                    headerHeight = $('.header').outerHeight(),
                    footerHeight = $('.footer').outerHeight(),
                    pageContentHeight = $('.page-content').outerHeight(),

                    docHeight = cookieHeight + headerHeight + pageContentHeight + footerHeight,
                    winHeight = $(window).height();

                if (docHeight < winHeight) {
                    $('.footer').addClass('fixed-footer');
                }
                else {
                    $('.footer').removeClass('fixed-footer');
                }
            };

            footerPosition();
            $(window).smartresize(function () {
                footerPosition();
            });
        };

        // Tabbed component at the footer of some pages
        mod.supplementTabs = function () {

            var supplementGroup = $(".supplement-group");

            if (supplementGroup.length == 0 || device.isIE('ie7')) {
                return;
            }
     
            supplementGroup.each(function () {
                
                var supplementBlock = $(".supplement-block", this);

                // Create the supplement tabs container before the first '.supplement-block'
                var firstSupplementBlock = $(".supplement-block", this).eq(0),
                    supplementTabsMarkup = $('<div class="supplement-tabs"><ul></ul></div>'),
                    listItems = [];

                supplementTabsMarkup.insertBefore(firstSupplementBlock);

                // Populate the list for each 'supplement-header'
                var tabPopulation = function (el, i) {

                    var title = $(".supplement-title", el).text().trim();

                    listItems.push('<li id="supplementBlock_'+ (i + 1 )*1+'"><a data-index="' + i + '" class="tab-link" href="#"><span>' + title + '</span></a></li>');

                    $('<div class="tab-link-container"><a data-index="' + i + '" class="tab-link" href="#supplementBlock_' + (i + 1) * 1 + '"><span>' + title + '</span></a></div>').insertBefore(el);

                }

                supplementBlock.each(function (i) {

                    tabPopulation($(this), i);
                });

                $('.supplement-tabs ul', supplementGroup).append(listItems.join(""));

                var tabNavItem = $('.supplement-tabs li,.tab-link-container', supplementGroup);

                tabNavItem.on("click", function (e, data) {
                    e.preventDefault();
                    
                    var selectedIndex = $('a', this).data('index');
                    var parentEl = $('[data-index="' + selectedIndex + '"]').parent();
                    var fromPageNav = typeof data != 'undefined' && data.open;

                    if (!supplementBlock.eq(selectedIndex).hasClass("shown")) {

                        $(".supplement-block.shown", supplementGroup).removeClass("shown");

                        supplementBlock.eq(selectedIndex).addClass("shown");

                        $(".supplement-tabs li.active", supplementGroup).removeClass("active");
                        $(".tab-link-container.active", supplementGroup).removeClass("active");

                        parentEl.addClass("active");
                    }
                    else {
                        if (fromPageNav) {
                            return;
                        }
                        supplementBlock.eq(selectedIndex).removeClass("shown");

                        $(".supplement-tabs li.active", supplementGroup).removeClass("active");
                        $(".tab-link-container.active", supplementGroup).removeClass("active");

                        parentEl.removeClass("active");
                    }
                    if(!fromPageNav) 
                        $(window).scrollTop($(this).offset().top);

                    mod.footerPosition();
                });

            });

        };

        mod.scrollPageTop = function () {

            var scrollTopControl = $(".scroll-top"),
                makeBackToTopSticky = true;
      
            // Animate scroll when user clicks back to top link.
            scrollTopControl.on('click', 'a', function (e) {
                e.preventDefault();

                mod.scrollPage($('body'), 0, 1000);

            });

            /* ---- MAKE BACK TO TOP LINK STICKY ON SMALL SCREENS ---- */

            if (!makeBackToTopSticky)
                return;

            var scrollTop = function () {

                var initialPos = 0,
                    offsetPos = $(window).height(),
                    isActive = false,
                    timeOutID,
                    speed = 3000;

                $(window).smartresize(function () { offsetPos = $(window).height() });

                scrollTopControl.addClass('scroll-top-sticky').removeClass('scroll-top-static');

                var showElement = function () {
                    scrollTopControl.addClass('scroll-top-active');
                    isActiveTimeout();
                    isActive = true;

                }
                var hideElement = function () {
                    scrollTopControl.removeClass('scroll-top-active');
                    resetActiveTimeout();
                    isActive = false;
                }
                var isActiveTimeout = function () {
                    timeOutID = window.setTimeout(function () {
                        if (isActive) {
                            hideElement();
                        }
                    }, speed);
                }
                var resetActiveTimeout = function () {
                    window.clearTimeout(isActiveTimeout);
                }

                this.scrollDirection = function () {
                    $(window).bind('scroll touchmove', function () {
   
                        if (!shouldScroll) {
                            return;
                        }
                        var scrollPos = $(window).scrollTop();

                        // Scroll up
                        if (scrollPos < initialPos && scrollPos > offsetPos) {
                            if (!isActive) {
                                showElement();
                            }
                        }
                            // Scroll down
                        else if (scrollPos > initialPos) {
                            if (isActive) {
                                hideElement();
                            }
                        }

                        initialPos = scrollPos;
                    });
                }

            }
            var makeSticky = new scrollTop();
            makeSticky.scrollDirection();

        };

        // FAQ Component used within supplement tabs
        mod.questionAnswer = function () {

            if ($(".question-stage").length == 0 || device.isIE('ie7')) {
                return;
            }

            var questionStage = $(".question-stage"),
                answerStageMarkup = $('<div class="answer-stage"><div class="answer-content"></div></div>'),
                isMobileView = questionStage.css('float') == 'none' ? true : false;

            answerStageMarkup.insertAfter(questionStage);

            // Configure the question and answer content based on user choice

            var questionAnswerConfig = function () {

                // wrap each faq heading in an anchor so content can be accessed using keyboard
                $(".faq-item .heading").each(function () {
                    $(this).wrapInner('<a href="#"></a>');
                });

                // Set up and configure the
                $(".faq-item").on("click", ".faq-title a", function (e) {
                    e.preventDefault();
                    var faqItem = $(this).parents('.faq-item'),
                        itemPosition = faqItem.position().top;

                    if (isMobileView) {
                        if (!faqItem.hasClass('active')) {

                            faqItem.addClass('active');
                        }
                        else {
                            faqItem.removeClass('active');
                        }
                    }
                    else {
                        if (!faqItem.hasClass('active')) {

                            var itemText = $(".faq-content", faqItem).clone();

                            // remove from other items
                            $(".active", questionStage).removeClass("active");

                            // add the class to this item
                            faqItem.addClass("active");

                            // Insert the cloned markup
                            $(".answer-content").html(itemText).css({ marginTop: itemPosition });
                        }
                    }


                    
                });

                // Set the height of the 'answer-stage' based on the height of the 'question stage'
                var questionAnswerHeights = function () {

                    var questionStageHeight = questionStage.outerHeight(),
                        answerStage = $(".answer-stage");

                    answerStage.css("min-height", questionStageHeight);

                };
                questionAnswerHeights();
                $(window).smartresize(function () {
                    questionAnswerHeights();
                    isMobileView = questionStage.css('float') == 'none' ? true : false;
                });

            }
            questionAnswerConfig();

            $(".faq-item:eq(0) .faq-title a").click();
        };

        // Share it component
        mod.socialShare = function () {
            var sharePanel = $('.share-panel');

            if (sharePanel.length == 0) {
                return;
            }

            var shareText;

            sharePanel.each(function () {
                shareText = $(this).data('sharetxt');

                $(shareText).prependTo(this);
            });

            $('.share-link', sharePanel).on('click', function (e) {
                e.preventDefault();

                var addThisContainer = $(this).closest('.share-panel').find('.addthis-container');
                var shareText = $(this).parent();
                shareText.fadeToggle(function () { addThisContainer.fadeToggle(); });
            });

        };

        mod.numberedList = function () {
            var numberedList = $('.numbered-list');
            if (numberedList.length == 0) {
                return;
            }

            var styledNumberedList = function () {
                var li = $('li', this);

                li.each(function (i) {
                    var i = i + 1,
                        numberMarkup = $('<span class="numbered-list-item-number"><span class="number">' + i + '</span></span>');

                    $(this).prepend(numberMarkup);
                });

            }

            numberedList.each(styledNumberedList);

        }

        // Tabbed component used within the main content area
        mod.tabbedComponent = function () {

            var detailGroup = $(".detail-group");

            if (detailGroup.length == 0 || device.isIE('ie7')) {
                return;
            }

            detailGroup.each(function () {

                var currentTabbedPanel = $(this),
                    detailBlock = $(".detail-block", currentTabbedPanel);

                // Create the detail tabs container before the first '.detail-block'
                var firstDetailBlock = detailBlock.eq(0),
                    detailTabsMarkup = $('<div class="detail-tabs" id="tabNav"><ul class="numbered-list"></ul></div>'),
                    listItems = [],
                    currentIndex = 0,
                    prevIndex = 0,
                    disabledClass = 'arrow-disabled';

                detailTabsMarkup.insertBefore(firstDetailBlock);

                var tabIndex = function (currentIndex) {

                    $('.' + disabledClass, currentTabbedPanel).removeClass(disabledClass);

                    if (currentIndex == 0) {
                        $('.prev-arrow', currentTabbedPanel).addClass(disabledClass);
                    }
                    else if (currentIndex == totalItems) {
                        $('.next-arrow', currentTabbedPanel).addClass(disabledClass);
                    }

                    prevIndex = currentIndex;
                };

                // Populate the list for each 'detail-header'
                var tabPopulation = function (el) {

                    var title = $(".detail-title", el).text().trim();

                    listItems.push('<li id="tab_' + $(el).index() + '"><a href="#">' + title + '</a></li>');
                }

                detailBlock.each(function () {
                    tabPopulation($(this));
                });

                $('.detail-tabs ul', currentTabbedPanel).append(listItems.join(""));

                var totalItems = $('.detail-tabs ul li', currentTabbedPanel).length - 1;

                $('.detail-tabs ul li', currentTabbedPanel).on("click", function (e) {
                    e.preventDefault();
                    var selectedIndex = $(this).index();

                    if (!detailBlock.eq(selectedIndex).hasClass("shown")) {

                        $(".shown", currentTabbedPanel).removeClass("shown");

                        detailBlock.eq(selectedIndex).addClass("shown");

                        $(".detail-tabs .active", currentTabbedPanel).removeClass("active");

                        $(this).addClass("active");

                        mod.productTable();
                        mod.responsiveTables();

                        currentIndex = selectedIndex;

                        tabIndex(currentIndex);


                    }

                });
                // select the first tab on page load
                $('.detail-tabs ul li:eq(0)', currentTabbedPanel).click();


                // used for smaller screens
                var navgationArrows = function () {
                    var arrows = $('<div class="navigation"><a class="arrow prev-arrow ' + disabledClass + '" href="#">Prev</a><a href="#" class="arrow next-arrow">Next</a></div>');

                    $('.detail-tabs', currentTabbedPanel).append(arrows);

                    $('.arrow', currentTabbedPanel).on('click', function (e) {
                        e.preventDefault();
                        var direction = $(this).hasClass('prev-arrow') ? -1 : 1;
                        currentIndex = prevIndex + direction

                        if (currentIndex == -1) {
                            return;
                        }

                        $('.detail-tabs ul li:eq(' + currentIndex + ')', currentTabbedPanel).click();
                    });
                };
                navgationArrows();

                $('.detail-navigation .btn a', currentTabbedPanel).on('click', function (e) {
                    var tabId = $(this).attr('href');

                    if ($(tabId, currentTabbedPanel).length) {
                        e.preventDefault();

                        var targetIndex = tabId.split("_").pop() - 1;

                        $('.detail-tabs ul li:eq(' + targetIndex + ')', currentTabbedPanel).click();

                        location.hash = 'tab_' + (targetIndex + 1 * 1);

                    }
                });

            });

        };

        // Product comparison table
        mod.productTable = function () {
            
            var table = $('.product-table'),
                tableLoaded = $('.table-header', table).length;



            if (device.isIE('lt-ie8') || tableLoaded > 0)
                return;

            table.each(function (i) {
  
                if ($(this).is(':hidden')) {
                    return;
                }

                var $table = $(this),
                    productNames = [],
                    productPrices = [],
				    headerTemplate = '<div class="table-header"><div class="table-header-inner"><ul>{list}</ul></div></div>',
                    footerTemplate = '<div class="price-container"><ul>{prices}</ul></div>',
                    initialPos,
                    tableHeaderHeight,
                    stopPos,
                    $tableHeader,
                    isMobileView;

                // Add a fake table header and footer 
                var setupHeaderFooter = function () {
                    $('.product-info li', $table).each(function () {

                        var iconSrc = $(this).find('img').attr('src'),
                            productName = $(this).find('.product-name').html(),
                            productPrice = $(this).find('.product-price').html();

                        productNames.push('<li><div class="image-container"><img class="product-icon" src="' + iconSrc + '" alt="" /></div>' + productName + '</li>');
                        productPrices.push('<li class="price">' + productPrice + '</li>');

                    });

                    var instruction = $('<div class="instruction fadeInDown"><div class="instruction-inner"><p>Click a plus to learn more about a feature</p></div></div>');

                    var tableHeader = headerTemplate.replace('{list}', productNames.join(''));
                    $('.product-table-row:first', $table).before(tableHeader);
                    $tableHeader = $('.table-header', $table);

                    instruction.prependTo($tableHeader)

                    var tableFooter = footerTemplate.replace('{prices}', productPrices.join(''));
                    $('.product-table-footer', $table).prepend(tableFooter);
                }

                // initial heights & positions
                var startVals = function () {
                    initialPos = $tableHeader.offset().top,
                    tableHeaderHeight = $tableHeader.outerHeight(),
                    stopPos;

                    $(document).imagesLoaded(function () {
                        stopPos = $('.product-table-row:last', $table).offset().top - tableHeaderHeight;
                    })
                }

                // Match cell heights for each row
                var matchCellHeights = function (row) {

                    isMobileView = $('.table-header .product-icon').length == 0 ? true : false;

                    if (!isMobileView) {
                        var productCellHeight = $('.products dl', row).removeAttr('style').outerHeight(),
                            rowTitleHeight = row.find('.row-title').removeAttr('style').outerHeight();

                        if (productCellHeight < rowTitleHeight) {
                            $('.products dl', row).height(rowTitleHeight - 1);
                        }
                        else {
                            row.find('.row-title').height(productCellHeight - 1)
                        }
                    }
                }

                var bindEvents = function () {

                    if (device.supportsTouch && device.screenLayout() == "phone") {
                        $(window).bind('scroll touchstart MSGestureStart', function () {
                            var scrollPos = $(this).scrollTop();
                            if (scrollPos >= stopPos) {
                                $tableHeader.addClass('sticky-table-header-end').css({ top: stopPos });
                            }
                            else if (scrollPos > initialPos) {
                                $tableHeader.removeClass('sticky-table-header-end').removeAttr('style').addClass('sticky-table-header');
                                $table.css({ paddingTop: tableHeaderHeight });
                            }
                            else if (scrollPos < initialPos) {

                                $tableHeader.removeClass('sticky-table-header');
                                $table.removeAttr('style');
                            }
                        });
                    }


                    $('.toggle', $table).on('click', function (e) {
                        e.preventDefault();
                        var productRow = $(this).closest('.product-table-row'),
                            descriptionPanel = productRow.find('.text');

                        productRow.toggleClass('selected-row');

                        descriptionPanel.slideToggle(function () {
                            matchCellHeights(productRow);
                            stopPos = $('.product-table-row:last', $table).offset().top - $tableHeader.outerHeight();
                        });
                    });
                }

                var init = function () {
                    var windowWidth = $(window).width();

                    setupHeaderFooter();
                    startVals();

                    $(window).smartresize(function () {
                        if (windowWidth != $(window).width())
                            startVals();
                    });

                    $('.product-table-row', $table).each(function () {
                        $('<a href="#" class="toggle"><span class="toggle-text">Toggle</span></a>').appendTo(this);
                        matchCellHeights($(this));
                    });

                    bindEvents();
                };

                init();
            });
        }

        // add a link to the aside help component for small screens        
        mod.linkToHelpComponent = function () {
            var helpComponent = $('#helpComponent');

            if (helpComponent.length == 0)
                return;

            // if the help component exists, add a link directly before the site header
            var linkText = $('.supplementary-title', helpComponent).text(),
                link = $('<div class="help-component-link"><a href="#helpComponent">' + linkText + '</a></div>');

            $('.header').after(link);

            $('.help-component-link').on('click', function (e) {
                e.preventDefault();
                mod.scrollPage(helpComponent, 0, 1000);
            });

        }

        mod.iframePopup = function () {
            var popupLink = $('[data-iframepopup]');

            if (popupLink.length == 0)
                return;

            $('body').append('<div class="iframe-popup" tabindex="-1" role="dialog" aria-labelledby="ifarme popup">\
                                <div class="popup-controls"><div class="popup-controls-inner"><a href="#" class="close">Close</a></div></div>\
					            <iframe frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen /></div>');

            popupLink.on('click', function (e) {
                e.preventDefault();
                var iframeSrc = $(this).attr('href');

                $('.iframe-popup iframe').attr('src', iframeSrc);

                $('html').addClass('show-iframepopup');
            });

            $('.iframe-popup .close').on('click', function (e) {
                e.preventDefault();
                $('html').removeClass('show-iframepopup');
            });
        }

        /* Scroll to a specified element. Scroll postion can be offset by a specified amount. 
        Element selector and offset are passed through as params. */
        mod.scrollPage = function (elem, offsetPos, speed, callback) {
            var speed = speed ? speed : 500,
                offsetPos = offsetPos ? offsetPos : 0,
                topPos = elem ? elem.offset().top - offsetPos : 0;

            $('html,body').animate({
                scrollTop: topPos
            }, speed, function () {
                $('html,body').clearQueue();
                $('html,body').stop();
                if (callback)
                    callback();
            });
        };

        // make richtext tables responsive
        mod.responsiveTables = function () {
            $('.richtext table').responsiveTable();
        }

        // Article summary components
        mod.articleSummary = function () {
            var article = $('.article-summary-item'),
                featureArticle = article.filter('.article-feature'),
                stardardArticle = article.not('.article-feature'),
                windowWidth = $(window).width();

            
            var setupArticleImages = function () {
                article.each(function () {
                    var imgSrc;

                    if ($(this).hasClass('article-feature') || device.screenLayout() == 'phone') {
                        imgSrc = $(this).data('landscapeimg');
                    }
                    else {
                        imgSrc = $(this).data('portraitimg');
                    }

                    if (imgSrc) {
                        $('.article-summary-image-container', this).remove();

                        var itemImage = $('<div class="article-summary-image-container"><img class="article-summary-image" src=" ' + imgSrc + ' " alt="" /></div>');
                        $('.article-summary-content', this).before(itemImage);
                    }

                });

                if ($('.article-summary-image', featureArticle).length && device.screenLayout() != 'phone') {
                    $('.article-summary-image', featureArticle).backgroundCover({ imageContainer: featureArticle });
                }
            }
            setupArticleImages();

            $(window).smartresize(function () {
                if (windowWidth != $(window).width()) {
                    setupArticleImages();
                }
            });



        }

        // Social share buttons without using a 3rd party plugin
        mod.staticShareButtons = function () {
            if ($('.static-share-buttons').length == 0)
                return;

            var shareButtonPanel = $('.static-share-buttons'),
                pageUrl = encodeURIComponent(window.location.href),
                pageTitle = encodeURIComponent(document.title),
                facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u={URL}',
                twitterShareUrl = 'https://twitter.com/intent/tweet?url={URL}&text={TEXT}',
                googlePlusShareUrl = 'https://plus.google.com/share?url={URL}';

            facebookShareUrl = facebookShareUrl.replace('{URL}', pageUrl);
            twitterShareUrl = twitterShareUrl.replace('{URL}', pageUrl).replace('{TEXT}', pageTitle);
            googlePlusShareUrl = googlePlusShareUrl.replace('{URL}', pageUrl);

            var shareHTML = '<a target="_blank" class="share-button share-facebook" href="' + facebookShareUrl + '"><span>Facebook</span></a> \
                                <a target="_blank" class="share-button share-twitter" href="' + twitterShareUrl + '"><span>Twitter</span></a> \
                                <a target="_blank" class="share-button share-gplus" href="' + googlePlusShareUrl + '"><span>Google plus</span></a>';

            shareButtonPanel.each(function () {
                $(shareHTML).appendTo(this);
            });

            $(document).on('click', '.share-facebook', function () {
                window.open(
                  $(this).attr('href'),
                  'facebook-share-dialog',
                  'width=626,height=436');
                return false;
            });

            $(document).on('click', '.share-twitter', function () {
                window.open(
                  $(this).attr('href'),
                  'twitter-share-dialog',
                  'width=575,height=400');
                return false;
            });

            $(document).on('click', '.share-gplus', function () {
                window.open(
                  $(this).attr('href'),
                  'gplus-share-dialog',
                  'width=626,height=436');
                return false;
            });
        }

        // Lazy load addThis
        mod.addThis = function () {
            var sharePanel = $('.addthis-container');

            if (sharePanel.length == 0)
                return;

            // load the google maps api
            var script = "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-4fa281062df709ce";

            if (window.addthis) {
                window.addthis = null;
            }
            $.getScript(script, function () { addthis.init(); });

        }

        // Blog category control
        mod.blogCategoryComponent = function () {
            // create a drop down from the blog category link list

            var categoryControl = $('.category-list');

            if (categoryControl.length == 0) {
                return;
            }
            var optionsArray = [],
                categorySelect = $('<select class="category-select"></select>').prependTo(categoryControl);

            $('li a', categoryControl).each(function (i) {
                var text = $(this).text(),
                    selected = $(this).hasClass('selected') ? 'selected' : '';


                optionsArray.push('<option value="' + i + '" ' + selected + '>' + text + '</option>');
            });
            
           categorySelect.append(optionsArray.join(''));

           categorySelect.on('change', function (e) {

               var categoryUrl = $('.category-list li:eq(' + $(this).val() + ') a').attr('href');

               window.location = categoryUrl;

           });

        }

        // use JS to add styled buttons for consistent look & feel.
        mod.styleEktronFormButtons = function () {
           
            var ektronForm = $('.ektron-form-panel,.poll-snippet');
            
            if (ektronForm.length == 0)
                return;

            var btnClass = ektronForm.hasClass('poll-snippet') ? 'btn-small' : '';

            // For each ektron form submit button create a fake button to replace it
            $('input[type="submit"]', ektronForm).each(function () {
                var btn = $(this);

                var newBtn = $('<div class="btn ektronform-btn btn-secondary ' + btnClass + ' btn-icon-right"><span class="btn-inner"><span class="icon-arrow-ltr" aria-hidden="true"></span><a href="#">' + btn.val() + '</a></span></div>');

                btn.before(newBtn);
            });

            // On clikc of the fake button trigger the click of the hidden submit button
            $('.ektronform-btn').on('click', function (e) {
                e.preventDefault();
                $(this).next('input[type="submit"]').click();
            });


        }

        // work around ektron HTML
        mod.pollWidgetHeader = function () {
            var pollWidget = $('.poll-snippet');

            if (pollWidget.length == 0)
                return;

            pollWidget.each(function () {
                var headerText = $('p:first', this).text();

                if ($('.tblreport', this).length) {
                    headerText = $('.headreport', this).text();
                }

                $('.snippet-header', this).append('<h3 class="title">' + headerText + '</h3>')
            });
        }

        return mod;

    }(module, $));

    return module;

})(window.APP || {}, window.jQuery);