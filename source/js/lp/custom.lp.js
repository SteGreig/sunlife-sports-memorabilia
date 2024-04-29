var sendQuickMenuVarsOnClick = function () {
    lpTag.vars.push([
    { scope: 'page', name: 'QuickMenu', value: 'TRUE' },
    ]);
    try {
        lpTag.vars.send();
    } catch (e) { }
};

var sendQuoteSavedVarsOnClick = function () {
    lpTag.vars.push([
    { scope:'page', name:'QuoteSaved', value:'TRUE' },
    ]);
    try{
        lpTag.vars.send();
    } catch(e) {}
};


// For sending these variables we need to count the number of times the user
// clicks on the TPC/FBO checkboxes. When it reaches 3 then call the below function.
var sendTPCFBOVarsOnClick = function () {
    lpTag.vars.push([
    { scope:'page', name:'TPC_FBO', value:'TRUE' },
    ]);
    try{
        lpTag.vars.send();
    } catch(e) {}
};

var x = 0;
var incrementTPCFBOCount = function () {
    x++;
    if (x > 2) {
        sendTPCFBOVarsOnClick();
    }
};

$('#checkBoxFreeFuneral').on('click', function () {
    incrementTPCFBOCount();
});

$('#checkBoxPremiumcap').on('click', function () {
    incrementTPCFBOCount();
});

// For sending these variables we need to count the number of times the user
// causes a validation error. When it reaches 2 then call the below function.
var sendApplicationErrorVarsOnClick = function () {
    lpTag.vars.push([
    { scope: 'page', name: 'ApplicationError', value: 'TRUE' },
    ]);
    try {
        lpTag.vars.send();
    } catch (e) { }
};

var y = 0;
var incrementErrorCount = function () {
    y++;
    if (y > 1) {
        sendApplicationErrorVarsOnClick();
    }
};

// Because the below functions are needed after equators code, I've had to move the handlers to source/js/sld/app.js and source/js/
var sendFAQTermsConditionsVarsOnClick = function () {
    lpTag.vars.push([
    { scope:'page', name:'TermsConditions', value:'TRUE' },
    ]);
    try{
        lpTag.vars.send();
    } catch(e) {}
};

var sendFuneralPlanTab1VarsOnClick = function () {
    lpTag.vars.push([
    { scope:'page', name:'FuneralPlanTab', value:'1' },
    ]);
    try{
        lpTag.vars.send();
    } catch(e) {}
};

var sendFuneralPlanTab2VarsOnClick = function () {
    lpTag.vars.push([
    { scope:'page', name:'FuneralPlanTab', value:'2' },
    ]);
    try{
        lpTag.vars.send();
    } catch(e) {}
};

var sendFuneralPlanTab3VarsOnClick = function () {
    lpTag.vars.push([
    { scope:'page', name:'FuneralPlanTab', value:'3' },
    ]);
    try{
        lpTag.vars.send();
    } catch(e) {}
};