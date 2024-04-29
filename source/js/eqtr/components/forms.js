
window.APP = (function (module, $) {
    "use strict";

    var helper = APP.HELPER; // shortcut to APP.HELPER
    var device = helper.device; // shortcut to feature detection

    var validationSettings = APP.SLD.VALIDATION.SETTINGS; // Check for Form Validation settings


    module.EQTR.FORMS = (function (module, $) {
        var mod = {}; // mod is a submodule of EQTR.FORMS

        var form = $('#aspnetForm'),
            fieldsArray,
            requiredFieldsArray = [];

        // prepend 0 if DOB field has one digit on focusout
        $('.date-select-multiple[maxlength="2"]').on('focusout', function () {
            if (!isNaN(this.value) && this.value.length == 1) {
                this.value = '0' + this.value;
            };
        });

        // eg DOB & sortcode
        mod.populateGroupedFields = function () {
            // Prepopulate the hidden field 
            var dob = function () {

                var settings = validationSettings.groupedValidationElements.dob;

                if (!settings) {
                    return;
                }

                var hiddenInput = $(settings.hiddenInputID),
                    fieldRow = hiddenInput.closest('.field-row'),
                    selector = $(settings.selector, fieldRow),
                    separator = settings.separator,
                    initialValue = [],
                    requiredCharacterLength = 10;

                selector.each(function () {
                    initialValue.push(this.value);
                });

                initialValue = initialValue.join(separator);

                if (initialValue.length == requiredCharacterLength) {
                    hiddenInput.val(initialValue);
                }
            }
            dob();

            var sortCode = function () {

                var settings = validationSettings.groupedValidationElements.sortcode;

                if (!settings) {
                    return;
                }

                var hiddenInput = $(settings.hiddenInputID),
                    expectedFormat = new RegExp(settings.format),
                    fieldRow = hiddenInput.closest('.field-row'),
                    selector = $(settings.selector, fieldRow),
                    separator = settings.separator,
                    initialValue = [];

                // Prepopulate the hidden field 
                selector.each(function () {
                    initialValue.push(this.value);
                });

                initialValue = initialValue.join(separator);
                hiddenInput.val(initialValue);
            }
            sortCode();
        }

        var setRequiredFields = function (callback) {

            mod.populateGroupedFields();

            requiredFieldsArray = [];
            $('.custom-input-group input').addClass('custom-input');
            $('.select-policy-options .field-control-group input').attr({ 'data-hidecompletemsg': true });

            $('.validation-authorisationcheck input').addClass('validation-authorisationcheck');

            var requiredCustomInputs = $('.required-custom-input');

            if (requiredCustomInputs.length == 0) {
                requiredFields();
            }
            else {
                // set the required attr for webform generated checkboxes and radiobuttons
                for (var i = 0; i < requiredCustomInputs.length; i++) {
                    $(requiredCustomInputs[i]).find('input:first').attr({ 'required': true, 'aria-required': true });

                    if (i == requiredCustomInputs.length - 1) {
                        requiredFields();
                    }
                }
            }

            function requiredFields() {
                var mainForm = $('.generic-form');

                $('[required]', mainForm).each(function (index) {
                    var id = "_requiredfield_" + index,
                        row = $(this).closest('.field-row').prop("id", id).data("index", index),
                        thisVal = this.value,
                        isValid = false,
                        isHidden = row.is(":hidden"),
                        container = $(this).parents('.field-entry'),
                        hideCompleteMsg = $(this).data('hidecompletemsg') ? $(this).data('hidecompletemsg') : false;

                    // check if field has value
                    if (!isHidden) {

                        if (this.type == 'radio' || this.type == 'checkbox') {
                            if ($(this).prop("checked")) {
                                row.addClass('field-row-complete');
                                isValid = true;
                            }
                        }
                        else {
                            if (thisVal != '') {
                                row.addClass('field-row-complete');
                                isValid = true;
                            }
                        }
                    }

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

                    requiredFieldsArray.push({
                        id: id,
                        valid: isValid,
                        hidden: isHidden
                    });
                });

            };

        }

        mod.updateProgressIndicator = function (callback, fieldIndex, isValid) {

            // Exit here if IE7 or less
            if (device.isIE('lt-ie8'))
                return;

            var formOffsetTop,
                progressBar = $('.validation-progress-bar'),
                lastValid = -1;

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

                // Add a class if the validation track is in progress
                $('.validation-progress-track', form).addClass("in-progress");

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

                // optional callback
                if (callback) {
                    callback();
                }

            }, 0);

        }

        /** -- [ Returns an Array of all required fields on the page ]--- */
        mod.getRequiredFields = function () {
            return requiredFieldsArray;
        }

        // Client side form validation
        mod.formValidation = function () {

            if ($('.generic-form').length == 0 && !validationSettings) {
                return;
            }

            setRequiredFields();

            // Exit here if IE7 or less
            if (device.isIE('lt-ie8'))
                return;

            // On change for field row height - update size of progress indicator
            $(window).on('fieldHeightChange', function () {
                mod.updateProgressIndicator();
            });
            $(window).on('onFieldBlur', function () {
                mod.updateProgressIndicator();
            });

            // Reset height of progress indicator on window resize
            $(window).smartresize(function () {
                mod.updateProgressIndicator();
            });

            //[ jQuery.validate configuration ]---------------
            form.validate({
                ignore: '.show-hide-row-hidden [required],.popup-content [required]',
                errorPlacement: function (error, element) {

                    var labelGroup

                    if ($(element).attr('type') == 'hidden' || $(element).attr('type') == 'checkbox' || $(element).attr('type') == 'radio') {
                        labelGroup = element.closest('.field-control-group').append('<div class="tooltip tooltip-error"><span class="tooltip-msg"></span></div>');
                        element.closest('.field-control-group').find('.tooltip-error .tooltip-msg').append(error);
                    }
                    else {
                        labelGroup = element.closest('.field-row').find('.field-entry').append('<div class="tooltip tooltip-error"><span class="tooltip-msg"></span></div>');
                        element.closest('.field-row').find('.tooltip-error .tooltip-msg').append(error);
                        if (typeof incrementErrorCount === 'function') {
                            incrementErrorCount();
                        }
                    }
                },
                highlight: function (element, errorClass, validClass) {

                    if (!$(element).hasClass('group-field')) {
                        var fieldRow = $(element).closest('.field-row');
                        fieldRow.removeClass('field-row-complete').addClass('field-row-error');
                    }

                    if ($(element).attr('required')) {
                        mod.updateProgressIndicator(null, fieldRow.data('index'), false);
                    }
                },
                unhighlight: function (element, errorClass, validClass) {

                    if (!$(element).hasClass('group-field')) {
                        var fieldRow = $(element).closest('.field-row');
                        fieldRow.addClass('field-row-complete').removeClass('field-row-error');
                    }

                    if ($(element).attr('required')) {
                        mod.updateProgressIndicator(null, fieldRow.data('index'), true);
                    }
                },
                rules: validationSettings.validateRules
            });

            //[ Radio/Checkbox Validation ]---------------
            $('.required-custom-input .custom-input:radio', form).on("change focusout", function () {
                $(this).valid();
            });

            //[ Select Validation ]---------------
            $('input[required],select[required]', form).on("change", function () {
                $(this).valid();
            });

            $('.validation-authorisationcheck input').change(function () {
                $(this).valid();

                if (!$(this).valid()) {
                    $('.account-holder-link').click();
                }

            });

            //[ Grouped Validation ]---------------

            // Date of Birth
            // Values for each field is set to a hidden input which is then validated.
            var dobValidation = function () {
                var settings = validationSettings.groupedValidationElements.dob;

                if (!settings) {
                    return;
                }

                var hiddenInput = $(settings.hiddenInputID),
                    expectedFormat = new RegExp(settings.format),
                    fieldRow = hiddenInput.closest('.field-row'),
                    selector = $(settings.selector, fieldRow),
                    separator = settings.separator,
                    valueEntered = false,
                    requiredCharacterLength = 10;

                var updateHiddenField = function (currentElement) {
                    var outputValue = [];

                    selector.val(function (index, value) {
                        outputValue.push(value);
                        return value;
                    });

                    outputValue = outputValue.join(separator);

                    /* Trigger validation once expected character length has been met */
                    if (expectedFormat.test(outputValue) || currentElement.hasClass('date-select-year')) {
                        form.validate().element(hiddenInput.val(outputValue));
                        valueEntered = true;
                    }
                    else if (outputValue == separator + separator) {
                        form.validate().element(hiddenInput.val(''));
                        valueEntered = false;
                    }
                    else if (valueEntered || outputValue.length >= requiredCharacterLength) {
                        form.validate().element(hiddenInput.val(outputValue));
                    }

                };

                selector.on('change focusout', function () {
                    updateHiddenField($(this));
                });

            }
            dobValidation();


            // Sort code
            // Values for each field is set to a hidden input which is then validated.
            var sortCodeValidation = function () {
                var settings = validationSettings.groupedValidationElements.sortcode;

                if (!settings) {
                    return;
                }

                var hiddenInput = $(settings.hiddenInputID),
                    expectedFormat = new RegExp(settings.format),
                    fieldRow = hiddenInput.closest('.field-row'),
                    selector = $(settings.selector, fieldRow),
                    separator = settings.separator,
                    valueEntered = false;

                var updateHiddenField = function (currentElement) {
                    var outputValue = [],
                        requiredCharacterLength = 6;

                    selector.val(function (index, value) {
                        outputValue.push(value);
                        return value;
                    });

                    outputValue = outputValue.join(separator);

                    if (expectedFormat.test(outputValue)) {
                        form.validate().element(hiddenInput.val(outputValue));
                        valueEntered = true;
                    }
                    else if (valueEntered || outputValue.length >= requiredCharacterLength) {
                        form.validate().element(hiddenInput.val(outputValue));
                    }

                };

                selector.on('change focusout', function () {
                    updateHiddenField($(this));
                });

                selector.on('focusout', function () {
                    updateHiddenField($(this));
                });

            }
            sortCodeValidation();

        };

        // Run on updatepanel update.
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

        mod.conditionalFields = function () {

            //[ Conditional field rows ]---------------
            // Show extra fields dependent on user selection
            // show extra fields dependent on user selection
            var conditionalFieldGroup = $('.dynamic-field-group')

            if (conditionalFieldGroup.length == 0) {
                return;
            }

            var conditionalFieldToggle = {
                show: function (showHidePanel, conditionalFieldRow) {
                    showHidePanel.slideDown(function () {

                        if (conditionalFieldRow.length) {
                            conditionalFieldRow.each(function () {
                                requiredFieldsArray[$(this).data('index')].hidden = false;
                            });
                        }

                        $(this).removeClass('show-hide-row-hidden').addClass('show-hide-row-active').removeAttr('style');

                        form.trigger('fieldHeightChange');

                    });
                },
                hide: function (showHidePanel, conditionalFieldRow) {
                    showHidePanel.slideUp(function () {

                        if (conditionalFieldRow.length) {
                            conditionalFieldRow.each(function () {
                                requiredFieldsArray[$(this).data('index')].hidden = true;
                            });
                        }
                        $(this).removeClass('show-hide-row-active').addClass('show-hide-row-hidden').removeAttr('style');

                        form.trigger('fieldHeightChange');

                    });
                }
            }

            $('.show-hide-row-control input:checkbox').each(function () {
                var showHidePanel = $(this).closest('.dynamic-field-group').find('.show-hide-row'),
                        conditionalField = $('[required]', showHidePanel),
                        conditionalFieldRow = conditionalField.closest('.field-row');

                // Show conditional fiels if checkbox is selected on pageload
                if ($(this).prop('checked')) {
                    conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);
                }

                $(this).on('click', function () {
                    if ($(this).prop('checked')) {
                        conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);
                    }
                    else {
                        conditionalFieldToggle.hide(showHidePanel, conditionalFieldRow);
                    }
                });

            });

            $('.field-row-title select').each(function () {
                var showHidePanel = $(this).closest('.dynamic-field-group').find('.show-hide-row'),
                    conditionalField = $('[required]', showHidePanel),
                    conditionalFieldRow = conditionalField.closest('.field-row'),
                    selectedTextVal = $('option:selected', this).text();

                // This is the select value which triggers the conditional fields for Other Title, Gender Select.
                var conditionalVal = 'Other';

                // If 'Other' is preselected on pageload
                if (selectedTextVal == conditionalVal)
                    conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);


                // On select change, show conditional fields if the 'Other' option is selected.
                $(this).on('change', function () {
                    selectedTextVal = $('option:selected', this).text();

                    if (selectedTextVal == conditionalVal) {
                        conditionalFieldToggle.show(showHidePanel, conditionalFieldRow);
                    }
                    else {
                        conditionalFieldToggle.hide(showHidePanel, conditionalFieldRow);
                    }
                });

            });
        }

        // Styled input slider used on quote process
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

        // Add CSS class to a custom input
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
                $(this).data('defaulttext', $("label[for='" + this.id + "']").text());
            });

            // On change of the product feature checkbox, toggle the CSS class and text of the corresponding label. Selected text is stored as a data-attr.
            $('.product-feature-select :checkbox').on('change', function () {
                var defaultText = $(this).data('defaulttext');

                if (!defaultText)
                    return;

                var label = $("label[for='" + this.id + "']"),
                selectedText = $(this).closest('.field-control').data('selectedtext');


                if ($(this).prop('checked')) {
                    label.addClass('label-selected').text(selectedText);
                }
                else {
                    label.removeClass('label-selected').text(defaultText);
                }

            });

        }

        // Add a tooltip trigger for showing tooltips on show/hide
        mod.tooltipTrigger = function () {

            // Add a trigger to each field control group
            $(".tooltip-instruction", form).each(function () {

                var fieldRow = $(this).closest(".field-row");

                $(".field-desc:first", fieldRow).append('<a class="tooltip-trigger" href="#">Helper</a>')

            });

            var formFields = $('.field-entry input,.field-entry select, .field-entry textarea', form);

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

        mod.sectionProgressCount = function () {

            var sectionProgressGroup = $('.section-progress .progress-group'),
                sectionProgressItems = $("li", sectionProgressGroup).size();

            sectionProgressGroup.addClass("item-count-" + sectionProgressItems);

        };

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

        // Update firstpayment date tooltip when the user makes a new selection
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

        // show address fields when user clicks 'enter address manually'
        mod.findAddress = function () {

            var adressFields = $('.address-fields-row');

            // check for dependancies
            if (!APP.EQTR.FORMS.formValidation && adressFields.length == 0) {
                return;
            }

            var lookupFields = $('.find-address-link').closest('.field-row'),
                postcodeField = $('.validation-postcode');

            // Validate postcode field 
            $('.postcode-submit', form).on('click', function (e) {
                if (!$(this).closest('.field-row').hasClass('field-row-complete')) {
                    postcodeField.valid();
                    e.preventDefault();
                }
                else {
                    // postcode valid, do postcode lookup
                }
            });
        }

        // Gift radio button list
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

        mod.ajaxForms = function () {
            var link = $('.form-popup-link');

            if (link.length == 0) {
                return;
            }

            var formLoaded;



            var ajaxform = {
                create: function (data) {
                    console.log('loaded');

                    var content = $('<div/>');
                    content[0].innerHTML = data;

                    var formHTML = content.find('.page-content .row:first').html(),
                        template = '<div class="popup-window popup-window-form" tabindex="-1" role="dialog" aria-labelledby="popup window">\
                                        <a href="#" class="close"><span class="close-btn"></span></a>\
                                        <div class="popup-window-content-holder">' + formHTML + '</div>\
                                    </div><div class="modal form-modal"></div>';

                    $('form').append(template);
                    var thisPopup = $('.popup-window-form');

                    this.show(thisPopup);
                },
                show: function (thisPopup) {
                    $('html').addClass('show-form-popup');
                    $('.form-modal').fadeIn(function () {
                        mod.formValidation();
                    });
                },
                close: function () {
                    $('html').removeClass('show-form-popup');
                    $('.form-modal').fadeOut(function () {
                        mod.formValidation();
                    });
                }
            }

            link.on('click', function (e) {
                e.preventDefault();

                var url = $(this).attr('href');

                if (!formLoaded) {
                    $.ajax({
                        url: url
                    }).done(function (data) {
                        formLoaded = true;
                        ajaxform.create(data);
                    }).fail(function (data) {
                        alert('Error: Cannot load page');
                    });
                }
                else {
                    ajaxform.show();
                }

            });

            $(document).on('click', '.popup-window-form .close', function (e) {
                e.preventDefault();
                ajaxform.close();
            });

        }

        // Input focused - fixes layout issues of fixed position elements on smartphones & tablets
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

        // Show and alert box if the user tries to leave the quote process
        /*mod.onBeforeUnload = function () {

            window.onbeforeunload = function () {
                if (typeof stayOnPageAlert != 'undefined' && stayOnPageAlert) {
                    return "You have not completed your application and, if you exit, any information entered will be lost."
                }
            }

            var validatePage = function () {
                return form.valid();
                //return Page_IsValid; // returns true is page is valid
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

        // Basic validation for the email field
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

        // Store form page urls in session storage. 
        // If page url exists in session then we know to trigger the form validation on pageload.
        mod.sessionStorage = function () {
            if (window.sessionStorage) {
                var selectors = $('.edit-details-cta a, .step-navigation a');

                var pageUrl = location.pathname;
                var storedUrl = sessionStorage.getItem('validatepage');

                selectors.on('click', function (e) {
                    var pageUrl = $(this).attr('href');
                    sessionStorage.setItem('validatepage', pageUrl);
                });

                var validatePage = function () {
                    form.valid();
                    // Page_ClientValidate(); // trigger webform validation of entire form
                }

                // delete sessionStorage data
                var clearSessionStorage = function () {
                    sessionStorage.clear(); // reset sessionStorage
                }

                // If page url matches whats stored in sessionStorage, validate page on pageload
                if (storedUrl == pageUrl) {
                    validatePage();
                    clearSessionStorage();
                }

            }
        }

        // policy options select used on get your quote page
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
                        APP.EQTR.scrollPage($paymentOptions, 0, 1000);
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

        return mod;

    }(module, $));

    return module;

})(window.APP || {}, window.jQuery);