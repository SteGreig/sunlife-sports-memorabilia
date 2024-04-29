window.APP = (function (module, $) {
    "use strict";

    // Everything is contained within the window.APP namespace. 
    // Module is a public method which can be called within the APP namespace

    var eqtr = APP.EQTR;
    var sld = APP.SLD;

    // On DOM ready
    $(function () {
        
        
        eqtr.placeholderAttr();
        eqtr.videoLightbox();
        eqtr.equalHeights();
        eqtr.sectorTagging();
        eqtr.productPromoComponents();
        eqtr.pageIntro();
        eqtr.showHide();
        eqtr.responsiveImages();
        eqtr.responsiveNav();
        eqtr.pageBanner();
        // eqtr.cookiePanel();
        sld.cookiePanel();
        sld.dobAlert();
        sld.printSection();
        sld.popupwindows();
        eqtr.footerPosition();
        eqtr.scrollPageTop();
        eqtr.questionAnswer();
        eqtr.supplementTabs();
        eqtr.socialShare();
        eqtr.tabbedComponent();
        eqtr.numberedList();
        eqtr.popupwindows();
        sld.inactivityWindow();
        sld.livePersonHandlers();
        
        eqtr.FORMS.customInputGroup();
        eqtr.FORMS.inputSlider();
        eqtr.FORMS.formValidation();
        eqtr.FORMS.updateProgressIndicator();
        eqtr.FORMS.conditionalFields();
        eqtr.FORMS.sectionProgressCount();
        eqtr.FORMS.tooltipTrigger();
        eqtr.FORMS.quoteSummary();
        eqtr.FORMS.firstPaymentDate();
        eqtr.FORMS.findAddress();
        eqtr.FORMS.selectionBlock();
        eqtr.FORMS.inputFocused();
        eqtr.FORMS.onBeforeUnload();
        eqtr.FORMS.emailQuote();
        eqtr.FORMS.sessionStorage();
        eqtr.FORMS.selectPolicyOptions();
        // eqtr.FORMS.ajaxForms();

        //eqtr.linkToHelpComponent();
        eqtr.productTable();
        // eqtr.iframePopup();
        eqtr.responsiveTables();
        eqtr.articleSummary();
        eqtr.blogCategoryComponent();
        eqtr.styleEktronFormButtons();
       // eqtr.pollWidgetHeader();

        //eqtr.staticShareButtons();
        eqtr.printStyles();
        eqtr.addThis();
        eqtr.pageSectionNav();

        // Handling Create & Update events for each updatepanel
        var setupUpdatePanels = function (sender, args) {

            var panelsCreated = args.get_panelsCreated(),
                panelsUpdated = args.get_panelsUpdated(),
                panelId,
                status,
                i;

            // callbacks for each update panel. on create and update
            var updatePanelSetup = {
                UpdatePanelAddressDetail: function (state) {
                    if (state == "update") {
                        eqtr.FORMS.formValidation();
                        eqtr.FORMS.updateProgressIndicator(eqtr.FORMS.updateForm());
                       // eqtr.FORMS.tooltipTrigger();
                        eqtr.FORMS.findAddress();
                        eqtr.numberedList();
                    }
                    //if (state == "create")
                    //    console.log('up create');
                },
                UpdatePanelHowDidYouFindUs: function (state) {
                    if (state == "update") {
                        eqtr.FORMS.formValidation();
                        eqtr.FORMS.updateProgressIndicator(eqtr.FORMS.updateForm());
                        //eqtr.FORMS.tooltipTrigger();
                        eqtr.FORMS.findAddress();
                        eqtr.numberedList();
                        // any other funtions which need retriggered after updatepanel change
                    }
                    //if (state == "create")
                    //    console.log('up create');
                },
                UpdatePanelPackRequest: function (state) {
                    if (state == "update") {
                        eqtr.FORMS.formValidation();
                        eqtr.FORMS.updateProgressIndicator(eqtr.FORMS.updateForm());
                        eqtr.FORMS.tooltipTrigger();
                        eqtr.FORMS.findAddress();
                        eqtr.FORMS.onPageAlert();
                        eqtr.FORMS.conditionalFields();

                        // any other funtions which need retriggered after updatepanel change
                    }
                    //if (state == "create")
                    //    console.log('up create');
                },
                ctl00_uiContentPlaceHolder_uiDropProductList_uxColumnDisplay_ctl05_uxControlColumn_ctl01_uxWidgetHost_uxUpdatePanel: function (state) {
                    if (state == "create") {
                        eqtr.placeholderAttr();
                        eqtr.equalHeights();
                        eqtr.productPromoComponents();
                        eqtr.pageIntro();
                        eqtr.numberedList();
                        
                        sld.livePersonHandlers();

                        // any other funtions which need retriggered after updatepanel change
                    }
                    //if (state == "create")
                    //    console.log('up create');
                }
                
            };

            // for each update panel created
            for (i = 0; i < panelsCreated.length; i++) {
                panelId = panelsCreated[i].id,
                status = "create";

                if (updatePanelSetup[panelId])
                    updatePanelSetup[panelId](status);

            }

            // for each update panel updated
            for (i = 0; i < panelsUpdated.length; i++) {
                panelId = panelsUpdated[i].id,
                status = "update";

                if (updatePanelSetup[panelId])
                    updatePanelSetup[panelId](status);
            }
        };

        // UPDATE PANELS - Check to see what panels are created/updated
        if (typeof (Sys) !== 'undefined')
            Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(setupUpdatePanels);

    });

    return module;
})(window.APP || {}, window.jQuery);