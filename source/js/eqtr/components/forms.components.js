window.APP = (function (module, $) {
    "use strict";

    var helper = APP.HELPER; // shortcut to APP.HELPER
    var device = helper.device; // shortcut to feature detection

    module.EQTR.FORMS = (function (module, $) {
        var mod = {}; // mod is a submodule of EQTR.FORMS

        var form = $('#aspnetForm'),
            fieldsArray,
            requiredFieldsArray = [];

        // On height change or blur of field - update size of progress indicator
        $(window).on('fieldHeightChange onFieldBlur', function () {
            mod.updateProgressIndicator();
        });

        // Reset height of progress indicator on window resize
        $(window).smartresize(function () {
            mod.updateProgressIndicator();
        });

        /** ---[ Set up form elements on pageload ]--- */
        mod.onFormLoad = function () {
           
            var requiredCustomInputs = $('.required-custom-input');

            if (requiredCustomInputs.length == 0) {
                mod.setRequiredFields();
            }
            else {
                /*--[ set the required attr for webform generated checkboxes and radiobuttons ]--*/
                for (var i = 0; i < requiredCustomInputs.length; i++) {
                    $(requiredCustomInputs[i]).find('input:first').attr({ 'required': true, 'aria-required': true });

                    if (i == requiredCustomInputs.length - 1) {
                        mod.setRequiredFields();
                    }
                }
            }

            /*--[ Add additional CSS classes and ATTRs ]--*/
            $('.custom-input-group input').addClass('custom-input');
            $('.validation-authorisationcheck input').addClass('validation-authorisationcheck');

            /*--[ Set data-attr to hide the complete message for Policy Option select on step 2 of Funeral Plans Q&A ]--*/
            $('.select-policy-options .field-control-group input').attr({ 'data-hidecompletemsg': true });

            /*--[ Set show/hide toggles for checbox fields ]--*/
            $('.show-hide-row-control input:checkbox').each(function () {
                var showHidePanel = $(this).closest('.dynamic-field-group').find('.show-hide-row'),
                        conditionalField = $('[required]', showHidePanel),
                        conditionalFieldRow = conditionalField.closest('.field-row');

                // Show conditional fiels if checkbox is selected on pageload
                if ($(this).prop('checked')) {
                    mod.conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);
                }

                $(this).on('click', function () {
                    if ($(this).prop('checked')) {
                        mod.conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);
                    }
                    else {
                        mod.conditionalFieldToggle.hide(showHidePanel, conditionalFieldRow);
                    }
                });

            });

            /*--[ For title select: show conditional title fields if user selects 'Other' ]--*/
            $('.field-row-title select').each(function () {
                var showHidePanel = $(this).closest('.dynamic-field-group').find('.show-hide-row'),
                    conditionalField = $('[required]', showHidePanel),
                    conditionalFieldRow = conditionalField.closest('.field-row'),
                    selectedTextVal = $('option:selected', this).text();

                // This is the select value which triggers the conditional fields for Other Title, Gender Select.
                var conditionalVal = 'Other';

                // If 'Other' is preselected on pageload
                if (selectedTextVal == conditionalVal)
                    mod.conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);


                // On select change, show conditional fields if the 'Other' option is selected.
                $(this).on('change', function () {
                    selectedTextVal = $('option:selected', this).text();

                    if (selectedTextVal == conditionalVal) {
                        mod.conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);
                    }
                    else {
                        mod.conditionalFieldToggle.hide(showHidePanel, conditionalFieldRow);
                    }
                });

            });

            // prepend 0 if DOB field has one digit on focusout
            $('.date-select-multiple[maxlength="2"]').on('focusout', function () {
                if (!isNaN(this.value) && this.value.length == 1) {
                    this.value = '0' + this.value;
                };
            });

        }

        /** ---[ Create a record of all required fields and insert complete msg html for each ]--- */
        mod.setRequiredFields = function () {
            /*  
                For each required field, add to requiredFields 
                Array and insert complete msg HTML 
            */
            var mainForm = $('.generic-form');

            requiredFieldsArray = [];

            $('[required]', mainForm).each(function (index) {
                var id = "_requiredfield_" + index,
                    row = $(this).closest('.field-row').prop("id", id).data("index", index),
                    thisVal = this.value,
                    isValid = false,
                    container = $(this).parents('.field-entry'),
                    hideCompleteMsg = $(this).data('hidecompletemsg') ? $(this).data('hidecompletemsg') : false;

                if (this.type == 'radio' || this.type == 'checkbox' || this.type == 'hidden') {
                    container = $(this).parents('.field-control-group');

                    // Get the error message from the parent span tag
                    var errorMsg = $(this).closest('span').data('msg-required');

                    if (errorMsg !== null) {
                        $(this).data('msg-required', errorMsg);
                    }

                }

                if (!$('.complete-msg', container).length && !hideCompleteMsg) {
                    // insert the complete message
                    var completeTxt = ($(this).data('completetxt')) ? $(this).data('completetxt') : 'Complete',
                        completeMsgHTML = $('<div class="complete-msg">' + completeTxt + '</div>').appendTo(container);
                }
          
                container.addClass('required-field-entry');

                if (row.hasClass('field-row-complete') ) {
                    isValid = true;
                }

                requiredFieldsArray.push({
                    id: id,
                    valid: isValid,
                    hidden: row.is(":hidden")
                });
            });
            
        }

        /** -- [ Returns an Array of all required fields on the page ]--- */
        mod.getRequiredFields = function () {
            return requiredFieldsArray;
        }

        /** -- [ Updates the position of the vertical progress bar ]--- */
        /*
         @callback - optional. callback function whichs fires after update
         @fieldIndex - optional. the data-index of the current focused .field-row
         @isValid - optional boolean. sets if current focused field is valid or invalid
        */
        mod.updateProgressIndicator = function (callback, fieldIndex, isValid) {
            var formOffsetTop,
                progressBar = $('.validation-progress-bar'),
                lastValid = -1;

            // Exit here if IE7 or less
            if (device.isIE('lt-ie8'))
                return;

            if (typeof fieldIndex != 'undefined' && typeof isValid != 'undefined') {
                requiredFieldsArray[fieldIndex].valid = isValid;
            }

            // updateProgressIndicator - 
            // gets the current index of the relevant field and updates fieldsArray.
            // sets the height of the vertical progress line.
            setTimeout(function () {

                for (var i = 0; i < requiredFieldsArray.length; i++) {
                    if (requiredFieldsArray[i].valid == true || requiredFieldsArray[i].hidden == true) {
                        if (requiredFieldsArray[i].hidden == false) {
                            lastValid = i;
                        }
                    }
                    else {
                        break;
                    }
                }

                // first field is not valid 
                if (lastValid == -1) {
                    progressBar.removeAttr('style');
                    $('.validation-progress-track', form).removeClass("in-progress");
                    return;
                }

                // if all visible fields are valid
                if (requiredFieldsArray.length - 1 == lastValid) {

                    progressBar.height('100%');
                    return;
                }

                // Set the height to the last valid field
                var fieldRow = $('#_requiredfield_' + lastValid).find('.required-field-entry'),
                    fieldPos = fieldRow.offset().top + (fieldRow.height() / 2),
                    formOffsetTop = $('.validation-progress-track', form).offset().top,
                    progressBarHeight = fieldPos - formOffsetTop;

                progressBar.height(progressBarHeight);

                // Add a class if the validation track is in progress
                if (progressBarHeight > 0) {
                    $('.validation-progress-track', form).addClass("in-progress");
                }

                // optional callback
                if (callback) {
                    callback();
                }

            }, 0);

        }

        mod.validationUpdate = function(val) {
            var element = '#' + $(val).data('valControltovalidate'),
                isvalid = val.isvalid,
                fieldRow = $(element).closest('.field-row'),
                fieldIndex = fieldRow.data('index'),
                isGroupField = $(element).hasClass('group-field'); // e.g. DOB or sort code fields

            if (isvalid) {
                if (!isGroupField) {
                    fieldRow.addClass('field-row-complete').removeClass('field-row-error');
                }
                if ($(element).attr('required')) {
                    mod.updateProgressIndicator(null, fieldIndex, isvalid);
                }
            }
            else {

                if (!isGroupField) {
                    fieldRow.removeClass('field-row-complete').addClass('field-row-error');
                }
                if ($(element).attr('required')) {
                    mod.updateProgressIndicator(null, fieldIndex, isvalid);
                }
            }
        }

        /** -- [ Error message placement ]--- */
        // Use Page_Validators to get array of all validation messages
        mod.errorMsgPlacement = function () {

            if(typeof Page_Validators === 'undefined') 
                return;

            var errorCollection = Page_Validators;

            for (var i = 0; i < errorCollection.length; ++i) {
                $(errorCollection[i]).wrap('<div class="tooltip tooltip-error"><span class="tooltip-msg"></span></div>');
            }
        }

        /** -- [ Show/Hide Conditional Fields ]--- */
        // Toggle visibility of conditional fields
        mod.conditionalFieldToggle = {

            // Show the conditional fields and update the requiredFieldsArray
            show: function (showHidePanel, fieldRow) {

                if (typeof showHidePanel === "undefined" || typeof fieldRow === "undefined") {
                    return;
                }

                showHidePanel.slideDown(function () {

                    if (fieldRow.length) {
                        fieldRow.each(function () {
                            requiredFieldsArray[$(this).data('index')].hidden = false;
                        });
                    }

                    $(this).removeClass('show-hide-row-hidden').addClass('show-hide-row-active').removeAttr('style');

                    form.trigger('fieldHeightChange');

                });
            },

            // Hide the conditional fields and update the requiredFieldsArray
            hide: function (showHidePanel, fieldRow) {

                if (typeof showHidePanel === "undefined" || typeof fieldRow === "undefined") {
                    return;
                }

                showHidePanel.slideUp(function () {

                    if (fieldRow.length) {
                        fieldRow.each(function () {
                            requiredFieldsArray[$(this).data('index')].hidden = true;
                        });
                    }
                    $(this).removeClass('show-hide-row-active').addClass('show-hide-row-hidden').removeAttr('style');

                    form.trigger('fieldHeightChange');

                });
            }

        };

        /** -- [ Add a tooltip trigger for showing tooltips on show/hide ]--- */
        mod.tooltipTrigger = function () {

            var formFields = $('.field-entry input,.field-entry select, .field-entry textarea', form);

            // Add a trigger to each field control group
            $(".tooltip-instruction", form).each(function () {
                var fieldRow = $(this).closest(".field-row");
                $(".field-desc:first", fieldRow).append('<a class="tooltip-trigger" href="#">Helper</a>')
            });

            // Toggle the class on the tooltips on click
            $(".tooltip-trigger").on("click", function (e) {
                e.preventDefault();
                $(this).closest(".field-row").find(".tooltip-instruction").toggleClass("open-tooltip");

                form.trigger('fieldHeightChange');
            });

            //[ Add CSS class on focus ]---------------
            formFields.on("focus", function () {
                // remove .field-row-focus if there are any
                $('.field-row-focus', form).removeClass('field-row-focus');

                // add .field-row-focus to the current element
                $(this).closest('.field-row').addClass('field-row-focus');

            });
            formFields.on("blur", function () {
                // add .field-row-focus to the current element
                $(this).closest('.field-row').removeClass('field-row-focus');

                form.trigger('onFieldBlur');
            });
        }

        /** -- [ Set the CSS class on the step progress bar. Only ever needs to be triggered on pageload ]--- */
        mod.sectionProgressCount = function () {

            var sectionProgressGroup = $('.section-progress .progress-group'),
                sectionProgressItems = $("li", sectionProgressGroup).size();

            sectionProgressGroup.addClass("item-count-" + sectionProgressItems);

        };

        /** -- [ Input focused - fixes layout issues of fixed position elements on smartphones & tablets ]--- */
        mod.inputFocused = function () {
            if (device.supportsTouch) {

                $(document)
                .on('focus', 'input', function (e) {
                    $("body").addClass('focused');
                })

                .on('blur', 'input', function (e) {
                    $("body").removeClass('focused');
                });
            }
        };

        /** -- [ Show and alert box if the user tries to leave the quote process ]--- */
        /*mod.onBeforeUnload = function () {

            window.onbeforeunload = function () {
                if (typeof stayOnPageAlert != 'undefined' && stayOnPageAlert) {
                    return "You have not completed your application and, if you exit, any information entered will be lost."
                }
            }

            var validatePage = function () {
                //return form.valid();
                return Page_IsValid; // returns true is page is valid
            }

            // do not show alert box on form submit
            $('.generic-form input[type="submit"],.generic-form button').on('click', function () {
                if (validatePage()) {
                    stayOnPageAlert = false;
                }
            });

        }*/
        // Show and alert box if the user tries to leave the quote process
        mod.onBeforeUnload = function () {

            window.onbeforeunload = function () {
                if (typeof stayOnPageAlert != 'undefined' && stayOnPageAlert) {
                    return "Are your sure you want to go? You have not finished your application so if you leave now, you’ll lose any information you’ve entered. If you need help, please contact us on 0800 904 7674."
                }
            }

            //var validatePage = function () {
            //        return form.valid();
            //        //return Page_IsValid; // returns true is page is valid
            //    }

            // do not show alert box on form submit
            $('.generic-form input[type=submit],.generic-form button').on('click', function () {
                //if (validatePage()) {
                stayOnPageAlert = false;
                //}
            });

            $('a').on('click', function () {
                if (typeof stayOnPageAlert != 'undefined') {
                    stayOnPageAlert = true;

                    if ($(this).closest('.generic-form').length) {
                        stayOnPageAlert = false;
                    }
                }
            });
        }

        // Module to be called from update panel updates
        mod.onPageAlert = function () {

            // do not show alert box on form submit
            $('.generic-form input[type=submit], .generic-form a').on('click', function () {
                stayOnPageAlert = false;
            });
        }

        /** -- [ Add CSS class to a custom input ]--- */
        mod.customInputGroup = function () {
            var customInputGroup = $(".custom-input-group");

            if (customInputGroup.length == 0) {
                return;
            }

            var styledInput = function () {
                $("label[for='" + this.id + "']").addClass('checked-' + this.checked + '-blur');
            }

            $('.custom-input-group :radio, .custom-input-group :checkbox').each(styledInput);

            $('.custom-input-group :radio, .custom-input-group :checkbox')
            .click(changeInputCheckStyle)
            .blur(changeInputFocusStyle)
            .focus(changeInputFocusStyle);

            function changeInputCheckStyle() {
                customInputGroup.find("label").each(function () {
                    this.className = this.className.replace(/true|false/, "false");
                });

                var labelDom = $("label[for='" + this.id + "']").get(0);
                labelDom.className = labelDom.className.replace(/true|false/, "true");
            }

            function changeInputFocusStyle(evt) {
                var labelDom = $("label[for='" + this.id + "']").get(0);
                labelDom.className = labelDom.className.replace(/blur|focus/, evt.type);
            }


            // For each product feature checkbox, store the default text of the corresponding label
            $('.product-feature-select :checkbox').each(function () {
                var isChecked = $(this).prop('checked');

                $(this).data('defaulttext', $("label[for='" + this.id + "']").text());

                if (isChecked) {
                    updateQuoteOptionsLabel(this, isChecked);
                }
            });

            // On change of the product feature checkbox, toggle the CSS class and text of the corresponding label. Selected text is stored as a data-attr.
            $('.product-feature-select :checkbox').on('change', function () {
                var isChecked = $(this).prop('checked');

                updateQuoteOptionsLabel(this, isChecked);

            });

            function updateQuoteOptionsLabel(checkbox, isChecked) {
                var label = $("label[for='" + checkbox.id + "']"),
                    defaultText = $(checkbox).data('defaulttext'),
                    selectedText = $(checkbox).closest('.field-control').data('selectedtext');

                if (!defaultText)
                    return;

                if (isChecked) {
                    label.addClass('label-selected').text(selectedText);
                }
                else {
                    label.removeClass('label-selected').text(defaultText);
                }
            }

        }

        /** -- [ Basic validation for the email field ]--- */
        mod.emailQuote = function () {
            var saveQuotePanel = $('.save-quote');

            if (saveQuotePanel.length == 0) {
                return;
            }

            var fieldEmptyError = 'This field is required',
                fieldInvalidError = 'Please enter a valid email address',
                errorMsgHTML = $('<span class="error">{0}</span>');

            // Check if value is valid email format or is not empty. Initially on btn click, on keyup thereafter
            var validateEmailField = function (btn, e) {
                var fieldEntry = btn.closest('.field-entry'),
                    emailField = fieldEntry.find('.text-field'),
                    emailVal = fieldEntry.find('.text-field').val();

                errorMsgHTML.insertBefore(fieldEntry);

                // If email field has no value
                if (!emailVal) {
                    e.preventDefault();
                    errorMsgHTML.text(fieldEmptyError);
                }
                    // If email field value is not valid
                else if (!helper.isEmail(emailVal)) {
                    e.preventDefault();
                    errorMsgHTML.text(fieldInvalidError);
                }
                else {
                    $('.save-quote .error').text('');
                }

                emailField.addClass('validated-field');
            }

            $('form').on('click', '.save-quote .btn', function (event) {
                $(this).closest('.field-entry').find('.error').remove();
                validateEmailField($(this), event)
            });

            $('form').on('keyup', '.validated-field', function (event) {
                var btn = $(this).closest('.field-entry').find('.btn');
                validateEmailField(btn, event)
            });

        }

        /** -- [ Run on updatepanel update. ]--- */
        // Check the requiredFieldsArray for valid required fields and update the markup accordingly
        mod.updateForm = function () {

            if (requiredFieldsArray.length > 0) {
                $.each(requiredFieldsArray, function (index) {

                    // for all the valid required fields stored in the Array. Update field row css class so complete message is shown
                    if (requiredFieldsArray[index].valid) {

                        var fieldRow = $('#_requiredfield_' + index),
                            isFieldGroup = $('.group-field', fieldRow).length;

                        if (isFieldGroup.length == 0) {
                            return;
                        }

                        fieldRow.addClass('field-row-complete');

                    }

                });
            }
        }

        /*** --- Q & A GOF --------------------*/

        /** -- [ Styled input slider used on quote process ]--- */
        mod.inputSlider = function () {

            // check for dependancies
            if (!$.ui) {
                return;
            }

            var sliderInput = $('.slider-input');

            if (sliderInput.length == 0) {
                return;
            }

            // Cashsum text taken from data-attrs on slider input
            var cashSumText = sliderInput.data('cashsumtext'),
                cashSumQualifier = sliderInput.data('cashsumqualifier');

            // HTML markup for slider control 
            var template = '<div class="slider-holder">\
                                <div class="slider-btns">\
                                    <a href="#" class="slider-btn decrease-btn"><span>decrease</span></a>\
                                    <a href="#" class="slider-btn increase-btn"><span>increase</span></a>\
                                </div>\
                                <div class="slider-element-container">\
                                    <div class="slider-element"></div>\
                                </div>\
                                <p class="lump-sum-payment">{cash-sum-text} <span>&pound;<span class="number">00.00</span></span></p>\
                                <p class="qualifier">{cash-sum-qualifier}</p>\
                            </div>';

            var sliderHTML = template.replace('{cash-sum-text}', cashSumText)
                                     .replace('{cash-sum-qualifier}', cashSumQualifier);

            $(sliderHTML).insertAfter(sliderInput);

            // start values
            var sliderElement = $('.slider-element'),
                rates = sliderInput.data('rates'),
                maxValSlider = (sliderInput.data('maxvalue')) ? sliderInput.data('maxvalue') : 75, // max val of slider, defaults to 75 is none specified
                minValSlider = (sliderInput.data('minlumpsum')) ? sliderInput.data('minvalue') : 5, // min val of slider, defaults to 5 is none specified
                startValSlider = sliderInput.val(); //  start value of slider is taken from input.slider-input

            var sliderComponent = {
                setup: function () {

                    // create slider 
                    sliderElement.slider({
                        range: 'min',
                        value: startValSlider,
                        min: minValSlider,
                        max: maxValSlider,
                        create: function (e, ui) {
                            $('.ui-slider-handle', sliderElement).append('<span class="handle"><span class="indicator" tabindex="-1"></span><span class="value-holder" tabindex="-1"><p tabindex="-1">&pound;<span class="value" tabindex="-1">Slider Value</span></p></span></span>');
                        },
                        slide: function (e, ui) {
                            sliderComponent.updateTotalPrice(ui.value);
                        }
                    });

                    this.gauge(minValSlider, maxValSlider);

                    // set value of lumpsum
                    this.updateTotalPrice(startValSlider);

                    // bind events
                    this.events();
                },
                gauge: function (minValSlider, maxValSlider) {
                    var halfVal = Math.floor((maxValSlider - minValSlider) / 2 + minValSlider),
                        quarterVal = Math.floor((halfVal - minValSlider) / 2 + minValSlider),
                        threeQuarterVal = Math.floor(maxValSlider - ((maxValSlider - minValSlider) / 4));

                    var template = '<div class="slider-gauge">\
                                        <ul><li class="min-val"><span>{min-val}</span></li><li class="quarter-val"><span>{quarter-val}</span></li><li><span>{half-val}</span></li><li class="threequarter-val"><span>{threequarter-val}</span></li><li class="max-val"><span>{max-val}</span></li></ul>\
                                    </div>';
                    var gaugeHTML = template.replace('{min-val}', minValSlider)
                                            .replace('{quarter-val}', quarterVal)
                                            .replace('{half-val}', halfVal)
                                            .replace('{threequarter-val}', threeQuarterVal)
                                            .replace('{max-val}', maxValSlider);

                    $(gaugeHTML).insertAfter('.slider-element-container');
                },
                events: function () {
                    var increment = 1; // how much to increase/decrease by

                    // incremental buttons
                    $('.slider-holder').on('click', '.slider-btn', function (e) {
                        e.preventDefault();
                        var sliderCurrentVal = parseInt(sliderElement.slider('option', 'value')),
                            sliderNewVal;

                        // if increase-btn
                        if ($(this).hasClass('increase-btn')) {
                            if ((sliderCurrentVal + increment) > maxValSlider) {
                                sliderNewVal = maxValSlider;
                            }
                            else {
                                sliderNewVal = sliderCurrentVal + increment;
                            }
                        }
                            // if decrease-btn
                        else {
                            if ((sliderCurrentVal - increment) < minValSlider) {
                                sliderNewVal = minValSlider;
                            }
                            else {
                                sliderNewVal = sliderCurrentVal - increment;
                            }
                        }

                        sliderElement.slider({ value: sliderNewVal })
                        sliderComponent.updateTotalPrice(sliderNewVal);
                    });
                },
                updateTotalPrice: function (sliderVal) {

                    var cashSum = rates[sliderVal].toFixed(0);

                    if (isNaN(cashSum) || isNaN(sliderVal))
                        return;

                    // update the cashsum value
                    $('.lump-sum-payment .number').text(cashSum);

                    // update slider input field
                    sliderInput.val(sliderVal);

                    // update slider handle 
                    $('.handle .value', sliderElement).text(sliderVal);

                    if ($('.quotesummary').length) {
                        $('.quotesummary .cash-sum-amount').text(cashSum);
                        $('.quotesummary .monthly-payment-amount').text(sliderVal);
                    }
                }
            }
            sliderComponent.setup();

        }

        /** -- [ Quote Summary component ]--- */
        mod.quoteSummary = function () {
            var quoteSummary = $('.quotesummary-main');

            if (quoteSummary.length == 0)
                return;

            // vAlign quote summary numbered list on pageload and on resize
            var alignContent = function () { $('.quotesummary-item-content', quoteSummary).valign({ style: 'marginTop' }) };
            alignContent();

            var infoTextABI = $('.form-closing-text .abi');
            var infoTextTPC = $('.form-closing-text .tpc');
            if (quoteSummary.length && $('.product-feature-select').length) {

                var premiumCap = $('.product-feature-premiumcap'),
                    freeFuneral = $('.product-feature-freefuneral');

                var additionalCost = $('.feature-cost', premiumCap).text(),
                    monthlyCost = $('.monthly-payment-amount', quoteSummary),
                    initialMonthlyCost = monthlyCost.text();

                var total = parseFloat(additionalCost) + parseFloat(initialMonthlyCost);

                // Add decimal places if needed
                if (total % 1 > 0)
                    total = total.toFixed(2);

                if (premiumCap.length === 0) {
                    infoTextTPC.hide();
                    infoTextABI.show();
                }

                $('input', premiumCap).each(function () {
                    if ($(this).prop('checked')) {
                        monthlyCost.text(total);
                        quoteSummary.addClass('premium-cap-selected');
                        infoTextABI.hide();
                        infoTextTPC.show();
                        alignContent();
                    }
                    else {
                        infoTextTPC.hide();
                        infoTextABI.show();
                    }
                });

                premiumCap.on('click', 'input', function () {
                    if ($(this).prop('checked')) {
                        monthlyCost.text(total);
                        quoteSummary.addClass('premium-cap-selected');
                        infoTextABI.hide();
                        infoTextTPC.show();
                        alignContent();
                    }
                    else {
                        monthlyCost.text(initialMonthlyCost);
                        quoteSummary.removeClass('premium-cap-selected');
                        infoTextTPC.hide();
                        infoTextABI.show();
                        alignContent();
                    }
                });

                $('input', freeFuneral).each(function () {
                    if ($(this).prop('checked')) {
                        quoteSummary.addClass('free-funeral-selected');
                        alignContent();
                    }
                });

                freeFuneral.on('click', 'input', function () {

                    if ($(this).prop('checked')) {
                        quoteSummary.addClass('free-funeral-selected');
                        alignContent();
                    }
                    else {
                        quoteSummary.removeClass('free-funeral-selected');
                        alignContent();
                    }
                });
            }



            $(window).smartresize(function () { alignContent(); });
        }

        /** -- [ Update firstpayment date tooltip when the user makes a new selection ]--- */
        mod.firstPaymentDate = function () {
            var firstPaymentDateRow = $('.first-payment-date-control'),
                infoToolTip = $('.tooltip-information', firstPaymentDateRow);

            if (infoToolTip.length == 0)
                return;

            $('select', firstPaymentDateRow).on('change', function () {
                var selectVal = $(this).val();

                selectVal = Number.getOrdinalFor(selectVal * 1, true);

                $('.payment-date', infoToolTip).text(selectVal);
            });

        }

        /** -- [ Gift radio button list ]--- */
        mod.selectionBlock = function () {

            var selectInput = function (elem) {

                var currentInput = $('input', elem);

                // Uncheck the other selected radio button
                if ($('.field-control-gift-decline input').prop('checked')) {
                    $('.field-control-gift-decline input').prop('checked', false);
                }

                if (!$(elem).hasClass('active')) {

                    // Unselect the other selected item
                    $(".selection-block-item.active").removeClass("active");

                    $(elem).addClass('active');
                    currentInput.prop('checked', true);
                }
            };

            // Add an additional click for touch devices
            // Touch devices
            if (helper.device.supportsTouch) {

                $('.selection-block-item').on('click', function (e) {
                    e.preventDefault();

                    if (!$(this).hasClass('active-touch')) {
                        $(".selection-block-item.active-touch").removeClass("active-touch");
                        $(this).addClass('active-touch');
                    }
                    else {
                        $(this).removeClass('active-touch');
                        selectInput(this);
                    }

                });

            }
                // Non touch devices
            else {

                $('.selection-block-item').on("click", function (e) {
                    e.preventDefault();

                    selectInput($(this));

                });
            }

            //vAlign the summary

            var alignSummary = function () {
                $('.selection-block').imagesLoaded(function () {
                    $('.gift-summary').valign()
                });
            }; alignSummary();

            $(window).smartresize(function () {
                alignSummary();
            });

            // if the user selects the gift decline checkbox,  unselect the gift select radio button list
            $('.field-control-gift-decline input').on('change', function () {
                if ($(this).prop('checked')) {
                    var selectedRadioBtn = $('.selection-block-item.active');
                    selectedRadioBtn.removeClass('active');
                    $('input', selectedRadioBtn).prop('checked', false);
                }
            });
        }

        /*** --- Q & A GOF END --------------------*/


        /*** --- Q & A FUNERAL PLANS --------------------*/

        /** -- [ policy options select used on get your quote page ]--- */
        mod.selectPolicyOptions = function () {
            var $selectPlan = $('.product-select-list');

            if ($selectPlan.length == 0) {
                return;
            }

            var $paymentOptions = $('.policy-payment-options-container'),
                $paymentOptionPanel = $('.policy-payment-option'),
                paymentOptionsVisible = false,
                linkHtml,
                itemSubTitle = '<p class="policy-payment-option-sub-title"></p>',
                lumpSumInfoPanel = $('.paymenttype-lumpsum', $paymentOptions),
                lifeInsuranceInfoPanel = $('.paymenttype-lifeinsurance', $paymentOptions);

            if (document.getElementById("policyPaymentLinks") != null) {
                linkHtml = document.getElementById('policyPaymentLinks').innerHTML;
            }

            // add some additional markup for each payment option panel
            $paymentOptionPanel.each(function () {
                if (linkHtml) {
                    var popupID = '#' + $(this).data('popupid'),
                        updateLinkHtml = linkHtml.replace('{popupid}', popupID)

                    $('.policy-payment-options-summary', this).after(updateLinkHtml);
                }
            });

            $('.step-navigation a', $paymentOptionPanel).popwindow();


            var changePaymentOptionPanelView = {
                forward: function ($selectedPanel) {
                    var panelContainerHeight = $paymentOptions.outerHeight();

                    $selectedPanel.addClass('show-panel-description');
                    $paymentOptions.addClass('panelview-changed');

                    $('.radiobutton input', $selectedPanel).prop('checked', true).trigger('change');

                },
                back: function () {
                    $('.show-panel-description .radiobutton input').prop('checked', false).trigger('change');
                    $('.show-panel-description', $paymentOptions).removeClass('show-panel-description');
                    $paymentOptions.removeClass('panelview-changed').removeAttr('style');
                }
            }

            var bindEvents = function () {

                var firstClick = true;

                // on change, add a selected class if checked
                $('input', $selectPlan).on('change', function (e) {
                    var $container = $(this).closest('.products-list-item'),
                        lumpsumSubTitle = $container.data('lumpsumtxt'),
                        lifeInsuranceSubTitle = $container.data('lifeinsurancetxt');

                    $('.selected-item', $selectPlan).removeClass('selected-item');

                    if ($(this).prop('checked')) {
                        $container.addClass('selected-item');
                    }
                    if (!paymentOptionsVisible) {
                        $paymentOptions.slideToggle(function () {
                            $(this).addClass('show-summaries').removeAttr('style');
                            $('.select-policy-options .additional-content-panel').addClass('show');
                        });
                        paymentOptionsVisible = true;
                    }

                    if ($('.policy-payment-option-sub-title', $paymentOptions).length == 0) {
                        $('.policy-payment-options-summary', lifeInsuranceInfoPanel).append($(itemSubTitle).html(lifeInsuranceSubTitle));
                        $('.policy-payment-options-summary', lumpSumInfoPanel).append($(itemSubTitle).html(lumpsumSubTitle));
                    }
                    else {
                        var subTitle = $('.policy-payment-option-sub-title');

                        $('.policy-payment-option-sub-title', lifeInsuranceInfoPanel).html(lifeInsuranceSubTitle);
                        $('.policy-payment-option-sub-title', lumpSumInfoPanel).html(lumpsumSubTitle);

                        subTitle.addClass('fadeInText');

                        subTitle.bind('animationend webkitAnimationEnd', function (e) {
                            subTitle.removeClass('fadeInText');
                        });
                    }

                    var requiredFieldId = $selectPlan.attr('id'),
                        requiredFieldIndx = parseFloat(requiredFieldId.replace(/^\D+/g, '')) + parseFloat(1);

                    requiredFieldsArray[requiredFieldIndx].hidden = false;

                    if (firstClick) {
                        APP.EQTR.scrollPage($paymentOptions, 180, 1000);
                        firstClick = false;
                    }
                });

                $('.item-links .btn a', $paymentOptionPanel).on('click', function (e) {
                    e.preventDefault();

                    var panel = $(this).closest('.policy-payment-option');
                    changePaymentOptionPanelView.forward(panel);
                });

                $('.generic-form-navigation .step-navigation a', $paymentOptions).on('click', function (e) {
                    e.preventDefault();
                    changePaymentOptionPanelView.back();
                });

                $('input', $selectPlan).each(function () {
                    if ($(this).prop('checked')) {
                        $(this).trigger('change');
                    }
                });

                $('.radiobutton input', $paymentOptionPanel).each(function () {


                    if ($(this).prop('checked')) {
                        var thisPanel = $(this).closest('.policy-payment-option');

                        thisPanel.find('.item-links .btn a').click();
                    }
                });
            }
            bindEvents();

        }

        /*** --- Q & A FUNERAL PLANS END --------------------*/

        return mod;

    }(module, $));

    return module;

})(window.APP || {}, window.jQuery);