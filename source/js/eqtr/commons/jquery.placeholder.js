
// placeholder creater plugin
(function ($) {
    $.fn.setPlaceholder = function (placeholderClass) {
        placeholderClass = placeholderClass || "has-placeholder-text";
        return this.each(function () {
            var defaultVal = $(this).attr("placeholder");
            $(this).focus(function () {
                if (this.value == defaultVal) {
                    $(this).val("");
                }
                $(this).removeClass(placeholderClass);
            })
            .blur(function () {
                if (!$.trim(this.value) || this.value == defaultVal) {
                    $(this).val(defaultVal).addClass(placeholderClass);
                }
            }).triggerHandler("blur");
        });
    };
})(jQuery);