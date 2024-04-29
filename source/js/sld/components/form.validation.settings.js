window.APP = (function (module, $) {
    "use strict";

    module.SLD.VALIDATION = {};

    module.SLD.VALIDATION.SETTINGS = (function (module, $) {

        var mod = {}; // mod is a submodule of SLD.FORMS.VALIDATION.SETTINGS

        

        //[ Validation rules using CSS class ]---------------
        // Usage: 
        // Validation rules can be set for each required field or group of fields. 
        // Object name should match the CSS classname of the relevant field(s) e.g. <select class="validation-dob"> is represented by dob:{}
        // Rules are specified as name/value pairs within each Object
        // Note: we are validating against classnames as the name & ID is generated server-side
        jQuery.validator.addClassRules({
            'validation-email':{
                required: false,
                email: true
            },


            'validation-name': {
                digits: false,
                validname: true
            },

            'validation-dob': {
                validdate: true
            },

            'validation-accountnum': {
                digits: true,
                minlength: 8,
                maxlength: 8
            },
            'validation-sortcode': {
                digits: true,
                minlength: 6,
                maxlength: 6
            },
            'validation-postcode': {
                postcodeUK: true,
                postcodeInvalidNonUK: true
            },
            'validation-addressline1': {
                validateAddressLine1: true,
                maxlength: 35
            },
            'validation-addressline2': {
                validateAddressLine2: true,
                maxlength: 35
            },
            'validation-addressline3': {
                validateAddressLine3: true,
                maxlength: 27
            },
            'validation-telephone': {
                phoneUK: true
            },
            'validation-authorisationcheck': {
                authorisationCheck: true, // NOTE: authorisationCheck is a custom method. Logic & properties for custom methods can be changed further down this file.
                required: true
            },
            'validation-select': {
                validateselect: true
            },
            'validation-bankAccountHolderName': {
                validatebankAccountHolderName: true,
                maxlength: 18
            }
        });


        //[ Validation error messages ]---------------
        // Usage: 
        // Validation messages can be set for each required field or group of fields. 
        // Object name should match the name attr of the relevant field(s) e.g. <input name="accountNumField"> is represented by accountNumField:{}
        // Rules are specified as name/value pairs within each Object
        mod.validateMessages = {
            accountNumField: {
                min: 'Oops you need to enter 8 digits',
                max: 'Oops you need to enter 8 digits',
                digits: 'Account number must be a 8 digit number'
            },
            sortcode: {
                digits: 'Oops you need to enter 6 digits',
                min: 'Oops you need to enter 6 digits',
                max: 'Oops you need to enter 6 digits',
            },
            email: 'Oops. That doesn’t look right. Can you try again?'
        }

        //[ jQuery Validate Custom Method properties ]---------------
        // These are properties of custom validation methods
        mod.custom = {
            validname: {
                message:
                    {
                        foreName: 'Forename(s) contains invalid character(s). Please re-enter',
                        surName: 'Surname contains invalid character(s). Please re-enter',
                        defaultMessage: 'Default error'
                    }
            },

            adultage: {
                message: 'Min age of 50. Cannot be under age', // Default error message
                agelimit: 50 // changing this value will change the min age limit for adultage custom method.
            },
            validdate: {
                message: 'Oops. That doesn’t look right. Can you try again?' // Default error message
            },
            authorisationCheck: {
                message: 'Sorry, we can’t continue as you are not authorised to set up Direct Debits. Please call us to continue your application' // Default error message
            },
            postcodeUK: {
                message: 'Oops. That doesn’t look right. Can you try again?'
            },
            postcodeInvalidNonUK: {
                message: 'Sorry, we can’t continue as you don’t live in the UK'
            },
            validateAddressLine: {
                message: 'Oops. That doesn’t look right. Can you try again?'
            },
            phoneUK: {
                message: 'Oops. That doesn’t look right. Your phone number should have 11 numbers and start with a zero'
            },
            validateselect: {
                message: 'This field is required'
            },
            validatebankAccountHolderName: {
                message: 'Oops. That doesn’t look right. Can you try again?'
            }
        }

        //[ jQuery Validate Custom Methods ]---------------

        mod.customMethods = (function () {
            

            $.validator.addMethod("validname", function (value, element) {

                // As labels are content managed get label name from element

                $.validator.messages["validname"] = $(element).data("msgValidname");
                
                // This regex is different on server and client as javascript does not support unicode characters
               
                return /^([-a-zA-Z'\s]{0,40})$/.test(value);

            }, "My error message");
            
            // Check format is a valid UK postcode
            $.validator.addMethod("postcodeUK", function (value, element) {
                return this.optional(element) || /^[A-Za-z]{1,2}[0-9A-Za-z]{1,2}[ ]?[0-9]{0,1}[A-Za-z]{2}$/i.test(value);
            }, mod.custom.postcodeUK.message);
            
            // Check format is a valid UK postcode and not accepting Channel Islands, Isle of Man or Guernsey
            $.validator.addMethod("postcodeInvalidNonUK", function (value, element) {
                value = value.toUpperCase();
                if (value.substring(0, 2) == "GY") {
                    return false;
                }
                if (value.substring(0, 2) == "JE") {
                    return false;
                }
                if (value.substring(0, 2) == "IM") {
                    return false;
                }
                return true;
            }, mod.custom.postcodeInvalidNonUK.message);

            // Check format is valid
            $.validator.addMethod("validateAddressLine1", function (value, element) {
                return this.optional(element) || /^[a-zA-Z 0-9-#/',;:.]+$/.test(value);
                //return this.optional(element) || /[0-9,-\.]+/i.test(value);
            }, mod.custom.validateAddressLine.message);

            $.validator.addMethod("validateAddressLine2", function (value, element) {
                return this.optional(element) || /^[a-zA-Z 0-9-#/',;:.]+$/.test(value);
                //return this.optional(element) || /[0-9,-\.]+/i.test(value);
            }, mod.custom.validateAddressLine.message);

            $.validator.addMethod("validateAddressLine3", function (value, element) {
                return this.optional(element) || /^[a-zA-Z 0-9-#/',;:.]+$/.test(value);
                //return this.optional(element) || /[0-9,-\.]+/i.test(value);
            }, mod.custom.validateAddressLine.message);
            
            // Check bank account holder name format is valid
            $.validator.addMethod("validatebankAccountHolderName", function (value, element) {
                return this.optional(element) || /^\d*[a-zA-Z-,.\s]{1,}\d*/.test(value);
                //return this.optional(element) || /[0-9,-\.]+/i.test(value);
            }, mod.custom.validatebankAccountHolderName.message);
            
            // Check format is a valid UK phone number
            $.validator.addMethod('phoneUK', function (phone_number, element) {
                return this.optional(element) || phone_number.length > 9 &&
                /^0(\d ?){10}$/.test(phone_number);
            }, mod.custom.phoneUK.message);

            // Check if the value from a radiobutton list is 'true'
            $.validator.addMethod("authorisationCheck", function (value, element) {
                if ($(element).prop("checked")) {
                    return true;
                }
                else {
                    return false;
                }
            }, mod.custom.authorisationCheck.message);


            // Check date of birth is valid date - e.g 01/Jan/1960
            $.validator.addMethod("validdate", function (value, element) {

                var re = new RegExp('([0-9]{2}).?([0-9]{2}).?([0-9]{4})');

                if (value.match(re)) {
                    var d = RegExp.$1,
                        m = RegExp.$2,
                        y = RegExp.$3;
                    var selectedDate = new Date(y, m - 1, d);

                    var testDate = ("00" + selectedDate.getDate()).slice(-2) + ("00" + (selectedDate.getMonth() + 1)).slice(-2) + "" + selectedDate.getFullYear();

                    if (testDate == (d + m + y)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                } else {
                    return false;
                }

            }, mod.custom.validdate.message);


            //Check date of birth is over age limit
            $.validator.addMethod("adultage", function (value, element) {
                // at this point you know it is a valid date, so just grab the relevant bit. No real need to test again.
                value.match('([0-9]{2}).?([0-9]{2}).?([0-9]{4})');
                
                var currentDate = new Date(),
                    selectedDate = new Date(RegExp.$3, RegExp.$2 - 1, RegExp.$1),

                    diff = currentDate - selectedDate, // difference in milliseconds
                    age = Math.floor(diff / 31536000000); // Divide by 1000*60*60*24*365

                if (age >= mod.custom.adultage.agelimit) {
                    return true;
                }
                else {
                    return false;
                }
            }, mod.custom.adultage.message);

            // Custom validation to validate select dropdowns (value="-1" is invalid)
            $.validator.addMethod("validateselect", function (value, element) {
                return (value != -1);
            }, mod.custom.validateselect.message);


        })();

        //[ jQuery Validate Custom Methods END ]---------------


        // Object groupedValidationElements contains properties for each validation group. 
        // This is used were 3 inputs fields are validated as one single item
        mod.groupedValidationElements = {
            dob: {
                selector: '.date-select-multiple',
                hiddenInputID: '.validation-dob',
                separator: '/',
                format: '([0-9]{2}).?([0-9]{2}).?([0-9]{4})'
            },
            sortcode: {
                selector: '.sortcode-multiple',
                hiddenInputID: '.validation-sortcode',
                separator: '',
                format: '[0-9]{6}'
            }
        }


        return mod;

    }(module, $));

    return module;

})(window.APP || {}, window.jQuery);