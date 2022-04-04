/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        try {
            s = decodeURIComponent(s.replace(pluses, ' '));
        } catch (e) {
            return;
        }
        try {
            return config.json ? JSON.parse(s) : s;
        } catch (e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }
    var config = $.cookie = function (key, value, options) {
        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);
            if (typeof options.expires === 'number') {
                var days = options.expires,
                    t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }
            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }
        var result = key ? undefined : {};
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');
            if (key && key === name) {
                result = read(cookie, value);
                break;
            }
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }
        return result;
    };
    config.defaults = {};
    $.removeCookie = function (key, options) {
        if ($.cookie(key) !== undefined) {
            $.cookie(key, '', $.extend({}, options, {
                expires: -1
            }));
            return true;
        }
        return false;
    };
}));
/**
 * Chimpy Plugin Frontend JavaScript
 */
jQuery(document).ready(function () {
    /**
     * Display hidden interest groups (if any)
     */
    jQuery('.chimpy_signup_form fieldset').click(function () {
        jQuery(this).find('.chimpy_interest_groups_hidden').show();
        var form = jQuery(this).closest('.chimpy_signup_form');
        if (form.hasClass('sky-form-modal')) {
            form.css('top', '50%').css('left', '50%').css('margin-top', -form.outerHeight() / 2).css('margin-left', -form.outerWidth() / 2);
        }
    });
    /**
     * Handle form submit
     */
    jQuery('.chimpy_signup_form').each(function () {
        var chimpy_button = jQuery(this).find('button');
        var chimpy_context = jQuery(this).find('.chimpy_form_context').val();
        chimpy_button.click(function () {
            chimpy_process_mailchimp_signup(jQuery(this), chimpy_context);
        });
        jQuery(this).find('input[type="text"], input[type="email"]').each(function () {
            jQuery(this).keydown(function (e) {
                if (e.keyCode === 13) {
                    chimpy_process_mailchimp_signup(chimpy_button, chimpy_context);
                }
            });
        });
    });
    /**
     * MailChimp signup
     */
    function chimpy_process_mailchimp_signup(button, context) {
        if (button.closest('.chimpy_signup_form').valid()) {
            button.closest('.chimpy_signup_form').find('fieldset').fadeOut(function () {
                var this_form = jQuery(this).closest('.chimpy_signup_form');
                this_form.find('.chimpy_signup_' + context + '_processing').fadeIn();
                button.prop('disabled', true);
                if (this_form.hasClass('sky-form-modal')) {
                    this_form.css('top', '50%').css('left', '50%').css('margin-top', -this_form.outerHeight() / 2).css('margin-left', -this_form.outerWidth() / 2);
                }
                jQuery.post(
                    chimpy_ajaxurl, {
                        'action': 'chimpy_subscribe',
                        'data': button.closest('.chimpy_signup_form').serialize()
                    },
                    function (response) {
                        var result = jQuery.parseJSON(response);
                        this_form.find('.chimpy_signup_' + context + '_processing').fadeOut(function () {
                            if (result['error'] == 1) {
                                this_form.find('#chimpy_signup_' + context + '_error').children().html(result['message']);
                                this_form.find('#chimpy_signup_' + context + '_error').fadeIn();
                                this_form.find('.chimpy_signup_' + context + '_error').children().html(result['message']);
                                this_form.find('.chimpy_signup_' + context + '_error').fadeIn();
                            } else {
                                this_form.find('#chimpy_signup_' + context + '_success').children().html(result['message']);
                                this_form.find('#chimpy_signup_' + context + '_success').fadeIn();
                                this_form.find('.chimpy_signup_' + context + '_success').children().html(result['message']);
                                this_form.find('.chimpy_signup_' + context + '_success').fadeIn();
                                var date = new Date();
                                date.setTime(date.getTime() + (5 * 365 * 24 * 60 * 60 * 1000));
                                jQuery.cookie('chimpy_s', '1', {
                                    expires: date,
                                    path: '/'
                                });
                                setTimeout(function () {
                                    jQuery('.sign-circle, .sign-overlay').removeClass('show');
                                    jQuery("body,html").removeClass('overlayed');
                                    jQuery("body #page").removeAttr('style');
                                    jQuery("body").scrollTop(offsetTop);
                                    jQuery.cookie("showed-sign-up", 1, {
                                        expires: 30,
                                        path: '/'
                                    });
                                }, 2000);
                                if (context == 'lock') {
                                    setTimeout(function () {
                                        location.reload();
                                    }, 2000);
                                } else if (typeof result['redirect_url'] !== 'undefined' && result['redirect_url']) {
                                    setTimeout(function () {
                                        location.replace(result['redirect_url']);
                                    }, 1000);
                                }
                            }
                            if (this_form.hasClass('sky-form-modal')) {
                                this_form.css('top', '50%').css('left', '50%').css('margin-top', -this_form.outerHeight() / 2).css('margin-left', -this_form.outerWidth() / 2);
                            }
                        });
                    }
                );
            });
        }
    }
});
/*! jQuery Validation Plugin - v1.11.0 - 2/4/2013
 https://github.com/jzaefferer/jquery-validation
 Copyright (c) 2013 Jörn Zaefferer; Licensed MIT */
(function ($) {
    $.extend($.fn, {
        validate: function (options) {
            if (!this.length) {
                if (options && options.debug && window.console) {
                    console.warn("Nothing selected, can't validate, returning nothing.");
                }
                return;
            }
            var validator = $.data(this[0], "validator");
            if (validator) {
                return validator;
            }
            this.attr("novalidate", "novalidate");
            validator = new $.validator(options, this[0]);
            $.data(this[0], "validator", validator);
            if (validator.settings.onsubmit) {
                this.validateDelegate(":submit", "click", function (event) {
                    if (validator.settings.submitHandler) {
                        validator.submitButton = event.target;
                    }
                    if ($(event.target).hasClass("cancel")) {
                        validator.cancelSubmit = true;
                    }
                });
                this.submit(function (event) {
                    if (validator.settings.debug) {
                        event.preventDefault();
                    }

                    function handle() {
                        var hidden;
                        if (validator.settings.submitHandler) {
                            if (validator.submitButton) {
                                hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
                            }
                            validator.settings.submitHandler.call(validator, validator.currentForm, event);
                            if (validator.submitButton) {
                                hidden.remove();
                            }
                            return false;
                        }
                        return true;
                    }
                    if (validator.cancelSubmit) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if (validator.form()) {
                        if (validator.pendingRequest) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }
            return validator;
        },
        valid: function () {
            if ($(this[0]).is("form")) {
                return this.validate().form();
            } else {
                var valid = true;
                var validator = $(this[0].form).validate();
                this.each(function () {
                    valid &= validator.element(this);
                });
                return valid;
            }
        },
        removeAttrs: function (attributes) {
            var result = {},
                $element = this;
            $.each(attributes.split(/\s/), function (index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        },
        rules: function (command, argument) {
            var element = this[0];
            if (command) {
                var settings = $.data(element.form, "validator").settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch (command) {
                    case "add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        staticRules[element.name] = existingRules;
                        if (argument.messages) {
                            settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                        }
                        break;
                    case "remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        var filtered = {};
                        $.each(argument.split(/\s/), function (index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                        });
                        return filtered;
                }
            }
            var data = $.validator.normalizeRules($.extend({}, $.validator.classRules(element), $.validator.attributeRules(element), $.validator.dataRules(element), $.validator.staticRules(element)), element);
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({
                    required: param
                }, data);
            }
            return data;
        }
    });
    $.extend($.expr[":"], {
        blank: function (a) {
            return !$.trim("" + a.value);
        },
        filled: function (a) {
            return !!$.trim("" + a.value);
        },
        unchecked: function (a) {
            return !a.checked;
        }
    });
    $.validator = function (options, form) {
        this.settings = $.extend(true, {}, $.validator.defaults, options);
        this.currentForm = form;
        this.init();
    };
    $.validator.format = function (source, params) {
        if (arguments.length === 1) {
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply(this, args);
            };
        }
        if (arguments.length > 2 && params.constructor !== Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor !== Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                return n;
            });
        });
        return source;
    };
    $.extend($.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "invalid",
            validClass: "valid",
            errorElement: "em",
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: ":hidden",
            ignoreTitle: false,
            onfocusin: function (element, event) {
                this.lastActive = element;
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    if (this.settings.unhighlight) {
                        this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.addWrapper(this.errorsFor(element)).hide();
                }
            },
            onfocusout: function (element, event) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                    this.element(element);
                }
            },
            onkeyup: function (element, event) {
                if (event.which === 9 && this.elementValue(element) === "") {
                    return;
                } else if (element.name in this.submitted || element === this.lastElement) {
                    this.element(element);
                }
            },
            onclick: function (element, event) {
                if (element.name in this.submitted) {
                    this.element(element);
                } else if (element.parentNode.name in this.submitted) {
                    this.element(element.parentNode);
                }
            },
            highlight: function (element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).addClass(errorClass).removeClass(validClass).parent().addClass('state-error').removeClass('state-success');
                } else {
                    $(element).addClass(errorClass).removeClass(validClass).parent().addClass('state-error').removeClass('state-success');
                }
            },
            unhighlight: function (element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).removeClass(errorClass).addClass(validClass).parent().addClass('state-success').removeClass('state-error');
                } else {
                    $(element).removeClass(errorClass).addClass(validClass).parent().addClass('state-success').removeClass('state-error');
                }
            }
        },
        setDefaults: function (settings) {
            $.extend($.validator.defaults, settings);
        },
        messages: {
            required: "This field is required",
            remote: "Please fix this field",
            email: "Please enter a valid email address",
            url: "Please enter a valid URL",
            date: "Please enter a valid date",
            dateISO: "Please enter a valid date (ISO)",
            number: "Please enter a valid number",
            digits: "Please enter only digits",
            creditcard: "Please enter a valid credit card number",
            equalTo: "Please enter the same value again",
            maxlength: $.validator.format("Please enter no more than {0} characters"),
            minlength: $.validator.format("Please enter at least {0} characters"),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long"),
            range: $.validator.format("Please enter a value between {0} and {1}"),
            max: $.validator.format("Please enter a value less than or equal to {0}"),
            min: $.validator.format("Please enter a value greater than or equal to {0}")
        },
        autoCreateRanges: false,
        prototype: {
            init: function () {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();
                var groups = (this.groups = {});
                $.each(this.settings.groups, function (key, value) {
                    if (typeof value === "string") {
                        value = value.split(/\s/);
                    }
                    $.each(value, function (index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function (key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator"),
                        eventType = "on" + event.type.replace(/^validate/, "");
                    if (validator.settings[eventType]) {
                        validator.settings[eventType].call(validator, this[0], event);
                    }
                }
                $(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, " + "[type='number'], [type='search'] ,[type='tel'], [type='url'], " + "[type='email'], [type='datetime'], [type='date'], [type='month'], " + "[type='week'], [type='time'], [type='datetime-local'], " + "[type='range'], [type='color'] ", "focusin focusout keyup", delegate).validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);
                if (this.settings.invalidHandler) {
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
                }
            },
            form: function () {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid()) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
                this.showErrors();
                return this.valid();
            },
            checkForm: function () {
                this.prepareForm();
                for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                    this.check(elements[i]);
                }
                return this.valid();
            },
            element: function (element) {
                element = this.validationTargetFor(this.clean(element));
                this.lastElement = element;
                this.prepareElement(element);
                this.currentElements = $(element);
                var result = this.check(element) !== false;
                if (result) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if (!this.numberOfInvalids()) {
                    this.toHide = this.toHide.add(this.containers);
                }
                this.showErrors();
                return result;
            },
            showErrors: function (errors) {
                if (errors) {
                    $.extend(this.errorMap, errors);
                    this.errorList = [];
                    for (var name in errors) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    this.successList = $.grep(this.successList, function (element) {
                        return !(element.name in errors);
                    });
                }
                if (this.settings.showErrors) {
                    this.settings.showErrors.call(this, this.errorMap, this.errorList);
                } else {
                    this.defaultShowErrors();
                }
            },
            resetForm: function () {
                if ($.fn.resetForm) {
                    $(this.currentForm).resetForm();
                }
                this.submitted = {};
                this.lastElement = null;
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass).removeData("previousValue");
            },
            numberOfInvalids: function () {
                return this.objectLength(this.invalid);
            },
            objectLength: function (obj) {
                var count = 0;
                for (var i in obj) {
                    count++;
                }
                return count;
            },
            hideErrors: function () {
                this.addWrapper(this.toHide).hide();
            },
            valid: function () {
                return this.size() === 0;
            },
            size: function () {
                return this.errorList.length;
            },
            focusInvalid: function () {
                if (this.settings.focusInvalid) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin");
                    } catch (e) {}
                }
            },
            findLastActive: function () {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function (n) {
                    return n.element.name === lastActive.name;
                }).length === 1 && lastActive;
            },
            elements: function () {
                var validator = this,
                    rulesCache = {};
                return $(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function () {
                    if (!this.name && validator.settings.debug && window.console) {
                        console.error("%o has no name assigned", this);
                    }
                    if (this.name in rulesCache || !validator.objectLength($(this).rules())) {
                        return false;
                    }
                    rulesCache[this.name] = true;
                    return true;
                });
            },
            clean: function (selector) {
                return $(selector)[0];
            },
            errors: function () {
                var errorClass = this.settings.errorClass.replace(" ", ".");
                return $(this.settings.errorElement + "." + errorClass, this.errorContext);
            },
            reset: function () {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.currentElements = $([]);
            },
            prepareForm: function () {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            },
            prepareElement: function (element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },
            elementValue: function (element) {
                var type = $(element).attr("type"),
                    val = $(element).val();
                if (type === "radio" || type === "checkbox") {
                    return $("input[name='" + $(element).attr("name") + "']:checked").val();
                }
                if (typeof val === "string") {
                    return val.replace(/\r/g, "");
                }
                return val;
            },
            check: function (element) {
                element = this.validationTargetFor(this.clean(element));
                var rules = $(element).rules();
                var dependencyMismatch = false;
                var val = this.elementValue(element);
                var result;
                for (var method in rules) {
                    var rule = {
                        method: method,
                        parameters: rules[method]
                    };
                    try {
                        result = $.validator.methods[method].call(this, val, element, rule.parameters);
                        if (result === "dependency-mismatch") {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;
                        if (result === "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }
                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        if (this.settings.debug && window.console) {
                            console.log("Exception occured when checking element " + element.id + ", check the '" + rule.method + "' method.", e);
                        }
                        throw e;
                    }
                }
                if (dependencyMismatch) {
                    return;
                }
                if (this.objectLength(rules)) {
                    this.successList.push(element);
                }
                return true;
            },
            customDataMessage: function (element, method) {
                return $(element).data("msg-" + method.toLowerCase()) || (element.attributes && $(element).attr("data-msg-" + method.toLowerCase()));
            },
            customMessage: function (name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor === String ? m : m[method]);
            },
            findDefined: function () {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        return arguments[i];
                    }
                }
                return undefined;
            },
            defaultMessage: function (element, method) {
                return this.findDefined(this.customMessage(element.name, method), this.customDataMessage(element, method), !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[method], "<strong>Warning: No message defined for " + element.name + "</strong>");
            },
            formatAndAdd: function (element, rule) {
                var message = this.defaultMessage(element, rule.method),
                    theregex = /\$?\{(\d+)\}/g;
                if (typeof message === "function") {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
                }
                this.errorList.push({
                    message: message,
                    element: element
                });
                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },
            addWrapper: function (toToggle) {
                if (this.settings.wrapper) {
                    toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
                }
                return toToggle;
            },
            defaultShowErrors: function () {
                var i, elements;
                for (i = 0; this.errorList[i]; i++) {
                    var error = this.errorList[i];
                    if (this.settings.highlight) {
                        this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    for (i = 0; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    for (i = 0, elements = this.validElements(); elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            },
            validElements: function () {
                return this.currentElements.not(this.invalidElements());
            },
            invalidElements: function () {
                return $(this.errorList).map(function () {
                    return this.element;
                });
            },
            showLabel: function (element, message) {
                var label = this.errorsFor(element);
                if (label.length) {
                    label.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                    label.html(message);
                } else {
                    label = $("<" + this.settings.errorElement + ">").attr("for", this.idOrName(element)).addClass(this.settings.errorClass).html(message || "");
                    if (this.settings.wrapper) {
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (!this.labelContainer.append(label).length) {
                        if (this.settings.errorPlacement) {
                            this.settings.errorPlacement(label, $(element));
                        } else {
                            label.insertAfter(element);
                        }
                    }
                }
                if (!message && this.settings.success) {
                    label.text("");
                    if (typeof this.settings.success === "string") {
                        label.addClass(this.settings.success);
                    } else {
                        this.settings.success(label, element);
                    }
                }
                this.toShow = this.toShow.add(label);
            },
            errorsFor: function (element) {
                var name = this.idOrName(element);
                return this.errors().filter(function () {
                    return $(this).attr("for") === name;
                });
            },
            idOrName: function (element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },
            validationTargetFor: function (element) {
                if (this.checkable(element)) {
                    element = this.findByName(element.name).not(this.settings.ignore)[0];
                }
                return element;
            },
            checkable: function (element) {
                return (/radio|checkbox/i).test(element.type);
            },
            findByName: function (name) {
                return $(this.currentForm).find("[name='" + name + "']");
            },
            getLength: function (value, element) {
                switch (element.nodeName.toLowerCase()) {
                    case "select":
                        return $("option:selected", element).length;
                    case "input":
                        if (this.checkable(element)) {
                            return this.findByName(element.name).filter(":checked").length;
                        }
                }
                return value.length;
            },
            depend: function (param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            },
            dependTypes: {
                "boolean": function (param, element) {
                    return param;
                },
                "string": function (param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function (param, element) {
                    return param(element);
                }
            },
            optional: function (element) {
                var val = this.elementValue(element);
                return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
            },
            startRequest: function (element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },
            stopRequest: function (element, valid) {
                this.pendingRequest--;
                if (this.pendingRequest < 0) {
                    this.pendingRequest = 0;
                }
                delete this.pending[element.name];
                if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                    this.formSubmitted = false;
                } else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false;
                }
            },
            previousValue: function (element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, "remote")
                });
            }
        },
        classRuleSettings: {
            required: {
                required: true
            },
            email: {
                email: true
            },
            url: {
                url: true
            },
            date: {
                date: true
            },
            dateISO: {
                dateISO: true
            },
            number: {
                number: true
            },
            digits: {
                digits: true
            },
            creditcard: {
                creditcard: true
            }
        },
        addClassRules: function (className, rules) {
            if (className.constructor === String) {
                this.classRuleSettings[className] = rules;
            } else {
                $.extend(this.classRuleSettings, className);
            }
        },
        classRules: function (element) {
            var rules = {};
            var classes = $(element).attr("class");
            if (classes) {
                $.each(classes.split(" "), function () {
                    if (this in $.validator.classRuleSettings) {
                        $.extend(rules, $.validator.classRuleSettings[this]);
                    }
                });
            }
            return rules;
        },
        attributeRules: function (element) {
            var rules = {};
            var $element = $(element);
            for (var method in $.validator.methods) {
                var value;
                if (method === "required") {
                    value = $element.get(0).getAttribute(method);
                    if (value === "") {
                        value = true;
                    }
                    value = !!value;
                } else {
                    value = $element.attr(method);
                }
                if (value) {
                    rules[method] = value;
                } else if ($element[0].getAttribute("type") === method) {
                    rules[method] = true;
                }
            }
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }
            return rules;
        },
        dataRules: function (element) {
            var method, value, rules = {},
                $element = $(element);
            for (method in $.validator.methods) {
                value = $element.data("rule-" + method.toLowerCase());
                if (value !== undefined) {
                    rules[method] = value;
                }
            }
            return rules;
        },
        staticRules: function (element) {
            var rules = {};
            var validator = $.data(element.form, "validator");
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },
        normalizeRules: function (rules, element) {
            $.each(rules, function (prop, val) {
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case "string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });
            $.each(rules, function (rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });
            $.each(['minlength', 'maxlength'], function () {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength'], function () {
                var parts;
                if (rules[this]) {
                    if ($.isArray(rules[this])) {
                        rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                    } else if (typeof rules[this] === "string") {
                        parts = rules[this].split(/[\s,]+/);
                        rules[this] = [Number(parts[0]), Number(parts[1])];
                    }
                }
            });
            if ($.validator.autoCreateRanges) {
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }
            return rules;
        },
        normalizeRule: function (data) {
            if (typeof data === "string") {
                var transformed = {};
                $.each(data.split(/\s/), function () {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },
        addMethod: function (name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },
        methods: {
            required: function (value, element, param) {
                if (!this.depend(param, element)) {
                    return "dependency-mismatch";
                }
                if (element.nodeName.toLowerCase() === "select") {
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                if (this.checkable(element)) {
                    return this.getLength(value, element) > 0;
                }
                return $.trim(value).length > 0;
            },
            remote: function (value, element, param) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                var previous = this.previousValue(element);
                if (!this.settings.messages[element.name]) {
                    this.settings.messages[element.name] = {};
                }
                previous.originalMessage = this.settings.messages[element.name].remote;
                this.settings.messages[element.name].remote = previous.message;
                param = typeof param === "string" && {
                    url: param
                } || param;
                if (previous.old === value) {
                    return previous.valid;
                }
                previous.old = value;
                var validator = this;
                this.startRequest(element);
                var data = {};
                data[element.name] = value;
                $.ajax($.extend(true, {
                    url: param,
                    mode: "abort",
                    port: "validate" + element.name,
                    dataType: "json",
                    data: data,
                    success: function (response) {
                        validator.settings.messages[element.name].remote = previous.originalMessage;
                        var valid = response === true || response === "true";
                        if (valid) {
                            var submitted = validator.formSubmitted;
                            validator.prepareElement(element);
                            validator.formSubmitted = submitted;
                            validator.successList.push(element);
                            delete validator.invalid[element.name];
                            validator.showErrors();
                        } else {
                            var errors = {};
                            var message = response || validator.defaultMessage(element, "remote");
                            errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                            validator.invalid[element.name] = true;
                            validator.showErrors(errors);
                        }
                        previous.valid = valid;
                        validator.stopRequest(element, valid);
                    }
                }, param));
                return "pending";
            },
            minlength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length >= param;
            },
            maxlength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length <= param;
            },
            rangelength: function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || (length >= param[0] && length <= param[1]);
            },
            min: function (value, element, param) {
                return this.optional(element) || value >= param;
            },
            max: function (value, element, param) {
                return this.optional(element) || value <= param;
            },
            range: function (value, element, param) {
                return this.optional(element) || (value >= param[0] && value <= param[1]);
            },
            email: function (value, element) {
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
            },
            url: function (value, element) {
                return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },
            date: function (value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
            },
            dateISO: function (value, element) {
                return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
            },
            number: function (value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },
            digits: function (value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },
            creditcard: function (value, element) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                if (/[^0-9 \-]+/.test(value)) {
                    return false;
                }
                var nCheck = 0,
                    nDigit = 0,
                    bEven = false;
                value = value.replace(/\D/g, "");
                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9) {
                            nDigit -= 9;
                        }
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }
                return (nCheck % 10) === 0;
            },
            equalTo: function (value, element, param) {
                var target = $(param);
                if (this.settings.onfocusout) {
                    target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function () {
                        $(element).valid();
                    });
                }
                return value === target.val();
            }
        }
    });
    $.format = $.validator.format;
}(jQuery));
(function ($) {
    var pendingRequests = {};
    if ($.ajaxPrefilter) {
        $.ajaxPrefilter(function (settings, _, xhr) {
            var port = settings.port;
            if (settings.mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = xhr;
            }
        });
    } else {
        var ajax = $.ajax;
        $.ajax = function (settings) {
            var mode = ("mode" in settings ? settings : $.ajaxSettings).mode,
                port = ("port" in settings ? settings : $.ajaxSettings).port;
            if (mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                return (pendingRequests[port] = ajax.apply(this, arguments));
            }
            return ajax.apply(this, arguments);
        };
    }
}(jQuery));
(function ($) {
    $.extend($.fn, {
        validateDelegate: function (delegate, type, handler) {
            return this.bind(type, function (event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        }
    });
}(jQuery));
/* Additional methods */
(function () {
    function e(e) {
        return e.replace(/<.[^<>]*?>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/[.(),;:!?%#$'"_+=\/\-]*/g, "")
    }
    jQuery.validator.addMethod("maxWords", function (t, n, r) {
        return this.optional(n) || e(t).match(/\b\w+\b/g).length <= r
    }, jQuery.validator.format("Please enter {0} words or less.")), jQuery.validator.addMethod("minWords", function (t, n, r) {
        return this.optional(n) || e(t).match(/\b\w+\b/g).length >= r
    }, jQuery.validator.format("Please enter at least {0} words.")), jQuery.validator.addMethod("rangeWords", function (t, n, r) {
        var i = e(t),
            s = /\b\w+\b/g;
        return this.optional(n) || i.match(s).length >= r[0] && i.match(s).length <= r[1]
    }, jQuery.validator.format("Please enter between {0} and {1} words."))
})(), jQuery.validator.addMethod("letterswithbasicpunc", function (e, t) {
    return this.optional(t) || /^[a-z\-.,()'"\s]+$/i.test(e)
}, "Letters or punctuation only please"), jQuery.validator.addMethod("alphanumeric", function (e, t) {
    return this.optional(t) || /^\w+$/i.test(e)
}, "Letters, numbers, and underscores only please"), jQuery.validator.addMethod("lettersonly", function (e, t) {
    return this.optional(t) || /^[a-z]+$/i.test(e)
}, "Letters only please"), jQuery.validator.addMethod("nowhitespace", function (e, t) {
    return this.optional(t) || /^\S+$/i.test(e)
}, "No white space please"), jQuery.validator.addMethod("ziprange", function (e, t) {
    return this.optional(t) || /^90[2-5]\d\{2\}-\d{4}$/.test(e)
}, "Your ZIP-code must be in the range 902xx-xxxx to 905-xx-xxxx"), jQuery.validator.addMethod("zipcodeUS", function (e, t) {
    return this.optional(t) || /\d{5}-\d{4}$|^\d{5}$/.test(e)
}, "The specified US ZIP Code is invalid"), jQuery.validator.addMethod("integer", function (e, t) {
    return this.optional(t) || /^-?\d+$/.test(e)
}, "A positive or negative non-decimal number please"), jQuery.validator.addMethod("vinUS", function (e) {
    if (e.length !== 17) return !1;
    var t, n, r, i, s, o, u = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        a = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 7, 9, 2, 3, 4, 5, 6, 7, 8, 9],
        f = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2],
        l = 0;
    for (t = 0; t < 17; t++) {
        i = f[t], r = e.slice(t, t + 1), t === 8 && (o = r);
        if (!isNaN(r)) r *= i;
        else
            for (n = 0; n < u.length; n++)
                if (r.toUpperCase() === u[n]) {
                    r = a[n], r *= i, isNaN(o) && n === 8 && (o = u[n]);
                    break
                } l += r
    }
    return s = l % 11, s === 10 && (s = "X"), s === o ? !0 : !1
}, "The specified vehicle identification number (VIN) is invalid."), jQuery.validator.addMethod("dateITA", function (e, t) {
    var n = !1,
        r = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (r.test(e)) {
        var i = e.split("/"),
            s = parseInt(i[0], 10),
            o = parseInt(i[1], 10),
            u = parseInt(i[2], 10),
            a = new Date(u, o - 1, s);
        a.getFullYear() === u && a.getMonth() === o - 1 && a.getDate() === s ? n = !0 : n = !1
    } else n = !1;
    return this.optional(t) || n
}, "Please enter a correct date"), jQuery.validator.addMethod("dateNL", function (e, t) {
    return this.optional(t) || /^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(e)
}, "Vul hier een geldige datum in."), jQuery.validator.addMethod("time", function (e, t) {
    return this.optional(t) || /^([01]\d|2[0-3])(:[0-5]\d){1,2}$/.test(e)
}, "Please enter a valid time, between 00:00 and 23:59"), jQuery.validator.addMethod("time12h", function (e, t) {
    return this.optional(t) || /^((0?[1-9]|1[012])(:[0-5]\d){1,2}( ?[AP]M))$/i.test(e)
}, "Please enter a valid time in 12-hour format"), jQuery.validator.addMethod("phoneUS", function (e, t) {
    return e = e.replace(/\s+/g, ""), this.optional(t) || e.length > 9 && e.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/)
}, "Please specify a valid phone number"), jQuery.validator.addMethod("phoneUK", function (e, t) {
    return e = e.replace(/\(|\)|\s+|-/g, ""), this.optional(t) || e.length > 9 && e.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:(?:\d{5}\)?\s?\d{4,5})|(?:\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3}))|(?:\d{3}\)?\s?\d{3}\s?\d{3,4})|(?:\d{2}\)?\s?\d{4}\s?\d{4}))$/)
}, "Please specify a valid phone number"), jQuery.validator.addMethod("mobileUK", function (e, t) {
    return e = e.replace(/\s+|-/g, ""), this.optional(t) || e.length > 9 && e.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/)
}, "Please specify a valid mobile number"), jQuery.validator.addMethod("phonesUK", function (e, t) {
    return e = e.replace(/\s+|-/g, ""), this.optional(t) || e.length > 9 && e.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[45789]\d{8}|624\d{6})))$/)
}, "Please specify a valid uk phone number"), jQuery.validator.addMethod("postcodeUK", function (e, t) {
    return e = e.toUpperCase().replace(/\s+/g, ""), this.optional(t) || e.match(/^([^QZ][^IJZ]{0,1}\d{1,2})(\d[^CIKMOV]{2})$/) || e.match(/^([^QV]\d[ABCDEFGHJKSTUW])(\d[^CIKMOV]{2})$/) || e.match(/^([^QV][^IJZ]\d[ABEHMNPRVWXY])(\d[^CIKMOV]{2})$/) || e.match(/^(GIR)(0AA)$/) || e.match(/^(BFPO)(\d{1,4})$/) || e.match(/^(BFPO)(C\/O\d{1,3})$/)
}, "Please specify a valid postcode"), jQuery.validator.addMethod("strippedminlength", function (e, t, n) {
    return jQuery(e).text().length >= n
}, jQuery.validator.format("Please enter at least {0} characters")), jQuery.validator.addMethod("email2", function (e, t, n) {
    return this.optional(t) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(e)
}, jQuery.validator.messages.email), jQuery.validator.addMethod("url2", function (e, t, n) {
    return this.optional(t) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(e)
}, jQuery.validator.messages.url), jQuery.validator.addMethod("creditcardtypes", function (e, t, n) {
    if (/[^0-9\-]+/.test(e)) return !1;
    e = e.replace(/\D/g, "");
    var r = 0;
    return n.mastercard && (r |= 1), n.visa && (r |= 2), n.amex && (r |= 4), n.dinersclub && (r |= 8), n.enroute && (r |= 16), n.discover && (r |= 32), n.jcb && (r |= 64), n.unknown && (r |= 128), n.all && (r = 255), r & 1 && /^(5[12345])/.test(e) ? e.length === 16 : r & 2 && /^(4)/.test(e) ? e.length === 16 : r & 4 && /^(3[47])/.test(e) ? e.length === 15 : r & 8 && /^(3(0[012345]|[68]))/.test(e) ? e.length === 14 : r & 16 && /^(2(014|149))/.test(e) ? e.length === 15 : r & 32 && /^(6011)/.test(e) ? e.length === 16 : r & 64 && /^(3)/.test(e) ? e.length === 16 : r & 64 && /^(2131|1800)/.test(e) ? e.length === 15 : r & 128 ? !0 : !1
}, "Please enter a valid credit card number."), jQuery.validator.addMethod("ipv4", function (e, t, n) {
    return this.optional(t) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(e)
}, "Please enter a valid IP v4 address."), jQuery.validator.addMethod("ipv6", function (e, t, n) {
    return this.optional(t) || /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(e)
}, "Please enter a valid IP v6 address."), jQuery.validator.addMethod("pattern", function (e, t, n) {
    return this.optional(t) ? !0 : (typeof n == "string" && (n = new RegExp("^(?:" + n + ")$")), n.test(e))
}, "Invalid format."), jQuery.validator.addMethod("require_from_group", function (e, t, n) {
    var r = this,
        i = n[1],
        s = $(i, t.form).filter(function () {
            return r.elementValue(this)
        }).length >= n[0];
    if (!$(t).data("being_validated")) {
        var o = $(i, t.form);
        o.data("being_validated", !0), o.valid(), o.data("being_validated", !1)
    }
    return s
}, jQuery.format("Please fill at least {0} of these fields.")), jQuery.validator.addMethod("skip_or_fill_minimum", function (e, t, n) {
    var r = this,
        i = n[0],
        s = n[1],
        o = $(s, t.form).filter(function () {
            return r.elementValue(this)
        }).length,
        u = o >= i || o === 0;
    if (!$(t).data("being_validated")) {
        var a = $(s, t.form);
        a.data("being_validated", !0), a.valid(), a.data("being_validated", !1)
    }
    return u
}, jQuery.format("Please either skip these fields or fill at least {0} of them.")), jQuery.validator.addMethod("accept", function (e, t, n) {
    var r = typeof n == "string" ? n.replace(/\s/g, "").replace(/,/g, "|") : "image/*",
        i = this.optional(t),
        s, o;
    if (i) return i;
    if ($(t).attr("type") === "file") {
        r = r.replace(/\*/g, ".*");
        if (t.files && t.files.length)
            for (s = 0; s < t.files.length; s++) {
                o = t.files[s];
                if (!o.type.match(new RegExp(".?(" + r + ")$", "i"))) return !1
            }
    }
    return !0
}, jQuery.format("Please enter a value with a valid mimetype.")), jQuery.validator.addMethod("extension", function (e, t, n) {
    return n = typeof n == "string" ? n.replace(/,/g, "|") : "png|jpe?g|gif", this.optional(t) || e.match(new RegExp(".(" + n + ")$", "i"))
}, jQuery.format("Please enter a value with a valid extension."));
jQuery(function ($) {
    'use strict';

    function rot13(s) {
        return s.replace(/[a-zA-Z]/g, function (c) {
            return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

    function fetchEmail(el) {
        var email = el.getAttribute('data-enc-email');
        if (!email) {
            return null;
        }
        email = email.replace(/\[at\]/g, '@');
        email = rot13(email);
        return email;
    }

    function parseTitle(el) {
        var title = el.getAttribute('title');
        var email = fetchEmail(el);
        if (title && email) {
            title = title.replace('{{email}}', email);
            el.setAttribute('title', title);
        }
    }

    function setInputValue(el) {
        var email = fetchEmail(el);
        if (email) {
            el.setAttribute('value', email);
        }
    }

    function mailto(el) {
        var email = fetchEmail(el);
        if (email) {
            window.location.href = 'mailto:' + email;
        }
    }

    function revert(el, rtl) {
        var email = fetchEmail(el);
        if (email) {
            rtl.text(email);
            rtl.removeClass('wpml-rtl');
        }
    }
    document.addEventListener('copy', function (e) {
        $('a[data-enc-email]').each(function () {
            var rtl = $(this).find('.wpml-rtl');
            if (rtl.text()) {
                revert(this, rtl);
            }
        });
        console.log('copy');
    });
    $('body').on('click', 'a[data-enc-email]', function () {
        mailto(this);
    });
    $('a[data-enc-email]').each(function () {
        parseTitle(this);
    });
    $('input[data-enc-email]').each(function () {
        setInputValue(this);
    });
});
jQuery(function () {
    jQuery(":input").on("focus", function () {
        var input = jQuery(this);
        var inputID = input.attr("id") || "(no input ID)";
        var inputName = input.attr("name") || "(no input name)";
        var inputClass = input.attr("class") || "(no input class)";
        var form = jQuery(this.form);
        var formID = form.attr("id") || "(no form ID)";
        var formName = form.attr("name") || "(no form name)";
        var formClass = form.attr("class") || "(no form class)";
        window[gtm4wp_datalayer_name].push({
            'event': 'gtm4wp.formElementEnter',
            'inputID': inputID,
            'inputName': inputName,
            'inputClass': inputClass,
            'formID': formID,
            'formName': formName,
            'formClass': formClass
        });
    }).on("blur", function () {
        var input = jQuery(this);
        var inputID = input.attr("id") || "(no input ID)";
        var inputName = input.attr("name") || "(no input name)";
        var inputClass = input.attr("class") || "(no input class)";
        var form = jQuery(this.form);
        var formID = form.attr("id") || "(no form ID)";
        var formName = form.attr("name") || "(no form name)";
        var formClass = form.attr("class") || "(no form class)";
        window[gtm4wp_datalayer_name].push({
            'event': 'gtm4wp.formElementLeave',
            'inputID': inputID,
            'inputName': inputName,
            'inputClass': inputClass,
            'formID': formID,
            'formName': formName,
            'formClass': formClass
        });
    });
});
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function ($) {
    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        try {
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch (e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }
    var config = $.cookie = function (key, value, options) {
        if (arguments.length > 1 && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);
            if (typeof options.expires === 'number') {
                var days = options.expires,
                    t = options.expires = new Date();
                t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
            }
            return (document.cookie = [encode(key), '=', stringifyCookieValue(value), options.expires ? '; expires=' + options.expires.toUTCString() : '', options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join(''));
        }
        var result = key ? undefined : {},
            cookies = document.cookie ? document.cookie.split('; ') : [],
            i = 0,
            l = cookies.length;
        for (; i < l; i++) {
            var parts = cookies[i].split('='),
                name = decode(parts.shift()),
                cookie = parts.join('=');
            if (key === name) {
                result = read(cookie, value);
                break;
            }
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }
        return result;
    };
    config.defaults = {};
    $.removeCookie = function (key, options) {
        $.cookie(key, '', $.extend({}, options, {
            expires: -1
        }));
        return !$.cookie(key);
    };
}));
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
    "use strict";
    var a = Math.PI / 180,
        b = 180 / Math.PI,
        c = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
        d = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,
        e = /[achlmqstvz]/gi,
        f = _gsScope.TweenLite,
        g = function (a) {
            window.console && console.log(a)
        },
        h = function (b, c) {
            var d, e, f, g, h, i, j = Math.ceil(Math.abs(c) / 90),
                k = 0,
                l = [];
            for (b *= a, c *= a, d = c / j, e = 4 / 3 * Math.sin(d / 2) / (1 + Math.cos(d / 2)), i = 0; j > i; i++) f = b + i * d, g = Math.cos(f), h = Math.sin(f), l[k++] = g - e * h, l[k++] = h + e * g, f += d, g = Math.cos(f), h = Math.sin(f), l[k++] = g + e * h, l[k++] = h - e * g, l[k++] = g, l[k++] = h;
            return l
        },
        i = function (c, d, e, f, g, i, j, k, l) {
            if (c !== k || d !== l) {
                e = Math.abs(e), f = Math.abs(f);
                var m = g % 360 * a,
                    n = Math.cos(m),
                    o = Math.sin(m),
                    p = (c - k) / 2,
                    q = (d - l) / 2,
                    r = n * p + o * q,
                    s = -o * p + n * q,
                    t = e * e,
                    u = f * f,
                    v = r * r,
                    w = s * s,
                    x = v / t + w / u;
                x > 1 && (e = Math.sqrt(x) * e, f = Math.sqrt(x) * f, t = e * e, u = f * f);
                var y = i === j ? -1 : 1,
                    z = (t * u - t * w - u * v) / (t * w + u * v);
                0 > z && (z = 0);
                var A = y * Math.sqrt(z),
                    B = A * (e * s / f),
                    C = A * -(f * r / e),
                    D = (c + k) / 2,
                    E = (d + l) / 2,
                    F = D + (n * B - o * C),
                    G = E + (o * B + n * C),
                    H = (r - B) / e,
                    I = (s - C) / f,
                    J = (-r - B) / e,
                    K = (-s - C) / f,
                    L = Math.sqrt(H * H + I * I),
                    M = H;
                y = 0 > I ? -1 : 1;
                var N = y * Math.acos(M / L) * b;
                L = Math.sqrt((H * H + I * I) * (J * J + K * K)), M = H * J + I * K, y = 0 > H * K - I * J ? -1 : 1;
                var O = y * Math.acos(M / L) * b;
                !j && O > 0 ? O -= 360 : j && 0 > O && (O += 360), O %= 360, N %= 360;
                var P, Q, R, S = h(N, O),
                    T = n * e,
                    U = o * e,
                    V = o * -f,
                    W = n * f,
                    X = S.length - 2;
                for (P = 0; X > P; P += 2) Q = S[P], R = S[P + 1], S[P] = Q * T + R * V + F, S[P + 1] = Q * U + R * W + G;
                return S[S.length - 2] = k, S[S.length - 1] = l, S
            }
        },
        j = function (a) {
            var b, d, e, f, h, j, k, l, m, n, o, p, q, r = (a + "").match(c) || [],
                s = [],
                t = 0,
                u = 0,
                v = r.length,
                w = 2,
                x = 0;
            if (!a || !isNaN(r[0]) || isNaN(r[1])) return g("ERROR: malformed path data: " + a), s;
            for (b = 0; v > b; b++)
                if (q = h, isNaN(r[b]) ? (h = r[b].toUpperCase(), j = h !== r[b]) : b--, e = +r[b + 1], f = +r[b + 2], j && (e += t, f += u), 0 === b && (l = e, m = f), "M" === h) t = l = e, u = m = f, k = [e, f], x += w, w = 2, s.push(k), b += 2;
                else if ("C" === h) k || (k = [0, 0]), k[w++] = e, k[w++] = f, j || (t = u = 0), k[w++] = t + 1 * r[b + 3], k[w++] = u + 1 * r[b + 4], k[w++] = t += 1 * r[b + 5], k[w++] = u += 1 * r[b + 6], b += 6;
            else if ("S" === h) "C" === q || "S" === q ? (n = t - k[w - 4], o = u - k[w - 3], k[w++] = t + n, k[w++] = u + o) : (k[w++] = t, k[w++] = u), k[w++] = e, k[w++] = f, j || (t = u = 0), k[w++] = t += 1 * r[b + 3], k[w++] = u += 1 * r[b + 4], b += 4;
            else if ("Q" === h) n = e - t, o = f - u, k[w++] = t + 2 * n / 3, k[w++] = u + 2 * o / 3, j || (t = u = 0), t += 1 * r[b + 3], u += 1 * r[b + 4], n = e - t, o = f - u, k[w++] = t + 2 * n / 3, k[w++] = u + 2 * o / 3, k[w++] = t, k[w++] = u, b += 4;
            else if ("T" === h) n = t - k[w - 4], o = u - k[w - 3], k[w++] = t + n, k[w++] = u + o, n = t + 1.5 * n - e, o = u + 1.5 * o - f, k[w++] = e + 2 * n / 3, k[w++] = f + 2 * o / 3, k[w++] = t = e, k[w++] = u = f, b += 2;
            else if ("H" === h) f = u, k[w++] = t + (e - t) / 3, k[w++] = u + (f - u) / 3, k[w++] = t + 2 * (e - t) / 3, k[w++] = u + 2 * (f - u) / 3, k[w++] = t = e, k[w++] = f, b += 1;
            else if ("V" === h) f = e, e = t, j && (f += u - t), k[w++] = e, k[w++] = u + (f - u) / 3, k[w++] = e, k[w++] = u + 2 * (f - u) / 3, k[w++] = e, k[w++] = u = f, b += 1;
            else if ("L" === h || "Z" === h) "Z" === h && (e = l, f = m, k.closed = !0), ("L" === h || Math.abs(t - e) > 1 || Math.abs(u - f) > 1) && (k[w++] = t + (e - t) / 3, k[w++] = u + (f - u) / 3, k[w++] = t + 2 * (e - t) / 3, k[w++] = u + 2 * (f - u) / 3, k[w++] = e, k[w++] = f, b += 2), t = e, u = f;
            else if ("A" === h) {
                for (p = i(t, u, 1 * r[b + 1], 1 * r[b + 2], 1 * r[b + 3], 1 * r[b + 4], 1 * r[b + 5], (j ? t : 0) + 1 * r[b + 6], (j ? u : 0) + 1 * r[b + 7]), d = 0; d < p.length; d++) k[w++] = p[d];
                t = k[w - 2], u = k[w - 1], b += 7
            } else g("Error: malformed path data: " + a);
            return s.totalPoints = x + w, s
        },
        k = function (a, b) {
            var c, d, e, f, g, h, i, j, k, l, m, n, o, p, q = 0,
                r = .999999,
                s = a.length,
                t = b / ((s - 2) / 6);
            for (o = 2; s > o; o += 6)
                for (q += t; q > r;) c = a[o - 2], d = a[o - 1], e = a[o], f = a[o + 1], g = a[o + 2], h = a[o + 3], i = a[o + 4], j = a[o + 5], p = 1 / (Math.floor(q) + 1), k = c + (e - c) * p, m = e + (g - e) * p, k += (m - k) * p, m += (g + (i - g) * p - m) * p, l = d + (f - d) * p, n = f + (h - f) * p, l += (n - l) * p, n += (h + (j - h) * p - n) * p, a.splice(o, 4, c + (e - c) * p, d + (f - d) * p, k, l, k + (m - k) * p, l + (n - l) * p, m, n, g + (i - g) * p, h + (j - h) * p), o += 6, s += 6, q--;
            return a
        },
        l = function (a) {
            var b, c, d, e, f = "",
                g = a.length,
                h = 100;
            for (c = 0; g > c; c++) {
                for (e = a[c], f += "M" + e[0] + "," + e[1] + " C", b = e.length, d = 2; b > d; d++) f += (e[d++] * h | 0) / h + "," + (e[d++] * h | 0) / h + " " + (e[d++] * h | 0) / h + "," + (e[d++] * h | 0) / h + " " + (e[d++] * h | 0) / h + "," + (e[d] * h | 0) / h + " ";
                e.closed && (f += "z")
            }
            return f
        },
        m = function (a) {
            for (var b = [], c = a.length - 1, d = 0; --c > -1;) b[d++] = a[c], b[d++] = a[c + 1], c--;
            for (c = 0; d > c; c++) a[c] = b[c];
            a.reversed = a.reversed ? !1 : !0
        },
        n = function (a) {
            var b, c = a.length,
                d = 0,
                e = 0;
            for (b = 0; c > b; b++) d += a[b++], e += a[b];
            return [d / (c / 2), e / (c / 2)]
        },
        o = function (a) {
            var b, c, d, e = a.length,
                f = a[0],
                g = f,
                h = a[1],
                i = h;
            for (d = 6; e > d; d += 6) b = a[d], c = a[d + 1], b > f ? f = b : g > b && (g = b), c > h ? h = c : i > c && (i = c);
            return a.centerX = (f + g) / 2, a.centerY = (h - i) / 2, a.size = (f - g) * (h - i)
        },
        p = function (a, b) {
            return b.length - a.length
        },
        q = function (a, b) {
            var c = a.size || o(a),
                d = b.size || o(b);
            return Math.abs(d - c) < (c + d) / 20 ? b.centerX - a.centerX || b.centerY - a.centerY : d - c
        },
        r = function (a, b) {
            var c, d, e = a.slice(0),
                f = a.length,
                g = f - 2;
            for (b = 0 | b, c = 0; f > c; c++) d = (c + b) % g, a[c++] = e[d], a[c] = e[d + 1]
        },
        s = function (a, b, c, d, e) {
            var f, g, h, i, j = a.length,
                k = 0,
                l = j - 2;
            for (c *= 6, g = 0; j > g; g += 6) f = (g + c) % l, i = a[f] - (b[g] - d), h = a[f + 1] - (b[g + 1] - e), k += Math.sqrt(h * h + i * i);
            return k
        },
        t = function (a, b, c) {
            var d, e, f, g = a.length,
                h = n(a),
                i = n(b),
                j = i[0] - h[0],
                k = i[1] - h[1],
                l = s(a, b, 0, j, k),
                o = 0;
            for (f = 6; g > f; f += 6) e = s(a, b, f / 6, j, k), l > e && (l = e, o = f);
            if (c)
                for (d = a.slice(0), m(d), f = 6; g > f; f += 6) e = s(d, b, f / 6, j, k), l > e && (l = e, o = -f);
            return o / 6
        },
        u = function (a, b, c) {
            var d, e, f, g, h = a.length,
                i = 99999999999,
                j = 0;
            for (g = 0; h > g; g += 6) d = a[g] - b, e = a[g + 1] - c, f = Math.sqrt(d * d + e * e), i > f && (i = f, j = g);
            return j
        },
        v = function (a, b, c) {
            var d, e, f, g, h = b.length,
                i = 0,
                j = .8 * (b[c].size || o(b[c])),
                k = 999999999999,
                l = a.size || o(a),
                m = a.centerX,
                n = a.centerY;
            for (d = c; h > d && (l = b[d].size || o(b[d]), !(j > l)); d++) e = b[d].centerX - m, f = b[d].centerY - n, g = Math.sqrt(e * e + f * f), k > g && (i = d, k = g);
            return g = b[i], b.splice(i, 1), g
        },
        w = function (a, b, c, d) {
            var e, f, g, h, i, j = b.length - a.length,
                l = j > 0 ? b : a,
                n = j > 0 ? a : b,
                o = 0,
                s = "complexity" === d ? p : q,
                w = n.length,
                x = "object" == typeof c && c.push ? c.slice(0) : [c],
                y = "reverse" === x[0] || x[0] < 0;
            if (n[0]) {
                if (j) {
                    if (0 > j && (j = -j), a.sort(s), b.sort(s), s === q)
                        for (w = 0; w < n.length; w++) l.splice(w, 0, v(n[w], l, w));
                    for (l[0].length > n[0].length && k(n[0], (l[0].length - n[0].length) / 6 | 0), w = n.length; j > o;) g = u(n[0], l[w][0], l[w][1]), h = n[0][g], i = n[0][g + 1], n[w++] = [h, i, h, i, h, i, h, i], n.totalPoints += 8, o++
                }
                for (w = 0; w < a.length; w++) e = b[w], f = a[w], j = e.length - f.length, 0 > j ? k(e, -j / 6 | 0) : j > 0 && k(f, j / 6 | 0), y && !f.reversed && m(f), c = x[w] || 0 === x[w] ? x[w] : "auto", c && (f.closed || Math.abs(f[0] - f[f.length - 2]) < .5 && Math.abs(f[1] - f[f.length - 1]) < .5 ? "auto" === c ? (x[w] = c = t(f, e, 0 === w), 0 > c && (y = !0, m(f), c = -c), r(f, 6 * c)) : "reverse" !== c && (w && 0 > c && m(f), r(f, 6 * (0 > c ? -c : c))) : !y && ("auto" === c && Math.abs(e[0] - f[0]) + Math.abs(e[1] - f[1]) + Math.abs(e[e.length - 2] - f[f.length - 2]) + Math.abs(e[e.length - 1] - f[f.length - 1]) > Math.abs(e[0] - f[f.length - 2]) + Math.abs(e[1] - f[f.length - 1]) + Math.abs(e[e.length - 2] - f[0]) + Math.abs(e[e.length - 1] - f[1]) || c % 2) ? (m(f), x[w] = -1, y = !0) : "auto" === c ? x[w] = 0 : "reverse" === c && (x[w] = -1));
                return x
            }
        },
        x = function (a, b, c) {
            var d = j(a[0]),
                e = j(a[1]);
            w(d, e, b || 0 === b ? b : "auto", c) && (a[0] = l(d), a[1] = l(e))
        },
        y = function (a, b) {
            return b || a || 0 === a ? function (c) {
                x(c, a, b)
            } : x
        },
        z = function (a, b) {
            if (!b) return a;
            var c, e, f, g = a.match(d) || [],
                h = g.length,
                i = "";
            for ("reverse" === b ? (e = h - 1, c = -2) : (e = (2 * (parseInt(b, 10) || 0) + 1 + 100 * h) % h, c = 2), f = 0; h > f; f += 2) i += g[e - 1] + "," + g[e] + " ", e = (e + c) % h;
            return i
        },
        A = function (a, b) {
            var c, d, e, f, g, h, i, j = 0,
                k = parseFloat(a[0]),
                l = parseFloat(a[1]),
                m = k + "," + l + " ",
                n = .999999;
            for (e = a.length, c = .5 * b / (.5 * e - 1), d = 0; e - 2 > d; d += 2) {
                if (j += c, h = parseFloat(a[d + 2]), i = parseFloat(a[d + 3]), j > n)
                    for (g = 1 / (Math.floor(j) + 1), f = 1; j > n;) m += (k + (h - k) * g * f).toFixed(2) + "," + (l + (i - l) * g * f).toFixed(2) + " ", j--, f++;
                m += h + "," + i + " ", k = h, l = i
            }
            return m
        },
        B = function (a) {
            var b = a[0].match(d) || [],
                c = a[1].match(d) || [],
                e = c.length - b.length;
            e > 0 ? a[0] = A(b, e) : a[1] = A(c, -e)
        },
        C = function (a) {
            return isNaN(a) ? B : function (b) {
                B(b), b[1] = z(b[1], parseInt(a, 10))
            }
        },
        D = function (a, b) {
            var c = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                d = Array.prototype.slice.call(a.attributes),
                e = d.length;
            for (b = "," + b + ","; --e > -1;) - 1 === b.indexOf("," + d[e].nodeName + ",") && c.setAttributeNS(null, d[e].nodeName, d[e].nodeValue);
            return c
        },
        E = function (a, b) {
            var c, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y = a.tagName.toLowerCase(),
                z = .552284749831;
            return "path" !== y && a.getBBox ? (i = D(a, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), "rect" === y ? (g = +a.getAttribute("rx") || 0, h = +a.getAttribute("ry") || 0, e = +a.getAttribute("x") || 0, f = +a.getAttribute("y") || 0, m = (+a.getAttribute("width") || 0) - 2 * g, n = (+a.getAttribute("height") || 0) - 2 * h, g || h ? (o = e + g * (1 - z), p = e + g, q = p + m, r = q + g * z, s = q + g, t = f + h * (1 - z), u = f + h, v = u + n, w = v + h * z, x = v + h, c = "M" + s + "," + u + " V" + v + " C" + [s, w, r, x, q, x, q - (q - p) / 3, x, p + (q - p) / 3, x, p, x, o, x, e, w, e, v, e, v - (v - u) / 3, e, u + (v - u) / 3, e, u, e, t, o, f, p, f, p + (q - p) / 3, f, q - (q - p) / 3, f, q, f, r, f, s, t, s, u].join(",") + "z") : c = "M" + (e + m) + "," + f + " v" + n + " h" + -m + " v" + -n + " h" + m + "z") : "circle" === y || "ellipse" === y ? ("circle" === y ? (g = h = +a.getAttribute("r") || 0, k = g * z) : (g = +a.getAttribute("rx") || 0, h = +a.getAttribute("ry") || 0, k = h * z), e = +a.getAttribute("cx") || 0, f = +a.getAttribute("cy") || 0, j = g * z, c = "M" + (e + g) + "," + f + " C" + [e + g, f + k, e + j, f + h, e, f + h, e - j, f + h, e - g, f + k, e - g, f, e - g, f - k, e - j, f - h, e, f - h, e + j, f - h, e + g, f - k, e + g, f].join(",") + "z") : "line" === y ? c = "M" + a.getAttribute("x1") + "," + a.getAttribute("y1") + " L" + a.getAttribute("x2") + "," + a.getAttribute("y2") : ("polyline" === y || "polygon" === y) && (l = (a.getAttribute("points") + "").match(d) || [], e = l.shift(), f = l.shift(), c = "M" + e + "," + f + " L" + l.join(","), "polygon" === y && (c += "," + e + "," + f + "z")), i.setAttribute("d", c), b && a.parentNode && (a.parentNode.insertBefore(i, a), a.parentNode.removeChild(a)), i) : a
        },
        F = function (a, b) {
            var c, e;
            return ("string" != typeof a || (a.match(d) || []).length < 3) && (c = f.selector(a), c && c[0] ? (c = c[0], e = c.nodeName.toUpperCase(), b && "PATH" !== e && (c = E(c, !1), e = "PATH"), a = c.getAttribute("PATH" === e ? "d" : "points") || "") : (g("WARNING: invalid morph to: " + a), a = !1)), a
        },
        G = "Use MorphSVGPlugin.convertToPath(elementOrSelectorText) to convert to a path before morphing.",
        H = _gsScope._gsDefine.plugin({
            propName: "morphSVG",
            API: 2,
            global: !0,
            version: "0.3.1",
            init: function (a, b, c) {
                var d, f, h, i, j;
                return "function" != typeof a.setAttribute ? !1 : (d = a.nodeName.toUpperCase(), j = "POLYLINE" === d || "POLYGON" === d, "PATH" === d || j ? (f = "PATH" === d ? "d" : "points", ("string" == typeof b || b.getBBox) && (b = {
                    shape: b
                }), i = F(b.shape || b.d || b.points || "", "d" === f), j && e.test(i) ? (g("WARNING: a <" + d + "> cannot accept path data. " + G), !1) : (i && (this._target = a, h = this._addTween(a, "setAttribute", a.getAttribute(f) + "", i + "", "morphSVG", !1, f, "d" === f ? y(b.shapeIndex, b.map) : C(b.shapeIndex)), h && (this._overwriteProps.push("morphSVG"), h.end = i, h.endProp = f)), !0)) : (g("WARNING: cannot morph a <" + d + "> SVG element. " + G), !1))
            },
            set: function (a) {
                var b;
                if (this._super.setRatio.call(this, a), 1 === a)
                    for (b = this._firstPT; b;) b.end && this._target.setAttribute(b.endProp, b.end), b = b._next
            }
        });
    H.pathFilter = x, H.pointsFilter = B, H.subdivideRawBezier = k, H.pathDataToRawBezier = function (a) {
        return j(F(a, !0))
    }, H.equalizeSegmentQuantity = w, H.convertToPath = function (a, b) {
        "string" == typeof a && (a = f.selector(a));
        for (var c = a && 0 !== a.length ? a.length && a[0] && a[0].nodeType ? Array.prototype.slice.call(a, 0) : [a] : [], d = c.length; --d > -1;) c[d] = E(c[d], b !== !1);
        return c
    }, H.pathDataToBezier = function (a, b) {
        var c, d, e, f, g, h, i = j(F(a, !0))[0] || [];
        if (b = b || {}, f = b.matrix, c = [], e = i.length, f)
            for (b.relative && (f = f.slice(0), f[4] -= i[0], f[5] -= i[1]), d = 0; e > d; d += 2) c.push({
                x: i[d] * f[0] + i[d + 1] * f[2] + f[4],
                y: i[d] * f[1] + i[d + 1] * f[3] + f[5]
            });
        else
            for (g = b.offsetX || 0, h = b.offsetY || 0, b.relative && (g -= i[0], h -= i[1]), d = 0; e > d; d += 2) c.push({
                x: i[d] + g,
                y: i[d + 1] + h
            });
        return c
    }
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()();
var swiper;
(function () {
    var e;
    e = window.jQuery || window.Zepto || window.$, e.fn.fancySelect = function (n) {
        var t, r;
        return null == n && (n = {}), r = e.extend({
            forceiOS: !1,
            includeBlank: !1,
            optionTemplate: function (e) {
                return e.text()
            },
            triggerTemplate: function (e) {
                return e.text()
            }
        }, n), t = !!navigator.userAgent.match(/iP(hone|od|ad)/i), this.each(function () {
            var n, s, i, o, a, l, d;
            return o = e(this), o.hasClass("fancified") || "SELECT" !== o[0].tagName ? void 0 : (e("body").on("click", function (n) {
                e(".fancy-select > .trigger.open").length >= 1 && e(".fancy-select > .trigger.open").not(e(n.target)).trigger("close.fs")
            }), o.addClass("fancified"), o.css({
                width: 1,
                height: 1,
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0
            }), o.wrap('<div class="fancy-select">'), d = o.parent(), o.data("class") && d.addClass(o.data("class")), d.append('<div class="trigger">'), (!t || r.forceiOS) && d.append('<ul class="options">'), a = d.find(".trigger"), i = d.find(".options"), s = o.prop("disabled"), s && d.addClass("disabled"), l = function () {
                var e;
                return e = r.triggerTemplate(o.find(":selected")), a.html(e)
            }, o.on("blur.fs", function () {
                return a.hasClass("open") ? setTimeout(function () {
                    return a.trigger("close.fs")
                }, 120) : void 0
            }), a.on("close.fs", function () {
                return a.removeClass("open"), i.removeClass("open")
            }), a.on("click.fs", function () {
                var n, l;
                if (!s)
                    if (a.toggleClass("open"), t && !r.forceiOS) {
                        if (a.hasClass("open")) return o.focus()
                    } else a.hasClass("open") && (l = a.parent(), n = l.offsetParent(), l.offset().top + l.outerHeight() + i.outerHeight() + 20 > e(window).height() + e(window).scrollTop() ? i.addClass("overflowing") : i.removeClass("overflowing")), i.toggleClass("open")
            }), o.on("enable", function () {
                return o.prop("disabled", !1), d.removeClass("disabled"), s = !1, n()
            }), o.on("disable", function () {
                return o.prop("disabled", !0), d.addClass("disabled"), s = !0
            }), o.on("change.fs", function (e) {
                return e.originalEvent && e.originalEvent.isTrusted ? e.stopPropagation() : l()
            }), o.on("keydown", function (e) {
                var n, t, r;
                if (r = e.which, n = i.find(".hover"), n.removeClass("hover"), i.hasClass("open")) {
                    if (38 === r ? (e.preventDefault(), n.length && n.index() > 0 ? n.prev().addClass("hover") : i.find("li:last-child").addClass("hover")) : 40 === r ? (e.preventDefault(), n.length && n.index() < i.find("li").length - 1 ? n.next().addClass("hover") : i.find("li:first-child").addClass("hover")) : 27 === r ? (e.preventDefault(), a.trigger("click.fs")) : 13 === r || 32 === r ? (e.preventDefault(), n.trigger("click.fs")) : 9 === r && a.hasClass("open") && a.trigger("close.fs"), t = i.find(".hover"), t.length) return i.scrollTop(0), i.scrollTop(t.position().top - 12)
                } else if (13 === r || 32 === r || 38 === r || 40 === r) return e.preventDefault(), a.trigger("click.fs")
            }), i.on("click.fs", "li", function (n) {
                var r;
                return r = e(this), o.val(r.data("raw-value")), t || o.trigger("blur.fs").trigger("focus.fs"), i.find(".selected").removeClass("selected"), r.addClass("selected"), o.val(r.data("raw-value")).trigger("change.fs").trigger("blur.fs").trigger("focus.fs")
            }), i.on("mouseenter.fs", "li", function () {
                var n, t;
                return t = e(this), n = i.find(".hover"), n.removeClass("hover"), t.addClass("hover")
            }), i.on("mouseleave.fs", "li", function () {
                return i.find(".hover").removeClass("hover")
            }), n = function () {
                var n;
                return l(), !t || r.forceiOS ? (n = o.find("option"), o.find("option").each(function (n, t) {
                    var s;
                    return t = e(t), t.prop("disabled") || !t.val() && !r.includeBlank ? void 0 : (s = r.optionTemplate(t), t.prop("selected") ? i.append('<li data-raw-value="' + t.val() + '" class="selected">' + s + "</li>") : i.append('<li data-raw-value="' + t.val() + '">' + s + "</li>"))
                })) : void 0
            }, o.on("update.fs", function () {
                return d.find(".options").empty(), n()
            }), n())
        })
    }
}).call(this);
(function ($) {
    $('head').append('<style type="text/css">.sn-pxg .pxg-set{user-select:none;-moz-user-select:none;-webkit-user-select:none;}.sn-pxg span.pxg-source{position:relative;display:inline-block;z-index:2;}.sn-pxg U.pxg-set,.sn-pxg U.pxg-set S,.sn-pxg U.pxg-set S B{left:0;right:0;top:0;bottom:0;height:inherit;width:inherit;position:absolute;display:inline-block;text-decoration:none;font-weight:inherit;}.sn-pxg U.pxg-set S{overflow:hidden;}.sn-pxg U.pxg-set{text-decoration:none;z-index:1;display:inline-block;position:relative;}</style>')
    $.fn.pxgradient = function (options) {
        var options = $.extend({
            step: 10,
            colors: ["#ffcc00", "#cc0000", "#000000"],
            dir: "y"
        }, options);
        options.RGBcolors = [];
        for (var i = 0; i < options.colors.length; i++) {
            options.RGBcolors[i] = hex2Rgb(options.colors[i]);
        }
        return this.each(function (i, e) {
            var pxg = $(e);
            if (!pxg.hasClass("sn-pxg")) {
                var pxg_source = pxg.html();
                pxg.html('<span class="pxg-source" style="visibility: hidden;">' + pxg_source + '</span>').append('<u class="pxg-set"></u>');
                var pxg_set = pxg.find(".pxg-set");
                var pxg_text = pxg.find(".pxg-source");
                var pxg_w = pxg.find(".pxg-source").parent().innerWidth();
                var pxg_h = pxg.find(".pxg-source").parent().innerHeight();
                pxg_text.hide();
                pxg.addClass("sn-pxg");
                if (options.dir == "x") {
                    var blocksize = pxg_w;
                } else if (options.dir == "y") {
                    var blocksize = pxg_h;
                }
                var fullsteps = Math.floor(blocksize / options.step);
                var allsteps = fullsteps;
                var laststep = (blocksize - (fullsteps * options.step));
                if (laststep > 0) {
                    allsteps++;
                }
                pxg_set.css({
                    width: pxg_w,
                    height: pxg_h
                });
                var offleft = 0;
                var pxg_set_html = '';
                if (options.dir == "x") {
                    for (var i = 0; i < allsteps; i++) {
                        var color = getColor(offleft, blocksize);
                        pxg_set_html += '<s style="height:' + pxg_h + 'px;width:' + options.step + 'px;left:' + offleft + 'px;color:' + color + '"><b style="left:-' + offleft + 'px;width:' + pxg_w + 'px;height:' + pxg_h + 'px;">' + pxg_source + '</b></s>';
                        offleft = offleft + options.step;
                    }
                } else if (options.dir == "y") {
                    for (var i = 0; i < allsteps; i++) {
                        var color = getColor(offleft, blocksize);
                        pxg_set_html += '<s style="width:' + pxg_w + 'px;height:' + options.step + 'px;top:' + offleft + 'px;color:' + color + '"><b style="top:-' + offleft + 'px;height:' + pxg_w + 'px;height:' + pxg_h + 'px;">' + pxg_source + '</b></s>';
                        offleft = offleft + options.step;
                    }
                }
                pxg_set.append(pxg_set_html);
            }
        });

        function hex2Rgb(hex) {
            if ('#' == hex.substr(0, 1)) {
                hex = hex.substr(1);
            }
            if (3 == hex.length) {
                hex = hex.substr(0, 1) + hex.substr(0, 1) + hex.substr(1, 1) + hex.substr(1, 1) + hex.substr(2, 1) + hex.substr(2, 1);
            }
            return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
        }

        function rgb2Hex(rgb) {
            var s = '0123456789abcdef';
            return '#' + s.charAt(parseInt(rgb[0] / 16)) + s.charAt(rgb[0] % 16) + s.charAt(parseInt(rgb[1] / 16)) + s.charAt(rgb[1] % 16) + s.charAt(parseInt(rgb[2] / 16)) + s.charAt(rgb[2] % 16);
        }

        function getColor(off, blocksize) {
            var fLeft = (off > 0) ? (off / blocksize) : 0;
            for (var i = 0; i < options.colors.length; i++) {
                fStopPosition = (i / (options.colors.length - 1));
                fLastPosition = (i > 0) ? ((i - 1) / (options.colors.length - 1)) : 0;
                if (fLeft == fStopPosition) {
                    return options.colors[i];
                } else if (fLeft < fStopPosition) {
                    fCurrentStop = (fLeft - fLastPosition) / (fStopPosition - fLastPosition);
                    return getMidColor(options.RGBcolors[i - 1], options.RGBcolors[i], fCurrentStop);
                }
            }
            return options.colors[options.colors.length - 1];
        }

        function getMidColor(aStart, aEnd, fMidStop) {
            var aRGBColor = [];
            for (var i = 0; i < 3; i++) {
                aRGBColor[i] = aStart[i] + Math.round((aEnd[i] - aStart[i]) * fMidStop)
            }
            return rgb2Hex(aRGBColor)
        }
    }
})(jQuery);
var isTouchDevice = 'ontouchstart' in document.documentElement;
var arrBlub = ['M241.6,0.4c59.797,0,71.2,40.6,104.601,73.8c33.399,33.2,40.2,33.8,53,33.8s40.2-30,55.2-1.8S427.8,131.6,421.8,151.2c-6,19.6,8.601,90.6,8.601,117.6c0,48.8-31,67.8-64,114s-47,80.2-69.2,96.8c-22.2,16.601-63.2,53-102.2,53S146.8,501.4,131.8,475.2C97.8,406.667,47,366.6,47,301.2c0-65.4,66-103.4,89.2-150.2S158-0.8,241.6,0.4z', 'M275.8,20.8c41,0,62.4,22.4,117,56.2C447.4,110.8,480,97.4,480,135.2  c0,26.133-17,33.2-17,71.399c0,80.534-51,100.801-67.4,133c-16.399,32.2,2.601,61.601-25.399,83c-28,21.4-37.2-2-99.8,41c-62.601,43-82.2,41-131.4,24s-67.4-22.199-85.8-83C34.8,343.8,8,329.6,8,260.2c0-69.4,11.4-70.8,11.4-101.4c0-30.6-31.2-42-14-66.6c13.533-18.601,37.2,3.2,57,1C82.2,91,221.8,20.8,275.8,20.8z', 'M465.003,253.059c0,74.94-32.45,89.232-58.986,131.091c-26.536,41.858-27.016,50.381-27.016,66.423c0,16.041,23.979,50.381,1.438,69.181c-22.539,18.799-20.302-33.338-35.967-40.857s-72.414,10.778-93.994,10.778c-39.004,0-54.191-38.851-91.117-80.208c-36.927-41.358-64.102-58.903-77.37-86.726c-13.27-27.822-42.362-79.206-42.362-128.083c0-48.877,24.937-60.409,45.878-79.208C140.285,72.839,172.31,9.174,224.582,9.174c52.273,0,82.645,82.716,120.051,111.792C382.038,150.041,465.962,148.287,465.003,253.059z', 'M211.344,521.88c-33.052,0-50.304-23.712-94.321-59.491c-44.015-35.78-70.297-21.596-70.297-61.609c0-27.663,13.705-35.145,13.705-75.581c0-85.25,41.114-106.705,54.335-140.79c13.22-34.085-2.097-65.208,20.476-87.86c22.572-22.654,29.989,2.116,80.455-43.401c50.466-45.519,66.266-43.401,105.929-25.406s54.336,23.499,69.168,87.86c14.834,64.36,36.439,79.393,36.439,152.857c0,73.465-9.189,74.946-9.189,107.339c0,32.392,25.151,44.46,11.285,70.5c-10.909,19.689-29.989-3.388-45.95-1.059C367.417,447.568,254.876,521.88,211.344,521.88z', 'M264.096,468.628c-11.725,15.647-8.302,46.214-28.521,48.605c-26.382,2.577-18.52-29.296-40.363-44.154c-21.845-14.859-28.691-5.916-78.234-39.613c-49.543-33.7-45.934-63.221-79.899-108.276C3.111,280.133,8.736,262.243,21.835,212.452c13.099-49.791,21.724-67.308,84.529-99.277c62.804-31.971,50.818-51.1,80.457-64.346c29.637-13.249,40.881,17.068,72.278,18.858c31.398,1.79,72.024-31.425,129.516,7.68c27.271,18.548,41.033,7.628,59.689,20.317c26.984,18.354,0.697,39.371-3.177,101.877c-3.877,62.508,1.138,91.451-19.892,126.064C397.539,369.212,275.823,452.981,264.096,468.628z'];
var scene;
var end;
var swiper;
var offsetTop = 0;
var totalHeight = parseInt((jQuery('.works-row').length - 1) * jQuery(window).height());
var _wHeight = jQuery(window).height();
var sceneInfo11, sceneInfo21, sceneInfo31, sceneInfo41, controller20191 = new ScrollMagic.Controller();
var swipe = false;
if (isTouchDevice) {
    swipe = true;
}

function setCaseStudySize() {
    if (jQuery('.works').length) {
        if (jQuery(window).width() < 801) {
            jQuery('.works-row-in .work').each(function () {
                jQuery(this).css('height', jQuery(window).height() + 'px');
            });
        } else {
            var csWidth = 0;
            var csHeight = 0;
            var csOffset = 0;
            jQuery('.works-row .work').each(function () {
                if (jQuery(this).hasClass('right-work')) {
                    jQuery(this).css({
                        'width': '',
                        'height': '',
                        'right': 0
                    });
                } else {
                    jQuery(this).css({
                        'width': '',
                        'height': '',
                        'left': 0
                    });
                }
                jQuery(this).find('.poster').css({
                    'width': '',
                    'height': ''
                });
            });
            if (parseInt(jQuery('.works-row .work').first().width()) / 763 < parseInt(jQuery('.works-row .work').first().height()) / 1036) {
                csWidth = parseInt(jQuery('.works-row .work').first().width());
                csHeight = Math.round(parseInt(jQuery('.works-row .work').first().width()) * 1.35);
            } else {
                csWidth = Math.round(parseInt(jQuery('.works-row .work').first().height()) * 0.73);
                csHeight = parseInt(jQuery('.works-row .work').first().height());
            }
            if (jQuery(window).width() < 1280) {
                csOffset = parseInt(jQuery('#header .inner').css('padding-left'));
            } else {
                csOffset = (parseInt(jQuery('.works-row').first().width()) / 2 - csWidth) / 2;
            }
            jQuery('.works-row .work').each(function () {
                if (jQuery(this).hasClass('right-work')) {
                    jQuery(this).css({
                        'width': csWidth + 'px',
                        'height': csHeight + 'px',
                        'right': csOffset + 'px'
                    });
                } else {
                    jQuery(this).css({
                        'width': csWidth + 'px',
                        'height': csHeight + 'px',
                        'left': csOffset + 'px'
                    });
                }
                jQuery(this).find('.poster').css({
                    'width': csWidth + 'px',
                    'height': csHeight + 'px',
                });
            });
        }
    }
}

function caseStudyParallax(p) {
    if (jQuery('.page-template-work-new-page').length) {
        var i = 0;
        jQuery(".page-template-work-new-page .works-row").each(function () {
            var _top = _wHeight * i;
            if (p * (-1) + _wHeight * 1.2 > _top) {
                _d = p * (-1) + _wHeight * 1.2 - _top;
                kof = 50 - _d * 0.05;
                jQuery(this).find('.poster-in').css({
                    '-webkit-transform': 'translate(0,' + kof + 'px)',
                    'transform': 'translate(0,' + kof + 'px)',
                });
            }
            i++;
        });
    }
}

function setScrollheight() {
    if (jQuery('.vertical-slider2').length) {
        if (jQuery(window).width() < 1024 && jQuery('.is-tablet').length && jQuery(window).width() > jQuery(window).height()) {
            var h = jQuery(window).height() * jQuery('.works-row').length - jQuery('.vertical-slider2').offset().top * 2;
            jQuery('.fake-height').css('height', h + 'px');
        } else if (jQuery(window).width() < 1024 && jQuery('.is-tablet').length) {
            var h = jQuery(window).height() * allCS - jQuery('.vertical-slider2').offset().top * 2 + 70;
            jQuery('.fake-height').css('height', h + 'px');
        } else if (jQuery(window).width() < 768) {
            var h = jQuery(window).height() * allCS - jQuery('.vertical-slider2').offset().top * 2 + 70;
            jQuery('.fake-height').css('height', h + 'px');
        } else {
            var h = jQuery(window).height() * jQuery('.works-row').length - jQuery('.vertical-slider2').offset().top * 2;
            jQuery('.fake-height').css('height', h + 'px');
        }
        scrollHeight = jQuery('.vertical-slider2').height();
    }
}
var rtime;
var timeout = false;
var delta = 200;
var resizeFlag = false;
var _t = 0;
jQuery(window).resize(function () {
    resizeFlag = true;
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
    updateInfoScenes1()
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        resizeFlag = false;
        if (jQuery('.vertical-slider2').length) {
            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _t + '%');
        }
    }
}

function updateCaseStudyPositions() {
    if (jQuery('.works').length) {
        if (jQuery(window).width() < 1024 && jQuery('.is-tablet').length) {
            var _posTL = Math.ceil(_t / 10) - 1;
            TweenLite.to('.works-timing', 0.5, {
                z: '0%',
                onComplete: function () {
                    jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _posTL * _wHeight + 'px');
                    jQuery('.works').removeClass('resized');
                    unClickFlag = true;
                    jQuery('.works-row-in-duplicated .work .work-in').css('margin-top', '');
                }
            });
        } else if (jQuery('.is-tablet').length) {
            var _posT = Math.ceil(_t / 20) - 1;
            if (jQuery('.mCSB_dragger_bar i').attr('data-current') % 2 == 0) {
                var _posT = jQuery('.mCSB_dragger_bar i').attr('data-current') / 2;
            } else {
                var _posT = Math.ceil(jQuery('.mCSB_dragger_bar i').attr('data-current') / 2);
            }
            TweenLite.to('.works-timing', 0.5, {
                z: '0%',
                onComplete: function () {
                    jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _posT * _wHeight + 'px');
                    jQuery('.works').removeClass('resized');
                    unClickFlag = true;
                    jQuery('.works-row-in-duplicated .work .work-in').css('margin-top', '');
                }
            });
        } else {
            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _t + '%');
        }
        var step = 100 / (jQuery('.works .works-row').length - 1);
        var percent = (jQuery('.vertical-slider2').height() / 2 - 70) / 50;
        jQuery('.vertical-slider2 .point').remove();
        var stepTotal = 0;
        var _o = jQuery('.vertical-slider2').offset().top;
        for (k = 0; k <= jQuery('.works .works-row').length; k++) {
            if (k == jQuery('.works .works-row').length) {
                _step = 100 * percent + 70;
                _s = Math.round((_step + _o) / 17) * 17 - _o + 1;
                jQuery('.vertical-slider2').append('<em class="point" style="top:' + _s + 'px" data-count="k"></em>');
            } else {
                if (stepTotal < 95) {
                    _step = stepTotal * percent + 70;
                    _s = Math.round((_step + _o) / 17) * 17 - _o + 1;
                    jQuery('.vertical-slider2').append('<em class="point" style="top:' + _s + 'px" data-count="k"></em>');
                }
            }
            stepTotal += step;
        }
    }
}

function convertVhToPx() {
    if (isTouchDevice) {
        jQuery('.works, .works-row').css('height', _wHeight + 'px');
    }
}

function evenWidth() {
    if (jQuery('body.page-template-work-new-page').length && !isTouchDevice) {
        var pageW = jQuery(window).width();
        if (pageW % 2 != 0) {
            pageW = pageW - 1;
        }
        jQuery('#page').css('width', pageW + 'px');
    }
}
var stopFlag = false;
var unClickFlag = false;
var swipeFlag = false;
document.ontouchmove = function (event) {
    if (!jQuery('body.page-template-work-new-page .works-ready').length && jQuery('body.page-template-work-new-page').length) {
        event.preventDefault();
    }
}

function roundDigitalSizes() {
    jQuery('.layer-b,.layer-c,.layer-d,.layer-e').each(function () {
        jQuery(this).css({
            'left': '',
            'width': ''
        });
        jQuery(this).css({
            'left': Math.ceil(parseInt(jQuery(this).css('left'))) + 'px',
            'width': Math.ceil(jQuery(this).width()) + 'px'
        });
    })
}
// var baseUrl=jQuery("#base-url").text();
var baseUrl = window.location.protocol + '//' + window.location.host + '/'
var bannerImages = [baseUrl + 'wp-content/uploads/2016/05/agency-top-3.jpg', baseUrl + 'wp-content/uploads/2016/05/bg-contact-top.png', baseUrl + 'images/banner-mask.png', baseUrl + 'images/paint-2.png', baseUrl + 'images/pattern.jpg', baseUrl + 'images/intro-03.png', baseUrl + 'images/blog-bg.jpg', baseUrl + 'wp-content/uploads/2016/06/services-top.jpg'];

function loadBannerImages() {
    for (i = 0; i < bannerImages.length; i++) {
        var tmpImg = new Image();
        tmpImg.src = bannerImages[i];
    }
}
jQuery(document).ready(function () {
    jQuery('body').on('click', '.which_social li', function (e) {
        jQuery('.which_social select').trigger('change');
    });
    if (jQuery('.bg-digital').length) {
        jQuery('.bg-digital')[0].play();
    }
    if (jQuery('.bgvid').length) {
        jQuery('.bgvid')[0].play();
    }
    document.addEventListener('wpcf7submit', function (event) {
        if ('4' == event.detail.contactFormId) {
            var d = new Date();
            var m = d.getMonth() * 1 + 1;
            var t = m + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
            jQuery('.time input').val(t);
        }
    }, false);
    document.addEventListener('wpcf7mailsent', function (event) {
        if ('4' == event.detail.contactFormId) {
            setTimeout(function () {
                jQuery(".badget-list input").trigger('change');
            }, 100);
            window.location.href = jQuery('#logo a').attr('href') + 'thank-you/';
        }
        if ('8536' == event.detail.contactFormId) {
            setTimeout(function () {
                jQuery(".badget-list input").trigger('change');
            }, 100);
            window.location.href = jQuery('#logo a').attr('href') + 'thanks-alot/';
        }
    }, false);
    document.addEventListener('wpcf7mailsent', function (event) {
        if ('102' == event.detail.contactFormId) {
            window.location.href = jQuery('#logo a').attr('href') + 'contact/';
            localStorage.setItem("email", jQuery('input[name="your-email"]').val());
            localStorage.setItem("title", jQuery('input[name="your-title"]').val());
            localStorage.setItem("name", jQuery('input[name="your-name"]').val());
        }
    }, false);
    jQuery('.entry-content iframe[src*="youtube"]').each(function () {
        jQuery(this).wrap('<div class="video-wrapper" />');
    });
    if (jQuery('.page-template-service-page').length) {
        if (jQuery("[data-src]").length) {
            jQuery("[data-src]").each(function () {
                jQuery(this).attr('src', jQuery(this).attr("data-src"));
            });
        }
    }
    if (typeof jQuery('.protected').attr('data-bg') !== 'undefined') {
        var tmpImg = new Image();
        tmpImg.src = jQuery('.protected').attr('data-bg') + '?key=' + Math.random();
        tmpImg.onload = function () {
            jQuery('.protected').addClass('show');
        };
        jQuery('.protected').submit(function (e) {
            var link = jQuery("#base-url").text();
            if (jQuery(this).hasClass('protected-kkb')) {
                jQuery.ajax({
                    type: "POST",
                    url: link + "wp-admin/admin-ajax.php",
                    data: 'action=check_psw_kkb&psw=' + jQuery('.protected input[type=password]').val(),
                    success: function (html) {
                        if (html == 1) {
                            jQuery.cookie("protected_kkb", 1, {
                                expires: 2,
                                path: '/'
                            });
                            jQuery('.protected input[type=password]').removeClass('error');
                            window.location.reload();
                        } else {
                            jQuery('.protected input[type=password]').addClass('error');
                        }
                    }
                });
            } else {
                jQuery.ajax({
                    type: "POST",
                    url: link + "wp-admin/admin-ajax.php",
                    data: 'action=check_psw&psw=' + jQuery('.protected input[type=password]').val(),
                    success: function (html) {
                        if (html == 1) {
                            jQuery.cookie("protected", 1, {
                                expires: 2,
                                path: '/'
                            });
                            jQuery('.protected input[type=password]').removeClass('error');
                            window.location.reload();
                        } else {
                            jQuery('.protected input[type=password]').addClass('error');
                        }
                    }
                });
            }
            return false;
            e.preventDefault();
        });
    }
    jQuery('.submit-box').click(function () {
        var d = new Date();
        var m = d.getMonth() * 1 + 1;
        var t = m + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        jQuery('.time input').val(t);
    });
    jQuery('.digital .arrows').click(function () {
        jQuery('html,body').animate({
            scrollTop: jQuery('.hero-carousel').offset().top + 'px'
        }, 750);
    });
    if ((!jQuery('#skip').length && jQuery("video.bg-digital").length) || (jQuery.cookie("intro") && jQuery('.home').length)) {
        jQuery('.video-elements,.mobile-intro').remove();
        if (isTouchDevice) {
            jQuery('.digital').addClass('animate');
            TweenMax.to(jQuery('.layer-b')[0], 2, {
                x: '-8rem',
                roundProps: "x,y",
                delay: .5
            });
            TweenMax.to(jQuery('.layer-c')[0], 2, {
                x: '-6rem',
                roundProps: "x,y",
                delay: .2
            });
            TweenMax.to(jQuery('.layer-d')[0], 2, {
                x: '7.3rem',
                roundProps: "x,y",
                delay: .3
            });
            TweenMax.to(jQuery('.layer-e')[0], 2, {
                x: '6rem',
                roundProps: "x,y",
                delay: .4
            });
            TweenMax.to(jQuery('.layer-b')[0], .35, {
                opacity: 1,
                roundProps: "x,y",
                delay: .5
            });
            TweenMax.to(jQuery('.layer-c')[0], .35, {
                opacity: 1,
                roundProps: "x,y",
                delay: .2
            });
            TweenMax.to(jQuery('.layer-d')[0], .35, {
                opacity: 1,
                roundProps: "x,y",
                delay: .3
            });
            TweenMax.to(jQuery('.layer-e')[0], .35, {
                opacity: 1,
                roundProps: "x,y",
                delay: .4
            });
            setTimeout(function () {
                jQuery('.digital .line-white').addClass('ready');
            }, 2000);
            setTimeout(function () {
                jQuery('.digital .line-white').addClass('ready');
            }, 3000);
        }
        roundDigitalSizes();
        digitalAnimation();
        var digital;
        jQuery('.digital').addClass('delay');

        function digitalAnimation() {
            digital = requestAnimationFrame(digitalAnimation);
            if (jQuery("video.bg-digital").length && jQuery("video.bg-digital")[0].currentTime > 0.2) {
                setTimeout(function () {
                    jQuery('.digital').addClass('animate');
                    TweenMax.to(jQuery('.layer-b')[0], 2, {
                        x: '-8rem',
                        roundProps: "x,y",
                        delay: .5
                    });
                    TweenMax.to(jQuery('.layer-c')[0], 2, {
                        x: '-6rem',
                        roundProps: "x,y",
                        delay: .2
                    });
                    TweenMax.to(jQuery('.layer-d')[0], 2, {
                        x: '7.3rem',
                        roundProps: "x,y",
                        delay: .3
                    });
                    TweenMax.to(jQuery('.layer-e')[0], 2, {
                        x: '6rem',
                        roundProps: "x,y",
                        delay: .4
                    });
                    TweenMax.to(jQuery('.layer-b')[0], .35, {
                        opacity: 1,
                        roundProps: "x,y",
                        delay: .5
                    });
                    TweenMax.to(jQuery('.layer-c')[0], .35, {
                        opacity: 1,
                        roundProps: "x,y",
                        delay: .2
                    });
                    TweenMax.to(jQuery('.layer-d')[0], .35, {
                        opacity: 1,
                        roundProps: "x,y",
                        delay: .3
                    });
                    TweenMax.to(jQuery('.layer-e')[0], .35, {
                        opacity: 1,
                        roundProps: "x,y",
                        delay: .4
                    });
                }, 800);
                setTimeout(function () {
                    jQuery('.digital').removeClass('delay');
                }, 3000);
                setTimeout(function () {
                    roundDigitalSizes();
                    loadBannerImages();
                    jQuery('.digital .line-white').addClass('ready');
                }, 3000);
                cancelAnimationFrame(digital);
            }
        }
        setTimeout(function () {
            roundDigitalSizes();
        }, 3000);
    } else {
        jQuery('.sign-circle, .sign-overlay').removeAttr('style');
        if (jQuery.cookie("showed-sign-up") === undefined && jQuery.cookie("showed-sign-up") != 1 && !jQuery('body.home').length && !jQuery('.protected').length) {
            setTimeout(function () {
                jQuery('.sign-circle, .sign-overlay').addClass('show');
                offsetTop = jQuery(window).scrollTop();
                jQuery("body,html").addClass('overlayed');
                jQuery("body #page").css('margin-top', '-' + offsetTop + 'px');
            }, 30000);
        }
    }
    jQuery('.no-thanks').click(function (e) {
        jQuery('.sign-circle, .sign-overlay').removeClass('show');
        jQuery("body,html").removeClass('overlayed');
        jQuery("body #page").removeAttr('style');
        jQuery("html, body").scrollTop(offsetTop);
        jQuery.cookie("showed-sign-up", 1, {
            expires: 30,
            path: '/'
        });
        e.preventDefault();
    });
    evenWidth();
    if (jQuery('body.page-template-work-new-page ').length) {
        jQuery('title').attr('data-origin', jQuery('title').text());
        jQuery(window).bind('popstate', function (event) {
            var state = event.originalEvent.state;
            if (state != null && document.location != jQuery('#logo a').attr('href') + 'work-prototype' && document.location != jQuery('#logo a').attr('href') + 'work') {
                if (!jQuery('.work-down').is(':visible')) {
                    window.location.href = document.location;
                } else {
                    jQuery('body').css('overflow-y', 'scroll');
                    if (jQuery('.prev-service').attr('href') == document.location) {
                        jQuery('#case-page').fadeOut(200, function () {
                            var _w = jQuery('.clickable[href="' + jQuery('.prev-service').attr('href') + '"]').first().parents('.work');
                            goToNextCS(_w, _w.next(), 'left-work', 0);
                        });
                    } else if (jQuery('.next-service').attr('href') == document.location) {
                        jQuery('#case-page').fadeOut(200, function () {
                            var _w = jQuery('.clickable[href="' + jQuery('.next-service').attr('href') + '"]').first().parents('.work');
                            goToNextCS(_w, _w.prev(), 'right-work', 0);
                        });
                    }
                }
            } else {
                if (jQuery('.case-menu.showed').length) {
                    jQuery('.works-back').trigger('click');
                } else {
                    history.back();
                }
            }
        });
    } else if (jQuery('.single-work').length) {
        jQuery(window).bind('popstate', function (event) {
            var state = event.originalEvent.state;
            if (state != null) {
                jQuery('body').css('overflow-y', 'scroll');
                if (jQuery('.prev-service').attr('href') == document.location) {
                    jQuery('#case-page').fadeOut(200, function () {
                        goToNextCSSingle(jQuery('.prev-service').attr('href'));
                    });
                } else if (jQuery('.next-service').attr('href') == document.location) {
                    jQuery('#case-page').fadeOut(200, function () {
                        goToNextCSSingle(jQuery('.next-service').attr('href'));
                    });
                }
            }
        });
    }
    if (jQuery('.hero-carousel #blub').length) {
        var b = 0;

        function drawBlub() {
            TweenLite.to('.hero-carousel #blub', 2.3, {
                morphSVG: arrBlub[b],
                onComplete: function () {}
            });
            TweenLite.to('.hero-carousel #blub', 1.8, {
                x: 0,
                onComplete: function () {
                    b++;
                    if (b == arrBlub.length) {
                        b = 0;
                    }
                    drawBlub();
                }
            });
        }
        drawBlub();
    }
    if (jQuery('.works').length) {
        convertVhToPx();
        var stepsReverse = [];
        allCS = jQuery('.works .work').length;
        totalHeight = parseInt((jQuery('.works-row').length - 1) * jQuery(window).height());
        jQuery('body').addClass('on-init');
        jQuery(".vertical-slider2").mCustomScrollbar({
            scrollButtons: {
                enable: false
            },
            mouseWheel: {
                enable: false
            },
            scrollEasing: "linear",
            autoDraggerLength: false,
            setTop: totalHeight * (-0.5) + 'px',
            scrollInertia: (jQuery(window).width() < 768) ? 750 : 950,
            callbacks: {
                onCreate: function () {
                    jQuery('body').on('click', '.mCSB_dragger_bar', function (e) {
                        unClickFlag = true;
                        stopFlag = true;
                        jQuery('.mCSB_dragger_bar').removeClass('overed');
                    });
                    setScrollheight();
                    jQuery('.mCSB_dragger_bar').html('<i data-text="DRAG \n AND DROP" data-hover="2 of 16"></i><em></em><b></b>');
                    jQuery('.mCSB_dragger_bar i').attr('data-hover', '2 of ' + allCS);
                    jQuery('.mCSB_dragger_bar i').attr('data-total', allCS);
                    jQuery('.mCSB_dragger_bar i').attr('data-current', 1);
                    var step = 100 / (jQuery('.works .works-row').length - 1);
                    var percent = (jQuery('.vertical-slider2').height() / 2 - 70) / 50;
                    step = step.toFixed(1) * 1;
                    var stepTotal = 0;
                    var _o = jQuery('.vertical-slider2').offset().top;
                    for (k = 0; k <= jQuery('.works .works-row').length; k++) {
                        if (k == jQuery('.works .works-row').length) {
                            _step = 100 * percent + 70;
                            _s = Math.round((_step + _o) / 17) * 17 - _o + 1;
                            jQuery('.vertical-slider2').append('<em class="point" style="top:' + _s + 'px" data-count="k"></em>');
                        } else {
                            if (stepTotal < 95) {
                                _step = stepTotal * percent + 70;
                                _s = Math.round((_step + _o) / 17) * 17 - _o + 1;
                                jQuery('.vertical-slider2').append('<em class="point" style="top:' + _s + 'px" data-count="k"></em>');
                            }
                            steps.push(Math.floor(stepTotal));
                            stepsReverse.push(Math.floor(stepTotal));
                        }
                        stepTotal += step;
                    }
                    stepsReverse = stepsReverse.reverse();
                    setCaseStudySize();
                    jQuery('.vertical-slider-wrap2').addClass('ready');
                    if (jQuery(window).width() < 1024 && jQuery('.is-tablet').length) {
                        jQuery('.works-row .work').each(function () {
                            jQuery(this).css('height', _wHeight + 'px');
                        });
                    }
                },
                onInit: function () {
                    if (jQuery(window).width() < 768) {
                        jQuery('.poster-in').each(function () {
                            jQuery(this).attr('style', jQuery(this).attr('data-mobile'))
                        });
                    }
                    TweenLite.to('.works-timing', 0.5, {
                        x: '0%',
                        onComplete: function () {
                            jQuery('body').addClass('fade-in');
                            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", '0%');
                        }
                    });
                    TweenLite.to('.works-timing', 1.6, {
                        y: '0%',
                        onComplete: function () {
                            jQuery('body').removeClass('fade-in on-init');
                            jQuery('.disable-hover').remove();
                            jQuery('.clickable').each(function () {
                                downloadingImage = new Image();
                                downloadingImage.src = jQuery(this).attr('data-video-poster');
                            });
                        }
                    });
                },
                onScrollStart: function () {
                    stopFlag = false;
                    unClickFlag = false;
                },
                onScroll: function () {
                    stopFlag = true;
                    if (jQuery(window).width() > 767) {
                        scrollToPoint();
                    }
                    if (!resizeFlag) {
                        _t = scrollPosition;
                    }
                    swipeFlag = false;
                    isScrolled = false;
                },
                whileScrolling: function () {
                    dragScrollPosition = Math.round(this.mcs.draggerTop * 100 / (scrollHeight - 140));
                    isScrolled = true;
                    var draggerTop = this.mcs.draggerTop + 118;
                    var r = 0;
                    jQuery('.point').each(function () {
                        if (draggerTop > parseInt(jQuery(this).css('top'))) {
                            r = jQuery(this).index();
                        }
                    })
                    jQuery('.mCSB_dragger_bar i').attr('data-hover', r * 2 + ' of ' + allCS);
                    if (!swipeFlag) {
                        var _mStep = Math.round(100 / (allCS - 1));
                        jQuery('.mCSB_dragger_bar i').attr('data-current', Math.ceil((dragScrollPosition - 7) / _mStep) + 1);
                    }
                    scrollPosition = this.mcs.topPct;
                    if (scrollPosition != scrollPosition2) {
                        if (scrollPosition > scrollPosition2) {
                            dragDirection = 'bottom';
                        } else {
                            dragDirection = 'up';
                        }
                        scrollPosition2 = this.mcs.topPct;
                    }
                    jQuery('.works-row .work').css({
                        '-webkit-transform': 'translate(0,' + this.mcs.top + 'px)',
                        'transform': 'translate(0,' + this.mcs.top + 'px)',
                    });
                    caseStudyParallax(this.mcs.top);
                },
                alwaysTriggerOffsets: false
            }
        });

        function scrollToPoint() {
            if (stopFlag && unClickFlag) {
                if (jQuery(window).width() < 768 || (jQuery(window).width() < 1024 && jQuery('.is-tablet').length && jQuery(window).height() > jQuery(window).width())) {
                    _pos = jQuery('.mCSB_dragger_bar i').attr('data-current') * 1 - 1;
                    if (_pos < 0) {
                        _pos = 1;
                    }
                    jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _pos * _wHeight + 'px');
                    jQuery('.works').removeClass('resized');
                    unClickFlag = true;
                } else {
                    for (s = 0; s < steps.length; s++) {
                        if (scrollPosition >= steps[s] && scrollPosition <= steps[s + 1]) {
                            jQuery('body').addClass('fade-in');
                            if (scrollPosition >= (steps[s + 1] - steps[s]) / 2 + steps[s]) {
                                jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", jQuery('.works-row').innerHeight() * (s + 1) + 'px');
                                jQuery('.mCSB_dragger_bar i').attr('data-hover', (s + 2) * 2 + ' of ' + allCS);
                                if (s == 1 && steps[s + 1] == 100) {
                                    jQuery('.mCSB_dragger_bar i').attr('data-hover', '2 of ' + allCS);
                                }
                            } else {
                                jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", jQuery('.works-row').innerHeight() * s + 'px');
                                if (s == 0 && steps[s] == 0) {
                                    jQuery('.mCSB_dragger_bar i').attr('data-hover', '2 of ' + allCS);
                                } else {
                                    jQuery('.mCSB_dragger_bar i').attr('data-hover', (s + 1) * 2 + ' of ' + allCS);
                                }
                            }
                            var _time = 0.15;
                            TweenLite.to('.works-timing', _time, {
                                z: '0%',
                                onComplete: function () {
                                    jQuery('.works').removeClass('resized');
                                    jQuery('.works-row-in-duplicated .work .work-in').css('margin-top', '');
                                }
                            });
                        }
                    }
                }
                if (!jQuery('.works.resized').length) {
                    stopFlag = false;
                    unClickFlag = false;
                }
            }
        }
        jQuery('.works-row-in').each(function () {
            jQuery(this).before('<div class="works-row-in works-row-in-duplicated"><div class="inner"><div class="inner-d">' + jQuery(this).html() + '</div></div></div>');
        });
        var delay = 200,
            setTimeoutConst;
        jQuery('body').on('touchstart', function (e) {
            if (jQuery('.work-overed').length) {
                if (jQuery(e.target).attr('class') == 'case-menu' || jQuery(e.target).attr('class') == 'works-row-in') {
                    if (!jQuery('.works.resized').length) {
                        jQuery('.works').toggleClass('overed');
                        jQuery('.vertical-slider-wrap,.vertical-slider-wrap2').removeClass('inactive');
                        if (!jQuery('.works.animate-works').length) {
                            jQuery('.works-overlay').css({
                                'opacity': 0
                            });
                        }
                        jQuery('.work-overed').removeClass('work-overed');
                    }
                }
            }
        })
        jQuery('.works .work .clickable').hover(function () {
            if (jQuery(window).width() < 768) {
                window.location.href = jQuery(this).attr('href');
                jQuery(this).parent().addClass('mobile-overed');
            } else {
                var _this = jQuery(this);
                setTimeoutConst = setTimeout(function () {
                    if (!jQuery('.works.resized').length) {
                        jQuery('.works-overlay').css({
                            'background': _this.parents('.work').attr('data-color-overlay'),
                            'opacity': _this.parents('.work').attr('data-color-opacity')
                        });
                        jQuery('.vertical-slider-wrap,.vertical-slider-wrap2').addClass('inactive');
                        jQuery('.works').toggleClass('overed');
                        _this.parents('.works-row').find('.work').addClass('delay');
                        if (_this.parents('.work').hasClass('left-work')) {
                            _this.parents('.works-row').find('.right-work').addClass('work-overed');
                            _this.parents('.works-row').find('.left-work').addClass('move-towards');
                        } else {
                            _this.parents('.works-row').find('.left-work').addClass('work-overed');
                            _this.parents('.works-row').find('.right-work').addClass('move-towards');
                        }
                    }
                }, delay);
            }
        }, function () {
            jQuery('.mobile-overed').removeClass('mobile-overed');
            clearTimeout(setTimeoutConst);
            if (!jQuery('.works.resized').length) {
                jQuery('.works').toggleClass('overed');
                jQuery('.vertical-slider-wrap,.vertical-slider-wrap2').removeClass('inactive');
                if (!jQuery('.works.animate-works').length) {
                    jQuery('.works-overlay').css({
                        'opacity': 0
                    });
                }
                jQuery(this).parents('.works-row').find('.work').removeClass('work-overed move-towards');
                TweenLite.to('.works-timing', 0.15, {
                    x: '0%',
                    onComplete: function () {
                        jQuery('.work').removeClass('delay');
                    }
                });
            }
        });
        jQuery('body').on('click', '.works .work .clickable', function (e) {
            if (!jQuery(this).hasClass('protected')) {
                if (jQuery('.work-overed').length && !jQuery('.mobile-overed').length) {
                    jQuery('#menu-main-menu .current-menu-item').removeClass('current-menu-item');
                    jQuery(this).parents('.works').toggleClass('animate-overlay');
                    var _this = jQuery(this);
                    TweenLite.to('.works-timing', 0.01, {
                        x: '0%',
                        onComplete: function () {
                            jQuery('.work-full-video').addClass('full-opacity');
                        }
                    });
                    _this.parents('.works-row').find('.work').addClass('delay2');
                    jQuery('.vertical-slider-wrap,.vertical-slider-wrap2').addClass('inactive-0');
                    var boxClass = '';
                    if (jQuery(this).parents('.work').hasClass('left-work')) {
                        boxClass = 'right-style';
                    }
                    jQuery('.case-menu-in strong em').text(jQuery(this).next().find('h2').text());
                    if (jQuery(this).parents('.work').hasClass('right-work')) {
                        if (isTouchDevice) {
                            jQuery(this).parents('.works-row').prepend('<div class="work-full-video"><i></i><div class="work-full-video-in left"><div class="head-work-image" style="background-image: url(' + jQuery(this).attr('data-mobile-src') + ');"></div></div></div>');
                        } else {
                            jQuery(this).parents('.works-row').prepend('<div class="work-full-video"><i></i><div class="work-full-video-in left"><video class="single-work-video" loop="" autoplay="" poster="' + jQuery(this).attr('data-video-poster') + '"><source type="video/mp4" src="' + jQuery(this).attr('data-video-src') + '"></source></video></div></div>');
                        }
                    } else {
                        if (isTouchDevice) {
                            jQuery(this).parents('.works-row').prepend('<div class="work-full-video"><i></i><div class="work-full-video-in"><div class="head-work-image" style="background-image: url(' + jQuery(this).attr('data-mobile-src') + ');"></div></div></div>');
                        } else {
                            jQuery(this).parents('.works-row').prepend('<div class="work-full-video"><i></i><div class="work-full-video-in"><video class="single-work-video" loop="" autoplay="" poster="' + jQuery(this).attr('data-video-poster') + '"><source type="video/mp4" src="' + jQuery(this).attr('data-video-src') + '"></source></video></div></div>');
                        }
                    }
                    jQuery(this).parents('.works-row').append('<div class="case-study-top ' + boxClass + '"><div class="progress"><b></b></div>' + jQuery(this).next().html() + '<a href="javascript:;" class="work-down"></a></div>');
                    jQuery(this).parents('.works').find('.work-overed').toggleClass('work-animated');
                    jQuery(this).parents('.works').toggleClass('animate-works');
                    var _d = 0;
                    if (boxClass == '') {
                        _d = 15 - (jQuery(this).parents('.work').offset().left - jQuery(this).offset().left);
                    } else {
                        _d = (jQuery(this).parents('.work').offset().left - jQuery(this).offset().left) + 15;
                    }
                    jQuery('.work-full-video').css({
                        'left': (boxClass == '') ? jQuery(this).offset().left - _d + 'px' : jQuery(this).offset().left + 'px',
                        'right': (boxClass == '') ? jQuery(window).width() - jQuery(this).offset().left - jQuery(this).width() + 'px' : jQuery(window).width() - _d - jQuery(this).offset().left - jQuery(this).width() + 'px',
                        'top': jQuery(this).offset().top + 'px',
                        'bottom': _wHeight - jQuery(this).offset().top - jQuery(this).height() + 'px',
                        'position': 'absolute',
                        'overflow': 'hidden',
                        'z-index': 5
                    });
                    jQuery('.progress').addClass('show');
                    jQuery('.works-row-after').load(jQuery(this).attr('href') + ' #case-page', function () {
                        jQuery('.progress').addClass('disable');
                        if (jQuery("[data-src]").length) {
                            jQuery("[data-src]").each(function () {
                                jQuery(this).attr('src', jQuery(this).attr("data-src"));
                            });
                        }
                        WorkDetailPage();
                    });
                    window.history.pushState('', '', jQuery(this).attr('href'));
                    jQuery('title').text(jQuery(this).next().find('h2').text() + ' - Isadora Digital Agency');
                    TweenLite.to('.works-timing', 0.4, {
                        width: '100%',
                        onComplete: function () {
                            jQuery('.work-full-video').addClass('full');
                            jQuery('.works-overlay,.work-full-video i').css({
                                'background': _this.parents('.work').attr('data-video-overlay'),
                                'opacity': _this.parents('.work').attr('data-video-opacity')
                            });
                        }
                    });
                    TweenLite.to('.works-timing', 0.6, {
                        y: '0%',
                        onComplete: function () {
                            jQuery('.work-animated').addClass('to-hide');
                            jQuery('#header').addClass('white');
                            jQuery('.works-row-in').removeAttr('style');
                        }
                    });
                    TweenLite.to('.works-timing', 1, {
                        opacity: '1',
                        onComplete: function () {
                            var _a = jQuery('.work-animated');
                            jQuery('.case-study-top .col').css({
                                'width': _a.width() + 'px',
                                'height': _a.height() + 'px',
                                'top': _a.find('.clickable').offset().top + 'px',
                                'left': _a.find('.clickable').offset().left - parseInt(jQuery('.case-study-top .col').css('margin-left')) + 'px',
                            });
                            jQuery('.work-full-video').addClass('full-h');
                        }
                    });
                    TweenLite.to('#header', 1.4, {
                        opacity: '1',
                        onComplete: function () {
                            _this.parents('.works-row').find('.work').removeClass('delay2');
                            _this.parents('.works').toggleClass('animate-overlay');
                            var _a = jQuery('.work-animated');
                            jQuery('.case-study-top .col').css({
                                'width': '58.9vh',
                                'height': '78vh',
                                'top': '12.5rem',
                                'left': (_a.hasClass('right-work')) ? (jQuery(window).width() * 0.93 - 0.589 * jQuery(window).height() - getScrollBarWidth()) : 0 + 'px',
                                '-webkit-transition': 'all .3s',
                                'transition': 'all .3s'
                            });
                        }
                    });
                    TweenLite.to('#header', 1.7, {
                        width: '100%',
                        onComplete: function () {
                            jQuery('.work-full-video,.case-study-top,.works-overlay').css({
                                'height': jQuery(window).height() + 'px'
                            });
                            jQuery('.works-row').addClass('ready');
                            jQuery('.work-full-video i').remove();
                            jQuery('.works').addClass('works-ready');
                            jQuery('.case-menu').addClass('showed');
                            jQuery('.work-animated').removeClass('to-hide');
                            jQuery('.case-study-top .col').css({
                                'width': '',
                                'height': '',
                                'top': '',
                                'left': '',
                            });
                        }
                    });
                }
                e.preventDefault();
                return false;
            }
        });
        jQuery('body').on('click', '.prev-next-links .prev', function (e) {
            if (!jQuery('.prev-service').hasClass('protect')) {
                if (!jQuery(this).hasClass('was-clicked')) {
                    jQuery(this).addClass('was-clicked');
                    var _time = jQuery(window).scrollTop() / 2;
                    if (_time > 750) {
                        _time = 750;
                    }
                    jQuery('html,body').animate({
                        scrollTop: 0
                    }, _time, function () {
                        jQuery('body').css('overflow-y', 'scroll');
                        jQuery('#case-page').fadeOut(200, function () {
                            var _w = jQuery('.clickable[href="' + jQuery('.prev-service').attr('href') + '"]').first().parents('.work');
                            goToNextCS(_w, _w.next(), 'left-work', 0);
                        });
                    });
                    window.history.pushState('', '', jQuery('.prev-service').attr('href'));
                }
                e.preventDefault();
            } else {
                console.log(2);
                window.location.href = jQuery('.prev-service').attr('href');
            }
        });
        jQuery('body').on('click', '#case-page .prev-service', function (e) {
            if (!jQuery(this).hasClass('protect')) {
                jQuery('body').css('overflow-y', 'scroll');
                var _w = jQuery('.clickable[href="' + jQuery('.prev-service').attr('href') + '"]').first().parents('.work');
                if (isTouchDevice) {
                    jQuery('.work-full-video').html('<div class="head-work-image" style="background-image: url(' + _w.find('.clickable').attr('data-mobile-src') + ');"></div>');
                } else {
                    jQuery('.work-full-video-in').append('<video class="single-work-video v2" loop="" autoplay="" poster="' + _w.find('.clickable').attr('data-video-poster') + '"><source type="video/mp4" src="' + _w.find('.clickable').attr('data-video-src') + '"></source></video>');
                }
                jQuery('.case-study-top').html('<div class="progress"><b></b></div>' + _w.find('.testimonial').html() + '<a href="javascript:;" class="work-down"></a>');
                if (_w.hasClass('right-work')) {
                    jQuery('.case-study-top').removeClass('right-style');
                } else {
                    jQuery('.case-study-top').addClass('right-style');
                }
                if (_w.hasClass('left-work')) {
                    _wa = jQuery('.work-animated');
                } else {
                    _wa = _w.parents('.works-row').find('.work.right-work').first();
                }
                jQuery('.works-overlay').css({
                    'background': _wa.attr('data-video-overlay'),
                    'opacity': _wa.attr('data-video-opacity')
                });
                jQuery('.case-study-top').addClass('to-replace');
                TweenLite.to('.works-timing', .2, {
                    z: '0%',
                    onComplete: function () {
                        jQuery('#header').addClass('temp');
                    }
                });
                jQuery('.case-study-top').addClass('with-bg');
                jQuery('#case-page').fadeOut(450, function () {
                    jQuery('html,body').animate({
                        scrollTop: 0
                    }, 1);
                    jQuery('#header').removeClass('temp');
                });
                TweenLite.to('.works-timing', .5, {
                    x: '0%',
                    onComplete: function () {
                        var _w = jQuery('.clickable[href="' + jQuery('.prev-service').attr('href') + '"]').first().parents('.work');
                        goToNextCS(_w, _w.next(), 'left-work', 0);
                        jQuery('.case-study-top .progress').addClass('show');
                        window.history.pushState('', '', jQuery('.prev-service').attr('href'));
                    }
                });
                e.preventDefault();
            }
        });
        jQuery('body').on('click', '.prev-next-links .next', function (e) {
            if (!jQuery('.next-service').hasClass('protect')) {
                if (!jQuery(this).hasClass('was-clicked')) {
                    jQuery(this).addClass('was-clicked');
                    var _time = jQuery(window).scrollTop() / 2;
                    if (_time > 750) {
                        _time = 750;
                    }
                    jQuery('html,body').animate({
                        scrollTop: 0
                    }, _time, function () {
                        jQuery('body').css('overflow-y', 'scroll');
                        jQuery('#case-page').fadeOut(200, function () {
                            var _w = jQuery('.clickable[href="' + jQuery('.next-service').attr('href') + '"]').first().parents('.work');
                            goToNextCS(_w, _w.prev(), 'right-work', 0);
                        });
                    });
                    window.history.pushState('', '', jQuery('.next-service').attr('href'));
                }
                e.preventDefault();
            } else {
                window.location.href = jQuery('.next-service').attr('href');
            }
        });
        jQuery('body').on('click', '#case-page .next-service', function (e) {
            if (!jQuery(this).hasClass('protect')) {
                jQuery('body').css('overflow-y', 'scroll');
                var _w = jQuery('.clickable[href="' + jQuery('.next-service').attr('href') + '"]').first().parents('.work');
                if (isTouchDevice) {
                    jQuery('.work-full-video').html('<div class="head-work-image" style="background-image: url(' + _w.find('.clickable').attr('data-mobile-src') + ');"></div>');
                } else {
                    jQuery('.work-full-video-in').append('<video class="single-work-video v2" loop="" autoplay="" poster="' + _w.find('.clickable').attr('data-video-poster') + '"><source type="video/mp4" src="' + _w.find('.clickable').attr('data-video-src') + '"></source></video>');
                }
                jQuery('.case-study-top').html('<div class="progress"><b></b></div>' + _w.find('.testimonial').html() + '<a href="javascript:;" class="work-down"></a>');
                if (_w.hasClass('right-work')) {
                    jQuery('.case-study-top').removeClass('right-style');
                } else {
                    jQuery('.case-study-top').addClass('right-style');
                }
                if (_w.hasClass('right-work')) {
                    _wa = jQuery('.work-animated');
                } else {
                    _wa = _w.parents('.works-row').find('.work.left-work').first();
                }
                jQuery('.works-overlay').css({
                    'background': _wa.attr('data-video-overlay'),
                    'opacity': _wa.attr('data-video-opacity')
                });
                jQuery('.case-study-top').addClass('to-replace');
                TweenLite.to('.works-timing', .2, {
                    z: '0%',
                    onComplete: function () {
                        jQuery('#header').addClass('temp');
                    }
                });
                jQuery('.case-study-top').addClass('with-bg');
                jQuery('#case-page').fadeOut(450, function () {
                    jQuery('html,body').animate({
                        scrollTop: 0
                    }, 1);
                    jQuery('#header').removeClass('temp');
                });
                TweenLite.to('.works-timing', .5, {
                    x: '0%',
                    onComplete: function () {
                        var _w = jQuery('.clickable[href="' + jQuery('.next-service').attr('href') + '"]').first().parents('.work');
                        goToNextCS(_w, _w.prev(), 'right-work', 1);
                        jQuery('.case-study-top .progress').addClass('show');
                        window.history.pushState('', '', jQuery('.next-service').attr('href'));
                    }
                });
                e.preventDefault();
            }
        });

        function goToNextCS(a, b, c, f) {
            var _wa;
            jQuery('.works-overlay').css('visibility', 'hidden');
            if (a.hasClass(c)) {
                _wa = jQuery('.work-animated');
            } else {
                if (c == 'right-work') {
                    b = a.parents('.works-row').find('.work.right-work').first();
                    _wa = a.parents('.works-row').find('.work.left-work').first();
                } else {
                    b = a.parents('.works-row').find('.work.left-work').first();
                    _wa = a.parents('.works-row').find('.work.right-work').first();
                }
            }
            jQuery('.case-study-top').addClass('to-replace');
            jQuery('.case-menu-in strong em').text(b.find('.to-top').first().text());
            jQuery('title').text(b.find('.to-top').first().text() + ' - Isadora Digital Agency');
            TweenLite.to('.works-timing', .2, {
                x: '0%',
                onComplete: function () {
                    if (f == 0) {}
                    jQuery('.works-row-after').load(a.find('.clickable').first().attr('href') + ' #case-page', function () {
                        jQuery('.progress').addClass('disable');
                        if (jQuery("[data-src]").length) {
                            jQuery("[data-src]").each(function () {
                                jQuery(this).attr('src', jQuery(this).attr("data-src"));
                            });
                        }
                        jQuery('.prev-next-links .was-clicked').removeClass('was-clicked');
                        WorkDetailPage();
                    });
                }
            });
            TweenLite.to('.works-timing', .4, {
                z: '0%',
                onComplete: function () {
                    if (f == 0) {
                        if (isTouchDevice) {
                            jQuery('.work-full-video').html('<div class="head-work-image" style="background-image: url(' + a.find('.clickable').attr('data-mobile-src') + ');"></div>');
                        } else {
                            jQuery('.work-full-video-in').append('<video class="single-work-video v2" loop="" autoplay="" poster="' + a.find('.clickable').attr('data-video-poster') + '"><source type="video/mp4" src="' + a.find('.clickable').attr('data-video-src') + '"></source></video>');
                        }
                        jQuery('.case-study-top').html('<div class="progress"><b></b></div>' + a.find('.testimonial').html() + '<a href="javascript:;" class="work-down"></a>');
                        if (a.hasClass('right-work')) {
                            jQuery('.case-study-top').removeClass('right-style');
                        } else {
                            jQuery('.case-study-top').addClass('right-style');
                        }
                    }
                    if (jQuery('.case-study-top.with-bg').length) {
                        jQuery('.work-full-video-in .v2').addClass('show');
                    }
                }
            });
            TweenLite.to('.works-timing', 1.2, {
                opacity: '1',
                onComplete: function () {
                    jQuery('.case-study-top').removeClass('to-replace fade with-bg');
                    jQuery('.work-full-video-in .v2').addClass('show');
                }
            });
            TweenLite.to('.works-timing', 2, {
                top: '0',
                onComplete: function () {
                    jQuery('.work-full-video-in video').first().remove();
                    jQuery('.work-full-video-in video.v2').removeClass('v2 show');
                }
            });
            TweenLite.to('.works-timing', .9, {
                left: '0',
                onComplete: function () {
                    jQuery('.case-study-top.with-bg').addClass('fade');
                }
            });
            TweenLite.to('.works-timing', .7, {
                y: '0%',
                onComplete: function () {
                    jQuery('.works-overlay').css({
                        'background': _wa.attr('data-video-overlay'),
                        'opacity': _wa.attr('data-video-opacity')
                    });
                    jQuery('.case-study-top .progress').addClass('show');
                    jQuery('.work-animated').removeClass('work-animated');
                    b.addClass('work-animated');
                    jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", jQuery(window).height() * jQuery('.work-animated').parents('.works-row').index() + 'px');
                    jQuery('.works-overlay').css('visibility', '');
                    jQuery('body').removeAttr('style');
                }
            });
        }
        jQuery('body').on('click', '.works-back, #case-page .agency-back', function (e) {
            jQuery('#menu-main-menu .current_page_item').addClass('current-menu-item');
            jQuery('.works').toggleClass('animate-overlay2');
            jQuery('.case-study-top').addClass('to-replace');
            jQuery('.works-row-after').html('');
            jQuery('.case-menu').removeClass('showed');
            var animated = jQuery('.work-animated');
            jQuery('.work-animated').removeClass('work-animated');
            TweenLite.to('.works-timing', .35, {
                x: '0%',
                onComplete: function () {
                    jQuery('.works-ready').removeClass('works-ready');
                    jQuery('.works-row').removeClass('ready');
                    var _p = animated.siblings('.work').first().find('.clickable');
                    jQuery('.work-full-video').removeClass('full-opacity');
                    jQuery('.work-full-video').addClass('full-opacity-1');
                    jQuery('.work-full-video').css({
                        'left': _p.offset().left + 'px',
                        'right': jQuery(window).width() - _p.offset().left - _p.width() + 'px',
                        'top': _p.offset().top + 'px',
                        'bottom': jQuery(window).height() - _p.offset().top - _p.height() + 'px',
                        'height': '',
                        'opacity': 1
                    });
                }
            });
            TweenLite.to('.works-timing', .4, {
                y: '0%',
                onComplete: function () {
                    jQuery('.work-full-video').removeClass('full full-h full-opacity');
                }
            });
            TweenLite.to('.works-timing', 1.2, {
                z: '0%',
                onComplete: function () {
                    jQuery('.works').toggleClass('animate-overlay2');
                    jQuery('.works').removeClass('animate-works');
                    jQuery('.works-overlay').removeAttr('style');
                    jQuery('#header').removeClass('white');
                    jQuery('.case-study-top').remove();
                    jQuery('.work-full-video').addClass('full-opacity-2');
                    window.history.pushState('', '', jQuery('.works').attr('data-url'));
                    jQuery('title').text(jQuery('title').attr('data-origin'));
                    jQuery('.vertical-slider-wrap,.vertical-slider-wrap2').removeClass('inactive-0');
                }
            });
            TweenLite.to('.works-timing', 2, {
                opacity: '1',
                onComplete: function () {
                    jQuery('.work-full-video').remove();
                }
            });
            e.preventDefault();
        });
        document.addEventListener('mousewheel', function (e) {
            if (!jQuery('.works.animate-works').length && !jQuery('body.in-progress').length && !jQuery('.works.resized').length && !jQuery('.work-overed').length) {
                if (e.wheelDelta !== 0) {
                    if (e.wheelDelta < 0) {
                        t = -1;
                    } else {
                        t = 1;
                    }
                    if ((t == 1 && scrollPosition != 0) || (t == -1 && scrollPosition != 100)) {
                        jQuery('body').addClass('in-progress');
                        jQuery('.works').removeClass('resized');
                        jQuery('.works-row-in-duplicated .work .work-in').css('margin-top', '');
                        var i = jQuery.inArray(scrollPosition, steps);
                        if (i == -1) {
                            for (h = 0; h < steps.length; h++) {
                                if (scrollPosition > (steps[h] - 3) && scrollPosition < (steps[h] + 3)) {
                                    i = h;
                                }
                            }
                        }
                        i = i - t;
                        jQuery('.mCSB_dragger_bar i').attr('data-hover', (i + t + 1) * 2 + ' of ' + allCS);
                        jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", jQuery('.works-row').innerHeight() * i + 'px');
                        TweenLite.to('.works-timing', 1.3, {
                            z: '0%',
                            onComplete: function () {
                                jQuery('body').removeClass('in-progress');
                            }
                        });
                    }
                }
            }
        });
        jQuery(".page-template-work-new-page #page").swipe({
            swipeDown: function () {
                if (!jQuery('.works.animate-works').length && !jQuery('.works.works-ready').length && !jQuery('.works.resized').length && !jQuery('body.in-progress').length && !jQuery('.work-overed').length) {
                    var t = 1;
                    if ((t == 1 && scrollPosition != 0) || (t == -1 && scrollPosition != 100)) {
                        jQuery('body').addClass('in-progress');
                        if (jQuery(window).width() < 769 || (jQuery(window).width() < 1024 && jQuery('.is-tablet').length && jQuery(window).height() > jQuery(window).width())) {
                            swipeFlag = true;
                            _pos = jQuery('.mCSB_dragger_bar i').attr('data-current') * 1 - 1;
                            _pos2 = jQuery('.mCSB_dragger_bar i').attr('data-current') * 1 - 2;
                            jQuery('.mCSB_dragger_bar i').attr('data-current', _pos);
                            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _pos2 * _wHeight + 'px');
                            jQuery('.mobile-overed').removeClass('mobile-overed');
                        } else {
                            jQuery('.works').removeClass('resized');
                            jQuery('.works-row-in-duplicated .work .work-in').css('margin-top', '');
                            var i = jQuery.inArray(scrollPosition, stepsReverse);
                            jQuery('.mCSB_dragger_bar i').attr('data-hover', (i + t + 1) * 2 + ' of ' + allCS);
                            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", stepsReverse[i + t] + '%');
                        }
                        TweenLite.to('.works-timing', 1.2, {
                            z: '0%',
                            onComplete: function () {
                                jQuery('body').removeClass('in-progress');
                            }
                        });
                    }
                }
            },
            swipeUp: function () {
                if (!jQuery('.works.animate-works').length && !jQuery('.works.works-ready').length && !jQuery('.works.resized').length && !jQuery('body.in-progress').length && !jQuery('.work-overed').length) {
                    var t = -1;
                    if ((t == 1 && scrollPosition != 0) || (t == -1 && jQuery('.mCSB_dragger_bar i').attr('data-current') != allCS)) {
                        jQuery('body').addClass('in-progress');
                        if (jQuery(window).width() < 769 || (jQuery(window).width() < 1024 && jQuery('.is-tablet').length && jQuery(window).height() > jQuery(window).width())) {
                            swipeFlag = true;
                            _pos = jQuery('.mCSB_dragger_bar i').attr('data-current') * 1;
                            _pos2 = _pos + 1;
                            jQuery('.mCSB_dragger_bar i').attr('data-current', _pos2);
                            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", _pos * _wHeight + 'px');
                            jQuery('.mobile-overed').removeClass('mobile-overed');
                        } else {
                            jQuery('.works').removeClass('resized');
                            jQuery('.works-row-in-duplicated .work .work-in').css('margin-top', '');
                            var i = jQuery.inArray(scrollPosition, stepsReverse);
                            jQuery('.mCSB_dragger_bar i').attr('data-hover', (i + t + 1) * 2 + ' of ' + allCS);
                            jQuery('.mCSB_dragger_bar i').attr('data-current', (i + t + 1) * 2);
                            jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", stepsReverse[i + t] + '%');
                        }
                        TweenLite.to('.works-timing', 1.2, {
                            z: '0%',
                            onComplete: function () {
                                jQuery('body').removeClass('in-progress');
                            }
                        });
                    }
                }
            },
            allowPageScroll: "vertical",
            threshold: 5,
        });
        jQuery('.page-template-work-new-page').bind(' DOMMouseScroll', function (event) {
            if (!jQuery('.works.animate-works').length && !jQuery('body.in-progress').length && !jQuery('.works.resized').length && !jQuery('.work-overed').length) {
                var t = 0;
                if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                    t = 1;
                } else {
                    t = -1;
                }
                if ((t == 1 && scrollPosition != 0) || (t == -1 && scrollPosition != 100)) {
                    jQuery('body').addClass('in-progress');
                    var i = jQuery.inArray(scrollPosition, stepsReverse);
                    jQuery('.mCSB_dragger_bar i').attr('data-hover', (i + t + 1) * 2 + ' of ' + allCS);
                    jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", stepsReverse[i + t] + '%');
                    TweenLite.to('.works-timing', 1.2, {
                        z: '0%',
                        onComplete: function () {
                            jQuery('body').removeClass('in-progress');
                        }
                    });
                }
            }
        });
        jQuery(window).keydown(function (e) {
            var det;
            var flag = 0;
            if (e.keyCode == 38 || e.keyCode == 37 || e.keyCode == 33) {
                det = 1;
                flag = 1;
            }
            if (e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 34) {
                det = -1;
                flag = 1;
            }
            if (flag == 1 && !jQuery('.works.animate-works').length && !jQuery('body.in-progress').length && !jQuery('.works.resized').length && !jQuery('.work-overed').length) {
                if ((det == 1 && scrollPosition != 0) || (det == -1 && scrollPosition != 100)) {
                    jQuery('body').addClass('in-progress');
                    var i = jQuery.inArray(scrollPosition, stepsReverse);
                    jQuery('.mCSB_dragger_bar i').attr('data-hover', (i + det + 1) * 2 + ' of ' + allCS);
                    jQuery('.vertical-slider2').mCustomScrollbar("scrollTo", stepsReverse[i + det] + '%');
                    TweenLite.to('.works-timing', 1.2, {
                        z: '0%',
                        onComplete: function () {
                            jQuery('body').removeClass('in-progress');
                        }
                    });
                }
            }
        });
    }
    if (jQuery('body.single-work').length) {
        jQuery('.f-work').each(function () {
            downloadingImage = new Image();
            downloadingImage.src = jQuery(this).attr('data-video-poster');
        });

        function goToNextCSSingle(u) {
            var isLoaded = false;
            var isLoaded2 = false;
            var _w = jQuery('.all-works .f-work[data-url="' + u + '"]');
            jQuery('.case-study-top').addClass('to-replace');
            jQuery('.case-menu-in strong em').text(_w.find('.f-t h2').text());
            jQuery('title').text(_w.find('.f-t h2').text() + ' - Isadora Digital Agency');
            TweenLite.to('.works-timing', .2, {
                x: '0%',
                onComplete: function () {
                    jQuery('#case-page').load(u + ' #case-page', function () {
                        if (jQuery('.responsive-slider').length) {
                            jQuery('.responsive-slider').on('init', function (event, slick, direction) {
                                jQuery('.responsive-slider .wow').removeClass('wow');
                            });
                            jQuery('.responsive-slider').slick({
                                dots: false,
                                infinite: false,
                                speed: 500,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                variableWidth: true,
                                arrows: false
                            });
                            jQuery('.iphone-mask.to-clone').each(function () {
                                jQuery('.responsive-slider').slick('slickAdd', "<div class='iphone-mask'>" + jQuery(this).html() + "</div>");
                                jQuery(this).remove();
                            });
                        }
                        jQuery('.progress').addClass('disable');
                        jQuery('#case-page').fadeIn();
                        if (jQuery("[data-src]").length) {
                            jQuery("[data-src]").each(function () {
                                jQuery(this).attr('src', jQuery(this).attr("data-src"));
                            });
                        }
                        if (isLoaded) {
                            isLoaded2 = true;
                            WorkDetailPage();
                        } else {
                            isLoaded2 = true;
                        }
                    });
                }
            });
            TweenLite.to('.works-timing', .4, {
                z: '0%',
                onComplete: function () {
                    if (isTouchDevice) {
                        jQuery('.work-video').html('<span class="v-overlay" style="background: ' + _w.attr('data-video-overlay') + '; opacity: ' + _w.attr('data-video-opacity') + ';"></span><div class="video-full"><div class="head-work-image" style="background-image: url(' + _w.attr('data-mobile-src') + ');"></div></div>');
                    } else {
                        jQuery('.work-video').append('<video id="video2" class=" v2" loop="" autoplay="" poster="' + _w.attr('data-video-poster') + '"><source type="video/mp4" src="' + _w.attr('data-video-src') + '"></source></video>');
                    }
                    jQuery('.case-study-top').html('<div class="progress"><b></b></div>' + _w.find('.f-t').html() + '<a href="javascript:;" class="work-down"></a>');
                    if (_w.attr('data-position') == 'right') {
                        jQuery('.case-study-top').removeClass('right-style');
                    } else {
                        jQuery('.case-study-top').addClass('right-style');
                    }
                    if (jQuery('.case-study-top.with-bg').length) {
                        jQuery('.work-video .v2').addClass('show');
                    }
                }
            });
            TweenLite.to('.works-timing', 1.3, {
                top: '0',
                onComplete: function () {
                    jQuery('.work-video video').first().remove();
                    jQuery('.work-video video.v2').removeClass('v2 show');
                    jQuery('.case-study-top').removeClass('fade with-bg');
                }
            });
            TweenLite.to('.works-timing', .8, {
                opacity: '1',
                onComplete: function () {
                    jQuery('.case-study-top').removeClass('to-replace');
                }
            });
            TweenLite.to('.works-timing', .7, {
                y: '0%',
                onComplete: function () {
                    jQuery('.v-overlay').css({
                        'background': _w.attr('data-video-overlay'),
                        'opacity': _w.attr('data-video-opacity')
                    });
                    jQuery('.case-study-top.with-bg').addClass('fade');
                    jQuery('.case-study-top').removeClass('to-replace');
                    jQuery('.work-video .v2').addClass('show');
                    jQuery('.case-study-top .progress').addClass('show');
                    if (isLoaded2) {
                        isLoaded = true;
                        WorkDetailPage();
                    } else {
                        isLoaded = true;
                    }
                }
            });
        }
        jQuery('body').on('click', '.single-page .prev-next-links .prev, #case-page .prev-service', function (e) {
            if (!jQuery('.prev-service').hasClass('protect')) {
                jQuery("body").addClass("next-prev-init");
                jQuery('body').css('overflow-y', 'scroll');
                if (jQuery(this).hasClass('prev-service')) {
                    var _w = jQuery('.all-works .f-work[data-url="' + jQuery('.prev-service').attr('href') + '"]');
                    if (isTouchDevice) {
                        jQuery('.work-video').html('<div class="head-work-image" style="background-image: url(' + _w.attr('data-mobile-src') + ');"></div>');
                    } else {
                        jQuery('.work-video').html('<span class="v-overlay"></span><video id="video" loop=""  poster="' + _w.attr('data-video-poster') + '"><source type="video/mp4" src="' + _w.attr('data-video-src') + '"></source></video>');
                    }
                    jQuery('.case-study-top').html('<div class="progress"><b></b></div>' + _w.find('.f-t').html() + '<a href="javascript:;" class="work-down"></a>');
                    if (_w.attr('data-position') == 'right') {
                        jQuery('.case-study-top').removeClass('right-style');
                    } else {
                        jQuery('.case-study-top').addClass('right-style');
                    }
                    jQuery('.v-overlay').css({
                        'background': _w.attr('data-video-overlay'),
                        'opacity': _w.attr('data-video-opacity')
                    });
                    jQuery('.case-study-top').addClass('to-replace');
                    jQuery('.case-study-top').addClass('with-bg');
                }
                TweenLite.to('.works-timing', .2, {
                    z: '0%',
                    onComplete: function () {
                        jQuery('#header').addClass('temp');
                    }
                });
                jQuery('#case-page').fadeOut(450, function () {
                    jQuery('html,body').animate({
                        scrollTop: 0
                    }, 1);
                    jQuery('#header').removeClass('temp');
                });
                TweenLite.to('.works-timing', .5, {
                    x: '0%',
                    onComplete: function () {
                        goToNextCSSingle(jQuery('.prev-service').attr('href'));
                        jQuery('.case-study-top .progress').addClass('show');
                        window.history.pushState('', '', jQuery('.prev-service').attr('href'));
                    }
                });
                e.preventDefault();
            } else {
                window.location.href = jQuery('.prev-service').attr('href');
            }
        });
        jQuery('body').on('click', '.single-page .prev-next-links .next, #case-page .next-service', function (e) {
            if (!jQuery('.next-service').hasClass('protect')) {
                jQuery("body").addClass("next-prev-init");
                jQuery('body').css('overflow-y', 'scroll');
                if (jQuery(this).hasClass('next-service')) {
                    var _w = jQuery('.all-works .f-work[data-url="' + jQuery('.next-service').attr('href') + '"]');
                    if (isTouchDevice) {
                        jQuery('.work-video').html('<div class="head-work-image" style="background-image: url(' + _w.attr('data-mobile-src') + ');"></div>');
                    } else {
                        jQuery('.work-video').html('<span class="v-overlay"></span><video id="video" loop=""  poster="' + _w.attr('data-video-poster') + '"><source type="video/mp4" src="' + _w.attr('data-video-src') + '"></source></video>');
                    }
                    jQuery('.case-study-top').html('<div class="progress"><b></b></div>' + _w.find('.f-t').html() + '<a href="javascript:;" class="work-down"></a>');
                    if (_w.attr('data-position') == 'right') {
                        jQuery('.case-study-top').removeClass('right-style');
                    } else {
                        jQuery('.case-study-top').addClass('right-style');
                    }
                    jQuery('.v-overlay').css({
                        'background': _w.attr('data-video-overlay'),
                        'opacity': _w.attr('data-video-opacity')
                    });
                    jQuery('.case-study-top').addClass('to-replace');
                    jQuery('.case-study-top').addClass('with-bg');
                }
                TweenLite.to('.works-timing', .2, {
                    z: '0%',
                    onComplete: function () {
                        jQuery('#header').addClass('temp');
                    }
                });
                jQuery('#case-page').fadeOut(450, function () {
                    jQuery('html,body').animate({
                        scrollTop: 0
                    }, 1);
                    jQuery('#header').removeClass('temp');
                });
                TweenLite.to('.works-timing', .5, {
                    x: '0%',
                    onComplete: function () {
                        goToNextCSSingle(jQuery('.next-service').attr('href'));
                        jQuery('.case-study-top .progress').addClass('show');
                        window.history.pushState('', '', jQuery('.next-service').attr('href'));
                    }
                });
                e.preventDefault();
            } else {
                window.location.href = jQuery('.next-service').attr('href');
            }
        });
        jQuery('body').on('click', '.single-page  .works-back', function (e) {
            window.location.href = jQuery('#logo a').attr('href') + "work";
            e.preventDefault();
        });
    }
    if (jQuery('.page-template-flexible-page').length) {
        if (jQuery('#video').length) {
            jQuery('#video')[0].play();
        }
        jQuery('.text-carousel-inner').slick({
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
        });
        jQuery('.table-layout table').each(function () {
            jQuery(this).addClass('cols-' + jQuery(this).find('tr:first-child td').length);
            for (r = 0; r < jQuery(this).find('tr:first-child td').length - 2; r++) {
                jQuery(this).after(jQuery(this).clone())
            }
        });
    }
    if (jQuery('.banner-outer.type1').length) {
        jQuery('body').addClass('flex-type1');
    }
    setWorkPageOrientation();
    jQuery('#page').removeClass('page-change');
    fixThanksHeight();
    if (jQuery('.hide-first-image').length) {
        jQuery('.hide-first-image .entry-post img').first().remove();
    }
    if (jQuery(".overlay-case").length) {
        var img = new Image();
        var t = 0;
        if (isTouchDevice) {
            t = 500;
        }
        img.onload = function () {
            setTimeout(function () {
                jQuery(".overlay-case").addClass("animate");
            }, t);
        };
        img.src = jQuery('.overlay-case').attr('data-src');
    }
    if (jQuery(".single-work .case-study-top").length) {
        var img = new Image();
        var t = 0;
        if (isTouchDevice) {
            t = 500;
        }
        img.onload = function () {
            setTimeout(function () {
                jQuery('.case-study-top').removeClass('to-replace2 to-replace');
            }, t);
        };
        if (isTouchDevice) {
            img.src = jQuery('.head-work-image').attr('data-url');
        } else {
            img.src = jQuery('#video').attr('poster');
        }
    }
    WorkDetailPage();
    if (jQuery("[data-bg]").length) {
        jQuery("[data-bg]").each(function () {
            var src = jQuery(this).attr("data-bg");
            jQuery(this).css("background-image", "url(" + src + ")");
        });
    }
    MainMenu();
    blogPage();
    if (!(isTouchDevice)) {
        jQuery('body').addClass('no-touch');
    }
    if (jQuery('.work-sub-title').length) {
        jQuery(".work-sub-title").each(function () {
            var words = jQuery(this).text().split(' ');
            var newHeading = '';
            for (i = 0; i < words.length; i++) {
                newHeading += '<span><em>' + words[i] + '</em></span> ';
            }
            jQuery(this).html(newHeading);
            workLines();
        });
    }
    jQuery("body").on("click", '.scroll-icon', function () {
        jQuery(this).fadeOut();
    });
    jQuery(".prev-service").mouseenter(function () {
        jQuery(".thumbnail-prev").addClass("hover");
    });
    jQuery(".prev-service").mouseleave(function () {
        jQuery(".thumbnail-prev").removeClass("hover");
    });
    jQuery(".next-service").mouseenter(function () {
        jQuery(".thumbnail-next").addClass("hover");
    });
    jQuery(".next-service").mouseleave(function () {
        jQuery(".thumbnail-next").removeClass("hover");
    });
    jQuery('body').on('click touchstart', '#page', function (e) {
        if (jQuery(e.target).parents('.post-social').length != 1 && jQuery('.last-social').hasClass('active')) {
            jQuery('.last-social, .open-social, .only-tablet').removeClass('active');
        }
        if (jQuery(e.target).parents('.laptop-position').length != 1 && jQuery('.laptop-position').hasClass('active')) {
            jQuery(".laptop-position").removeClass("active").css({
                "right": "",
                "left": ""
            });
            jQuery(".intro").removeClass("active");
            jQuery('body').removeClass('crossed');
            jQuery(".laptop-wrap .scroll-icon").fadeOut();
        }
        if (jQuery(e.target).parents('.filter-insights').length != 1 && jQuery('.filter-by-cat').hasClass('active')) {
            jQuery(".filter-by-cat").removeClass("active");
            jQuery(".filter-by-cat").next().removeClass("active");
        }
    });
    jQuery("body").on("click", ".filter-by-cat", function () {
        if (jQuery(this).hasClass("active")) {
            jQuery(this).removeClass("active");
            jQuery(this).next().removeClass("active");
        } else {
            jQuery(this).addClass("active");
            jQuery(this).next().addClass("active");
        }
    });
    jQuery(".navigation-item").on("click", function () {
        if (LaunchFlagWork) {
            clearInterval(firstLaunchW);
            firstLaunchFlagW = false;
        }
        LaunchFlagWork = true;
        if (!jQuery('body').hasClass("in-move") && !jQuery(this).hasClass("slick-current")) {
            jQuery('body').addClass("in-move");
            var prevCurrent = jQuery(".slick-current").index();
            var currSlide = jQuery(this).index();
            jQuery(".navigation-item").removeClass("slick-current");
            jQuery(this).addClass("slick-current");
            if (jQuery(".navigation-item").length - 1 == currSlide) {
                jQuery(".work-navigation .slick-next").addClass("disable");
                jQuery("#footer").fadeIn();
            } else {
                jQuery(".work-navigation .slick-next").removeClass("disable");
            }
            if (prevCurrent < currSlide) {
                jQuery(".all-works .work-row").removeClass("in-view");
                jQuery(".all-works .work-row").eq(currSlide).addClass("in-view").clone().appendTo(".fake-work");
                jQuery(".next-work").on("click", function () {
                    scrollDown(1);
                });
                jQuery(".fake-work").addClass("a");
                setTimeout(function () {
                    jQuery(".fake-work").addClass("fromBottom");
                    jQuery(".current-work").addClass("toTop");
                    jQuery(".work-navigation .total").addClass('hide');
                }, 100);
                setTimeout(function () {
                    jQuery(".work-navigation .total strong").text(jQuery('.navigation-item.slick-current').attr('data-slide'));
                }, 200);
                setTimeout(function () {
                    jQuery(".fromBottom").find(".work-row").addClass('animate');
                    jQuery('.work-row .quotes').removeClass("done");
                    jQuery('.work-row .quotes img').removeClass("hide show");
                    animateQuote();
                    jQuery(".work-navigation .total").removeClass('hide');
                }, 500);
                setTimeout(function () {
                    jQuery(".current-work").remove();
                    jQuery(".fake-work").addClass("current-work").removeClass("fake-work fromBottom a b");
                    jQuery(".current-work").after("<div class='fake-work'/>");
                }, 600);
                setTimeout(function () {
                    jQuery('body').removeClass('in-move');
                    jQuery('.work-row.animate').addClass('completed');
                }, 500);
                if (currSlide === 0) {
                    jQuery(".work-navigation .slick-prev").addClass("disable");
                } else {
                    jQuery(".work-navigation .slick-prev").removeClass("disable");
                }
            } else {
                if (currSlide === 0) {
                    jQuery(".work-navigation .slick-prev").addClass("disable");
                } else {
                    jQuery(".work-navigation .slick-prev").removeClass("disable");
                }
                jQuery(".all-works .work-row").removeClass("in-view");
                jQuery(".all-works .work-row").eq(currSlide).addClass("in-view").clone().appendTo(".fake-work");
                jQuery(".next-work").on("click", function () {
                    scrollDown(1);
                });
                jQuery(".fake-work").addClass("a");
                setTimeout(function () {
                    jQuery(".fake-work").addClass("fromTop");
                    jQuery(".current-work").addClass("toBottom");
                    jQuery(".work-navigation .total").addClass('hide');
                }, 100);
                setTimeout(function () {
                    jQuery(".work-navigation .total strong").text(jQuery('.navigation-item.slick-current').attr('data-slide'));
                }, 200);
                setTimeout(function () {
                    jQuery(".fromTop").find(".work-row").addClass('animate');
                    jQuery('.work-row .quotes').removeClass("done");
                    jQuery('.work-row .quotes img').removeClass("hide show");
                    animateQuote();
                    jQuery(".work-navigation .total").removeClass('hide');
                }, 500);
                setTimeout(function () {
                    jQuery(".current-work").remove();
                    jQuery(".fake-work").addClass("current-work").removeClass("fake-work fromTop a b");
                    jQuery(".current-work").after("<div class='fake-work'/>");
                }, 600);
                setTimeout(function () {
                    jQuery('body').removeClass('in-move');
                    jQuery('.work-row.animate').addClass('completed');
                }, 500);
            }
        }
    });
    if (jQuery("body.page-template-work-page").length) {
        if (firstLaunchFlagW) {
            firstLaunchW = setInterval(function () {
                LaunchFlagWork = false;
                if (!jQuery('.work-navigation .navigation-item.slick-current').next().hasClass('slick-prev')) {
                    jQuery('.work-navigation .navigation-item.slick-current').next().trigger('click');
                } else {
                    clearInterval(firstLaunchW);
                    firstLaunchFlagW = false;
                }
            }, 8000);
        }
        jQuery(".slick-prev").on("click", function () {
            scrollDown(0);
        });
        jQuery(".slick-next").on("click", function () {
            scrollDown(1);
        });
        jQuery(".next-work").on("click", function () {
            scrollDown(1);
        });
        jQuery(".work-wrap").swipe({
            swipeDown: function () {
                scrollDown(0);
            },
            swipeUp: function () {
                scrollDown(1);
            },
            swipeLeft: function () {
                scrollDown(1);
            },
            swipeRight: function () {
                scrollDown(0);
            },
            threshold: 5,
        });
    }
    activeMark();
    setTimeout(function () {
        activeMark();
    }, 3000);
    jQuery(".filter-insights ol li").mouseenter(function () {
        var startPos = jQuery(this).offset().left;
        var endPos = jQuery(this).offset().left + jQuery(this).width();
        jQuery(".markings span").each(function () {
            if (jQuery(this).offset().left >= startPos && jQuery(this).offset().left < endPos) {
                jQuery(this).addClass("active");
            } else {
                jQuery(this).removeClass("active");
            }
        });
    });
    jQuery(".filter-insights ol li").mouseleave(function () {
        jQuery(".markings span").each(function () {
            jQuery(this).removeClass("active");
        });
    });
    jQuery("#navi li a").on("click", function (e) {
        jQuery('#page').addClass('page-change');
        jQuery("#navi").addClass("loading-overlay").removeClass("active");
        jQuery("#navi li").removeClass("current-menu-item");
        jQuery(".menu-icon").removeClass("active");
        jQuery(this).parent().addClass("current-menu-item current-menu");
        var _this = jQuery(this);
        var t = 800;
        if (isTouchDevice) {
            t = 1400;
        }
        setTimeout(function () {
            window.location.href = _this.attr('href');
        }, t);
        e.preventDefault();
    });
    if (isTouchDevice) {
        jQuery(".post-social .open-social").on("touchend", function () {
            if (jQuery(this).hasClass("active")) {
                jQuery(this).removeClass("active");
                jQuery(this).parents('.post-social').find(".last-social").removeClass("active");
                if (jQuery(this).parents('.post-social').hasClass('vertical')) {
                    jQuery(this).parents('.post-social').find(".only-tablet").removeClass("active");
                } else {
                    jQuery(this).parents('.post-social').find(".last-social").removeClass("active");
                }
            } else {
                jQuery(this).addClass("active");
                jQuery(this).parents('.post-social').find(".last-social").addClass("active");
                jQuery(this).parents('.post-social').find(".only-tablet").addClass("active");
            }
        });
    } else {
        jQuery(".post-social .open-social").on("hover", function () {
            if (!jQuery(this).hasClass("active")) {
                jQuery(this).addClass("active");
                if (jQuery(this).parents('.post-social').hasClass('vertical')) {
                    if (jQuery(window).width() > 1280) {
                        jQuery(this).parents('.post-social').find(".last-social").addClass("active");
                    } else {
                        jQuery(this).parents('.post-social').find(".only-tablet").addClass("active");
                    }
                } else {
                    jQuery(this).parents('.post-social').find(".last-social").addClass("active");
                }
                jQuery(this).parents('.post-social').find(".first-social").addClass("expanded");
            }
        });
        jQuery(".post-social").on("mouseleave", function () {
            if (jQuery(this).find(".open-social").hasClass("active")) {
                jQuery(this).find(".open-social").removeClass("active");
                jQuery(this).find(".last-social").removeClass("active");
                jQuery(this).find(".only-tablet").removeClass("active");
                jQuery(this).find(".first-social").removeClass("expanded");
            }
        });
    }
    initGallerySlider();
    jQuery("#navi li a").append("<span class='nav-line nav-line-1'></span><span class='nav-line nav-line-2'></span><span class='nav-line nav-line-3'></span><span class='nav-line nav-line-4'></span>");
    jQuery(".nav_desc").append("<span/>");
    if (jQuery("body.page-template-contact-page").length) {
        topTrigger = jQuery(".diagram-wrap").offset().top + jQuery(window).height() / 2 - 81;
        jQuery("#trigger2").css("top", topTrigger + "px");
        var controller2 = new ScrollMagic.Controller();
        end22 = jQuery(".message").offset().top - jQuery(".diagram-wrap").offset().top - jQuery('.diagram-estimate').innerHeight() - 35;
        setTimeout(function () {
            scene = new ScrollMagic.Scene({
                triggerElement: "#trigger2",
                duration: end22
            }).setPin(".diagram-estimate").addTo(controller2);
            scene.duration(jQuery(".message").offset().top - jQuery(".diagram-wrap").offset().top - jQuery('.diagram-estimate').innerHeight() - 35);
        }, 800);
    }
    jQuery(".submit-box span").on("click", function () {
        jQuery(this).parent().find("input").trigger("click");
    });
    jQuery('.wpcf7-file').each(function () {
        jQuery(this).prop('disabled', true);
    });
    jQuery('.file-field').click(function () {
        jQuery(this).next().find('.wpcf7-file').prop('disabled', false);
    });
    jQuery("input[type=file]").on("change", function () {
        var valFile = jQuery(this).val().replace("C:\\fakepath\\", '');
        if (valFile != '') {
            jQuery(this).parent().parent().find(".file-name-contact").remove();
            jQuery(this).parent().parent().append("<span class='file-name-contact'>" + valFile + "</span>");
        }
        jQuery(this).parent().parent().prev().text('File attached!');
        jQuery(this).next('.wpcf7-not-valid-tip').remove();
        jQuery(this).prop('disabled', false);
    });
    jQuery(".file-field").on("click", function () {
        jQuery(this).parent().find("input[type=file]").trigger("click");
    });
    jQuery(".contact-bottom-fields select").fancySelect();
    if (jQuery("body.page-template-contact-page").length) {
        recaptcha();
        var globalCaptcha;

        function recaptcha() {
            globalCaptcha = requestAnimationFrame(recaptcha);
            if (jQuery('script + div').length == 1) {
                if (jQuery('script + div').offset().top > 2000) {
                    setTimeout(function () {
                        jQuery(window).scrollTop(jQuery('script + div').offset().top);
                    }, 50);
                    cancelAnimationFrame(globalCaptcha);
                }
            }
        }
        jQuery('.contacr-wrap form.wpcf7-form')[0].reset();
        if (localStorage.getItem("name") !== null) {
            jQuery('input[name="fname"]').val(localStorage.getItem("name"));
            localStorage.removeItem("name");
            jQuery('.contact-left-fields-inner h3').text('Tell us more about your needs');
        }
        if (localStorage.getItem("email") !== null) {
            jQuery('input[name="email"]').val(localStorage.getItem("email"));
            localStorage.removeItem("email");
        }
        if (localStorage.getItem("title") !== null) {
            jQuery('input[name="title"]').val(localStorage.getItem("title"));
            localStorage.removeItem("title");
        }
        jQuery("span.name").append("<span class='help-description'>first and LAST</span>");
        jQuery("span.email").append("<span class='help-description'>e.g. example@email.com</span>");
        jQuery("span.phone").append("<span class='help-description'>e.g. 310-567-1212.</span>");
        jQuery("span.company").append("<span class='help-description'>e.g. Google, or www.google.com</span>");
        jQuery(".badget-list > li").each(function () {
            if (jQuery(this).hasClass("active")) {
                jQuery(this).find("ul").show();
            }
        });
        jQuery(".badget-list > li span").on("click", function () {
            if (jQuery(this).parents("li").hasClass("active")) {
                jQuery(this).parents("li").removeClass("active");
                jQuery(this).parents("li").find("ul").slideUp(400, function () {
                    scene.duration(jQuery(".message").offset().top - jQuery(".diagram-wrap").offset().top - jQuery('.diagram-estimate').innerHeight() - 35);
                    jQuery(".diagram-wrap").css({
                        "height": "auto"
                    });
                });
            } else {
                jQuery(this).parents("li").addClass("active");
                jQuery(this).parents("li").find("ul").slideDown(400, function () {
                    scene.duration(jQuery(".message").offset().top - jQuery(".diagram-wrap").offset().top - jQuery('.diagram-estimate').innerHeight() - 35);
                    jQuery(".diagram-wrap").height(jQuery(".list-categories").height());
                });
            }
        });
        if (jQuery('#wpcf7-f4-p5-o1').length) {
            jQuery(".amount").val("10K-14K");
            jQuery(".data-min").attr("data-min", "10K-14K");
        } else {
            jQuery(".amount").val("10K-29K");
            jQuery(".data-min").attr("data-min", "10K-29K");
        }
        var colors = ["#00ff00", "#ff00ff", "#00ffff"];
        if (jQuery('#wpcf7-f4-p5-o1').length) {
            colors = ["#9B1F10", "#E97F72", "#701004"];
        }
        var doughnutData = [{
            value: 0,
            color: colors[0],
            label: "Web Experiences"
        }, {
            value: 0,
            color: colors[1],
            label: "Digital Marketing"
        }, {
            value: 0,
            color: colors[2],
            label: "Branding & Identity"
        }, {
            value: 1,
            color: "#e1e1e1",
            label: "NONE"
        }, ];
        window.onload = function () {
            var ctx = document.getElementById("chart-area").getContext("2d");
            window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, {
                responsive: true,
                animationEasing: "easeOutQuart",
                segmentStrokeWidth: 5,
                segmentStrokeColor: "#ffffff",
                showTooltips: false,
                percentageInnerCutout: 80,
            });
            var ctx2 = document.getElementById("chart-area2").getContext("2d");
            window.myDoughnut2 = new Chart(ctx2).Doughnut(doughnutData, {
                responsive: true,
                animationEasing: "easeOutQuart",
                segmentStrokeWidth: 5,
                segmentStrokeColor: "#ffffff",
                showTooltips: false,
                percentageInnerCutout: 80,
            });
        };
        var amount;
        jQuery(".badget-list input").on("change", function () {
            var a = 0;
            var brandCount = jQuery(".branding-list input:checked").length;
            var experiencesCount = jQuery(".experiences-list input:checked").length;
            var marketCount = jQuery(".marketing-list input:checked").length;
            if (jQuery("#id-6:checked").length == 1) {
                jQuery("#id-8").attr("data-value", "21");
            } else {
                jQuery("#id-8").attr("data-value", "65");
            }
            if (jQuery('#wpcf7-f4-p5-o1').length) {
                if (marketCount > 0) {
                    a = (a - 6 * marketCount) + 6;
                }
            } else {
                if (jQuery("#id-3:checked").length == 1) {
                    jQuery("#id-4").attr("data-value", "8");
                } else {
                    jQuery("#id-4").attr("data-value", "16");
                }
            }
            jQuery(".badget-list input:checked").each(function () {
                a += parseInt(jQuery(this).attr("data-value"), 10);
            });
            if (a > 0 || (a === 0 && jQuery("#id-7:checked").length == 1)) {
                jQuery(".select-checkbox").fadeOut();
                jQuery(".range-estimate, .title-beta").fadeIn(500);
                jQuery("#canvas-holder").addClass("active");
            } else {
                jQuery(".range-estimate, .title-beta").fadeOut();
                jQuery(".select-checkbox").fadeIn(500);
                jQuery("#canvas-holder").removeClass("active");
            }
            if (jQuery('#wpcf7-f4-p5-o1').length) {
                if (a <= 24) {
                    amount = "10K-14K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 34 && a >= 25) {
                    amount = "15K-24K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 49 && a >= 35) {
                    amount = "25K-39K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 74 && a >= 50) {
                    amount = "40K-64K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 99 && a >= 75) {
                    amount = "65K-89K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 174 && a >= 100) {
                    amount = "90K-164K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a >= 175) {
                    amount = "165K-250K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").addClass("disable");
                }
            } else {
                if (a <= 29) {
                    amount = "10K-29K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 59 && a >= 30) {
                    amount = "30K-59K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 99 && a >= 60) {
                    amount = "60K-99K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 150 && a >= 100) {
                    amount = "100K-150K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 200 && a >= 151) {
                    amount = "151K-200K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 350 && a >= 201) {
                    amount = "201K-350K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a <= 500 && a >= 351) {
                    amount = "351K-500K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                } else if (a >= 501) {
                    amount = "501K-750K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").addClass("disable");
                }
                if (jQuery('.branding-list input:checked').length == jQuery('.branding-list input').length && jQuery('.experiences-list input:checked').length == jQuery('.experiences-list input').length) {
                    amount = "501K-750K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").addClass("disable");
                }
                if (jQuery('.branding-list input:checked').length == 0 && jQuery('.experiences-list input:checked').length == 0 && marketCount >= 1) {
                    amount = "30K-59K";
                    jQuery(".range-minus").addClass("disable");
                    jQuery(".range-plus").removeClass("disable");
                }
            }
            jQuery(".amount").val(amount);
            jQuery(".data-min").attr("data-min", amount);
            var brand = jQuery(".branding-list input:checked").length;
            var experiences = jQuery(".experiences-list input:checked").length;
            var marketing = jQuery(".marketing-list input:checked").length;
            var nul = 0;
            if (brand === 0 && experiences === 0 && marketing === 0) {
                brand = 0;
                experiences = 0;
                marketing = 0;
                nul = 1;
                jQuery("input[name=check]").val("");
            } else {
                jQuery("input[name=check]").val("1");
            }
            myDoughnut.segments[0].value = experiences;
            myDoughnut.segments[1].value = marketing;
            myDoughnut.segments[2].value = brand;
            myDoughnut.segments[3].value = nul;
            myDoughnut.update();
            myDoughnut2.segments[0].value = experiences;
            myDoughnut2.segments[1].value = marketing;
            myDoughnut2.segments[2].value = brand;
            myDoughnut2.segments[3].value = nul;
            myDoughnut2.update();
        });
        jQuery(".range-plus").on("click", function () {
            if (!jQuery(this).hasClass("disable")) {
                var amount = jQuery(".data-min").attr("data-min");
                var amountVal = jQuery(".amount").val();
                jQuery(".range-minus").removeClass("disable");
                if (jQuery('#wpcf7-f4-p5-o1').length) {
                    if (amountVal == "10K-14K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="15K-24K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "15K-24K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="25K-39K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "25K-39K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="40K-64K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "40K-64K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="65K-89K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "65K-89K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="90K-164K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "90K-164K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="165K-250K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        jQuery(this).addClass("disable");
                    } else if (amountVal == "165K-250K") {
                        jQuery(this).addClass("disable");
                    }
                } else {
                    if (amountVal == "10K-29K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="30K-59K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "30K-59K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="60K-99K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "60K-99K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="100K-150K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "100K-150K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="151K-200K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "151K-200K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="201K-350K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "201K-350K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="351K-500K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "351K-500K") {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="501K-750K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        jQuery(this).addClass("disable");
                    } else if (amountVal == "501K-750K") {
                        jQuery(this).addClass("disable");
                    }
                }
            }
        });
        jQuery(".range-minus").on("click", function () {
            if (!jQuery(this).hasClass("disable")) {
                var amount = jQuery(".data-min").attr("data-min");
                var amountVal = jQuery(".amount").val();
                jQuery(".range-plus").removeClass("disable");
                if (jQuery('#wpcf7-f4-p5-o1').length) {
                    if (amountVal == "10K-14K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "15K-24K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="10K-14K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "10K-14K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "25K-39K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="15K-24K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "15K-24K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "40K-64K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text"  value="25K-39K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "25K-39K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "65K-89K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="40K-64K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "40K-64K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "90K-164K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="65K-89K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "65K-89K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "165K-250K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="90K-164K" readonly="" class="amount FromRight" name="amount">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "90K-164K") {
                            jQuery(this).addClass("disable");
                        }
                    } else {
                        jQuery(this).addClass("disable");
                    }
                } else {
                    if (amountVal == "10K-29K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                    } else if (amountVal == "30K-59K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="10K-29K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "10K-29K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "60K-99K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="30K-59K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "30K-59K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "100K-150K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text"  value="60K-99K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "60K-99K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "151K-200K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="100K-150K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "100K-150K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "201K-350K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="151K-200K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "151K-200K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "351K-500K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="201K-350K" readonly="" class="amount FromRight" name="amount" class="FromRight">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "201K-350K") {
                            jQuery(this).addClass("disable");
                        }
                    } else if (amountVal == "501K-750K" && amountVal != amount) {
                        jQuery(".amount").addClass("ToLeft");
                        jQuery(".range-minus").after('<input type="text" value="351K-500K" readonly="" class="amount FromRight" name="amount">');
                        setTimeout(function () {
                            jQuery(".ToLeft").remove();
                            jQuery(".FromRight").removeClass("FromRight");
                        }, 300);
                        if (jQuery(".data-min").attr("data-min") == "351K-500K") {
                            jQuery(this).addClass("disable");
                        }
                    } else {
                        jQuery(this).addClass("disable");
                    }
                }
            }
        });
    }
});
if (!isTouchDevice) {
    var id;
    jQuery(window).resize(function () {
        clearTimeout(id);
        roundDigitalSizes();
        totalHeight = parseInt((jQuery('.works-row').length - 1) * jQuery(window).height());
        _wHeight = jQuery(window).height();
        setScrollheight();
        id = setTimeout(doneResizing, 500);
        setWorkPageOrientation();
        setCaseStudySize();
        updateCaseStudyPositions();
        evenWidth();
    });
} else {
    window.addEventListener("orientationchange", function () {
        totalHeight = parseInt((jQuery('.works-row').length - 1) * jQuery(window).height());
        _wHeight = jQuery(window).height();
        jQuery('.digital .line-white').addClass('ready');
        setTimeout(function () {
            _wHeight = jQuery(window).height();
            doneResizing();
            if (jQuery(".diagram-wrap").length) {
                topTrigger = jQuery(".diagram-wrap").offset().top + jQuery(window).height() / 2 - 81;
                jQuery("#trigger2").css("top", topTrigger + "px");
                scene.duration(jQuery(".message").offset().top - jQuery(".diagram-wrap").offset().top - jQuery('.diagram-estimate').innerHeight() - 35);
                scene.refresh();
            }
            setScrollheight();
            convertVhToPx();
            setCaseStudySize();
            updateCaseStudyPositions();
            evenWidth();
            setWorkPageOrientation();
            roundDigitalSizes();
        }, 500);
    }, false);
}

function doneResizing() {
    workinner();
    heightFullScreen(jQuery(".work-video"));
    heightFullScreen(jQuery(".single-work .case-study-top"));
    var r = jQuery(window).width() / 2 - jQuery(".laptop-position.active").width() / 2;
    jQuery(".laptop-position.active").css({
        "right": r + "px"
    });
    workLines();
}
jQuery(window).scroll(function () {
    pageAnimation();
    scrollImage1();
    setPrevNextPosition();
});
jQuery('#main').scroll(function () {
    mainSectionAnimation();
    nowHiringAnimation();
});
if (jQuery('body.home').length) {
    jQuery(window).bind('touchend', function (event) {
        if (jQuery('#main').hasClass('activated')) {
            if ((jQuery('#main').scrollTop() === 0 || jQuery('#main').scrollTop() == 1 || jQuery('#main').scrollTop() < 0) && flagS != 1) {
                jQuery('.return-to-top').addClass('hide');
                jQuery('.hero-nav li:last-child').removeClass('current');
                jQuery('.hero-nav').removeClass('last-section');
                jQuery('.hero-nav li').eq(-2).addClass('current');
                jQuery('#header').removeClass('scrolled');
                TweenLite.to('.hero-carousel', 2.4, {
                    x: '0%',
                    ease: Power4.easeIn,
                    onComplete: function () {
                        flagS = 0;
                    }
                });
                TweenLite.to('.hero-carousel', 0.8, {
                    y: '0%',
                    ease: Power4.easeIn,
                    onComplete: function () {
                        jQuery('body').removeClass('no-section-scroll');
                        jQuery('#main').removeClass('activated');
                        clearTimeout(carouselAnimated);
                        clearTimeout(carouselAnimated2);
                        heroCarouselAnimate(jQuery('.hero-nav li:last-child').index());
                    }
                });
                TweenLite.to('#main', 0.8, {
                    y: '100%',
                    ease: Power4.easeIn
                });
            }
            setTimeout(function () {
                flagS = 0;
            }, 2400);
        }
    });
}
var t = 0;

function mainSectionAnimation() {
    jQuery('#main').bind(' DOMMouseScroll', function (event) {
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            if ((jQuery('#main').scrollTop() === 0 || jQuery('#main').scrollTop() == 1) && !jQuery('#main').hasClass('to-move') && flagS != 1) {
                jQuery('.return-to-top').addClass('hide');
                jQuery('.hero-nav li:last-child').removeClass('current');
                jQuery('.hero-nav li').eq(-2).addClass('current');
                jQuery('.hero-nav').removeClass('last-section');
                flagS = 1;
                jQuery('#main').addClass('to-move');
                jQuery('#header').removeClass('scrolled');
                TweenLite.to('.hero-carousel', 0.8, {
                    y: '0%',
                    ease: Power4.easeIn,
                    onComplete: function () {
                        jQuery('body').removeClass('no-section-scroll');
                        jQuery('#main').removeClass('to-move');
                        clearTimeout(carouselAnimated);
                        clearTimeout(carouselAnimated2);
                        heroCarouselAnimate(jQuery('.hero-nav li:last-child').index());
                        if (jQuery('.hero-nav li.current').index() % 2 != 0) {
                            jQuery('#header').addClass('purple');
                            jQuery('.hero-nav').addClass('grey');
                        } else {
                            jQuery('#header').removeClass('purple');
                            jQuery('.hero-nav').removeClass('grey');
                        }
                    }
                });
                TweenLite.to('#main', 0.8, {
                    y: '100%',
                    ease: Power4.easeIn,
                    onComplete: function () {}
                });
                setTimeout(function () {
                    flagS = 0;
                }, 3000);
            }
        }
    });
    jQuery('.power-statement .deco span').css({
        '-webkit-transform': 'translate(0,' + jQuery('#main').scrollTop() * 0.3 + 'px)',
        'transform': 'translate(0,' + jQuery('#main').scrollTop() * 0.3 + 'px)'
    });
    document.addEventListener('mousewheel', function (e) {
        if (jQuery('body').hasClass('no-section-scroll')) {
            if (e.wheelDelta !== 0) {
                if (e.wheelDelta < 0) {} else {
                    if ((jQuery('#main').scrollTop() === 0 || jQuery('#main').scrollTop() == 1) && !jQuery('#main').hasClass('to-move') && flagS != 1) {
                        jQuery('.return-to-top').addClass('hide');
                        jQuery('.hero-nav li:last-child').removeClass('current');
                        jQuery('.hero-nav li').eq(-2).addClass('current');
                        jQuery('.hero-nav').removeClass('last-section');
                        flagS = 1;
                        jQuery('#main').addClass('to-move');
                        jQuery('#header').removeClass('scrolled');
                        TweenLite.to('.hero-carousel', 0.8, {
                            y: '0%',
                            ease: Power4.easeIn,
                            onComplete: function () {
                                jQuery('body').removeClass('no-section-scroll');
                                jQuery('#main').removeClass('to-move');
                                clearTimeout(carouselAnimated);
                                clearTimeout(carouselAnimated2);
                                heroCarouselAnimate(jQuery('.hero-nav li:last-child').index());
                                if (jQuery('.hero-nav li.current').index() % 2 != 0) {
                                    jQuery('#header').addClass('purple');
                                    jQuery('.hero-nav').addClass('grey');
                                } else {
                                    jQuery('#header').removeClass('purple');
                                    jQuery('.hero-nav').removeClass('grey');
                                }
                            }
                        });
                        TweenLite.to('#main', 0.8, {
                            y: '100%',
                            ease: Power4.easeIn,
                            onComplete: function () {}
                        });
                        flagS = 1;
                    }
                    if (t == 0) {
                        setTimeout(function () {
                            flagS = 0;
                            t = 0;
                        }, 4000);
                    }
                    t = 1;
                }
            } else {
                e.preventDefault();
                return false;
            }
        }
    });
    var top = jQuery('#main').scrollTop();
    var k2 = 0.8;
    var k3 = 0.9;
    var k4 = 1;
    var wHeight = jQuery(window).height();
    if (isTouchDevice) {
        k = k1 = k2 = k3 = k4 = 1.05;
    }
    if (jQuery('.top-footer').length) {
        if ((top + wHeight * k4) > jQuery('.top-footer').offset().top) {
            jQuery('.top-footer').addClass('animated');
        }
    }
    if (jQuery('.insights').length) {
        jQuery('.insights .insight-row ').each(function () {
            if ((top + wHeight) > jQuery(this).offset().top) {
                jQuery(this).addClass('animated');
            }
        });
    }
    jQuery('.power-statement').addClass('animated');
    wordsChanging();
    TweenLite.to(jQuery(".power-statement #blockquote-line-1")[0], 0.05, {
        attr: {
            y2: 400
        }
    });
    TweenLite.to(jQuery(".power-statement #blockquote-line-2")[0], 0.3, {
        attr: {
            x2: 66
        },
        delay: 0.05
    });
    TweenLite.to(jQuery(".power-statement #blockquote-line-3")[0], 0.3, {
        attr: {
            y2: 0
        },
        delay: 0.36
    });
    TweenLite.to(jQuery(".power-statement #blockquote-line-4")[0], 0.15, {
        attr: {
            x2: 257
        },
        delay: 0.65
    });
    TweenLite.to(jQuery(".power-statement #shadow")[0], 0.5, {
        attr: {
            y: 49,
            x: 0
        },
        css: {
            'opacity': '1'
        },
        delay: 0.8
    });
    jQuery('#main').addClass('activated');
}
jQuery(window).load(function () {
    fixWorkPage();
    fixIntro();
    workinner();
    setTimeout(function () {
        workinner();
    }, 1000);
    pageAnimation();
    scrollImage1();
    setPrevNextPosition();
    jQuery('.post-hero-image').addClass('show');
});

function pageAnimation() {
    var k = 0.6;
    var k1 = 0.4;
    var k2 = 0.8;
    var k3 = 0.9;
    var k4 = 1;
    var wHeight = jQuery(window).height();
    if (isTouchDevice) {
        k = k1 = k2 = k3 = k4 = 1.05;
    }
    nowHiringAnimation();
    if (jQuery('.top-footer').length) {
        if ((window.pageYOffset + wHeight * k4) > jQuery('.top-footer').offset().top) {
            jQuery('.top-footer').addClass('animated');
        }
    }
    if (jQuery('.insights').length) {
        if ((window.pageYOffset + wHeight * k) > jQuery('.insights').offset().top) {
            jQuery('.insights').find('.square').addClass('animate');
        }
        jQuery('.insights .insight-row ').each(function () {
            if ((window.pageYOffset + wHeight * k2) > jQuery(this).offset().top) {
                jQuery(this).addClass('animated');
            }
        });
    }
    if (jQuery('.hero-carousel').length) {
        var s = 1;
        jQuery(".slide-outer").each(function () {
            if ((window.pageYOffset + wHeight * k3) > jQuery(this).offset().top) {
                if (!jQuery(this).hasClass('already')) {
                    if (isTouchDevice) {
                        jQuery(this).find('.img-holder .img-holder-in-r img:first-child').css('width', '2000px');
                    }
                    jQuery(this).addClass('already');
                    var _this = jQuery(this);
                    var i = s;
                    TweenLite.to('.slide-outer-0' + i, 0.01, {
                        y: '-100%',
                        ease: Power0.easeNone,
                        onComplete: function () {
                            jQuery('.slide-outer-0' + i).show().addClass('active');
                        }
                    });
                    i2 = i * 1 + 1;
                    TweenLite.to('.slide-outer-0' + i2 + ' .slide-wrap', 0.8, {
                        scale: jQuery('.slide-outer-0' + i).attr('data-ratio'),
                        ease: Power4.easeIn
                    });
                    TweenLite.to('.slide-outer-0' + i, 0.8, {
                        y: '0%',
                        ease: Power4.easeIn,
                        onComplete: function () {
                            TweenLite.to('.slide-outer-0' + i2 + ' .slide-wrap', 0.01, {
                                scale: jQuery('.slide-outer-0' + i).attr('data-ratio'),
                                ease: Power4.easeIn
                            });
                            jQuery('.slide-outer-0' + i).next().hide();
                            jQuery('.slide-outer-0' + i).next().find('.slide').removeClass('animate animated animated2 move-iphone move-laptop move-tablet');
                            jQuery('.slide-outer-0' + i).next().find('.hero-entry').removeClass('animate');
                            heroCarouselAnimate(i);
                            setTimeout(function () {
                                _this.find('.img-holder .img-holder-in-r img:first-child').css('width', '');
                            }, 500)
                        },
                        delay: 0.1
                    });
                }
            }
            s++;
        });
    }
    if (jQuery('.large-image-right').length) {
        jQuery(".large-image-right-wrap").each(function () {
            if ((window.pageYOffset + wHeight * k3) > jQuery(this).offset().top) {
                var kof1 = window.pageYOffset + wHeight - jQuery(this).offset().top;
                kof = kof1 * 0.2;
                kofText = -1 * kof1 * 0.3;
                kofImg = -1 * kof1 * 0.01;
                kofDeg = -1 * kof1 / 2 * 0.03;
                jQuery(this).css({
                    "background-position": "90% " + kof + "px"
                });
                jQuery(this).prev('.text-bg').css({
                    "-webkit-transform": "translate(0, " + kofText + "px)",
                    "transform": "translate(0, " + kofText + "px)",
                });
            }
        });
    }
    if (jQuery('.swiper-container').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.swiper-container').offset().top) {
            if (!jQuery('.swiper-container').hasClass('slided-to') && swiper !== null) {
                swiper.slideNext();
                jQuery('.swiper-container').addClass('slided-to');
            }
        }
    }
    if (jQuery('.post-gallery').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.post-gallery').offset().top && jQuery('.post-gallery').hasClass('initialized')) {
            if (!jQuery('.post-gallery').hasClass('slided-to')) {
                jQuery('.post-gallery').slick("slickNext");
                jQuery('.post-gallery').addClass('slided-to');
            }
        }
    }
    if (jQuery('.text-carousel-wrap').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.text-carousel-wrap').offset().top) {
            jQuery('.text-carousel-wrap').addClass('animate');
        }
    }
    if (jQuery('.ideals').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.ideals').offset().top) {
            jQuery('.ideals').addClass('animate');
        }
    }
    if (jQuery('.two-cols-belkin').length) {
        if ((window.pageYOffset + wHeight * k) > jQuery('.two-cols-belkin').offset().top) {
            jQuery('.two-cols-belkin').addClass('animate');
        }
    }
    if (jQuery('.large-image-right').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.large-image-right').offset().top) {
            jQuery('.large-image-right').addClass('animate');
        }
    }
    if (jQuery('.laptop-position').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.laptop-position').offset().top) {
            jQuery('.laptop-position').addClass('animate');
        }
    }
    if (jQuery('body.archive').length) {
        if ((window.pageYOffset + wHeight * k) > jQuery(".insights-wrap").offset().top) {
            var kof1 = window.pageYOffset + wHeight - jQuery(".insights-wrap").offset().top;
            kof = -1 * kof1 * 0.04;
            jQuery('.insights-wrap').css({
                "background-position": "center " + kof + "px"
            });
        }
        var kof11 = window.pageYOffset + wHeight - jQuery(".head-circle").offset().top;
        kof = kof11 * 0.2;
        jQuery('.head-circle').css({
            "-webkit-transform": "translate(0, " + kof + "px)",
            "transform": "translate(0, " + kof + "px)"
        });
    }
    if (jQuery('.mobi-block').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.mobi-block .inner').offset().top) {
            jQuery('.mobi-block').addClass('animate');
        }
    }
    if (jQuery('.body-txt').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.body-txt .col-l').offset().top) {
            jQuery('.body-txt .col-l, .body-txt .col-r').addClass('animated');
        }
    }
    if (jQuery('.single-post').length && jQuery("blockquote").length) {
        jQuery('blockquote').each(function () {
            if ((window.pageYOffset + wHeight * k2) > jQuery(this).offset().top) {
                jQuery(this).addClass('animate');
                TweenLite.to(jQuery(this).find("#blockquote-line-1")[0], 0.11, {
                    attr: {
                        x1: 2
                    }
                });
                TweenLite.to(jQuery(this).find("#blockquote-line-2")[0], 0.3, {
                    attr: {
                        y1: 0
                    },
                    delay: 0.11
                });
                TweenLite.to(jQuery(this).find("#blockquote-line-3")[0], 0.3, {
                    attr: {
                        x2: 104
                    },
                    delay: 0.41
                });
                TweenLite.to(jQuery(this).find("#blockquote-line-4")[0], 0.05, {
                    attr: {
                        y2: 15
                    },
                    delay: 0.71
                });
            }
        });
        if ((window.pageYOffset + wHeight * k2) > jQuery('.post-head').offset().top) {
            jQuery('.post-head').addClass('active');
        }
        if ((window.pageYOffset + wHeight) * 0.9 > jQuery('.top-green-dot').offset().top) {
            var pos = (window.pageYOffset + wHeight - jQuery('.top-green-dot').offset().top + 150) * 0.2 - 150;
            jQuery(".top-green-dot").css({
                "-webkit-transform": "translateY(" + pos + "px)",
                "transform": "translateY(" + pos + "px)",
            });
        }
    }
    if (jQuery('.page-template-contact-page').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.head-right-inner').offset().top) {
            jQuery('.head-right-inner').addClass('animated');
        }
        if ((window.pageYOffset + wHeight * k2) > jQuery('.contact-right-fields-inner').offset().top) {
            jQuery('.contact-right-fields-inner').addClass('animated');
            jQuery('.contact-right-fields').addClass('animate');
        }
        if ((window.pageYOffset + wHeight * k2) > jQuery('.address').offset().top) {
            jQuery('.address').addClass('animated');
        }
        if ((window.pageYOffset + wHeight * k2) > jQuery('.say-hello').offset().top) {
            jQuery('.say-hello').addClass('animated');
        }
    }
    if (jQuery('.page-template-careers-page').length || jQuery('.single-position').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.address').offset().top) {
            jQuery('.address').addClass('animated');
        }
        if ((window.pageYOffset + wHeight * k2) > jQuery('.say-hello').offset().top) {
            jQuery('.say-hello').addClass('animated');
        }
    }
    if (jQuery('.positions').length) {
        jQuery('.positions .row-position ').each(function () {
            if ((window.pageYOffset + wHeight * k2) > jQuery(this).offset().top) {
                jQuery(this).addClass('animated');
            }
        });
    }
    if (jQuery('.page-template-work-page').length) {
        if (jQuery('.current-work .work-row').length) {
            jQuery('.current-work .work-row').each(function () {
                if ((window.pageYOffset + wHeight * k) > jQuery(this).offset().top) {
                    jQuery('.work-navigation-wrap').addClass('to-show');
                    jQuery(this).addClass('animate');
                    var _this = jQuery(this);
                    setTimeout(function () {
                        _this.addClass('completed');
                    }, 700);
                    jQuery('.work-row .quotes').removeClass("done");
                    jQuery('.work-row .quotes img').removeClass("hide show");
                    animateQuote();
                }
            });
        }
    }
    if (jQuery(".work-quote").length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery(".work-quote-inner").offset().top) {
            jQuery(".work-quote").addClass('animate');
            animateQuote();
        }
    }
    if (jQuery(".work-head").length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery(".work-head").offset().top) {
            jQuery(".work-head").addClass('animate');
        }
    }
    if (jQuery(".work-type").length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery(".work-type").offset().top) {
            jQuery(".current-work .work-type").find(".work-services").addClass('animated');
            jQuery(".current-work .work-type").find(".work-techno").addClass('animated');
            jQuery(".right-intro").addClass('animate');
        }
    }
    if (jQuery('.services-list').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.services-list h2').offset().top) {
            jQuery('.services-list h2').addClass('animated');
        }
        jQuery('.services-row').each(function () {
            if ((window.pageYOffset + wHeight * k2) > jQuery(this).offset().top) {
                jQuery(this).addClass('animate');
            }
        });
    }
    if (jQuery('.power-services h3').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.power-services h3').offset().top) {
            jQuery('.power-services h3').addClass('animate');
            animateQuote();
        }
    }
    if (jQuery('.feature-txt').length) {
        if ((window.pageYOffset + wHeight) > jQuery('.feature-txt .col-r').offset().top) {
            jQuery('.feature-txt .col-r').addClass('animated');
            setTimeout(function () {
                jQuery('.page-template-flexible-page .feature-txt .col-r p').addClass('animate');
            }, 400);
        }
    }
    if (jQuery('.feature-txt .entry').length) {
        if ((window.pageYOffset + wHeight) > jQuery('.feature-txt .entry').offset().top) {
            jQuery('.feature-txt .entry').addClass('animated');
        }
    }
    if (jQuery('.feature-txt .col-r .deco-bottom').length) {
        if ((window.pageYOffset + wHeight * k3) > jQuery('.feature-txt .col-r .deco-bottom').offset().top) {
            jQuery('.feature-txt .col-r .deco-bottom').addClass('show');
        }
    }
    if (jQuery('.statement-top').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.statement-top').offset().top) {
            jQuery('.statement-top,.instagram-purple').addClass('animate');
        }
        if ((window.pageYOffset + wHeight * k2) > jQuery('.statement-top .entry').offset().top) {
            jQuery('.statement-top .entry').addClass('animate');
            jQuery('.work-row .quotes').removeClass("done");
            jQuery('.work-row .quotes img').removeClass("hide show");
            jQuery('.verticals-in > h3, .verticals-in .entry').addClass('animated');
            jQuery('.statement-top  .quotes').each(function () {
                if (!jQuery(this).hasClass('done')) {
                    jQuery(this).addClass('done');
                    var imgs = jQuery(this).find('img');
                    var k = 0;
                    var c = 0;
                    repeatOften();

                    function repeatOften() {
                        if (c % 3 === 0) {
                            if (k === 0) {
                                jQuery(imgs[k]).addClass('hide');
                                jQuery(imgs[k + 1]).addClass('show');
                            } else if (k == (imgs.length - 1)) {
                                return false;
                            } else {
                                jQuery(imgs[k]).removeClass('show');
                                jQuery(imgs[k + 1]).addClass('show');
                            }
                            k++;
                        }
                        c++;
                        requestAnimationFrame(repeatOften);
                    }
                }
            });
        }
        if (jQuery('.verticals').length) {
            if ((window.pageYOffset + wHeight * k2) > jQuery('.verticals').offset().top && jQuery(window).width() < 768) {
                jQuery('.verticals-in > h3, .verticals-in .entry').addClass('animated');
            }
        }
    }
    if (jQuery('.instagram-widget').length) {
        if ((window.pageYOffset + wHeight * k3) > jQuery('.instagram-widget').offset().top) {
            jQuery('.instagram-widget').addClass('animate');
        }
    }
    if (jQuery('.verticals .entry').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.verticals .services').offset().top) {
            jQuery('.verticals .services').addClass('animated');
        }
    }
    if (jQuery('.accolades').length) {
        if ((window.pageYOffset + wHeight * k3) > jQuery('.accolades ul').offset().top) {
            jQuery('.accolades ul').addClass('animate');
        }
    }
    var time = 1.5;
    if (jQuery('.verticals').length) {
        if ((window.pageYOffset + wHeight * k2) > (jQuery('.verticals .graph').offset().top + parseInt(jQuery('.verticals .graph').css('padding-top'))) && !jQuery('.graph').hasClass('animate')) {
            setTimeout(function () {
                jQuery('.graph').addClass('animate');
            }, 750);
            if (!jQuery('.green-line2').hasClass('activated')) {
                jQuery('.green-line2').addClass('activated');
                var svg = jQuery('.green-line2'),
                    line = jQuery('#line2', svg),
                    r = 50,
                    h = 47,
                    t = 1,
                    circles = [{
                        x: 0,
                        y: 0
                    }, {
                        x: 400,
                        y: 0
                    }, {
                        x: 800,
                        y: 0
                    }],
                    tm = new TimelineMax({
                        repeat: -1,
                        onUpdate: setPos
                    });

                function setPos() {
                    var path = 'M-100,' + h;
                    circles.forEach(function (c, index) {
                        path += ' S' + (c.x - r) + ',' + c.y + ' ' + ((index == circles.length - 1) ? 1000 : (c.x + r)) + ',' + h;
                    });
                    TweenLite.to(line, 1.5, {
                        morphSVG: path
                    });
                }
                setPos();
                tm.add(new TimelineMax().to(circles[0], t, {
                    y: 60
                }).to(circles[1], t, {
                    y: 0
                }, 0).to(circles[2], t, {
                    y: 60
                }, 0)).add(new TimelineMax().to(circles[0], t, {
                    y: 10
                }).to(circles[1], t, {
                    y: 0
                }, 0).to(circles[2], t, {
                    y: -60
                }, 0)).add(new TimelineMax().to(circles[0], t, {
                    y: -10
                }).to(circles[1], t, {
                    y: 10
                }, 0).to(circles[2], t, {
                    y: -10
                }, 0)).add(new TimelineMax().to(circles[0], t, {
                    y: 10
                }).to(circles[1], t, {
                    y: -10
                }, 0).to(circles[2], t, {
                    y: 10
                }, 0));
            }
            if (!jQuery('.graph').hasClass('pulse')) {
                setTimeout(function () {
                    function getRandomArbitrary(min, max) {
                        return Math.random() * (max - min) + min;
                    }
                    var c = 0;
                    greenLineAnimation();

                    function greenLineAnimation() {
                        if (c % 30 === 0) {
                            a1 = 11.7 + getRandomArbitrary(-11, 11);
                            a2 = 42.3 + getRandomArbitrary(-6, 6);
                            a3 = 49.7 + getRandomArbitrary(-6, 6);
                            a4 = 33 + getRandomArbitrary(-11, 11);
                            a5 = 436.3 + getRandomArbitrary(-15, 15);
                            a6 = 470 + getRandomArbitrary(-15, 15);
                            a7 = 23 + getRandomArbitrary(-6, 6);
                            a8 = 123 + getRandomArbitrary(-15, 15);
                            a9 = 79.2 + getRandomArbitrary(-15, 15);
                            a10 = -2 + getRandomArbitrary(-30, -15);
                            TweenLite.to("#line", 1.5, {
                                morphSVG: "M" + a10 + ",61C107," + a1 + ",228.7," + a2 + ",268.3," + a3 + "s77.9,6.8,95.8,4.2C390.4,49.9," + a5 + ",22," + a6 + "," + a7 + "c42.7,1.3,86.3-19.1," + a8 + "-18.5c" + a9 + ",1.2,66.2," + a4 + ",218,34.5L1000,50"
                            });
                            TweenLite.to("#line-black", 1.5, {
                                morphSVG: "M" + a10 + ",61C107," + a1 + ",228.7," + a2 + ",268.3," + a3 + "s77.9,6.8,95.8,4.2C390.4,49.9," + a5 + ",22," + a6 + "," + a7 + "c42.7,1.3,86.3-19.1," + a8 + "-18.5c" + a9 + ",1.2,66.2," + a4 + ",218,34.5L1000,50"
                            });
                        }
                        c++;
                        requestAnimationFrame(greenLineAnimation);
                    }
                    jQuery('.graph').addClass('pulse');
                }, 1500);
            }
        }
    }
    if (jQuery('.start-discuss').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.start-discuss').offset().top) {
            jQuery('.start-discuss').addClass('animated');
        }
    }
    if (jQuery('.contact-bottom-section').length) {
        if ((window.pageYOffset + wHeight * k2) > jQuery('.contact-bottom-section').offset().top) {
            jQuery('.contact-bottom-section').addClass('animated');
        }
    }
    if (jQuery('.header-blog').length) {
        if ((window.pageYOffset + wHeight * k3) > jQuery(".header-blog").offset().top) {
            var firstImg = new Image();
            firstImg.onload = function () {
                jQuery(".overlay").addClass('animate');
            };
            firstImg.src = jQuery('.header-blog').prev().attr('data-src');
            jQuery(".insights-wrap").addClass('animate');
            setTimeout(function () {
                if (jQuery('.insights').length) {
                    jQuery('.insights .insight-row ').each(function () {
                        if ((window.pageYOffset + wHeight) > jQuery(this).offset().top) {
                            jQuery(this).addClass('animated');
                        }
                    });
                }
            }, 1500);
        }
    }
    if (jQuery('.page-template-careers-page .our-ideals').length) {
        if ((window.pageYOffset + wHeight * 0.8) > jQuery('.our-ideals .main-txt p').offset().top) {
            jQuery('.our-ideals .main-txt').addClass('ready');
        }
    }
    if (jQuery('.wpcf7-form  .col-50').length) {
        if ((window.pageYOffset + wHeight * k2) > (jQuery('.wpcf7-form  .col-50').offset().top + 100)) {
            jQuery('.wpcf7-form  .col-50').addClass('animated');
        }
    }
    if (jQuery('.start-discuss  button').length) {
        if ((window.pageYOffset + wHeight * k2) > (jQuery('.start-discuss  button').offset().top + 100)) {
            jQuery('.start-discuss  button').addClass('bounce');
        }
    }
    if (jQuery('.wpcf7-form  .col-100').length) {
        if ((window.pageYOffset + wHeight * k2) > (jQuery('.wpcf7-form  .col-100').offset().top + 100)) {
            jQuery('.wpcf7-form  .col-100').addClass('animated');
        }
    }
    if (jQuery('.small-header').length) {
        jQuery('.small-header h1').addClass('animated');
    }
    if (jQuery('.page-template-flexible-page').length) {
        if (jQuery('.page-template-flexible-page .two-cols').length) {
            jQuery('.page-template-flexible-page .two-cols').each(function () {
                if ((window.pageYOffset + wHeight * k2) > jQuery(this).offset().top) {
                    jQuery(this).addClass('animated');
                }
            });
        }
        if (jQuery('.page-template-flexible-page .two-columns').length) {
            jQuery('.page-template-flexible-page .two-columns').each(function () {
                if ((window.pageYOffset + wHeight * k2) > jQuery(this).offset().top) {
                    jQuery(this).addClass('animated');
                }
            });
        }
    }
}

function setEqualMinHeight(columns) {
    var tallestcolumn = 0;
    columns.each(function () {
        jQuery(this).css({
            "height": "auto"
        });
        currentHeight = jQuery(this).height();
        if (currentHeight > tallestcolumn) {
            tallestcolumn = currentHeight;
        }
    });
    columns.css({
        height: tallestcolumn
    });
}

function scrollImage1() {
    var k = 1;
    if (jQuery('.head-circle').length) {
        kof = (window.pageYOffset + jQuery(window).height()) * 0.45;
        jQuery('.head-circle').css({
            "-webkit-transform": "translate(0, " + kof + "px)",
            "transform": "translate(0, " + kof + "px)"
        });
    }
    if (jQuery('.parallax-single-photo').length) {
        jQuery(".parallax-single-photo").each(function () {
            if ((window.pageYOffset + jQuery(window).height() * k) > jQuery(this).offset().top) {
                var kof1 = window.pageYOffset + jQuery(window).height() - jQuery(this).offset().top;
                kof = kof1 * 0.06;
                jQuery(this).css({
                    "background-position": "center " + kof + "%"
                });
            }
        });
    }
    if (jQuery('.work-quote').length) {
        jQuery(".work-quote").each(function () {
            if ((window.pageYOffset + jQuery(window).height() * k) > jQuery(this).offset().top) {
                var kof1 = window.pageYOffset + jQuery(window).height() - jQuery(this).offset().top;
                kof = kof1 * 0.04;
                jQuery(this).css({
                    "background-position": "center " + kof + "%"
                });
                kof = -1 * kof1 / 2 * 0.4;
                jQuery(this).find('.background-quote').css({
                    "-webkit-transform": "translate(0, " + kof + "px)",
                    "transform": "translate(0, " + kof + "px)"
                });
            }
        });
    }
}
var symbols;
var txt = jQuery('textarea'),
    hiddenDiv = jQuery(document.createElement('div')),
    content = null;
txt.addClass('txtstuff');
hiddenDiv.addClass('hiddendiv common');
jQuery('.wpcf7-form textarea').after(hiddenDiv);
txt.on('keyup paste', function () {
    content = jQuery(this).val();
    content = content.replace(/\n/g, '<br>');
    content = content.replace(/  /g, " &nbsp;");
    hiddenDiv.html(content + '<br class="lbr">');
    jQuery(this).css('height', hiddenDiv.outerHeight() + 10);
});

function activeMark() {
    if (jQuery(".markings").length && jQuery(".filter-insights .active").length) {
        var startPos = jQuery(".filter-insights .active").offset().left;
        var endPos = jQuery(".filter-insights .active").offset().left + jQuery(".filter-insights .active").width();
        jQuery(".markings span").each(function () {
            if (jQuery(this).offset().left >= startPos && jQuery(this).offset().left < endPos) {
                jQuery(this).addClass("current");
            } else {
                jQuery(this).removeClass("current");
            }
        });
    }
}
jQuery(window).bind("DOMMouseScroll", function (event) {
    if (jQuery("body.page-template-work-page").length) {
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            if (jQuery('body').hasClass('in-move') || flagW == 1) {
                return false;
            } else {
                scrollDown(0);
                flagW = 1;
                setTimeout(function () {
                    flagW = 0;
                }, 1000);
            }
        } else {
            if (jQuery('body').hasClass('in-move') || flagW == 1) {
                return false;
            } else {
                setTimeout(function () {
                    flagW = 0;
                }, 1000);
                scrollDown(1);
                flagW = 1;
            }
        }
    }
});
var flagW = 0;
document.addEventListener('mousewheel', function (e) {
    if (jQuery("body.page-template-work-page").length) {
        if (flagW != 1 && e.wheelDelta !== 0) {
            if (e.wheelDelta < 0) {
                scrollDown(1);
                flagW = 1;
            } else {
                scrollDown(0);
                flagW = 1;
            }
            setTimeout(function () {
                flagW = 0;
            }, 2000);
            e.preventDefault();
            return false;
        } else {
            e.preventDefault();
            return false;
        }
    }
});
jQuery(window).keydown(function (e) {
    if (jQuery("body.page-template-work-page").length) {
        var det;
        var flag = 0;
        if (e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 33) {
            det = 0;
            flag = 1;
        }
        if (e.keyCode == 37 || e.keyCode == 40 || e.keyCode == 34) {
            det = 1;
            flag = 1;
        }
        if (flag == 1) {
            scrollDown(det);
        }
    }
});

function scrollDown(event) {
    clearInterval(firstLaunchW);
    firstLaunchFlagW = false;
    if (!jQuery('body').hasClass("in-move")) {
        jQuery('body').addClass('in-move');
        if (event == 1) {
            var nextWork = jQuery(".all-works .work-row.in-view").index() + 1;
            if (jQuery(".all-works .work-row").length == nextWork) {
                jQuery('body').removeClass('in-move');
                jQuery('.work-row.animate').addClass('completed');
                return false;
            } else {
                jQuery(".navigation-item").removeClass("slick-current");
                jQuery(".navigation-item").eq(nextWork).trigger("click").addClass("slick-current");
            }
            if (jQuery(".all-works .work-row").length - 1 == nextWork) {
                jQuery("#footer").fadeIn();
                jQuery(".work-navigation .slick-next").addClass("disable");
            } else {
                jQuery(".work-navigation .slick-next").removeClass("disable");
            }
            jQuery(".all-works .work-row").removeClass("in-view");
            jQuery(".all-works .work-row").eq(nextWork).addClass("in-view").clone().appendTo(".fake-work");
            jQuery(".next-work").on("click", function () {
                scrollDown(1);
            });
            jQuery(".fake-work").addClass("a");
            setTimeout(function () {
                jQuery(".fake-work").addClass("fromBottom");
                jQuery(".current-work").addClass("toTop");
                jQuery(".work-navigation .total").addClass('hide');
            }, 100);
            setTimeout(function () {
                jQuery(".fromBottom").find(".work-row").addClass('animate');
                jQuery('.work-row .quotes').removeClass("done");
                jQuery('.work-row .quotes img').removeClass("hide show");
                animateQuote();
                jQuery(".work-navigation .total strong").text(jQuery('.navigation-item.slick-current').attr('data-slide'));
            }, 200);
            setTimeout(function () {
                jQuery(".current-work").remove();
                jQuery(".fake-work").addClass("current-work").removeClass("fake-work fromBottom a b");
                jQuery(".current-work").after("<div class='fake-work'/>");
            }, 300);
            setTimeout(function () {
                jQuery('body').removeClass('in-move');
                jQuery('.work-row.animate').addClass('completed');
            }, 200);
            setTimeout(function () {
                jQuery(".work-navigation .total").removeClass('hide');
            }, 500);
            if (nextWork === 0) {
                jQuery(".work-navigation .slick-prev").addClass("disable");
            } else {
                jQuery(".work-navigation .slick-prev").removeClass("disable");
            }
        } else {
            jQuery("#footer").fadeOut();
            var nextWork = jQuery(".all-works .work-row.in-view").index() - 1;
            if (nextWork === 0) {
                jQuery(".work-navigation .slick-prev").addClass("disable");
            } else {
                jQuery(".work-navigation .slick-prev").removeClass("disable");
            }
            if (nextWork == -1) {
                jQuery('body').removeClass('in-move');
                jQuery('.work-row.animate').addClass('completed');
                return false;
            } else {
                jQuery(".navigation-item").removeClass("slick-current");
                jQuery(".navigation-item").eq(nextWork).trigger("click").addClass("slick-current");
            }
            jQuery(".all-works .work-row").removeClass("in-view");
            jQuery(".all-works .work-row").eq(nextWork).addClass("in-view").clone().appendTo(".fake-work");
            jQuery(".next-work").on("click", function () {
                scrollDown(1);
            });
            jQuery(".fake-work").addClass("b");
            setTimeout(function () {
                jQuery(".fake-work").addClass("fromTop");
                jQuery(".current-work").addClass("toBottom");
                jQuery(".work-navigation .total").addClass('hide');
            }, 100);
            setTimeout(function () {
                jQuery(".fromTop").find(".work-row").addClass('animate');
                jQuery('.work-row .quotes').removeClass("done");
                jQuery('.work-row .quotes img').removeClass("hide show");
                animateQuote();
                jQuery(".work-navigation .total strong").text(jQuery('.navigation-item.slick-current').attr('data-slide'));
            }, 200);
            setTimeout(function () {
                jQuery(".current-work").remove();
                jQuery(".fake-work").addClass("current-work").removeClass("fake-work fromTop a b");
                jQuery(".current-work").after("<div class='fake-work'/>");
            }, 300);
            setTimeout(function () {
                jQuery('body').removeClass('in-move');
                jQuery('.work-row.animate').addClass('completed');
            }, 200);
            setTimeout(function () {
                jQuery(".work-navigation .total").removeClass('hide');
            }, 500);
        }
    }
}

function workinner() {
    var k1 = 38;
    var k2 = 20;
    if (jQuery(window).width() > 1600) {
        k1 = 138;
        k2 = 57;
    }
    var curHeight = jQuery(window).height() - jQuery("#header").outerHeight() - 100 - k1;
    var padding = jQuery("#header").outerHeight() + k2;
    jQuery(".work-inner-wrap").height(curHeight);
    jQuery(".work-inner-wrap").css({
        "margin-top": padding + "px",
        "margin-bottom": "100px"
    });
    setWorkPageOrientation();
}

function heightFullScreen(element) {
    var full = jQuery(window).height();
    element.height(full);
}

function MainMenu() {
    jQuery(".menu-icon").on("click", function () {
        if (jQuery(this).hasClass("active")) {
            jQuery(this).removeClass("active");
            jQuery("#navi").removeClass("active");
            jQuery("body").removeClass("navi-active");
        } else {
            jQuery(this).addClass("active");
            jQuery("#navi").addClass("active");
            jQuery("body").addClass("navi-active");
        }
    });
}

function workLines() {
    if (jQuery('.work-sub-title').length) {
        jQuery('.work-sub-title').each(function () {
            var curTop = jQuery(this).offset().top + 7;
            var i = 1;
            jQuery(this).find("span").each(function () {
                jQuery(this).removeAttr('class');
                if (jQuery(this).offset().top <= curTop) {
                    jQuery(this).addClass('work-sub-line-' + i);
                } else {
                    curTop = jQuery(this).offset().top + 7;
                    i++;
                    jQuery(this).addClass('work-sub-line-' + i);
                }
            });
        });
    }
}

function blogPage() {
    jQuery(".see-more").click(function () {
        var link = jQuery("#base-url").text();
        var count = jQuery(".insight-row").length;
        var countAll = jQuery(".countpost").first().text() * 1;
        var exclude = jQuery(".insights").data('exclude') * 1;
        var tag = "";
        var cat = "";
        if (jQuery(this).attr("data-tagid").length) {
            tag = jQuery(this).attr("data-tagid");
        }
        if (jQuery(".filter-insights li.active").length) {
            cat = jQuery(".filter-insights li.active").attr("data-catid");
        }
        jQuery.ajax({
            type: "POST",
            url: link + "wp-admin/admin-ajax.php",
            data: 'action=get_article&count=' + count + '&cat=' + cat + '&tag=' + tag + '&exclude=' + exclude,
            success: function (html) {
                jQuery(html).appendTo(".insights");
                var count2 = jQuery(".insight-row").length;
                if (countAll == count2) {
                    jQuery(".see-more").hide();
                }
                jQuery(".insight-row").addClass("animated");
            }
        });
        return false;
    });
    jQuery(".filter-insights li").click(function () {
        jQuery(".see-more").attr("data-tagid", "");
        var tex = jQuery(this).text();
        jQuery(this).parents("ol").removeClass("active");
        jQuery(this).parents("ol").prev().removeClass("active").text(tex);
        if (!jQuery(this).hasClass("active")) {
            jQuery(this).parents(".filter-insights").find("li").removeClass("active");
            jQuery(this).addClass("active");
            activeMark();
            var link = jQuery("#base-url").text();
            var count = 0;
            var cat = jQuery(".filter-insights li.active").attr("data-catid");
            var catLink = jQuery(".filter-insights li.active").attr("data-cat-link");
            jQuery.ajax({
                type: "POST",
                url: link + "wp-admin/admin-ajax.php",
                data: 'action=get_article&count=' + count + '&cat=' + cat,
                success: function (html) {
                    jQuery(".insights").html(html);
                    var count2 = jQuery(".insight-row").length;
                    if (count2 % 6 === 0) {
                        jQuery(".see-more").fadeIn();
                    } else {
                        jQuery(".see-more").hide();
                    }
                    setTimeout(function () {
                        jQuery(".insight-row").addClass("animated");
                    }, 200);
                    window.history.pushState('', '', catLink);
                }
            });
        }
        return false;
    });
}

function WorkDetailPage() {
    if (jQuery('body.single-work').length || jQuery('.works').length) {
        if (jQuery('.work-down').length) {
            jQuery('body').on('click', '.work-down', function () {
                jQuery('html,body').animate({
                    scrollTop: jQuery('#case-page').offset().top - 40
                }, 1000, function () {
                    jQuery('.laptop-position').addClass('animate');
                });
            });
        }
        heightFullScreen(jQuery(".work-video"));
        heightFullScreen(jQuery(".single-work .case-study-top"));
        if (jQuery('.text-bg').length) {
            jQuery(".text-bg").pxgradient({
                step: 10,
                colors: [jQuery('.text-bg div').attr('data-color-1'), jQuery('.text-bg div').attr('data-color-2')],
                dir: "y"
            });
        }
        if (jQuery('.services-nav').length) {
            jQuery('.prev-service').hover(function () {
                jQuery('.thumbnail-prev').addClass('zoom');
            }, function () {
                jQuery('.thumbnail-prev').removeClass('zoom');
            });
            jQuery('.next-service').hover(function () {
                jQuery('.thumbnail-next').addClass('zoom');
            }, function () {
                jQuery('.thumbnail-next').removeClass('zoom');
            });
        }
        jQuery(".mouse-click").on("click", function () {
            var r = jQuery(window).width() / 2 - jQuery(this).parents(".laptop-position").width() / 2;
            if (jQuery(this).parents(".intro").hasClass('left-style')) {
                jQuery(this).parents(".laptop-position").addClass("active").css({
                    "left": r + "px"
                });
            } else {
                jQuery(this).parents(".laptop-position").addClass("active").css({
                    "right": r + "px"
                });
            }
            jQuery(this).parents(".intro").addClass("active");
            jQuery('body').addClass('crossed');
            jQuery(".is-desktop-single-work .laptop-wrap .scroll-icon").fadeIn();
        });
        var $video = jQuery('video');
        if (isTouchDevice) {
            $video.attr('controls', 'controls');
        } else {
            if (jQuery('.video-full video').length) {
                video.pause();
                video.play();
                console.log(video);
            }
        }
        jQuery('.flipbook').slick({
            infinite: true,
            autoplay: true,
            slidesToShow: 1,
            arrows: false,
            slidesToScroll: 1,
            fade: true,
        });
        jQuery('.text-carousel-inner').slick({
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
        });
        jQuery('.laptop-carousel').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            jQuery('.laptop-wrap .scroll-icon').fadeOut();
            if (slick.slideCount - 1 == nextSlide) {
                jQuery('.laptop .side').first().css('visibility', 'visible');
                jQuery('.left-style  .laptop .side').first().css('visibility', 'visible');
            } else {
                jQuery('.laptop .side').first().removeAttr('style');
                jQuery('.left-style .laptop .side').first().removeAttr('style');
            }
        });
        jQuery('.laptop-carousel').each(function () {
            var startAt = 0;
            if (jQuery(this).parents('.intro').hasClass('left-style')) {
                startAt = jQuery(this).find('>div').length - 1;
                var divs = jQuery(this).find('>div');
                var divs2 = '';
                for (i = 0; i < divs.length; i++) {
                    divs2 += '<div>' + jQuery(divs[divs.length - 1 - i]).html() + '</div>';
                }
                jQuery(this).html(divs2);
            }
            jQuery(this).on('init', function (event, slick, currentSlide) {
                jQuery(this).append('<span class="to-open"/>');
                jQuery(this).append('<span class="fake"/>');
                jQuery(".to-open").on("click", function () {
                    var r = jQuery(window).width() / 2 - jQuery(this).parents(".laptop-position").width() / 2;
                    if (jQuery(this).parents(".intro").hasClass('left-style')) {
                        jQuery(this).parents(".laptop-position").addClass("active").css({
                            "left": r + "px"
                        });
                    } else {
                        jQuery(this).parents(".laptop-position").addClass("active").css({
                            "right": r + "px"
                        });
                    }
                    jQuery(this).parents(".intro").addClass("active");
                    jQuery('body').addClass('crossed');
                    jQuery(".is-desktop-single-work .laptop-wrap .scroll-icon").fadeIn();
                });
            });
            jQuery(this).slick({
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                initialSlide: startAt,
                focusOnSelect: true,
                variableWidth: true,
                centerMode: true,
            });
        });
        jQuery('.sliding-block').slick({
            infinite: true,
            centerMode: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: false,
            focusOnSelect: true,
            variableWidth: true,
        });
        if (jQuery('.swiper-container').length) {
            swiper = new Swiper('.swiper-container', {
                slidesPerView: 'auto',
                speed: 750,
                spaceBetween: 0,
                onTouchStart: function () {
                    jQuery('.swiper-container').addClass('grabbing');
                },
                onTouchEnd: function () {
                    jQuery('.swiper-container').removeClass('grabbing');
                }
            });
        }
        jQuery('body').on('click', function (e) {
            if (jQuery(e.target).parents('.laptop-position').length != 1 && jQuery('.laptop-position').hasClass('active') || jQuery(e.target).hasClass('side') || jQuery(e.target).hasClass('fake')) {
                jQuery(".laptop-position").removeClass("active").css({
                    "right": "",
                    "left": ""
                });
                jQuery(".intro").removeClass("active");
                jQuery('body').removeClass('crossed');
                jQuery(".laptop-wrap .scroll-icon").fadeOut();
            }
        });
        if (jQuery(".drag-box").length) {
            jQuery('.laptop-slide .content').mCustomScrollbar({
                theme: "dark-thin",
                callbacks: {
                    whileScrolling: function () {
                        jQuery(this).attr('data-offset', this.mcs.top);
                    },
                    alwaysTriggerOffsets: false
                }
            });
            jQuery(".drag-box").swipe({
                swipeStatus: function (event, phase, direction, distance, duration, fingerCount) {
                    if (phase == "move" || phase == "start") {
                        jQuery(this).addClass("grabbing");
                    } else {
                        jQuery(this).removeClass("grabbing");
                    }
                },
                swipeUp: function (event, phase, direction, distance, duration, fingerCount) {
                    var _offset = 0;
                    if (typeof jQuery(this).prev().attr('data-offset') !== typeof undefined && jQuery(this).prev().attr('data-offset') !== false) {
                        _offset = jQuery(this).prev().attr('data-offset');
                    }
                    var scrollTo = _offset * 1 - distance * 1.3;
                    jQuery(this).prev().mCustomScrollbar("scrollTo", scrollTo, {
                        scrollEasing: "easeOut"
                    });
                },
                swipeDown: function (event, phase, direction, distance, duration, fingerCount) {
                    var _offset = 0;
                    if (typeof jQuery(this).prev().attr('data-offset') !== typeof undefined && jQuery(this).prev().attr('data-offset') !== false) {
                        _offset = jQuery(this).prev().attr('data-offset');
                    }
                    var scrollTo = 0;
                    if (distance * 1.3 > _offset * (-1)) {
                        scrollTo = 0;
                    } else {
                        scrollTo = _offset * 1 + distance * 1.3;
                    }
                    jQuery(this).prev().mCustomScrollbar("scrollTo", scrollTo, {
                        scrollEasing: "easeOut"
                    });
                },
                threshold: 25,
                PageScroll: "horizontal"
            });
        }
        var r = jQuery(window).width() / 2 - jQuery(".laptop-position.active").width() / 2;
        jQuery(".laptop-position.active").css({
            "right": r + "px"
        });
        if (jQuery("[data-bg]").length) {
            jQuery("[data-bg]").each(function () {
                var src = jQuery(this).attr("data-bg");
                jQuery(this).css("background-image", "url(" + src + ")");
            });
        }
        if (jQuery("[data-src]").length) {
            jQuery("[data-src]").each(function () {
                jQuery(this).attr('src', jQuery(this).attr("data-src"));
            });
        }
        if (jQuery(".mobi-carousel").length) {
            jQuery('.mobi-carousel-slide .content').mCustomScrollbar({
                theme: "dark-thin",
                callbacks: {
                    whileScrolling: function () {
                        jQuery(this).parent().attr('data-offset', this.mcs.top);
                    },
                    alwaysTriggerOffsets: false
                }
            });
            jQuery(".mobi-carousel").each(function () {
                jQuery(this).attr('data-shift', 2);
                jQuery(this).find(".mobi-carousel-slide").first().next().addClass("active");
                jQuery(this).find(".mobi-carousel-slide").first().next().next().addClass("next-slide");
                jQuery(this).find(".mobi-carousel-slide").first().addClass("prev-slide");
            });
            jQuery(".mobi-carousel-wrap .drag-area").swipe({
                swipeStatus: function (event, phase, direction, distance, duration, fingerCount) {
                    if (phase == "move" || phase == "start") {
                        jQuery(this).parent().addClass("grabbing");
                    } else {
                        jQuery(this).parent().removeClass("grabbing");
                    }
                },
                swipeLeft: function () {
                    jQuery('.mobi-block .scroll-icon').fadeOut();
                    var coun = jQuery(this).parent().find(".mobi-carousel-slide").length;
                    if (jQuery(this).parent().find(".mobi-carousel").attr('data-shift') < coun) {
                        jQuery(this).parent().find(".mobi-prev").removeClass("disable");
                        if (jQuery(this).parent().find(".mobi-carousel-slide.active").index() + 2 == jQuery(this).parent().find(".mobi-carousel-slide").length) {
                            jQuery(this).parent().find(".mobi-next").addClass("disable");
                        } else {
                            jQuery(this).parent().find(".mobi-next").removeClass("disable");
                        }
                        var shift = (jQuery(this).parent().find('.mobi-carousel > .mobi-carousel-slide').last().width() + parseInt(jQuery(this).parent().find('.mobi-carousel > .mobi-carousel-slide').last().css('margin-left'))) * jQuery(this).parent().find(".mobi-carousel").attr('data-shift');
                        jQuery(this).parent().find(".mobi-carousel-slide").removeClass("active next-slide prev-slide");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(jQuery(this).parent().find(".mobi-carousel").attr('data-shift')).addClass("active");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(jQuery(this).parent().find(".mobi-carousel").attr('data-shift')).next().addClass("next-slide");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(jQuery(this).parent().find(".mobi-carousel").attr('data-shift')).prev().addClass("prev-slide");
                        var _this = jQuery(this).parent();
                        setTimeout(function () {
                            _this.find(".mobi-carousel").css({
                                'transform': 'translate(-' + shift + 'px, 0)',
                                '-webkit-transform': 'translate(-' + shift + 'px, 0)'
                            });
                        }, 100);
                        jQuery(this).parent().find(".mobi-carousel").attr('data-shift', jQuery(this).parent().find(".mobi-carousel").attr('data-shift') * 1 + 1);
                    }
                },
                swipeRight: function () {
                    jQuery('.mobi-block .scroll-icon').fadeOut();
                    if (jQuery(this).parent().find(".mobi-carousel").attr('data-shift') >= 1) {
                        jQuery(this).parent().find(".mobi-carousel").attr('data-shift', jQuery(this).parent().find(".mobi-carousel").attr('data-shift') * 1 - 1);
                        jQuery(this).parent().find(".mobi-next").removeClass("disable");
                        if (jQuery(this).parent().find(".mobi-carousel-slide.active").index() - 1 <= 0) {
                            jQuery(this).parent().find(".mobi-prev").addClass("disable");
                        } else {
                            jQuery(this).parent().find(".mobi-prev").removeClass("disable");
                        }
                        if (jQuery(this).parent().find(".mobi-carousel").attr('data-shift') <= 0) {
                            jQuery(this).parent().find(".mobi-carousel-slide").removeClass("active next-slide prev-slide");
                            jQuery(this).parent().find(".mobi-carousel-slide").eq(0).addClass("active");
                            jQuery(this).parent().find(".mobi-carousel-slide").eq(0).next().addClass("next-slide");
                            var _this = jQuery(this).parent();
                            setTimeout(function () {
                                _this.find(".mobi-carousel").css({
                                    'transform': 'translate(0, 0)',
                                    '-webkit-transform': 'translate(0, 0)'
                                });
                            }, 100);
                            jQuery(this).parent().find(".mobi-carousel").attr('data-shift', 1);
                        } else {
                            var shift;
                            var ds = jQuery(this).parent().find(".mobi-carousel").attr('data-shift') * 1;
                            ds -= 1;
                            shift = (jQuery(this).parent().find('.mobi-carousel > .mobi-carousel-slide').last().width() + parseInt(jQuery(this).parent().find(' .mobi-carousel > .mobi-carousel-slide').last().css('margin-left'))) * ds;
                            jQuery(this).parent().find(".mobi-carousel-slide").removeClass("active next-slide prev-slide");
                            jQuery(this).parent().find(".mobi-carousel-slide").eq(ds).addClass("active");
                            jQuery(this).parent().find(".mobi-carousel-slide").eq(ds).next().addClass("next-slide");
                            jQuery(this).parent().find(".mobi-carousel-slide").eq(ds).prev().addClass("prev-slide");
                            var _this = jQuery(this).parent();
                            setTimeout(function () {
                                _this.find(".mobi-carousel").css({
                                    'transform': 'translate(-' + shift + 'px, 0)',
                                    '-webkit-transform': 'translate(-' + shift + 'px, 0)'
                                });
                            }, 100);
                        }
                    }
                },
                swipeUp: function (event, phase, direction, distance, duration, fingerCount) {
                    jQuery('.mobi-block .scroll-icon').fadeOut();
                    var _offset = 0;
                    if (typeof jQuery('.mobi-carousel-slide.active').attr('data-offset') !== typeof undefined && jQuery('.mobi-carousel-slide.active').attr('data-offset') !== false) {
                        _offset = jQuery('.mobi-carousel-slide.active').attr('data-offset');
                    }
                    var scrollTo = _offset * 1 - distance * 1.3;
                    jQuery('.mobi-carousel-slide.active .content').mCustomScrollbar("scrollTo", scrollTo, {
                        scrollEasing: "easeOut"
                    });
                },
                swipeDown: function (event, phase, direction, distance, duration, fingerCount) {
                    jQuery('.mobi-block .scroll-icon').fadeOut();
                    var _offset = 0;
                    if (typeof jQuery('.mobi-carousel-slide.active').attr('data-offset') !== typeof undefined && jQuery('.mobi-carousel-slide.active').attr('data-offset') !== false) {
                        _offset = jQuery('.mobi-carousel-slide.active').attr('data-offset');
                    }
                    var scrollTo = 0;
                    if (distance * 1.3 > _offset * (-1)) {
                        scrollTo = 0;
                    } else {
                        scrollTo = _offset * 1 + distance * 1.3;
                    }
                    jQuery('.mobi-carousel-slide.active .content').mCustomScrollbar("scrollTo", scrollTo, {
                        scrollEasing: "easeOut"
                    });
                },
                threshold: 25,
                PageScroll: "horizontal"
            });
            jQuery(".mobi-next").on("click", function () {
                jQuery('.mobi-block .scroll-icon').fadeOut();
                if (jQuery(this).parent().find(".mobi-carousel").attr('data-shift') < jQuery(this).parent().find(".mobi-carousel-slide").length) {
                    jQuery(this).parent().find(".mobi-prev").removeClass("disable");
                    if (jQuery(this).parent().find(".mobi-carousel-slide.active").index() + 2 == jQuery(this).parent().find(".mobi-carousel-slide").length) {
                        jQuery(this).addClass("disable");
                    } else {
                        jQuery(this).removeClass("disable");
                    }
                    var shift = (jQuery(this).parent().find('.mobi-carousel > .mobi-carousel-slide').last().width() + parseInt(jQuery(this).parent().find('.mobi-carousel > .mobi-carousel-slide').last().css('margin-left'))) * jQuery(this).parent().find(".mobi-carousel").attr('data-shift');
                    jQuery(this).parent().find(".mobi-carousel-slide").removeClass("active next-slide prev-slide");
                    jQuery(this).parent().find(".mobi-carousel-slide").eq(jQuery(this).parent().find(".mobi-carousel").attr('data-shift')).addClass("active");
                    jQuery(this).parent().find(".mobi-carousel-slide").eq(jQuery(this).parent().find(".mobi-carousel").attr('data-shift')).next().addClass("next-slide");
                    jQuery(this).parent().find(".mobi-carousel-slide").eq(jQuery(this).parent().find(".mobi-carousel").attr('data-shift')).prev().addClass("prev-slide");
                    var _this = jQuery(this);
                    setTimeout(function () {
                        _this.parent().find(".mobi-carousel").css({
                            'transform': 'translate(-' + shift + 'px, 0)',
                            '-webkit-transform': 'translate(-' + shift + 'px, 0)'
                        });
                    }, 100);
                    jQuery(this).parent().find(".mobi-carousel").attr('data-shift', jQuery(this).parent().find(".mobi-carousel").attr('data-shift') * 1 + 1);
                }
            });
            jQuery(".mobi-prev").on("click", function () {
                jQuery('.mobi-block .scroll-icon').fadeOut();
                if (jQuery(this).parent().find(".mobi-carousel").attr('data-shift') >= 1) {
                    jQuery(this).parent().find(".mobi-carousel").attr('data-shift', jQuery(this).parent().find(".mobi-carousel").attr('data-shift') * 1 - 1);
                    jQuery(this).parent().find(".mobi-next").removeClass("disable");
                    if (jQuery(this).parent().find(".mobi-carousel-slide.active").index() - 1 <= 0) {
                        jQuery(this).parent().find(".mobi-prev").addClass("disable");
                    } else {
                        jQuery(this).parent().find(".mobi-prev").removeClass("disable");
                    }
                    if (jQuery(this).parent().find(".mobi-carousel").attr('data-shift') <= 0) {
                        jQuery(this).parent().find(".mobi-carousel-slide").removeClass("active next-slide prev-slide");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(0).addClass("active");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(0).next().addClass("next-slide");
                        var _this = jQuery(this);
                        setTimeout(function () {
                            _this.parent().find(".mobi-carousel").css({
                                'transform': 'translate(0, 0)',
                                '-webkit-transform': 'translate(0, 0)'
                            });
                        }, 100);
                        jQuery(this).parent().find(".mobi-carousel").attr('data-shift', 1);
                    } else {
                        var shift;
                        var ds = jQuery(this).parent().find(".mobi-carousel").attr('data-shift') * 1;
                        ds -= 1;
                        shift = (jQuery(this).parent().find('.mobi-carousel > .mobi-carousel-slide').last().width() + parseInt(jQuery(this).parent().find(' .mobi-carousel > .mobi-carousel-slide').last().css('margin-left'))) * ds;
                        jQuery(this).parent().find(".mobi-carousel-slide").removeClass("active next-slide prev-slide");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(ds).addClass("active");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(ds).next().addClass("next-slide");
                        jQuery(this).parent().find(".mobi-carousel-slide").eq(ds).prev().addClass("prev-slide");
                        var _this = jQuery(this);
                        setTimeout(function () {
                            _this.parent().find(".mobi-carousel").css({
                                'transform': 'translate(-' + shift + 'px, 0)',
                                '-webkit-transform': 'translate(-' + shift + 'px, 0)'
                            });
                        }, 100);
                    }
                }
            });
        }
        pageAnimation();
    }
    initGallerySlider();
    if (jQuery(".page-template-work-new-page").length || jQuery("body").hasClass("next-prev-init")) {
        jQuery("#screen-info-pin-2").next(".screen-info-wrap").next("img").on("load", function () {
            imageMarginTop();
            updateInfoScenes1()
        });
        if (jQuery('#screen-info-1').length && !jQuery('.the_website.mobile-version').length) {
            if (jQuery('#screen-info-pin-1').length) {
                sceneInfo11 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-1",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-1").addTo(controller20191);
            }
            if (jQuery('#screen-info-pin-2').length) {
                sceneInfo21 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-2",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-2").addTo(controller20191);
            }
            if (jQuery('#screen-info-pin-3').length) {
                sceneInfo31 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-3",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-3").addTo(controller20191);
            }
            if (jQuery('#screen-info-pin-4').length) {
                sceneInfo41 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-4",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-4").addTo(controller20191);
            }
        }
    }
}

function updateInfoScenes1() {
    if (jQuery(".page-template-work-new-page").length || jQuery("body").hasClass("next-prev-init")) {
        if (!jQuery('.the_website.mobile-version').length) {
            if (jQuery('#screen-info-pin-1').length) {
                if (jQuery(".screenshot.odd").length) {
                    sceneInfo11.duration(jQuery(".screenshot.odd").offset().top - jQuery("#screen-info-pin-1").offset().top - parseInt(jQuery(".screenshot.odd img").css('marginTop')) * (-1) - jQuery('#screen-info-1').innerHeight() - 50);
                } else {
                    sceneInfo11.duration(jQuery('#screen-info-1').innerHeight() - 50);
                }
            }
            if (jQuery('#screen-info-pin-2').length) {
                sceneInfo21.duration(jQuery(".screenshot.odd").innerHeight() - jQuery('#screen-info-2').innerHeight());
            }
            if (jQuery('#screen-info-pin-3').length) {
                if (jQuery(".screenshot-3").length) {
                    sceneInfo31.duration(jQuery(".screenshot-3").offset().top - jQuery("#screen-info-pin-3").offset().top - parseInt(jQuery(".screenshot-3 img").css('marginTop')) * (-1) - jQuery('#screen-info-3').innerHeight() - 50);
                } else {
                    sceneInfo31.duration(jQuery(".screenshot-2").innerHeight() - jQuery('#screen-info-2').innerHeight());
                }
            }
            if (jQuery('#screen-info-pin-4').length) {
                sceneInfo41.duration(jQuery(".screenshot-3").innerHeight() - jQuery('#screen-info-4').innerHeight());
            }
        }
    }
}

function initGallerySlider() {
    if (!jQuery('.post-gallery').hasClass('initialized')) {
        if (jQuery('.post-gallery .slide-item').length == 1) {
            jQuery('.post-gallery').addClass('one-slide');
        }
        var slider = jQuery('.post-gallery');
        jQuery('.post-gallery').addClass('initialized');
        slider.on('init', function (event, slick) {
            jQuery(".post-gallery .slick-dots li").each(function () {
                if (!jQuery(this).find('.slick-arrow-line').length) {
                    jQuery(this).append("<span class='slick-arrow-line slick-arrow-line-1'/><span class='slick-arrow-line slick-arrow-line-2'/><span class='slick-arrow-line slick-arrow-line-3'/>");
                    jQuery(this).find("button").prepend("0");
                }
            });
        });
        slider.on('breakpoint', function (event, slick) {
            jQuery(".post-gallery .slick-dots li").each(function () {
                if (!jQuery(this).find('.slick-arrow-line').length) {
                    jQuery(this).append("<span class='slick-arrow-line slick-arrow-line-1'/><span class='slick-arrow-line slick-arrow-line-2'/><span class='slick-arrow-line slick-arrow-line-3'/>");
                    jQuery(this).find("button").prepend("0");
                }
            });
        });
        slider.on('beforeChange', function (event, slick, direction, currentSlide, nextSlide) {
            slider.find('.slick-dots li.in').addClass('out')
            slider.find('.slick-dots li').eq(currentSlide).addClass('in')
        });
        slider.on('afterChange', function (event, slick, direction, currentSlide, nextSlide) {
            slider.find('.slick-dots li.in').not('.slick-active').removeClass('in out')
        });
        if (jQuery('.post-gallery').length) {
            var p = 25;
            if (jQuery('.page-template-flexible-page').length) {
                p = 0;
            }
            slider.slick({
                centerMode: true,
                centerPadding: '100px',
                slidesToShow: 1,
                dots: true,
                speed: 750,
                swipe: swipe,
                variableWidth: true,
                appendArrows: false,
                focusOnSelect: true,
                responsive: [{
                    breakpoint: 1500,
                    settings: {
                        variableWidth: false,
                    }
                }, {
                    breakpoint: 767,
                    settings: {
                        centerPadding: '110px',
                        variableWidth: false,
                    }
                }, {
                    breakpoint: 567,
                    settings: {
                        centerPadding: '50px',
                        variableWidth: false,
                    }
                }, {
                    breakpoint: 480,
                    settings: {
                        centerPadding: p + 'px',
                        variableWidth: false,
                    }
                }, {
                    breakpoint: 359,
                    settings: {
                        centerPadding: '0px',
                        variableWidth: false,
                    }
                }, ]
            });
        }
    }
}

function setWorkPageOrientation() {
    if (jQuery(window).width() > jQuery(window).height()) {
        jQuery('body').addClass('landscape').removeClass('portrait');
    } else {
        jQuery('body').addClass('portrait').removeClass('landscape');
    }
}

function setPrevNextPosition() {
    if (jQuery('.single-post').length) {
        if ((window.pageYOffset + jQuery(window).height() * 1.2) > jQuery('.related-posts').offset().top) {
            if (!jQuery('.post-hero-image a[rel="prev"]').hasClass('positioned') && !jQuery('.post-hero-image a[rel="next"]').hasClass('positioned')) {
                if (jQuery('.post-hero-image a[rel="prev"]').length) {
                    var _pt = jQuery('.post-hero-image a[rel="prev"]').offset().top;
                    if (_pt > jQuery('.related-posts').offset().top - jQuery(window).height() * 0.5) {
                        _pt = jQuery('.related-posts').offset().top - jQuery(window).height() * 0.8;
                    }
                    jQuery('.post-hero-image a[rel="prev"]').css({
                        'position': 'absolute',
                        'top': _pt
                    }).addClass('positioned');
                }
                if (jQuery('.post-hero-image a[rel="next"]').length) {
                    var _nt = jQuery('.post-hero-image a[rel="next"]').offset().top - parseInt(jQuery('.post-hero-image a[rel="next"]').width());
                    if (_nt > jQuery('.related-posts').offset().top - parseInt(jQuery('.post-hero-image a[rel="next"]').width()) - jQuery(window).height() * 0.5) {
                        _nt = jQuery('.related-posts').offset().top - jQuery(window).height() * 0.8 - parseInt(jQuery('.post-hero-image a[rel="next"]').width());
                    }
                    jQuery('.post-hero-image a[rel="next"]').css({
                        'position': 'absolute',
                        'top': _nt
                    }).addClass('positioned');
                }
            }
        } else {
            if (jQuery('.post-hero-image a[rel="prev"]').length) {
                var prevTop = '29.5rem';
                if (jQuery(window).width() < 1150) {
                    prevTop = '37.5rem';
                } else if (jQuery(window).width() < 1280) {
                    prevTop = '36.5rem';
                } else if (jQuery(window).width() < 1400) {
                    prevTop = '31.5rem';
                }
                jQuery('.post-hero-image a[rel="prev"]').css({
                    'position': 'fixed',
                    'top': prevTop
                }).removeClass('positioned');
            }
            if (jQuery('.post-hero-image a[rel="next"]').length) {
                var nextTop = '-15.5rem';
                if (jQuery(window).width() < 1150) {
                    nextTop = '-7.5rem';
                } else if (jQuery(window).width() < 1280) {
                    nextTop = '-8.5rem';
                } else if (jQuery(window).width() < 1400) {
                    nextTop = '-13.5rem';
                }
                jQuery('.post-hero-image a[rel="next"]').css({
                    'position': 'fixed',
                    'top': nextTop
                }).removeClass('positioned');
            }
        }
    }
}

function toFooter() {
    jQuery('body, html').stop().animate({
        scrollTop: jQuery('.contact-bottom-section').offset().top
    }, 1100);
}
var isTouchDevice = 'ontouchstart' in document.documentElement;
var is_iPad = false;
var flagS = 0;
var carouselAnimated;
var carouselAnimated2;
var carouselAnimated3;
var carouselAnimated4;
var firstLaunchFlag = true;
var launchHero = true;
var firstLaunch;
var firstLaunchFlagW = true;
var LaunchFlagWork = true;
var firstLaunchW;
if (isTouchDevice && jQuery(window).width() > 767) {
    is_iPad = true;
}

function isIE() {
    return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) !== null)));
}
jQuery(document).ready(function () {
    setTimeout(function () {
        jQuery('body').addClass('loaded');
    }, 400);
    jQuery('.return-to-top').click(function () {
        jQuery('.return-to-top').addClass('hide');
        flagS = 1;
        jQuery('#main').addClass('to-move');
        jQuery('#header').removeClass('scrolled');
        TweenLite.to('.hero-carousel', 0.8, {
            y: '0%',
            ease: Power4.easeIn,
            onComplete: function () {
                jQuery('body').removeClass('no-section-scroll');
                jQuery('#main').removeClass('to-move');
                clearTimeout(carouselAnimated);
                clearTimeout(carouselAnimated2);
                heroCarouselAnimate(jQuery('.hero-nav li:last-child').index());
                if (jQuery('.hero-nav li.current').index() % 2 != 0) {
                    jQuery('#header').addClass('purple');
                    jQuery('.hero-nav').addClass('grey');
                } else {
                    jQuery('#header').removeClass('purple');
                    jQuery('.hero-nav').removeClass('grey');
                }
            }
        });
        TweenLite.to('#main', 0.8, {
            y: '100%',
            ease: Power4.easeIn,
            onComplete: function () {}
        });
        setTimeout(function () {
            flagS = 0;
        }, 3000);
    });
    jQuery('.hero-nav').css('right', getScrollBarWidth() + 'px');
    if (jQuery("[data-style]").length) {
        jQuery("[data-style]").each(function () {
            jQuery(this).attr('style', jQuery(this).attr("data-style"));
        });
    }
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        jQuery('body').addClass('safari-only');
    }
    if (jQuery('.single-position').length) {
        if (jQuery('body img').length === 0) {
            jQuery('.a2a_button_pinterest').remove();
        }
    }
    if (jQuery('.full-video').length) {
        if (isTouchDevice) {
            jQuery('.play-icon,.pause-layout').remove();
        }
        var shown = false;
        var shown2 = false;
        jQuery('.play-icon').click(function () {
            var video = jQuery(this).prev()[0];
            video.play();
            jQuery(this).css('opacity', 0);
            jQuery(this).next().show();
            var _this = jQuery(this).prev();
            TweenLite.to(_this.parent()[0], 0.5, {
                height: parseInt(_this.height()) + 'px',
                ease: Power4.easeIn
            });
            setTimeout(function () {
                jQuery(".pause-layout").addClass('hide');
                shown = true;
            }, 2000);
            _this[0].onended = function () {
                if (jQuery(window).width() < 768) {
                    videoH = '30rem';
                }
                if (!isTouchDevice) {
                    _this[0].currentTime = 0;
                    _this[0].pause();
                    TweenLite.to(_this.parent(), 0.5, {
                        height: videoH,
                        ease: Power4.easeIn
                    });
                    _this.parent().find('.play-icon').css('opacity', 1);
                    _this.parent().find('.pause-layout').hide();
                }
            };
            _this[0].addEventListener('timeupdate', function () {
                var percent = Math.floor((100 / _this[0].duration) * _this[0].currentTime);
                _this.siblings('.pause-layout').find('b').css('width', percent + '%');
            });
        });
        jQuery(".pause-layout em").hover(function () {
            shown2 = true;
        }, function () {
            shown2 = false;
            setTimeout(function () {
                if (!shown2) {
                    jQuery(".pause-layout").addClass('hide');
                    shown = true;
                }
            }, 2000);
        })
        jQuery(".pause-layout").mousemove(function (event) {
            if (shown) {
                jQuery(".pause-layout").removeClass('hide');
                shown = false;
                setTimeout(function () {
                    if (!shown2) {
                        jQuery(".pause-layout").addClass('hide');
                        shown = true;
                    }
                }, 2000);
            }
        });
        jQuery('.pause-layout').click(function () {
            var video = jQuery(this).prev().prev()[0];
            video.pause();
            jQuery(this).prev().css('opacity', 1);
            jQuery(this).hide();
            var _this = jQuery(this).parent();
            if (jQuery(window).width() < 768) {
                videoH = '30rem';
            }
            if (!isTouchDevice) {
                TweenLite.to(_this, 0.5, {
                    height: videoH,
                    ease: Power4.easeIn
                });
                _this.find('.play-icon').css('opacity', 1);
            }
        });
        var videoH = '60rem';
    }
    if (jQuery('.single-post').length && jQuery("blockquote").length) {
        jQuery('blockquote').each(function () {
            jQuery(this).prepend('<svg  xmlns="http://www.w3.org/2000/svg" xml:space="preserve" enable-background="new 0 0 106 106" viewBox="0 0 106 106"  width="106" height="106"><defs><mask id="maskQuote"><path d="M0,0L106,0L106,15L40,15L40,106L0,106L0,0L106,0"  style="fill: #fff" /></mask></defs><line style="stroke:#2ff092;stroke-width:4" y2="102" x2="40" y1="102" x1="40" id="blockquote-line-1"/><line style="stroke:#2ff092;stroke-width:4" y2="104" x2="4" y1="104" x1="4" id="blockquote-line-2"/><line style="stroke:#2ff092;stroke-width:4" y2="2" x2="2" y1="2" x1="2" id="blockquote-line-3"/><line style="stroke:#2ff092;stroke-width:4" y2="0" x2="104" y1="0" x1="104" id="blockquote-line-4"/></svg>');
        });
    }
    if (!(isTouchDevice && jQuery(window).width() < 767)) {
        jQuery('body').addClass('is-desktop');
    }
    if (jQuery('.page-template-work-page').length) {
        fixWorkPage();
        fixIntro();
        if (!isTouchDevice && jQuery('.work-navigation-wrap').length) {
            jQuery('body').addClass('is-desktop-work');
        } else {
            jQuery('body').addClass('is-mobile-work');
        }
    }
    if (!isTouchDevice && jQuery('.page-template-careers-page').length) {
        jQuery('body').addClass('is-desktop-career');
    }
    if (isTouchDevice && jQuery('.home').length) {
        jQuery('body').addClass('is-home-mobile');
    }
    if (!isTouchDevice && jQuery('.single-work').length) {
        jQuery('body').addClass('is-desktop-single-work');
    }
    if (jQuery('.v-txt').length || jQuery('.slide-entry').length) {
        setHeroIpad();
        jQuery('.v-txt h2').each(function () {
            var vWords = jQuery(this).text().split(' ');
            var vNewHeading = '';
            for (i = 0; i < vWords.length; i++) {
                vNewHeading += '<span>' + vWords[i] + '</span> ';
            }
            jQuery(this).html(vNewHeading);
            var _this = jQuery(this);
            setTimeout(function () {
                var linePosition = _this.offset().left;
                if (jQuery(window).width() < 768) {
                    linePosition = _this.offset().top;
                }
                var curTop = linePosition + 7;
                var i = 0;
                var line = '';
                var superline = '';
                _this.find("span").each(function () {
                    var linePosition2 = jQuery(this).offset().left;
                    if (jQuery(window).width() < 768) {
                        linePosition2 = jQuery(this).offset().top;
                    }
                    if (linePosition2 <= curTop) {
                        line += jQuery(this).text() + ' ';
                    } else {
                        if (line !== '') {
                            superline += '<span class="line">' + line + '</span>';
                        }
                        line = '';
                        curTop = linePosition2 + 7;
                        line += jQuery(this).text() + ' ';
                    }
                });
                if (line !== '') {
                    superline += '<span class="line">' + line + '</span>';
                }
                _this.html(superline);
                _this.find('.line').each(function () {
                    jQuery(this).append('<span class="part top-part"><em>' + jQuery(this).text() + '</em></span><span class="part bottom-part"><em>' + jQuery(this).text() + '</em></span>');
                });
            }, 10);
        });
        setVerticalText();
    }
    if (jQuery('.home .our-ideals').length) {
        jQuery('.our-ideals .text').each(function () {
            var newWord = '';
            for (i = 0; i < jQuery(this).text().length; i++) {
                newWord += '<em>' + jQuery(this).text()[i] + '</em>';
            }
            jQuery(this).html(newWord);
        });
        var newTxt = jQuery('.our-ideals .main-txt').text().replace('[place1]', '<a class="f-word word" href="' + jQuery('.our-ideals .main-txt').attr('data-link-1') + '"><div class="word-in">' + jQuery('.first-words').html() + '</div></a>').replace('[place2]', '<a href="' + jQuery('.our-ideals .main-txt').attr('data-link-2') + '" class="l-word word"><div class="word-in">' + jQuery('.last-words').html() + '</div></a>').replace('[line-break]', '<div class="clear"/>');
        jQuery('.our-ideals .main-txt').html(newTxt);
        jQuery('.f-word .text:first-child(), .l-word .text:first-child()').addClass('active');
        jQuery('.f-word').css('width', jQuery('.f-word  .active').width() + 'px');
        jQuery('.l-word').css('width', jQuery('.l-word .active').width() + 'px');
        jQuery('.our-ideals .main-txt').addClass('ready');
        jQuery('.our-ideals .first-words, .our-ideals .last-words').remove();
        jQuery('.our-ideals .main-txt').removeAttr('data-link-1 data-link-2');
    }
    fixBannerAgency();
    if (jQuery(".three-subpages").length) {
        jQuery(".three-subpages .inner").attr('data-shift', 1);
        TouchLib.setOnTouch(jQuery('.three-subpages .col a')[0], function () {})();
        jQuery(".three-subpages .inner").swipe({
            swipeLeft: function () {
                if (jQuery(window).width() < 768 && jQuery(this).attr('data-shift') < 3) {
                    var shift = (jQuery(this).find('> .col').last().width() + parseInt(jQuery(this).find('> .col').last().css('margin-left'))) * jQuery(this).attr('data-shift');
                    jQuery(this).css({
                        'transform': 'translate(-' + shift + 'px, 0)',
                        '-webkit-transform': 'translate(-' + shift + 'px, 0)'
                    });
                    jQuery(this).attr('data-shift', jQuery(this).attr('data-shift') * 1 + 1);
                }
            },
            swipeRight: function () {
                if (jQuery(window).width() < 768 && jQuery(this).attr('data-shift') >= 1) {
                    jQuery(this).attr('data-shift', jQuery(this).attr('data-shift') * 1 - 2);
                    if (jQuery(this).attr('data-shift') <= 0) {
                        jQuery(this).css({
                            'transform': 'translate(0, 0)',
                            '-webkit-transform': 'translate(0, 0)'
                        });
                        jQuery(this).attr('data-shift', 1);
                    } else {
                        var shift = (jQuery(this).find('> .col').last().width() + parseInt(jQuery(this).find('> .col').last().css('margin-left'))) * jQuery(this).attr('data-shift');
                        jQuery(this).css({
                            'transform': 'translate(-' + shift + 'px, 0)',
                            '-webkit-transform': 'translate(-' + shift + 'px, 0)'
                        });
                    }
                }
            },
            threshold: 25,
            PageScroll: "horizontal"
        });
    }
    servicesTopFix();
    if (jQuery('.power-services h3').length) {
        var words = jQuery('.power-services h3').text().split(' ');
        var newHeading = '';
        for (i = 0; i < words.length; i++) {
            newHeading += '<span><em>' + words[i] + '</em></span> ';
        }
        jQuery('.power-services h3').html(newHeading);
    }
    if (jQuery('.feature-txt .col-r p').length) {
        var wordsCallout = jQuery('.feature-txt .col-r p').text().split(' ');
        var newHeadingCallout = '';
        for (i = 0; i < wordsCallout.length; i++) {
            newHeadingCallout += '<span><em>' + wordsCallout[i] + '</em></span> ';
        }
        jQuery('.feature-txt .col-r p').append('<i class="outer">' + newHeadingCallout + '</i>');
    }
    if (jQuery('.contact-description p').length) {
        var wordsCallout = jQuery('.contact-description p').text().split(' ');
        var newHeadingCallout = '';
        for (i = 0; i < wordsCallout.length; i++) {
            newHeadingCallout += '<span><em>' + wordsCallout[i] + '</em></span> ';
        }
        jQuery('.contact-description p').append('<i class="outer">' + newHeadingCallout + '</i>');
        var curTop = jQuery('.contact-description p').offset().top + 7;
        var i = 1;
        jQuery('.contact-description p span').each(function () {
            jQuery(this).removeAttr('class');
            if (jQuery(this).offset().top <= curTop) {
                jQuery(this).addClass('line-' + i);
            } else {
                curTop = jQuery(this).offset().top + 7;
                i++;
                jQuery(this).addClass('line-' + i);
            }
        });
    }
    if (jQuery('.highlights-gallery').length) {
        jQuery('.highlights-gallery').slick({
            dots: true,
            appendArrows: false,
            infinite: true,
            speed: 700,
            fade: true,
            cssEase: 'linear'
        });
        jQuery('.more-wrap a').click(function () {
            jQuery(this).parent().addClass('to-show');
        });
        jQuery('.more-wrap .close').click(function () {
            var _this = jQuery(this);
            _this.parents('.more-wrap').addClass('to-hide');
            setTimeout(function () {
                _this.parents('.more-wrap').removeClass('to-hide to-show');
            }, 700);
        });
    }
    if (jQuery(".services-list").length) {
        jQuery(".services-list h4, .services-list .h4").click(function () {
            if (jQuery(window).width() < 768) {
                jQuery(this).toggleClass('active');
                jQuery(this).next().slideToggle(400);
            }
        });
    }
    if (jQuery('.page-template-agency-page .statement-top p').length) {
        jQuery('.page-template-agency-page .statement-top p').each(function () {
            var words = jQuery(this).text().split(' ');
            var newHeading = '';
            for (i = 0; i < words.length; i++) {
                newHeading += '<span><em>' + words[i] + '</em></span> ';
            }
            jQuery(this).html(newHeading);
            setStatementLines();
        });
    }
    breakStatementHeadings();
    jQuery(".three-subpages a").mousemove(function (event) {
        var _this = jQuery(this);
        var x = (_this.offset().left + _this.width() / 2 - event.pageX) * (-0.04);
        var y = (_this.offset().top + _this.width() / 2 - event.pageY) * (-0.04);
        _this.find('.img-wrap i').css({
            '-webkit-transform': 'translate(' + x + 'px,' + y + 'px)',
            'transform': 'translate(' + x + 'px,' + y + 'px)'
        });
        if (!_this.find('.img-wrap i').hasClass('no-scale')) {
            setTimeout(function () {
                _this.find('.img-wrap i').addClass('no-scale');
            }, 500);
        }
    });
    jQuery(".three-subpages a").mouseleave(function (event) {
        jQuery(this).find('.img-wrap i').removeClass('no-scale').removeAttr('style');
    });
    mobileHeader();
});
jQuery(window).scroll(function () {
    subpagesAnimation();
    bannerAnimation();
    featuredTxtAnimation();
    discussAnimation();
    reachOutAnimation();
    verticalsParallax();
    servicesAnimation();
    powersAnimation();
    scrollImage();
    mobileHeader();
    setCaptionPosition();
});
jQuery(window).resize(function () {
    fixThanksHeight();
    fixWorkPage();
    fixIntro();
    breakStatementHeadings();
    setLinkPosition();
    fixContactBanner();
    fixRightColumnPosition();
    fixSubpages();
    _h = jQuery(window).height() / 2;
    _p = parseInt(jQuery('.three-subpages').css('padding-top'));
    fixBannerAgency();
    fixBannerIE();
    servicesTopFix();
    setVerticalText();
    setStatementLines();
    var scaleK = jQuery('.bgvid').width() / 1280;
    var fontSize;
    if (jQuery('.bgvid').length) {
        TweenMax.killAll(false, true, false);
        jQuery('.video-elements span,.video-elements i, .video-elements strong, .video-elements div').removeAttr('style');
        var k = 1;
        while (jQuery('#big-title span.word-1').offset().top != jQuery('#big-title span.word-2').offset().top) {
            fontSize = 60 * scaleK - k;
            jQuery('#big-title span').css('font-size', fontSize + 'px');
            k++;
        }
        if (k == 1) {
            fontSize = parseInt(jQuery('#big-title span').css('font-size')) * scaleK;
        }
        videoAnimation.set('#time', {
            css: {
                'font-size': parseInt(jQuery('#time').css('font-size')) * scaleK + 'px'
            }
        }).set('#time i', {
            css: {
                'font-size': parseInt(jQuery('#time i').css('font-size')) * scaleK + 'px'
            }
        }).set('#small-title', {
            css: {
                'font-size': parseInt(jQuery('#small-title').css('font-size')) * scaleK + 'px'
            }
        }).set('#big-title span', {
            css: {
                'font-size': fontSize + 'px'
            }
        }).to('#skip', 0.5, {
            className: "show",
            delay: 0.3
        }).to('#time', 0.5, {
            css: {
                opacity: 1
            },
            delay: 0.3
        }).to('#time', 6.5, {
            css: {
                top: '48%'
            },
            delay: 0.1,
            ease: Power0.easeNone
        }).to('#time', 0.7, {
            css: {
                opacity: 0,
                'transform': 'scaleY(2) scaleX(1.1)',
                'text-shadow': ' 0 0 15px #fff'
            }
        }).to('#small-title', 0.5, {
            css: {
                opacity: 1
            },
            className: "an",
            delay: 2
        }).to('#big-title', 0.5, {
            css: {
                opacity: 1
            },
            className: "an"
        }).to('#small-title, #big-title', 0.5, {
            css: {
                opacity: 0
            },
            delay: 3
        }).to('#slide-logo', 1, {
            css: {
                opacity: 1
            },
        }).to('#slide-logo', 0.5, {
            css: {
                opacity: 1
            },
            delay: 1.6,
            onComplete: function () {
                jQuery.cookie("intro", 1, {
                    expires: 30,
                    path: '/'
                });
                cancelAnimationFrame(globalID);
                jQuery('body, html').animate({
                    scrollTop: 0
                }, 1);
                var stopFlag1 = true;
                jQuery('.bgvid, .video-elements').fadeOut(750, function () {
                    if (stopFlag1) {
                        flagS = 1;
                        setTimeout(function () {
                            flagS = 0;
                        }, 3000);
                        jQuery('.digital').addClass('animate');
                        TweenMax.to(jQuery('.layer-b')[0], 2, {
                            x: '-8rem',
                            roundProps: "x,y",
                            delay: .5
                        });
                        TweenMax.to(jQuery('.layer-c')[0], 2, {
                            x: '-6rem',
                            roundProps: "x,y",
                            delay: .2
                        });
                        TweenMax.to(jQuery('.layer-d')[0], 2, {
                            x: '7.3rem',
                            roundProps: "x,y",
                            delay: .3
                        });
                        TweenMax.to(jQuery('.layer-e')[0], 2, {
                            x: '6rem',
                            roundProps: "x,y",
                            delay: .4
                        });
                        TweenMax.to(jQuery('.layer-b')[0], .35, {
                            opacity: 1,
                            roundProps: "x,y",
                            delay: .5
                        });
                        TweenMax.to(jQuery('.layer-c')[0], .35, {
                            opacity: 1,
                            roundProps: "x,y",
                            delay: .2
                        });
                        TweenMax.to(jQuery('.layer-d')[0], .35, {
                            opacity: 1,
                            roundProps: "x,y",
                            delay: .3
                        });
                        TweenMax.to(jQuery('.layer-e')[0], .35, {
                            opacity: 1,
                            roundProps: "x,y",
                            delay: .4
                        });
                        setTimeout(function () {
                            jQuery('.digital .line-white').addClass('ready');
                        }, 2000);
                        setTimeout(function () {
                            roundDigitalSizes();
                            loadBannerImages();
                        }, 3000);
                        stopFlag1 = false;
                    }
                });
                jQuery('body').css('overflow', 'inherit').removeAttr('data-scroll');
            }
        });
    }
});
var videoAnimation = new TimelineMax({
    paused: true
});
var globalID;
jQuery(window).load(function () {
    updateInfoScenes1();
    setTimeout(function () {
        updateInfoScenes1();
    }, 3000);
    setTimeout(function () {
        updateInfoScenes1();
    }, 5000);
    setTimeout(function () {
        updateInfoScenes1();
    }, 7000);
    setTimeout(function () {
        updateInfoScenes1();
    }, 9000);
    jQuery('.quotes img').each(function () {
        jQuery(this).attr('src', jQuery(this).attr('data-src'));
    });
    new TweenLite(jQuery('.blobs').removeAttr('style'), 1, {
        y: -51
    });
    new TweenLite(jQuery('.blobs .blob:eq(0)').removeAttr('style'), 1, {
        y: -200,
        delay: 0.5
    });
    new TweenLite(jQuery('.blobs .blob:eq(1)').removeAttr('style'), 1, {
        y: 50,
        delay: 0.5
    });
    if ((jQuery('.video-elements').length || jQuery('.mobile-intro').length) && jQuery('body').attr('data-scroll') == 'intro') {
        var date = new Date();
        var AP = '';
        var videoDuration;
        var fontSize;

        function amPm(h) {
            if (h > 12) {
                h = h - 12;
                AP = "pm";
            } else {
                AP = "am";
            }
            return h;
        }
        var hour = amPm(date.getHours());
        var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        // intro start
        if (!isTouchDevice) {
            if (jQuery.cookie("intro")) {
                jQuery('.video-elements').remove();
                jQuery('video.bgvid').hide();
            } else {
                jQuery('video.bgvid').show();
            }
            var video = jQuery('video.bgvid')[0];
            video.volume = 0.5;
            var scaleK = jQuery('.bgvid').width() / 1280;
            jQuery('#time').html('It&#8242;s <strong>' + hour + ':' + minutes + '</strong> <i>' + AP + '</i>');
            jQuery('#pause').click(function () {
                video.pause();
            });
            jQuery('#play').click(function () {
                video.play();
            });
            var k = 1;
            while (jQuery('#big-title span.word-1').offset().top != jQuery('#big-title span.word-2').offset().top) {
                fontSize = 60 * scaleK - k;
                jQuery('#big-title span').css('font-size', fontSize + 'px');
                k++;
            }
            if (k == 1) {
                fontSize = parseInt(jQuery('#big-title span').css('font-size')) * scaleK;
            }
            videoAnimation.set('#time', {
                css: {
                    'font-size': parseInt(jQuery('#time').css('font-size')) * scaleK + 'px'
                }
            }).set('#time i', {
                css: {
                    'font-size': parseInt(jQuery('#time i').css('font-size')) * scaleK + 'px'
                }
            }).set('#small-title', {
                css: {
                    'font-size': parseInt(jQuery('#small-title').css('font-size')) * scaleK + 'px'
                }
            }).set('#big-title span', {
                css: {
                    'font-size': fontSize + 'px'
                }
            }).to('#skip', 0.5, {
                className: "show",
                delay: 0.3
            }).to('#time', 0.5, {
                css: {
                    opacity: 1
                },
                delay: 0.3
            }).to('#time', 6.5, {
                css: {
                    top: '48%'
                },
                delay: 0.1,
                ease: Power0.easeNone
            }).to('#time', 0.7, {
                css: {
                    opacity: 0,
                    'transform': 'scaleY(2) scaleX(1.1)',
                    'text-shadow': ' 0 0 15px #fff'
                }
            }).to('#small-title', 0.5, {
                css: {
                    opacity: 1
                },
                className: "an",
                delay: 2
            }).to('#big-title', 0.5, {
                css: {
                    opacity: 1
                },
                className: "an"
            }).to('#small-title, #big-title', 0.5, {
                css: {
                    opacity: 0
                },
                delay: 3
            }).to('#slide-logo', 1, {
                css: {
                    opacity: 1
                },
            }).to('#slide-logo', 0.5, {
                css: {
                    opacity: 1
                },
                delay: 1.6,
                onComplete: function () {
                    jQuery.cookie("intro", 1, {
                        expires: 30,
                        path: '/'
                    });
                    cancelAnimationFrame(globalID);
                    jQuery('body, html').animate({
                        scrollTop: 0
                    }, 1);
                    var stopFlag1 = true;
                    jQuery('.bgvid, .video-elements').fadeOut(750, function () {
                        if (stopFlag1) {
                            flagS = 1;
                            setTimeout(function () {
                                flagS = 0;
                            }, 3000);
                            jQuery('.digital').addClass('animate');
                            TweenMax.to(jQuery('.layer-b')[0], 2, {
                                x: '-8rem',
                                roundProps: "x,y",
                                delay: .5
                            });
                            TweenMax.to(jQuery('.layer-c')[0], 2, {
                                x: '-6rem',
                                roundProps: "x,y",
                                delay: .2
                            });
                            TweenMax.to(jQuery('.layer-d')[0], 2, {
                                x: '7.3rem',
                                roundProps: "x,y",
                                delay: .3
                            });
                            TweenMax.to(jQuery('.layer-e')[0], 2, {
                                x: '6rem',
                                roundProps: "x,y",
                                delay: .4
                            });
                            TweenMax.to(jQuery('.layer-b')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .5
                            });
                            TweenMax.to(jQuery('.layer-c')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .2
                            });
                            TweenMax.to(jQuery('.layer-d')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .3
                            });
                            TweenMax.to(jQuery('.layer-e')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .4
                            });
                            setTimeout(function () {
                                jQuery('.digital .line-white').addClass('ready');
                            }, 2000);
                            setTimeout(function () {
                                roundDigitalSizes();
                                loadBannerImages();
                            }, 3000);
                            stopFlag1 = false;
                        }
                    });
                    jQuery('body').css('overflow', 'inherit').removeAttr('data-scroll');
                }
            });
            launchVideo();

            function launchVideo() {
                if (video.currentTime !== 0) {
                    videoDuration = video.duration;
                    videoProgress();
                }
                requestAnimationFrame(launchVideo);
            }

            function videoProgress() {
                if (!videoDuration) {
                    videoDuration = 9.047233;
                }
                videoAnimation.progress(video.currentTime / videoDuration);
                globalID = requestAnimationFrame(videoProgress);
            }
            jQuery("video.bgvid").bind("ended", function () {
                jQuery('.digital').addClass('animate');
                jQuery.cookie("intro", 1, {
                    expires: 30,
                    path: '/'
                });
                TweenMax.to(jQuery('.layer-b')[0], 2, {
                    x: '-8rem',
                    roundProps: "x,y",
                    delay: .5
                });
                TweenMax.to(jQuery('.layer-c')[0], 2, {
                    x: '-6rem',
                    roundProps: "x,y",
                    delay: .2
                });
                TweenMax.to(jQuery('.layer-d')[0], 2, {
                    x: '7.3rem',
                    roundProps: "x,y",
                    delay: .3
                });
                TweenMax.to(jQuery('.layer-e')[0], 2, {
                    x: '6rem',
                    roundProps: "x,y",
                    delay: .4
                });
                TweenMax.to(jQuery('.layer-b')[0], .35, {
                    opacity: 1,
                    roundProps: "x,y",
                    delay: .5
                });
                TweenMax.to(jQuery('.layer-c')[0], .35, {
                    opacity: 1,
                    roundProps: "x,y",
                    delay: .2
                });
                TweenMax.to(jQuery('.layer-d')[0], .35, {
                    opacity: 1,
                    roundProps: "x,y",
                    delay: .3
                });
                TweenMax.to(jQuery('.layer-e')[0], .35, {
                    opacity: 1,
                    roundProps: "x,y",
                    delay: .4
                });
                setTimeout(function () {
                    jQuery('.digital .line-white').addClass('ready');
                }, 2000);
                setTimeout(function () {
                    roundDigitalSizes();
                    loadBannerImages();
                }, 3000);
            });
        } else {
            jQuery('.mobile-intro').show();
            jQuery('#time-m').html('It&#8242;s <strong>' + hour + ':' + minutes + '</strong> <i>' + AP + '</i>');
            var stopFlag = true;
            videoAnimation = new TimelineMax({
                paused: true,
                onComplete: function () {
                    jQuery('body, html').animate({
                        scrollTop: 0
                    }, 1);
                    jQuery('.mobile-intro').fadeOut(750, function () {
                        if (stopFlag) {
                            flagS = 1;
                            setTimeout(function () {
                                flagS = 0;
                            }, 3000);
                            jQuery('.digital').addClass('animate');
                            TweenMax.to(jQuery('.layer-b')[0], 2, {
                                x: '-8rem',
                                roundProps: "x,y",
                                delay: .5
                            });
                            TweenMax.to(jQuery('.layer-c')[0], 2, {
                                x: '-6rem',
                                roundProps: "x,y",
                                delay: .2
                            });
                            TweenMax.to(jQuery('.layer-d')[0], 2, {
                                x: '7.3rem',
                                roundProps: "x,y",
                                delay: .3
                            });
                            TweenMax.to(jQuery('.layer-e')[0], 2, {
                                x: '6rem',
                                roundProps: "x,y",
                                delay: .4
                            });
                            TweenMax.to(jQuery('.layer-b')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .5
                            });
                            TweenMax.to(jQuery('.layer-c')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .2
                            });
                            TweenMax.to(jQuery('.layer-d')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .3
                            });
                            TweenMax.to(jQuery('.layer-e')[0], .35, {
                                opacity: 1,
                                roundProps: "x,y",
                                delay: .4
                            });
                            setTimeout(function () {
                                jQuery('.digital .line-white').addClass('ready');
                            }, 2000);
                            setTimeout(function () {
                                roundDigitalSizes();
                                loadBannerImages();
                            }, 3000);
                            stopFlag = false;
                        }
                    });
                    jQuery('body').css('overflow', 'inherit').removeAttr('data-scroll');
                }
            });
            var l130 = 130;
            var l290 = 290;
            if (jQuery(window).width() < 460 && (jQuery(window).width() < jQuery(window).height())) {
                l130 = 100;
                l290 = 250;
            } else if (jQuery(window).height() < 460 && (jQuery(window).width() > jQuery(window).height())) {
                l130 = 50;
                l290 = 150;
            } else {
                l130 = 130;
                l290 = 290;
            }
            var pointOfRotate = (1 - jQuery(window).height() * 0.04 / parseInt(jQuery('.video-elements-m .line').height())) * 100;
            pointOfRotate = pointOfRotate.toFixed(1);
            videoAnimation.set('.video-elements-m .line', {
                css: {
                    'transform-origin': '50% ' + pointOfRotate + '% 0',
                    '-webkit-transform-origin': '50% ' + pointOfRotate + '% 0'
                }
            }).to('#time-m', 0.5, {
                css: {
                    opacity: 1
                }
            }, 0.5).to('#time-m', 4, {
                css: {
                    top: '48%'
                },
                ease: Power0.easeNone
            }, 0.7).to('#time-m', 0.7, {
                css: {
                    opacity: 0,
                    'transform': 'scaleY(2) scaleX(1.1)',
                    'text-shadow': ' 0 0 15px #fff'
                }
            }, 4.7).to('.video-elements-m .line', 1.2, {
                css: {
                    'opacity': 1
                }
            }, 0.2).to('.video-elements-m .line', 1.4, {
                rotation: 390
            }, 0.2).to('.video-elements-m .line', 0.15, {
                rotation: 395
            }, 2).to('.video-elements-m .line', 0.15, {
                rotation: 400
            }, 2.9).to('.video-elements-m .line', 0.15, {
                rotation: 405
            }, 3.8).to('.video-elements-m .line', 0.15, {
                rotation: 410
            }, 4.7).to('.video-elements-m .line', 0.15, {
                rotation: 415
            }, 5.6).to('.video-elements-m .line', 0.3, {
                css: {
                    'opacity': 0
                }
            }, 4.7).to('.circle-1,.circle-2,.circle-3,.circle-4,.circle-5', 0.5, {
                css: {
                    'width': '12px',
                    'height': '12px'
                }
            }).to('.circle.center', 0.5, {
                css: {
                    'width': '36px',
                    'height': '36px'
                }
            }, 0).to('.circle.center', 0.5, {
                css: {
                    'width': '12px',
                    'height': '12px'
                }
            }, 0.5).to('.circle-1', 3.5, {
                css: {
                    'transform': 'translate(-37vw,3vh)',
                    'width': '12px',
                    'height': '12px'
                }
            }, 1).to('.circle-2', 3.5, {
                css: {
                    'transform': 'translate(-35vw,20vh)',
                    'width': '56px',
                    'height': '56px'
                }
            }, 1).to('.circle-3', 3.5, {
                css: {
                    'transform': 'translate(35vw,2vh)',
                    'width': '24px',
                    'height': '24px'
                }
            }, 1).to('.circle-4', 3.5, {
                css: {
                    'transform': 'translate(30vw,-35vh)',
                    'width': '48px',
                    'height': '48px'
                }
            }, 1).to('.circle-5', 3.5, {
                css: {
                    'transform': 'translate(19vw,-1vh)',
                    'width': '16px',
                    'height': '16px'
                }
            }, 1).to('.circle-1,.circle-2,.circle-3,.circle-4,.circle-5', 0.5, {
                css: {
                    'transform': 'translate(0,0)',
                    'width': '12px',
                    'height': '12px'
                }
            }, 4.6).to('.circle-1,.circle-2,.circle-3,.circle-4,.circle-5,.circle.center', 0.2, {
                css: {
                    'opacity': '0'
                }
            }, 5).to('.video-elements-m .square', 0.2, {
                css: {
                    'opacity': '1',
                    'border-width': '24px'
                }
            }, 4.8).to('.video-elements-m .square', 0.7, {
                css: {
                    'width': l130 + 'px',
                    'height': l130 + 'px',
                    'border-width': '4px'
                }
            }, 4.9).to('.video-elements-m .square', 0.5, {
                css: {
                    'width': l290 + 'px',
                    'height': l290 + 'px',
                    'border-width': '15px',
                    'margin-top': '-15vh'
                }
            }, 5.7).to('.video-elements-m .square', 2.5, {
                css: {
                    'box-shadow': '0 0 13px #01e471, inset 0 0 13px #01e471'
                }
            }, 6.1).to('.video-elements-m .square', 1.2, {
                rotation: -135
            }, 6.1).to('.video-elements-m .square', 0.5, {
                scale: 5
            }, 7.1).to('.video-elements-m .square', 0.5, {
                css: {
                    'opacity': '0'
                }
            }, 7.6).to('.video-elements-m .square-2', 0, {
                css: {
                    'opacity': '1'
                }
            }, 5.6).to('.video-elements-m .square-2', 0.5, {
                css: {
                    'width': l290 + 'px',
                    'height': l290 + 'px',
                    'margin-top': '-5vh'
                }
            }, 5.7).to('.video-elements-m .square-2', 1.2, {
                rotation: -135
            }, 6.3).to('.video-elements-m .square-2', 0.5, {
                scale: 0.5
            }, 7.1).to('.video-elements-m .square-2', 0.5, {
                css: {
                    'opacity': '0'
                }
            }, 7.1).to('#small-title-m', 0.5, {
                css: {
                    opacity: 1
                },
                className: "an"
            }, 7.2).to('#big-title-m', 0.5, {
                css: {
                    opacity: 1
                },
                className: "an"
            }, 7.2).to('#small-title-m, #big-title-m', 0.5, {
                css: {
                    opacity: 0
                }
            }, 9).to('#slide-logo-m', 0.7, {
                css: {
                    opacity: 1
                },
            }, 8.9).to('#slide-logo-m', 0.5, {
                css: {
                    opacity: 1
                },
                onComplete: function () {
                    jQuery.cookie("intro", 1, {
                        expires: 30,
                        path: '/'
                    });
                }
            }, 10);

            function getMobileOperatingSystem() {
                var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
                    return 'iOS';
                } else if (userAgent.match(/Android/i)) {
                    return 'Android';
                } else {
                    return 'unknown';
                }
            }
            var delay = 0;
            if (getMobileOperatingSystem() == 'Android') {
                delay = 1700;
            }
            setTimeout(function () {
                videoAnimation.play();
            }, delay);
        }
        // intro end
    } else {
        flagS = 1;
        setTimeout(function () {
            flagS = 0;
        }, 3000);
    }
    jQuery('#skip').click(function () {
        jQuery.cookie("intro", 1, {
            expires: 30,
            path: '/'
        });
        videoAnimation.progress(1);
        video.pause();
    })
    if (jQuery.cookie("intro")) {
        jQuery('video.bgvid').remove();
    }
    fixSubpages();
    subpagesAnimation();
    bannerAnimation();
    featuredTxtAnimation();
    nowHiringAnimation();
    discussAnimation();
    reachOutAnimation();
    fixBannerIE();
    verticalsParallax();
    servicesTopFix();
    servicesAnimation();
    powersAnimation();
    scrollImage();
    if (jQuery('.services-menu').length) {
        setTimeout(function () {
            jQuery('.services-menu, .services-top .deco-top, .services-top .feature-txt, .services-top .col-l .purple-top').addClass('animated');
            jQuery('.services-top .deco-bottom').addClass('animate');
        }, 400);
    }
});

function fixSubpages() {
    jQuery('.three-subpages .col').each(function () {
        var _t = jQuery(this).height() - jQuery(this).find('.img-wrap').height();
        jQuery(this).find('.img-wrap em').css('bottom', '-' + _t + 'px');
    });
    jQuery('.three-subpages').addClass('positioned');
}
var _h = jQuery(window).height() / 2;
var _p = parseInt(jQuery('.three-subpages').css('padding-top'));

function subpagesAnimation() {
    if (jQuery('.three-subpages').length) {
        if ((window.pageYOffset + jQuery(window).height()) > jQuery('.three-subpages .inner').offset().top && jQuery(window).width() > 767) {
            var _d = window.pageYOffset + jQuery(window).height() - jQuery('.three-subpages .inner').offset().top;
            if (_d < _h) {
                jQuery('.three-subpages .col.col-01').css({
                    '-webkit-transform': 'translate(0,-' + _d * _p * 0.3 / _h + 'px)',
                    'transform': 'translate(0,-' + _d * _p * 0.3 / _h + 'px)'
                });
                jQuery('.three-subpages .col.col-02').css({
                    '-webkit-transform': 'translate(0,' + _d * _p * 0.24 / _h + 'px)',
                    'transform': 'translate(0,' + _d * _p * 0.24 / _h + 'px)'
                });
                jQuery('.three-subpages .col.col-03').css({
                    '-webkit-transform': 'translate(0,-' + _d * _p / _h + 'px)',
                    'transform': 'translate(0,-' + _d * _p / _h + 'px)'
                });
            } else {
                jQuery('.three-subpages .col.col-01').css({
                    '-webkit-transform': 'translate(0,-' + _p * 0.3 + 'px)',
                    'transform': 'translate(0,-' + _p * 0.3 + 'px)'
                });
                jQuery('.three-subpages .col.col-02').css({
                    '-webkit-transform': 'translate(0,' + _p * 0.24 + 'px)',
                    'transform': 'translate(0,' + _p * 0.24 + 'px)'
                });
                jQuery('.three-subpages .col.col-03').css({
                    '-webkit-transform': 'translate(0,-' + _p + 'px)',
                    'transform': 'translate(0,-' + _p + 'px)'
                });
            }
        } else {
            jQuery('.three-subpages .col').removeAttr('style');
        }
    }
}

function bannerAnimation() {
    if ((jQuery('.page-template-agency-page').length || (jQuery('.page-template-careers-page').length) && !isTouchDevice)) {
        var _d = 69 - window.pageYOffset / 2;
        TweenLite.to("#banner-heading,#banner-heading-2", 0.01, {
            y: _d,
            ease: Power3.easeOut
        });
    }
}

function fixBannerIE() {
    if (isIE()) {
        jQuery('#bannerMask').css('width', jQuery('#bannerMask+img').width() + 'px');
        jQuery('#bannerMask').css('height', jQuery('#bannerMask+img').height() + 'px');
        jQuery('#bannerMask').attr('viewBox', '0 0 ' + parseInt(jQuery('#bannerMask+img').width()) + ' ' + parseInt(jQuery('#bannerMask+img').height()));
    }
}

function changeWord(p) {
    var _t = (jQuery('.' + p).find('.active em').length + 1) * 70;
    var time = 0;
    var lTime = 0;
    var fixIE = 0;
    var _d = 15;
    if (isTouchDevice && jQuery(window).width() < 768) {
        _d = 300;
    }
    if (jQuery('.' + p).find('.active').next().length) {
        jQuery('.' + p).find('.active').next().addClass('next-to-change');
        setTimeout(function () {
            jQuery('.' + p).find('.next-to-change').addClass('show-next');
        }, _d);
        setTimeout(function () {
            if (time < _t) {
                jQuery('.' + p).css('width', jQuery('.' + p).find('.active').width() + 'px');
            } else {
                jQuery('.' + p).css('width', jQuery('.' + p).find('.next-to-change').width() + 'px');
            }
        }, _t);
    } else {
        jQuery('.' + p).find('.text').first().addClass('next-to-change');
        setTimeout(function () {
            jQuery('.' + p).find('.next-to-change').addClass('show-next');
        }, 15);
        setTimeout(function () {
            if (time < _t) {
                jQuery('.' + p).css('width', jQuery('.' + p).find('.active').width() + 'px');
            } else {
                jQuery('.' + p).css('width', jQuery('.' + p).find('.text').first().width() + 'px');
            }
        }, _t);
    }
    time = (jQuery('.' + p).find('.next-to-change em').length + 1) * 70;
    setTimeout(function () {
        jQuery('.' + p).find('.active').addClass('to-change');
    }, 30);
    if (isIE()) {
        fixIE = 300;
    }
    if (time < _t) {
        lTime = _t + fixIE;
    } else {
        lTime = time + fixIE;
    }
    setTimeout(function () {
        jQuery('.' + p).find('.active').removeClass('active to-change');
        jQuery('.' + p).find('.next-to-change').removeClass('next-to-change show-next').addClass('active');
        jQuery('.' + p).css('width', jQuery('.' + p).find('.active').width() + 'px');
    }, lTime);
}

function wordsChanging() {
    if (jQuery('.home .our-ideals').length) {
        if (!jQuery('.our-ideals').hasClass('scrolled')) {
            jQuery('.our-ideals').addClass('scrolled');
            changeWord('f-word');
            setInterval(function () {
                changeWord('f-word');
            }, 4000);
            setTimeout(function () {
                changeWord('l-word');
                setInterval(function () {
                    changeWord('l-word');
                }, 4000);
            }, 1000);
        }
    }
}

function featuredTxtAnimation() {
    if (jQuery('.feature-txt .col-r .deco-bottom').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height() * 0.9) > jQuery('.feature-txt .col-r .deco-bottom').offset().top) {
            _offset = (window.pageYOffset + jQuery(window).height() - jQuery('.feature-txt .col-r .deco-bottom').offset().top) * 0.2;
        } else {
            _offset = 0;
        }
        jQuery('.feature-txt .col-r .deco-bottom').css({
            '-webkit-transform': 'translate(0,-' + _offset + 'px)',
            'transform': 'translate(0,-' + _offset + 'px)'
        });
    }
    if (jQuery('.page-template-service-page').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height() * 0.9) > jQuery('.services-top .deco-bottom').offset().top) {
            _offset = window.pageYOffset * 0.9;
        } else {
            _offset = 0;
        }
        if (jQuery('.page-template-service-page .post-gallery').length) {
            if (_offset > jQuery('.page-template-service-page .post-gallery').offset().top) {
                _offset = jQuery('.page-template-service-page .post-gallery').offset().top;
            }
        }
        jQuery('.services-top .deco-bottom').css({
            '-webkit-transform': 'translate(0,' + _offset + 'px)',
            'transform': 'translate(0,' + _offset + 'px)'
        });
    }
}

function verticalsParallax() {
    if (jQuery('.verticals').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height()) > jQuery('.agency-bottom').offset().top) {
            _offset = (window.pageYOffset + jQuery(window).height() - jQuery('.agency-bottom').offset().top) * 0.2;
        } else {
            _offset = 0;
        }
        jQuery('.parallax-top').css({
            '-webkit-transform': 'translate(0,-' + _offset + 'px)',
            'transform': 'translate(0,-' + _offset + 'px)'
        });
        var _offset2 = 0;
        if ((window.pageYOffset + jQuery(window).height()) > jQuery('.agency-bottom').offset().top) {
            _offset2 = (window.pageYOffset + jQuery(window).height() - jQuery('.agency-bottom').offset().top) * 0.4;
        } else {
            _offset2 = 0;
        }
        jQuery('.verticals-in').css({
            '-webkit-transform': 'translate(0,-' + _offset2 + 'px)',
            'transform': 'translate(0,-' + _offset2 + 'px)'
        });
        var verticalsHeight = parseInt(jQuery('.verticals-in').height()) - _offset2;
        jQuery('.verticals').css({
            'height': verticalsHeight + 'px'
        });
    }
}

function nowHiringAnimation() {
    if (jQuery('.top-footer').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height()) > jQuery('.top-footer .img-wrap').offset().top) {
            jQuery('.top-footer h3 .img-wrap img').addClass('no-transition');
            _offset = (window.pageYOffset + jQuery(window).height() - jQuery('.top-footer .img-wrap').offset().top) * 0.19;
        } else {
            _offset = 0;
        }
        jQuery('.top-footer .img-wrap img').css({
            '-webkit-transform': 'translate(0,-' + _offset + 'px)',
            'transform': 'translate(0,-' + _offset + 'px)'
        });
        jQuery('.top-footer .deco-01 span').css({
            '-webkit-transform': 'translate(0,' + _offset + 'px)',
            'transform': 'translate(0,' + _offset + 'px)'
        });
        jQuery('.top-footer .deco-02 span').css({
            '-webkit-transform': 'translate(0,-' + _offset * 0.4 + 'px)',
            'transform': 'translate(0,-' + _offset * 0.4 + 'px)'
        });
    }
}

function discussAnimation() {
    if (jQuery('.start-discuss').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height()) > jQuery('.start-discuss').offset().top) {
            _offset = (window.pageYOffset + jQuery(window).height() - jQuery('.start-discuss').offset().top) * 0.29;
        } else {
            _offset = 0;
        }
        jQuery('.start-discuss .deco-01 span').css({
            '-webkit-transform': 'translate(0,-' + _offset + 'px)',
            'transform': 'translate(0,-' + _offset + 'px)'
        });
        jQuery('.start-discuss .deco-02 span').css({
            '-webkit-transform': 'translate(0,' + _offset * 0.4 + 'px)',
            'transform': 'translate(0,' + _offset * 0.4 + 'px)'
        });
    }
}

function reachOutAnimation() {
    if (jQuery('.contact-bottom-section').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height()) > jQuery('.contact-bottom-section').offset().top) {
            _offset = (window.pageYOffset + jQuery(window).height() - jQuery('.contact-bottom-section').offset().top) * 0.24;
        } else {
            _offset = 0;
        }
        jQuery('.contact-bottom-section .deco-01 span').css({
            '-webkit-transform': 'translate(0,-' + _offset + 'px)',
            'transform': 'translate(0,-' + _offset + 'px)'
        });
        jQuery('.contact-bottom-section .deco-02 span').css({
            '-webkit-transform': 'translate(0,' + _offset * 0.8 + 'px)',
            'transform': 'translate(0,' + _offset * 0.8 + 'px)'
        });
        jQuery('.contact-bottom-section .deco-03 span').css({
            '-webkit-transform': 'translate(0,-' + _offset * 0.8 + 'px)',
            'transform': 'translate(0,-' + _offset * 0.8 + 'px)'
        });
    }
}

function fixBannerAgency() {
    if (jQuery(window).width() < 768 && jQuery(window).width() > 560) {
        jQuery('#banner-heading-right, #banner-heading-right-2, #banner-heading, #banner-heading-2').attr('x', '235');
        jQuery('#banner-heading-right, #banner-heading-right-2, #banner-heading, #banner-heading-2').attr('class', 'ready');
    } else if (jQuery(window).width() < 561 && jQuery(window).width() > 479.5) {
        jQuery('#banner-heading-right,#banner-heading-right-2, #banner-heading, #banner-heading-2').attr('x', '320');
        jQuery('#banner-heading-right,#banner-heading-right-2, #banner-heading, #banner-heading-2').attr('class', 'ready');
    } else if (jQuery(window).width() < 480) {
        if (jQuery('.page-template-careers-page').length) {
            jQuery('#banner-heading-right,#banner-heading-right-2, #banner-heading, #banner-heading-2').attr('x', '420');
            jQuery('#banner-heading-right,#banner-heading-right-2, #banner-heading, #banner-heading-2').attr('class', 'ready');
        } else {
            jQuery('#banner-heading-right,#banner-heading-right-2, #banner-heading, #banner-heading-2').attr('x', '430');
            jQuery('#banner-heading-right,#banner-heading-right-2, #banner-heading, #banner-heading-2').attr('class', 'ready');
        }
    }
}
(function (window, document) {
    function TouchLib() {
        function onTouch(element, fn) {
            return function () {
                var touchAllow = false;
                var coords = {};
                var timeout;
                var isTouchSupported = 'ontouchstart' in window;
                var square = 10;
                if (isTouchSupported) {
                    element.addEventListener('touchstart', function (event) {
                        coords = {
                            x: event.changedTouches[0].screenX,
                            y: event.changedTouches[0].screenY
                        };
                        touchAllow = true;
                        timeout = window.setTimeout(function () {
                            touchAllow = false;
                        }, 500);
                    });
                }
                element.addEventListener('touchend', function (event) {
                    var curCoords = {
                        x: event.changedTouches[0].screenX,
                        y: event.changedTouches[0].screenY
                    };
                    var x = Math.abs(curCoords.x - coords.x);
                    var y = Math.abs(curCoords.y - coords.y);
                    if (x < square && y < square) {
                        if (touchAllow) {
                            event.stopPropagation();
                            touchAllow = false;
                            clearTimeout(timeout);
                            fn(event);
                        }
                    }
                });
            };
        }
        this.setOnTouch = onTouch;
    }
    window.TouchLib = new TouchLib();
})(window, document);
window.addEventListener("orientationchange", function () {
    setTimeout(function () {
        if (jQuery(window).width() > 767) {
            jQuery(".three-subpages .inner").removeAttr('style');
            jQuery(".three-subpages .inner").attr('data-shift', 1);
        }
        if (jQuery(window).width() > 1023) {
            jQuery('.works-row .work,.works-row').each(function () {
                jQuery(this).css('height', '');
            });
            jQuery('.works').css('height', jQuery(window).height() + 'px');
        } else {
            jQuery('.works-row .work,.works').each(function () {
                jQuery(this).css('height', jQuery(window).height() + 'px');
            });
            jQuery('.works-row').each(function () {
                jQuery(this).css('height', 'auto');
            });
            TweenLite.to('.works-timing', 0.5, {
                x: '0%',
                onComplete: function () {
                    jQuery('.works-row .work,.works').each(function () {
                        jQuery(this).css('height', jQuery(window).height() + 'px');
                    });
                    jQuery('.works-row').each(function () {
                        jQuery(this).css('height', 'auto');
                    });
                }
            });
        }
        setHeroIpad();
        jQuery('.v-txt').each(function () {
            jQuery(this).css('width', 1078 * 0.56 + 'px');
        });
        fixContactBanner();
        breakStatementHeadings();
        fixWorkPage();
        fixIntro();
        fixThanksHeight();
    }, 500);
}, false);

function loadMoreInstagram() {
    if (!jQuery('.instagram-widget').hasClass('in-progress')) {
        jQuery('.instagram-widget').addClass('in-progress');
        jQuery('.loader').show();
        var showed = jQuery('.instagram-widget > a').length;
        jQuery.ajax({
            type: "POST",
            url: "/wp-admin/admin-ajax.php",
            data: 'action=get_instagram&showed=' + showed,
            success: function (html) {
                var _b = jQuery('.instagram-widget > a').length;
                jQuery('.load-row').before(html);
                var _a = jQuery('.instagram-widget > a').length;
                if ((_a - _b) != 3) {
                    jQuery('.load-more').remove();
                }
                jQuery('.instagram-widget').removeClass('in-progress');
                jQuery('.loader').hide();
            }
        });
    }
}

function servicesTopFix() {
    if (jQuery('.page-template-service-page').length) {
        var _offsetLeft = Math.ceil((jQuery(window).width() - 1200) / 2);
        if (_offsetLeft < parseInt(jQuery('.services-top .inner').css('padding-left'))) {
            _offsetLeft = parseInt(jQuery('.services-top .inner').css('padding-left')) + 2;
        }
        jQuery('.purple-top img').css({
            'width': jQuery('.services-top .col-l').width() + _offsetLeft + 'px',
            'margin-left': '-' + _offsetLeft + 'px'
        });
        jQuery('.services-top .col-l .purple-top > span, .purple-top .services-menu .current .gradient').css({
            'left': '-' + _offsetLeft + 'px'
        });
    }
}

function servicesAnimation() {
    if (jQuery('.services-list').length && !jQuery('.services-row').length) {
        var divs = jQuery(".services-list .col");
        for (var i = 0; i < divs.length; i += 4) {
            divs.slice(i, i + 4).wrapAll("<div class='services-row'></div>");
        }
    }
}

function powersAnimation() {
    if (jQuery('.power-services .deco-bottom').length) {
        var _offset = 0;
        if ((window.pageYOffset + jQuery(window).height() * 0.9) > jQuery('.power-services .deco-bottom').offset().top) {
            jQuery('.power-services .deco-bottom').addClass('show');
            _offset = (window.pageYOffset + jQuery(window).height() - jQuery('.power-services .deco-bottom').offset().top) * 0.2;
        } else {
            _offset = 0;
        }
        jQuery('.power-services .deco-bottom').css({
            '-webkit-transform': 'translate(0,' + _offset + 'px)',
            'transform': 'translate(0,' + _offset + 'px)'
        });
    }
}

function scrollImage() {
    var k = 1;
    if (jQuery('.portfolio-image').length) {
        if (jQuery(window).width() < 768) {
            if ((window.pageYOffset + jQuery(window).height() * k) > jQuery(".portfolio-image").offset().top) {
                var kof = window.pageYOffset + jQuery(window).height() - jQuery(".portfolio-image").offset().top;
                jQuery('.portfolio-image').css({
                    "background-position": "center " + kof * 0.04 + "%"
                });
                jQuery('.ipad').css({
                    "-webkit-transform": "translate(0, " + kof * 0.08 + "%)",
                    "transform": "translate(0, " + kof * 0.08 + "%)"
                });
            }
        } else {
            if ((window.pageYOffset + jQuery(window).height() * k) > jQuery(".portfolio-image").offset().top) {
                var kof = window.pageYOffset + jQuery(window).height() - jQuery(".portfolio-image").offset().top;
                jQuery('.portfolio-image').css({
                    "background-position": "center " + kof * 0.06 + "%"
                });
                jQuery('.ipad').css({
                    "-webkit-transform": "translate(0, " + kof * 0.025 + "%)",
                    "transform": "translate(0, " + kof * 0.025 + "%)"
                });
            }
        }
    }
    if (jQuery('.slide-inner').length) {
        if ((window.pageYOffset + jQuery(window).height() * k) > jQuery(".slide-inner").offset().top) {
            var kof = (window.pageYOffset + jQuery(window).height() - jQuery(".slide-inner").offset().top) * 0.065;
            jQuery('.slide-inner').css({
                "background-position": "center " + kof + "%"
            });
        }
    }
}

function setStatementLines() {
    if (jQuery('.page-template-agency-page .statement-top p').length) {
        jQuery('.page-template-agency-page .statement-top p').each(function () {
            var curTop = jQuery(this).offset().top + 7;
            var i = 1;
            jQuery(this).find('span').each(function () {
                jQuery(this).removeAttr('class');
                if (jQuery(this).offset().top <= curTop) {
                    jQuery(this).addClass('line-' + i);
                } else {
                    curTop = jQuery(this).offset().top + 7;
                    i++;
                    jQuery(this).addClass('line-' + i);
                }
            });
        });
    }
    if (jQuery('.feature-txt .col-r p').length) {
        var curTop = jQuery('.feature-txt .col-r p').offset().top + 7;
        var i = 1;
        jQuery('.feature-txt .col-r p span').each(function () {
            jQuery(this).removeAttr('class');
            if (jQuery(this).offset().top <= curTop) {
                jQuery(this).addClass('line-' + i);
            } else {
                curTop = jQuery(this).offset().top + 7;
                i++;
                jQuery(this).addClass('line-' + i);
            }
        });
    }
}

function animateQuote() {
    jQuery('.quotes').each(function () {
        if (!jQuery(this).hasClass('done')) {
            jQuery(this).addClass('done');
            var imgs = jQuery(this).find('img');
            var k = 0;
            var c = 0;
            repeatOften();

            function repeatOften() {
                if (c % 3 === 0) {
                    if (k === 0) {
                        jQuery(imgs[k]).addClass('hide');
                        jQuery(imgs[k + 1]).addClass('show');
                    } else if (k == (imgs.length - 1)) {
                        return false;
                    } else {
                        jQuery(imgs[k]).removeClass('show');
                        jQuery(imgs[k + 1]).addClass('show');
                    }
                    k++;
                }
                c++;
                requestAnimationFrame(repeatOften);
            }
        }
    });
}

function fixRightColumnPosition() {
    if (jQuery('body.page-template-agency-page').length) {
        var _w = jQuery(window).width();
        var innerW = jQuery('.feature-txt .inner').innerWidth();
        if (jQuery(window).width() > 1600) {
            var columnWidth = jQuery('.feature-txt .inner').width() - (901 * _w / 1600 - (_w - innerW) / 2 - 30) - parseInt(jQuery('.feature-txt .col-r').css('padding-right'));
            jQuery('.feature-txt .col-r').css('width', columnWidth + 'px');
        } else if (jQuery(window).width() < 1600 && jQuery(window).width() > 767) {
            var space = 0;
            space = (_w - jQuery('.feature-txt .inner').innerWidth()) / 2;
            if (space < 0) {
                space = 0;
            }
            var columnWidth = _w - parseInt(jQuery('.feature-txt .inner').css('padding-left')) - 901 * _w / 1600 - parseInt(jQuery('.feature-txt .col-r').css('padding-right')) - space;
            jQuery('.feature-txt .col-r').css('width', columnWidth + 'px');
        }
    }
    jQuery('.feature-txt .col-r p').addClass('animate');
    jQuery('.feature-txt .col-l').addClass('animated');
}

function mobileHeader() {
    if (window.pageYOffset > 0 && !jQuery('body.page-template-work-new-page').length) {
        jQuery("#header").addClass("scrolled");
        jQuery("body").addClass("header-scrolled");
    } else {
        if (window.pageYOffset > 0 && jQuery('body.page-template-work-new-page .works-ready').length) {
            jQuery("#header").addClass("scrolled");
            jQuery("body").addClass("header-scrolled");
        } else {
            jQuery("#header").removeClass("scrolled");
            jQuery("body").removeClass("header-scrolled");
        }
    }
}

function setVerticalText() {
    if (jQuery('.v-txt').length || jQuery('.slide-entry').length) {
        if (jQuery(window).width() > jQuery(window).height()) {
            jQuery('.home').addClass('landscape').removeClass('portrait');
        } else {
            jQuery('.home').addClass('portrait').removeClass('landscape');
        }
        setCarouselScale();
        jQuery('.v-txt').each(function () {
            jQuery(this).css('width', 1078 * 0.56 + 'px');
        });
        jQuery(".hero-carousel .slide-outer").mousemove(function (event) {
            if (jQuery(this).find('.slide').hasClass('animated')) {
                jQuery('.safari-only').addClass('to-activate');
                var _this = jQuery(this);
                var x = (_this.offset().left + _this.innerWidth() / 2 - event.pageX) * (0.004);
                var y = (_this.offset().top + _this.innerHeight() / 2 - event.pageY) * (0.005);
            }
        });
        var windowWidth = jQuery(window).innerWidth();
        var windowHeight = jQuery(window).innerHeight();
        var halfWindowWidth = windowWidth / 2;
        var halfWindowHeight = windowHeight / 2;
        jQuery(".hero-carousel .slide-outer").mousemove(function (e) {
            var _this = jQuery(this);
            var cursorX = e.pageX;
            var cursorY = e.pageY - jQuery(window).scrollTop();
            var moveX = (cursorX - (halfWindowWidth)) * -0.08;
            var moveY = (cursorY - (halfWindowHeight)) * -0.08;
            var moveX2 = (cursorX - (halfWindowWidth)) * -0.02;
            var moveY2 = (cursorY - (halfWindowHeight)) * -0.02;
            var rotateY = moveX * -0.09;
            TweenMax.to(_this.find('.deco-move'), 1.175, {
                x: moveX,
                y: moveY,
                rotationY: rotateY
            });
            TweenMax.to(_this.find('.digit-in'), 1.175, {
                x: moveX2,
                y: moveY2,
                rotationY: rotateY
            });
            TweenMax.to(_this.find('.left-move'), 1.175, {
                x: moveX * 0.4,
                y: moveY * 0.8,
                rotationY: rotateY * 0.4
            });
        });
        var nAgt = navigator.userAgent;
        jQuery(".digital").mousemove(function (e) {
            if (!jQuery('.digital.delay').length) {
                var _this = jQuery(this);
                var cursorX = e.pageX;
                var cursorY = e.pageY;
                var moveX = (cursorX - (halfWindowWidth)) * +0.016;
                var moveX2 = (cursorX - (halfWindowWidth)) * +0.048;
                var moveX3 = (cursorX - (halfWindowWidth)) * +0.03;
                var moveX4 = (cursorX - (halfWindowWidth)) * +0.016;
                var moveX5 = (cursorX - (halfWindowWidth)) * -0.02;
                var moveY5 = (cursorY - (halfWindowHeight)) * -0.02;
                TweenMax.to(_this.find('.layer-b'), 1.175, {
                    x: moveX,
                    roundProps: "x,y",
                    rotationZ: "0.01deg"
                });
                TweenMax.to(_this.find('.layer-c'), 1.475, {
                    x: moveX2,
                    roundProps: "x,y",
                    rotationZ: "0.01deg"
                });
                TweenMax.to(_this.find('.layer-d'), 1.175, {
                    x: moveX3,
                    roundProps: "x,y",
                    rotationZ: "0.01deg"
                });
                TweenMax.to(_this.find('.layer-e'), 1.275, {
                    x: moveX4,
                    roundProps: "x,y",
                    rotationZ: "0.01deg"
                });
                if (!((verOffset = nAgt.indexOf("Firefox")) != -1 && navigator.appVersion.indexOf("Mac") != -1)) {
                    TweenMax.to(_this.find('.layer-b .video-wrap'), 1.175, {
                        x: moveX * -2.5,
                        roundProps: "x,y",
                        rotationZ: "0.01deg"
                    });
                    TweenMax.to(_this.find('.layer-c .video-wrap'), 1.475, {
                        x: moveX2 * -2.5,
                        roundProps: "x,y",
                        rotationZ: "0.01deg"
                    });
                    TweenMax.to(_this.find('.layer-d .video-wrap'), 1.175, {
                        x: moveX3 * -2.5,
                        roundProps: "x,y",
                        rotationZ: "0.01deg"
                    });
                    TweenMax.to(_this.find('.layer-e .video-wrap'), 1.275, {
                        x: moveX4 * -2.5,
                        roundProps: "x,y",
                        rotationZ: "0.01deg"
                    });
                }
                TweenMax.to(_this.find('.square'), 1.175, {
                    x: moveX5,
                    y: moveY5
                });
            }
        });
        jQuery('.img-link').hover(function () {
            if (jQuery(this).parent().hasClass('animated') && !isTouchDevice) {
                jQuery(this).parent().find('> .inner').addClass('on-hover');
            }
        }, function () {
            if (jQuery(this).parent().hasClass('animated') && !isTouchDevice) {
                jQuery(this).parent().find('> .inner').removeClass('on-hover');
            }
        });
        var delay = 0;
        if (!jQuery('.hero-carousel .slide.animated').length) {
            delay = 1000;
        }
        setTimeout(setLinkPosition, delay);
    }
}

function heroCarouselAnimate(n) {
    if (!jQuery('.hero-carousel .slide-outer0' + n).find('.slide').hasClass('animate')) {
        var _this = jQuery('.hero-carousel .slide-outer-0' + n).find('.slide');
        _this.addClass('animate');
        carouselAnimated = setTimeout(function () {
            setLinkPosition();
        }, 1000);
        carouselAnimated2 = setTimeout(function () {
            if (jQuery('.slide-0' + _this.attr('data-id')).hasClass('slide-mobile')) {
                jQuery('.slide-0' + _this.attr('data-id')).addClass('move-iphone');
            } else if (jQuery('.slide-0' + _this.attr('data-id')).hasClass('slide-laptop')) {
                jQuery('.slide-0' + _this.attr('data-id')).addClass('move-laptop');
            } else if (jQuery('.slide-0' + _this.attr('data-id')).hasClass('slide-tablet')) {
                jQuery('.slide-0' + _this.attr('data-id')).addClass('move-tablet');
            }
        }, 1250);
        carouselAnimated3 = setTimeout(function () {
            jQuery('.hero-entry.hero-entry-0' + _this.attr('data-id')).addClass('animate');
            _this.addClass('animated');
        }, 1450);
        carouselAnimated4 = setTimeout(function () {
            _this.addClass('animated2');
        }, 2400);
    }
    if (n == 1) {
        if (jQuery("[data-src]").length) {
            jQuery("[data-src]").each(function () {
                jQuery(this).attr('src', jQuery(this).attr("data-src"));
            });
        }
        jQuery('.next-slide').addClass('animate');
        jQuery('.pineapple_').attr('class', 'pineapple');
        jQuery('.hero-laptop_').removeClass('hero-laptop_').addClass('hero-laptop');
        jQuery('.hero-tablet_').removeClass('hero-tablet_').addClass('hero-tablet');
        jQuery('.power-statement-wrap').addClass('marble');
        if (firstLaunchFlag) {}
    }
}

function setLinkPosition() {
    jQuery('.hero-carousel .slide').each(function () {
        var offset = 0;
        if (jQuery(this).hasClass('move-iphone')) {
            offset = 150;
        } else if (jQuery(this).hasClass('move-laptop')) {
            offset = 40;
        } else if (jQuery(this).hasClass('move-tablet')) {
            offset = 80;
        }
        jQuery(this).find('.img-link').css({
            'width': parseInt(jQuery(this).find('.img-holder-in img').width()) + 'px',
            'height': parseInt(jQuery(this).find('.img-holder-in img').height()) + 'px',
            'left': (jQuery(this).find('.img-holder-in img').offset().left - jQuery(this).offset().left) / jQuery(this).parents('.slide-outer').attr('data-ratio') + 'px',
            'top': (jQuery(this).find('.img-holder-in img').offset().top + offset * jQuery(this).parents('.slide-outer').attr('data-ratio') - jQuery(this).offset().top) / jQuery(this).parents('.slide-outer').attr('data-ratio') + 'px'
        });
    });
}

function setCaptionPosition() {}

function setCarouselScale() {
    if (jQuery('.hero-carousel').length) {
        var windowH = jQuery(window).height();
        var windowW = jQuery(window).width();
        var carouselImgH = 1078;
        var f = 0;
        jQuery('.slide-outer').each(function () {
            var ratio = windowH / carouselImgH;
            if (ratio > 1) {
                ratio = 1;
            }
            var posL = 0;
            var innerW = 0;
            if (windowW < 1600 && windowW > 1380) {
                posL = (-1) * (windowW * 0.16) / 2;
                innerW = windowW * 1.16 + 'px';
            } else if (windowW < 1381 && windowW > 1280) {
                posL = (-1) * (windowW * 0.26) / 2;
                innerW = windowW * 1.26 + 'px';
            } else if (windowW < 1281 && windowW > 767) {
                posL = (-1) * (windowW * 0.36) / 2;
                innerW = windowW * 1.36 + 'px';
            } else if (windowW < 768 && windowW < windowH) {
                posL = 0;
                innerW = windowW / ratio + 'px';
            } else {
                innerW = '100%';
                posL = 0;
            }
            if (windowH > 750) {
                posL = posL * 0.5;
            }
            jQuery(this).attr('data-ratio', ratio);
            jQuery(this).find('.slide-wrap').css({
                'width': innerW,
                'margin-left': posL + 'px',
                'transform': 'matrix(' + ratio + ', 0, 0, ' + ratio + ', 0, 0)'
            });
            if (jQuery(window).width() < 1541) {
                jQuery('.hero-nav ').css({
                    'right': parseInt(jQuery('#header > .inner').css('padding-right')) + getScrollBarWidth() + 'px'
                });
            } else {
                var rightOffset = jQuery(window).width() - jQuery('.menu-icon').offset().left - jQuery('.menu-icon').innerWidth() + getScrollBarWidth();
                jQuery('.hero-entry').css('padding-right', jQuery(window).width() - jQuery('.menu-icon').offset().left - jQuery('.menu-icon').innerWidth() + 'px');
                jQuery('.hero-nav ').css({
                    'right': rightOffset + 'px'
                });
            }
            if (f === 0) {
                jQuery('.hero-entry ').css({
                    'font-size': parseInt(22) * ratio * 1.1 + 'px',
                    'line-height': parseInt(32) * ratio * 1.1 + 'px',
                    'padding-top': parseInt(78) * ratio * 0.7 + 'px',
                    'padding-right': parseInt(152) * ratio + 'px',
                    'padding-left': parseInt(87) * ratio * 0.8 + 'px',
                    'padding-bottom': parseInt(78) * ratio * 0.7 + 'px'
                });
            }
            if (jQuery(window).width() > 1540) {
                jQuery('.hero-entry').css('padding-right', jQuery(window).width() - jQuery('.menu-icon').offset().left - jQuery('.menu-icon').innerWidth() + 'px');
            }
            f++;
        });
        setHeroIpad();
    }
}

function setHeroIpad() {
    if (is_iPad) {
        var _h = jQuery(window).height();
        jQuery('.hero-carousel-m .hero-entry.hero-entry-01').css('top', _h + 'px');
        jQuery('.hero-carousel-m .hero-entry.hero-entry-02').css('top', _h * 2 + 'px');
        jQuery('.hero-carousel-m .hero-entry.hero-entry-03').css('top', _h * 3 + 'px');
        jQuery('.hero-carousel-m .hero-entry.hero-entry-04').css('top', _h * 4 + 'px');
    }
}

function getScrollBarWidth() {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";
    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;
    document.body.removeChild(outer);
    return (w1 - w2);
}

function fixContactBanner() {
    if (jQuery('body.page-template-contact-page').length) {
        if (jQuery(window).width() < 1024) {
            jQuery('.banner-outer svg g').removeAttr('style');
            jQuery('.banner-outer svg g image').attr('x', 0).attr('width', '1600').attr('xlink:href', jQuery('.banner-outer svg g image').attr('data-mobile'));
        } else {
            jQuery('.banner-outer svg g').attr('style', 'mask: url(#maskRight);');
            jQuery('.banner-outer svg g image').attr('x', 801).attr('width', '799').attr('xlink:href', jQuery('.banner-outer svg g image').attr('data-desktop'));
        }
    }
}

function breakStatementHeadings() {}

function fixWorkPage() {
    if (jQuery('.work-row').length) {
        if (jQuery(window).width() < 1023) {
            jQuery('.work-row .work-right-in').removeAttr('style');
        } else {
            setTimeout(function () {
                jQuery('.work-row .work-right-in').css('width', parseInt(jQuery('.work-row').height()) * 0.94 + 'px');
            }, 1000);
        }
    }
}

function fixIntro() {
    if (jQuery('.intro.left-style').length) {
        if (jQuery(window).width() > 767) {
            jQuery('.left-style .laptop-position .laptop-wrap').removeAttr('style');
        } else {
            setTimeout(function () {
                jQuery('.left-style .laptop-position .laptop-wrap').css('margin-left', (jQuery(window).width() - 772) / 2 + 'px');
            }, 1000);
        }
    }
}

function fixThanksHeight() {
    if (jQuery('.page-template-page-templatesthanks-page-php').length) {
        jQuery('.page-template-page-templatesthanks-page-php #page').removeAttr('style');
        if (jQuery('.page-template-page-templatesthanks-page-php #page').height() < jQuery(window).height()) {
            jQuery('.page-template-page-templatesthanks-page-php #page').css('height', parseInt(jQuery(window).height()) + 'px');
        } else {
            jQuery('.page-template-page-templatesthanks-page-php #page').removeAttr('style');
        }
    }
};
var sceneInfo1, sceneInfo2, sceneInfo3, sceneInfo4, controller2019 = new ScrollMagic.Controller();
var wHeight = jQuery(window).height();
jQuery(document).ready(function () {
    if (jQuery('.responsive-slider').length) {
        jQuery('.responsive-slider').on('init', function (event, slick, direction) {
            jQuery('.responsive-slider .wow').removeClass('wow');
        });
        jQuery('.responsive-slider').slick({
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            variableWidth: true,
            arrows: false
        });
        jQuery('.iphone-mask.to-clone').each(function () {
            jQuery('.responsive-slider').slick('slickAdd', "<div class='iphone-mask'>" + jQuery(this).html() + "</div>");
            jQuery(this).remove();
        });
    }
    if (jQuery('video.to-scale').length) {
        var tmpHero = new Image();
        tmpHero.src = jQuery('video.to-scale').attr('poster');
        tmpHero.onload = function () {
            jQuery('video.to-scale').addClass('scale');
        };
    }
    if (detectIE()) {
        jQuery('body').addClass('ie');
    }
    if (jQuery(".single-work").length) {
        wow = new WOW({
            boxClass: 'wow',
            animateClass: 'cs-animated',
            offset: 120,
            mobile: true,
            live: true,
            callback: function (box) {
                jQuery(box).addClass('ready');
            },
        })
        wow.init();
    }
    jQuery('body').on('click', '.video-wrap-2019 .play-icon', function () {
        jQuery(this).siblings('video')[0].play();
        jQuery(this).siblings('.poster').addClass('clicked');
        jQuery(this).addClass('clicked');
    });
    jQuery('.iphone-mask .play-icon').click(function () {
        jQuery(this).siblings('.video-wrap-2019').find('video')[0].play();
        jQuery(this).siblings('.video-wrap-2019').find('.poster').addClass('clicked');
        jQuery(this).addClass('clicked');
    });
    if (jQuery(".single-work").length) {
        if (jQuery('#screen-info-1').length && !jQuery('.the_website.mobile-version').length) {
            if (jQuery('#screen-info-pin-1').length) {
                sceneInfo1 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-1",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-1").addTo(controller2019);
            }
            if (jQuery('#screen-info-pin-2').length) {
                sceneInfo2 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-2",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-2").addTo(controller2019);
            }
            if (jQuery('#screen-info-pin-3').length) {
                sceneInfo3 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-3",
                    duration: 300,
                    triggerHook: 0.1
                }).setPin("#screen-info-3").addTo(controller2019);
            }
            if (jQuery('#screen-info-pin-4').length) {
                sceneInfo4 = new ScrollMagic.Scene({
                    triggerElement: "#screen-info-pin-4",
                    duration: 300
                }).setPin("#screen-info-4").addTo(controller2019);
            }
        }
    }
    jQuery(document).on({
        mouseenter: function () {
            jQuery(this).parent().next().addClass('hide');
            jQuery(this).parent().addClass('zoom hover');
            jQuery(this).parent().siblings('.captions').find('.caption-prev').addClass('show');
        },
        mouseleave: function () {
            jQuery(this).parent().next().removeClass('hide');
            jQuery(this).parent().removeClass('zoom hover');
            jQuery(this).parent().siblings('.captions').find('.caption-prev').removeClass('show');
        }
    }, '.services-nav .prev-service');
    jQuery(document).on({
        mouseenter: function () {
            jQuery(this).parent().prev().addClass('hide');
            jQuery(this).parent().addClass('zoom hover');
            jQuery(this).parent().siblings('.captions').find('.caption-next').addClass('show');
        },
        mouseleave: function () {
            jQuery(this).parent().prev().removeClass('hide');
            jQuery(this).parent().removeClass('zoom hover');
            jQuery(this).parent().siblings('.captions').find('.caption-next').removeClass('show');
        }
    }, '.services-nav .next-service');
});
jQuery(window).load(function () {
    imageMarginTop();
    updateInfoScenes();
    setTimeout(function () {
        updateInfoScenes();
    }, 5000);
    ParallaxBG(jQuery(".animation-section"));
});
jQuery(window).scroll(function () {
    ParallaxBG(jQuery(".animation-section"));
});
jQuery(window).resize(function () {
    imageMarginTop();
    updateInfoScenes();
});

function imageMarginTop() {
    if (jQuery("#screen-info-pin-1").next(".screen-info-wrap").next("img").length && jQuery("#screen-info-pin-2").next(".screen-info-wrap").next("img")) {
        var m = jQuery("#screen-info-pin-1").next(".screen-info-wrap").next("img").height() / 2;
        jQuery("#screen-info-pin-2").next(".screen-info-wrap").next("img").css({
            "margin-top": "-" + m + "px"
        });
    }
}

function updateInfoScenes() {
    if (jQuery(".single-work").length && !jQuery(".page-template-work-new-page").length) {
        if (!jQuery('.the_website.mobile-version').length) {
            if (jQuery('#screen-info-pin-1').length) {
                if (jQuery(".screenshot.odd").length) {
                    sceneInfo1.duration(jQuery(".screenshot.odd").offset().top - jQuery("#screen-info-pin-1").offset().top - parseInt(jQuery(".screenshot.odd img").css('marginTop')) * (-1) - jQuery('#screen-info-1').innerHeight() - 50);
                } else {
                    sceneInfo1.duration(jQuery('#screen-info-1').innerHeight() - 50);
                }
            }
            if (jQuery('#screen-info-pin-2').length) {
                sceneInfo2.duration(jQuery(".screenshot.odd").innerHeight() - jQuery('#screen-info-2').innerHeight());
            }
            if (jQuery('#screen-info-pin-3').length) {
                if (jQuery(".screenshot-3").length) {
                    sceneInfo3.duration(jQuery(".screenshot-3").offset().top - jQuery("#screen-info-pin-3").offset().top - parseInt(jQuery(".screenshot-3 img").css('marginTop')) * (-1) - jQuery('#screen-info-3').innerHeight() - 50);
                } else {
                    sceneInfo3.duration(jQuery(".screenshot-2").innerHeight() - jQuery('#screen-info-2').innerHeight());
                }
            }
            if (jQuery('#screen-info-pin-4').length) {
                sceneInfo4.duration(jQuery(".screenshot-3").innerHeight() - jQuery('#screen-info-4').innerHeight());
            }
        }
    }
}

function detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }
    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
    return false;
}

function ParallaxBG(el) {
    if (el.length) {
        el.each(function () {
            if ((window.pageYOffset + wHeight) > jQuery(this).offset().top && (window.pageYOffset + wHeight * 0.2) < jQuery(this).offset().top) {
                scale = 1.05 + (window.pageYOffset - jQuery(this).offset().top) * 0.0002;
                TweenMax.to(jQuery(this), 0.6, {
                    scale: scale,
                });
            }
        });
    }
};
(function (modules) {
    var installedModules = {};

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            });
        }
    };
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };
    __webpack_require__.t = function (value, mode) {
        if (mode & 1) value = __webpack_require__(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != 'string')
            for (var key in value) __webpack_require__.d(ns, key, function (key) {
                return value[key];
            }.bind(null, key));
        return ns;
    };
    __webpack_require__.n = function (module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module['default'];
        } : function getModuleExports() {
            return module;
        };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 0);
})
({
    "./js/scripts_es6.js":
        /*!***************************!*\
          !*** ./js/scripts_es6.js ***!
          \***************************/
        /*! no exports provided */
        (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
                /*! @babel/runtime/regenerator */
                "./node_modules/@babel/runtime/regenerator/index.js");
            var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
            var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
                /*! @babel/runtime/helpers/asyncToGenerator */
                "./node_modules/@babel/runtime/helpers/asyncToGenerator.js");
            var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__);
            var cf7signature_resized = 0;
            var wpcf7cf_timeout;
            var wpcf7cf_change_time_ms = 100;
            if (window.wpcf7cf_running_tests) {
                jQuery('input[name="_wpcf7cf_options"]').each(function (e) {
                    var $input = jQuery(this);
                    var opt = JSON.parse($input.val());
                    opt.settings.animation_intime = 0;
                    opt.settings.animation_outtime = 0;
                    $input.val(JSON.stringify(opt));
                });
                wpcf7cf_change_time_ms = 0;
            }
            var wpcf7cf_show_animation = {
                "height": "show",
                "marginTop": "show",
                "marginBottom": "show",
                "paddingTop": "show",
                "paddingBottom": "show"
            };
            var wpcf7cf_hide_animation = {
                "height": "hide",
                "marginTop": "hide",
                "marginBottom": "hide",
                "paddingTop": "hide",
                "paddingBottom": "hide"
            };
            var wpcf7cf_show_step_animation = {
                "opacity": "show"
            };
            var wpcf7cf_hide_step_animation = {
                "opacity": "hide"
            };
            var wpcf7cf_change_events = 'input.wpcf7cf paste.wpcf7cf change.wpcf7cf click.wpcf7cf propertychange.wpcf7cf';
            var wpcf7cf_forms = [];
            window.wpcf7cf_dom = {};
            var wpcf7cf_reload_dom = function wpcf7cf_reload_dom($form) {
                wpcf7cf_dom = wpcf7cf.get_simplified_dom_model($form);
            };
            var wpcf7cf_getFieldsByOriginalName = function wpcf7cf_getFieldsByOriginalName(originalName) {
                return Object.values(wpcf7cf_dom).filter(function (inputField) {
                    return inputField.original_name === originalName || inputField.original_name === originalName + '[]';
                });
            };
            var wpcf7cf_getFieldByName = function wpcf7cf_getFieldByName(name) {
                return wpcf7cf_dom[name] || wpcf7cf_dom[name + '[]'];
            };
            if (!String.prototype.endsWith) {
                String.prototype.endsWith = function (search, this_len) {
                    if (this_len === undefined || this_len > this.length) {
                        this_len = this.length;
                    }
                    return this.substring(this_len - search.length, this_len) === search;
                };
            }
            if (!Object.values) Object.values = function (o) {
                return Object.keys(o).map(function (k) {
                    return o[k];
                });
            };
            var Wpcf7cfForm = function Wpcf7cfForm($form) {
                var options_element = $form.find('input[name="_wpcf7cf_options"]').eq(0);
                if (!options_element.length || !options_element.val()) {
                    return false;
                }
                var form = this;
                var form_options = JSON.parse(options_element.val());
                form.$form = $form;
                form.$input_hidden_group_fields = $form.find('[name="_wpcf7cf_hidden_group_fields"]');
                form.$input_hidden_groups = $form.find('[name="_wpcf7cf_hidden_groups"]');
                form.$input_visible_groups = $form.find('[name="_wpcf7cf_visible_groups"]');
                form.$input_repeaters = $form.find('[name="_wpcf7cf_repeaters"]');
                form.$input_steps = $form.find('[name="_wpcf7cf_steps"]');
                form.unit_tag = $form.closest('.wpcf7').attr('id');
                form.conditions = form_options['conditions'];
                form.get = function (selector) {
                    return jQuery(selector, form.$form);
                };
                for (var i = 0; i < form.conditions.length; i++) {
                    var condition = form.conditions[i];
                    if (!('and_rules' in condition)) {
                        condition.and_rules = [{
                            'if_field': condition.if_field,
                            'if_value': condition.if_value,
                            'operator': condition.operator
                        }];
                    }
                }
                form.initial_conditions = form.conditions;
                form.settings = form_options['settings'];
                form.$groups = jQuery();
                form.repeaters = [];
                form.multistep = null;
                form.fields = [];
                form.settings.animation_intime = parseInt(form.settings.animation_intime);
                form.settings.animation_outtime = parseInt(form.settings.animation_outtime);
                if (form.settings.animation === 'no') {
                    form.settings.animation_intime = 0;
                    form.settings.animation_outtime = 0;
                }
                form.updateGroups();
                form.updateEventListeners();
                form.displayFields();
                form.$form.on('reset.wpcf7cf', form, function (e) {
                    var form = e.data;
                    setTimeout(function () {
                        form.displayFields();
                        form.resetRepeaters();
                        if (form.multistep != null) {
                            form.multistep.moveToStep(1);
                        }
                    }, 200);
                });
                form.get('.wpcf7cf_repeater:not(.wpcf7cf_repeater .wpcf7cf_repeater)').each(function () {
                    form.repeaters.push(new Wpcf7cfRepeater(jQuery(this), form));
                });
                form.$input_repeaters.val(JSON.stringify(form.repeaters.map(function (item) {
                    return item.params.$repeater.id;
                })));
                var $multistep = form.get('.wpcf7cf_multistep');
                if ($multistep.length) {
                    form.multistep = new Wpcf7cfMultistep($multistep, form);
                }
            };
            Wpcf7cfForm.prototype.resetRepeaters = function () {
                var form = this;
                form.repeaters.forEach(function (repeater) {
                    repeater.updateSubs(repeater.params.$repeater.initial_subs);
                });
            };
            Wpcf7cfForm.prototype.displayFields = function () {
                var form = this;
                var wpcf7cf_conditions = this.conditions;
                var wpcf7cf_settings = this.settings;
                if (cf7signature_resized === 0 && typeof signatures !== 'undefined' && signatures.constructor === Array && signatures.length > 0) {
                    for (var i = 0; i < signatures.length; i++) {
                        if (signatures[i].canvas.width === 0) {
                            var $sig_canvas = jQuery(".wpcf7-form-control-signature-body>canvas");
                            var $sig_wrap = jQuery(".wpcf7-form-control-signature-wrap");
                            $sig_canvas.eq(i).attr('width', $sig_wrap.width());
                            $sig_canvas.eq(i).attr('height', $sig_wrap.height());
                            cf7signature_resized = 1;
                        }
                    }
                }
                form.$groups.addClass('wpcf7cf-hidden');
                wpcf7cf_reload_dom(form.$form);
                for (var i = 0; i < wpcf7cf_conditions.length; i++) {
                    var condition = wpcf7cf_conditions[i];
                    var show_group = window.wpcf7cf.should_group_be_shown(condition, form);
                    if (show_group) {
                        form.get('[data-id="' + condition.then_field + '"]').removeClass('wpcf7cf-hidden');
                    }
                }
                var animation_intime = wpcf7cf_settings.animation_intime;
                var animation_outtime = wpcf7cf_settings.animation_outtime;
                form.$groups.each(function (index) {
                    var $group = jQuery(this);
                    if ($group.is(':animated')) $group.finish();
                    if ($group.css('display') === 'none' && !$group.hasClass('wpcf7cf-hidden')) {
                        if ($group.prop('tagName') === 'SPAN') {
                            $group.show().trigger('wpcf7cf_show_group');
                        } else {
                            $group.animate(wpcf7cf_show_animation, animation_intime).trigger('wpcf7cf_show_group');
                        }
                    } else if ($group.css('display') !== 'none' && $group.hasClass('wpcf7cf-hidden')) {
                        if ($group.attr('data-clear_on_hide') !== undefined) {
                            var $inputs = jQuery(':input', $group).not(':button, :submit, :reset, :hidden');
                            $inputs.each(function () {
                                var $this = jQuery(this);
                                $this.val(this.defaultValue);
                                $this.prop('checked', this.defaultChecked);
                            });
                            jQuery('option', $group).each(function () {
                                this.selected = this.defaultSelected;
                            });
                            jQuery('select', $group).each(function () {
                                var $select = jQuery(this);
                                if ($select.val() === null) {
                                    $select.val(jQuery("option:first", $select).val());
                                }
                            });
                            $inputs.change();
                        }
                        if ($group.prop('tagName') === 'SPAN') {
                            $group.hide().trigger('wpcf7cf_hide_group');
                        } else {
                            $group.animate(wpcf7cf_hide_animation, animation_outtime).trigger('wpcf7cf_hide_group');
                        }
                    }
                });
                form.updateHiddenFields();
                form.updateSummaryFields();
            };
            Wpcf7cfForm.prototype.updateSummaryFields = function () {
                var form = this;
                var $summary = form.get('.wpcf7cf-summary');
                if ($summary.length == 0 || !$summary.is(':visible')) return;
                var fd = new FormData();
                var formdata = form.$form.serializeArray();
                jQuery.each(formdata, function (key, input) {
                    fd.append(input.name, input.value);
                });
                jQuery.each(form.$form.find('input[type="file"]'), function (index, el) {
                    if (!el.files.length) return false;
                    var file = el.files[0];
                    var fieldName = el.name;
                    fd.append(fieldName, new Blob(), file.name);
                });
                jQuery.ajax({
                    url: wpcf7cf_global_settings.ajaxurl + '?action=wpcf7cf_get_summary',
                    type: 'POST',
                    data: fd,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    success: function success(json) {
                        $summary.html(json.summaryHtml);
                    }
                });
            };
            Wpcf7cfForm.prototype.updateHiddenFields = function () {
                var form = this;
                var hidden_fields = [];
                var hidden_groups = [];
                var visible_groups = [];
                form.$groups.each(function () {
                    var $this = jQuery(this);
                    if ($this.hasClass('wpcf7cf-hidden')) {
                        hidden_groups.push($this.data('id'));
                        $this.find('input,select,textarea').each(function () {
                            hidden_fields.push(jQuery(this).attr('name'));
                        });
                    } else {
                        visible_groups.push($this.data('id'));
                    }
                });
                form.hidden_fields = hidden_fields;
                form.hidden_groups = hidden_groups;
                form.visible_groups = visible_groups;
                form.$input_hidden_group_fields.val(JSON.stringify(hidden_fields));
                form.$input_hidden_groups.val(JSON.stringify(hidden_groups));
                form.$input_visible_groups.val(JSON.stringify(visible_groups));
                return true;
            };
            Wpcf7cfForm.prototype.updateGroups = function () {
                var form = this;
                form.$groups = form.$form.find('[data-class="wpcf7cf_group"]');
                form.conditions = window.wpcf7cf.get_nested_conditions(form.initial_conditions, form.$form);
            };
            Wpcf7cfForm.prototype.updateEventListeners = function () {
                var form = this;
                form.get('input, select, textarea, button').not('.wpcf7cf_add, .wpcf7cf_remove').off(wpcf7cf_change_events).on(wpcf7cf_change_events, form, function (e) {
                    var form = e.data;
                    clearTimeout(wpcf7cf_timeout);
                    wpcf7cf_timeout = setTimeout(function () {
                        form.displayFields();
                    }, wpcf7cf_change_time_ms);
                });
                form.get('.wpcf7cf-togglebutton').off('click.toggle_wpcf7cf').on('click.toggle_wpcf7cf', function () {
                    var $this = jQuery(this);
                    if ($this.text() === $this.data('val-1')) {
                        $this.text($this.data('val-2'));
                        $this.val($this.data('val-2'));
                    } else {
                        $this.text($this.data('val-1'));
                        $this.val($this.data('val-1'));
                    }
                });
            };

            function Wpcf7cfRepeater($repeater, form) {
                var $ = jQuery;
                var repeater = this;
                var wpcf7cf_settings = form.settings;
                repeater.form = form;
                $repeater.num_subs = 0;
                $repeater.id = $repeater.data('id');
                $repeater.orig_id = $repeater.data('orig_data_id');
                $repeater.min = typeof $repeater.data('min') !== 'undefined' ? parseInt($repeater.data('min')) : 1;
                $repeater.max = typeof $repeater.data('max') !== 'undefined' ? parseInt($repeater.data('max')) : 200;
                $repeater.initial_subs = typeof $repeater.data('initial') !== 'undefined' ? parseInt($repeater.data('initial')) : $repeater.min;
                if ($repeater.initial_subs > $repeater.max) $repeater.initial_subs = $repeater.max;
                var $repeater_sub = $repeater.children('.wpcf7cf_repeater_sub').eq(0);
                var $repeater_controls = $repeater.children('.wpcf7cf_repeater_controls').eq(0);
                var $repeater_sub_clone = $repeater_sub.clone();
                $repeater_sub_clone.find('.wpcf7cf_repeater_sub').addBack('.wpcf7cf_repeater_sub').each(function () {
                    var $this = jQuery(this);
                    var prev_suffix = $this.attr('data-repeater_sub_suffix');
                    var new_suffix = prev_suffix + '__{{repeater_sub_suffix}}';
                    $this.attr('data-repeater_sub_suffix', new_suffix);
                });
                $repeater_sub_clone.find('[name]').each(function () {
                    var $this = jQuery(this);
                    var prev_name = $this.attr('name');
                    var new_name = repeater.getNewName(prev_name);
                    var orig_name = $this.attr('data-orig_name') != null ? $this.attr('data-orig_name') : prev_name;
                    $this.attr('name', new_name);
                    $this.attr('data-orig_name', orig_name);
                    $this.closest('.wpcf7-form-control-wrap').addClass(new_name.replace('[]', ''));
                });
                $repeater_sub_clone.find('.wpcf7cf_repeater,[data-class="wpcf7cf_group"]').each(function () {
                    var $this = jQuery(this);
                    var prev_data_id = $this.attr('data-id');
                    var orig_data_id = $this.attr('data-orig_data_id') != null ? $this.attr('data-orig_data_id') : prev_data_id;
                    var new_data_id = repeater.getNewName(prev_data_id);
                    if (prev_data_id.endsWith('_count')) {
                        new_data_id = prev_data_id.replace('_count', '__{{repeater_sub_suffix}}_count');
                    }
                    $this.attr('data-id', new_data_id);
                    $this.attr('data-orig_data_id', orig_data_id);
                });
                $repeater_sub_clone.find('[id]').each(function () {
                    var $this = jQuery(this);
                    var prev_id = $this.attr('id');
                    var orig_id = $this.attr('data-orig_id') != null ? $this.attr('data-orig_id') : prev_id;
                    var new_id = repeater.getNewName(prev_id);
                    $this.attr('id', new_id);
                    $this.attr('data-orig_id', orig_id);
                });
                $repeater_sub_clone.find('[for]').each(function () {
                    var $this = jQuery(this);
                    var prev_for = $this.attr('for');
                    var orig_for = $this.attr('data-orig_for') != null ? $this.attr('data-orig_for') : prev_for;
                    var new_for = repeater.getNewName(prev_for);
                    $this.attr('for', new_for);
                    $this.attr('data-orig_for', orig_for);
                });
                var repeater_sub_html = $repeater_sub_clone[0].outerHTML;
                var $repeater_count_field = $repeater.find('[name=' + $repeater.id + '_count]').eq(0);
                var $button_add = $repeater_controls.find('.wpcf7cf_add').eq(0);
                var $button_remove = $repeater_controls.find('.wpcf7cf_remove').eq(0);
                var params = {
                    $repeater: $repeater,
                    $repeater_count_field: $repeater_count_field,
                    repeater_sub_html: repeater_sub_html,
                    $repeater_controls: $repeater_controls,
                    $button_add: $button_add,
                    $button_remove: $button_remove,
                    wpcf7cf_settings: wpcf7cf_settings
                };
                this.params = params;
                $button_add.on('click', null, repeater, function (e) {
                    var repeater = e.data;
                    repeater.updateSubs(params.$repeater.num_subs + 1);
                });
                $button_remove.on('click', null, repeater, function (e) {
                    var repeater = e.data;
                    repeater.updateSubs(params.$repeater.num_subs - 1);
                });
                jQuery('> .wpcf7cf_repeater_sub', params.$repeater).eq(0).remove();
                repeater.updateSubs($repeater.initial_subs);
            }
            Wpcf7cfRepeater.prototype.getNewName = function (previousName) {
                var prev_parts = previousName.split('[');
                previousName = prev_parts[0];
                var prev_suff = prev_parts.length > 1 ? '[' + prev_parts.splice(1).join('[') : '';
                var newName = previousName + '__{{repeater_sub_suffix}}' + prev_suff;
                if (previousName.endsWith('_count')) {
                    newName = previousName.replace('_count', '__{{repeater_sub_suffix}}_count');
                }
                return newName;
            };
            Wpcf7cfRepeater.prototype.updateSubs = function (subs_to_show) {
                var repeater = this;
                var params = repeater.params;
                var subs_to_add = subs_to_show - params.$repeater.num_subs;
                if (subs_to_add < 0) {
                    repeater.removeSubs(-subs_to_add);
                } else if (subs_to_add > 0) {
                    repeater.addSubs(subs_to_add);
                }
                var showButtonRemove = false;
                var showButtonAdd = false;
                if (params.$repeater.num_subs < params.$repeater.max) {
                    showButtonAdd = true;
                }
                if (params.$repeater.num_subs > params.$repeater.min) {
                    showButtonRemove = true;
                }
                if (showButtonAdd) {
                    params.$button_add.show();
                } else {
                    params.$button_add.hide();
                }
                if (showButtonRemove) {
                    params.$button_remove.show();
                } else {
                    params.$button_remove.hide();
                }
                params.$repeater_count_field.val(subs_to_show);
            };
            Wpcf7cfRepeater.prototype.addSubs = function (subs_to_add) {
                var $ = jQuery;
                var params = this.params;
                var repeater = this;
                var form = repeater.form;
                var $repeater = params.$repeater;
                var $repeater_controls = params.$repeater_controls;
                var html_str = '';
                for (var i = 1; i <= subs_to_add; i++) {
                    var sub_suffix = $repeater.num_subs + i;
                    html_str += params.repeater_sub_html.replace(/\{\{repeater_sub_suffix\}\}/g, sub_suffix).replace(new RegExp('\{\{' + $repeater.orig_id + '_index\}\}', 'g'), sub_suffix);
                }
                var $html = jQuery(html_str);
                $html.hide().insertBefore($repeater_controls).animate(wpcf7cf_show_animation, params.wpcf7cf_settings.animation_intime).trigger('wpcf7cf_repeater_added');
                jQuery('.wpcf7cf_repeater', $html).each(function () {
                    form.repeaters.push(new Wpcf7cfRepeater(jQuery(this), form));
                });
                form.$input_repeaters.val(JSON.stringify(form.repeaters.map(function (item) {
                    return item.params.$repeater.id;
                })));
                $repeater.num_subs += subs_to_add;
                window.wpcf7cf.updateMultistepState(form.multistep);
                form.updateGroups();
                form.updateEventListeners();
                form.displayFields();
                $html.on('click', '.wpcf7-exclusive-checkbox input:checkbox', function () {
                    var name = $(this).attr('name');
                    $html.find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false);
                });
                if (typeof window.cf7mdInit === "function") {
                    window.cf7mdInit();
                }
                return false;
            };
            Wpcf7cfRepeater.prototype.removeSubs = function (num_subs) {
                var $ = jQuery;
                var params = this.params;
                var form = this.form;
                params.$repeater.num_subs -= num_subs;
                jQuery('> .wpcf7cf_repeater_sub', params.$repeater).slice(-num_subs).animate(wpcf7cf_hide_animation, {
                    duration: params.wpcf7cf_settings.animation_intime,
                    done: function done() {
                        var $this = jQuery(this);
                        $this.remove();
                        params.$repeater.trigger('wpcf7cf_repeater_removed');
                        window.wpcf7cf.updateMultistepState(form.multistep);
                        form.updateGroups();
                        form.updateEventListeners();
                        form.displayFields();
                    }
                });
                return false;
            };

            function Wpcf7cfMultistep($multistep, form) {
                var multistep = this;
                multistep.$multistep = $multistep;
                multistep.form = form;
                multistep.$steps = $multistep.find('.wpcf7cf_step');
                multistep.$btn_next = $multistep.find('.wpcf7cf_next');
                multistep.$btn_prev = $multistep.find('.wpcf7cf_prev');
                multistep.$dots = $multistep.find('.wpcf7cf_steps-dots');
                multistep.currentStep = 0;
                multistep.numSteps = multistep.$steps.length;
                multistep.$dots.html('');
                for (var i = 1; i <= multistep.numSteps; i++) {
                    multistep.$dots.append("\n            <div class=\"dot\" data-step=\"".concat(i, "\">\n                <div class=\"step-index\">").concat(i, "</div>\n                <div class=\"step-title\">").concat(multistep.$steps.eq(i - 1).data('title'), "</div>\n            </div>\n        "));
                }
                multistep.$btn_next.on('click.wpcf7cf_step', _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee() {
                    var result;
                    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    _context.next = 2;
                                    return multistep.validateStep(multistep.currentStep);
                                case 2:
                                    result = _context.sent;
                                    if (result === 'success') {
                                        multistep.moveToStep(multistep.currentStep + 1);
                                    }
                                    case 4:
                                    case "end":
                                        return _context.stop();
                            }
                        }
                    }, _callee);
                })));
                multistep.form.$form.on('submit.wpcf7cf_step', function (e) {
                    if (multistep.currentStep !== multistep.numSteps) {
                        multistep.$btn_next.trigger('click.wpcf7cf_step');
                        e.stopImmediatePropagation();
                        return false;
                    }
                });
                multistep.$btn_prev.on('click', function () {
                    multistep.moveToStep(multistep.currentStep - 1);
                });
                multistep.moveToStep(1);
            }
            jQuery(document).ajaxComplete(function (e, xhr, settings) {
                if (xhr.hasOwnProperty('responseJSON') && xhr.responseJSON != null && xhr.responseJSON.hasOwnProperty('status') && xhr.responseJSON.hasOwnProperty('into') && xhr.responseJSON.status === "mail_success") {
                    jQuery(xhr.responseJSON.into).trigger('reset.wpcf7cf');
                }
            });
            Wpcf7cfMultistep.prototype.validateStep = function (step_index) {
                var multistep = this;
                var $multistep = multistep.$multistep;
                var $form = multistep.form.$form;
                var form = multistep.form;
                $form.find('.wpcf7-response-output').addClass('wpcf7-display-none');
                return new Promise(function (resolve) {
                    var fd = new FormData();
                    jQuery.each($form.find('[data-id="step-' + step_index + '"] input[type="file"]'), function (index, el) {
                        if (!el.files.length) return false;
                        var file = el.files[0];
                        var fieldName = el.name;
                        fd.append(fieldName, file);
                    });
                    var formdata = $form.serializeArray();
                    jQuery.each(formdata, function (key, input) {
                        fd.append(input.name, input.value);
                    });
                    jQuery.ajax({
                        url: wpcf7cf_global_settings.ajaxurl + '?action=wpcf7cf_validate_step',
                        type: 'POST',
                        data: fd,
                        processData: false,
                        contentType: false,
                        dataType: 'json'
                    }).done(function (json) {
                        $multistep.find('.wpcf7-form-control-wrap .wpcf7-not-valid-tip').remove();
                        $multistep.find('.wpcf7-not-valid').removeClass('wpcf7-not-valid');
                        $multistep.find('.wpcf7-response-output').remove();
                        $multistep.find('.wpcf7-response-output.wpcf7-validation-errors').removeClass('wpcf7-validation-errors');
                        if (!json.success) {
                            var checkError = 0;
                            jQuery.each(json.invalid_fields, function (index, el) {
                                if ($multistep.find('input[name="' + index + '"]').length || $multistep.find('input[name="' + index + '[]"]').length || $multistep.find('select[name="' + index + '"]').length || $multistep.find('select[name="' + index + '[]"]').length || $multistep.find('textarea[name="' + index + '"]').length || $multistep.find('textarea[name="' + index + '[]"]').length) {
                                    checkError = checkError + 1;
                                    var controlWrap = form.get('.wpcf7-form-control-wrap.' + index);
                                    controlWrap.find('.wpcf7-form-control').addClass('wpcf7-not-valid');
                                    controlWrap.find('span.wpcf7-not-valid-tip').remove();
                                    controlWrap.append('<span role="alert" class="wpcf7-not-valid-tip">' + el.reason + '</span>');
                                }
                            });
                            resolve('failed');
                            $multistep.parent().find('.wpcf7-response-output').removeClass('wpcf7-display-none').html(json.message);
                            wpcf7.setStatus($form, 'invalid');
                        } else if (json.success) {
                            wpcf7.setStatus($form, 'init');
                            resolve('success');
                            return false;
                        }
                    }).fail(function () {
                        resolve('error');
                    }).always(function () {});
                });
            };
            Wpcf7cfMultistep.prototype.moveToStep = function (step_index) {
                var multistep = this;
                var previousStep = multistep.currentStep;
                multistep.currentStep = step_index > multistep.numSteps ? multistep.numSteps : step_index < 1 ? 1 : step_index;
                multistep.$multistep.attr('data-current_step', multistep.currentStep);
                multistep.$steps.hide();
                multistep.$steps.eq(multistep.currentStep - 1).show().trigger('wpcf7cf_change_step', [previousStep, multistep.currentStep]);
                var formEl = multistep.form.$form[0];
                var topOffset = formEl.getBoundingClientRect().top;
                if (topOffset < 0 && previousStep > 0) {
                    formEl.scrollIntoView({
                        behavior: "smooth"
                    });
                }
                multistep.form.updateSummaryFields();
                window.wpcf7cf.updateMultistepState(multistep);
            };
            Wpcf7cfMultistep.prototype.getFieldsInStep = function (step_index) {
                wpcf7cf_reload_dom(this.form.$form);
                var inStep = false;
                return Object.values(wpcf7cf_dom).filter(function (item, i) {
                    if (item.type == 'step') {
                        inStep = item.val == step_index + '';
                    }
                    return inStep && item.type == 'input';
                }).map(function (item) {
                    return item.name;
                });
            };
            window.wpcf7cf = {
                initForm: function initForm($forms) {
                    $forms.each(function () {
                        var $form = jQuery(this);
                        if ($form.hasClass('wpcf7-form') && !wpcf7cf_forms.some(function (form) {
                                return form.$form.get(0) === $form.get(0);
                            })) {
                            wpcf7cf_forms.push(new Wpcf7cfForm($form));
                        }
                    });
                },
                get_nested_conditions: function get_nested_conditions(conditions, $current_form) {
                    wpcf7cf_reload_dom($current_form);
                    var groups = Object.values(wpcf7cf_dom).filter(function (item, i) {
                        return item.type === 'group';
                    });
                    var sub_conditions = [];
                    for (var i = 0; i < groups.length; i++) {
                        var g = groups[i];
                        var relevant_conditions = conditions.filter(function (condition, i) {
                            return condition.then_field === g.original_name;
                        });
                        var relevant_conditions = relevant_conditions.map(function (item, i) {
                            return {
                                then_field: g.name,
                                and_rules: item.and_rules.map(function (and_rule, i) {
                                    return {
                                        if_field: and_rule.if_field + g.suffix,
                                        if_value: and_rule.if_value,
                                        operator: and_rule.operator
                                    };
                                })
                            };
                        });
                        sub_conditions = sub_conditions.concat(relevant_conditions);
                    }
                    return sub_conditions;
                },
                get_simplified_dom_model: function get_simplified_dom_model($current_form) {
                    var currentNode;
                    var ni = document.createNodeIterator($current_form[0], NodeFilter.SHOW_ELEMENT, null, false);
                    var simplified_dom = {};
                    while (currentNode = ni.nextNode()) {
                        var type = currentNode.classList.contains('wpcf7cf_repeater') ? 'repeater' : currentNode.dataset["class"] == 'wpcf7cf_group' ? 'group' : currentNode.className == 'wpcf7cf_step' ? 'step' : currentNode.hasAttribute('name') ? 'input' : false;
                        if (!type) {
                            continue;
                        }
                        var name = type === 'input' ? currentNode.getAttribute('name') : currentNode.dataset.id;
                        if (name.substring(0, 6) === '_wpcf7') continue;
                        var original_name = type === 'repeater' || type === 'group' ? currentNode.dataset.orig_data_id : type === 'input' ? currentNode.getAttribute('data-orig_name') || name : name;
                        var val = type === 'step' ? [currentNode.dataset.id.substring(5)] : [];
                        var original_name_length = original_name == null ? name.length : original_name.length;
                        var suffix = name.substring(original_name_length);
                        if (!simplified_dom[name]) {
                            simplified_dom[name] = {
                                name: name,
                                type: type,
                                original_name: original_name,
                                suffix: suffix,
                                val: val
                            };
                        }
                        if (type === 'input') {
                            if ((currentNode.type === 'checkbox' || currentNode.type === 'radio') && !currentNode.checked) continue;
                            if (currentNode.multiple && currentNode.options) {
                                simplified_dom[name].val = Object.values(currentNode.options).filter(function (o) {
                                    return o.selected;
                                }).map(function (o) {
                                    return o.value;
                                });
                            } else {
                                simplified_dom[name].val.push(currentNode.value);
                            }
                        }
                    }
                    return simplified_dom;
                },
                updateMultistepState: function updateMultistepState(multistep) {
                    if (multistep == null) return;
                    var stepsData = {
                        currentStep: multistep.currentStep,
                        numSteps: multistep.numSteps,
                        fieldsInCurrentStep: multistep.getFieldsInStep(multistep.currentStep)
                    };
                    multistep.form.$input_steps.val(JSON.stringify(stepsData));
                    multistep.$btn_prev.removeClass('disabled').attr('disabled', false);
                    multistep.$btn_next.removeClass('disabled').attr('disabled', false);
                    if (multistep.currentStep == multistep.numSteps) {
                        multistep.$btn_next.addClass('disabled').attr('disabled', true);
                    }
                    if (multistep.currentStep == 1) {
                        multistep.$btn_prev.addClass('disabled').attr('disabled', true);
                    }
                    var $submit_button = multistep.form.$form.find('input[type="submit"]').eq(0);
                    var $ajax_loader = multistep.form.$form.find('.ajax-loader').eq(0);
                    if (multistep.currentStep == multistep.numSteps) {
                        multistep.$btn_next.hide();
                        $ajax_loader.detach().appendTo(multistep.$btn_next.parent());
                        $submit_button.detach().appendTo(multistep.$btn_next.parent());
                        $submit_button.show();
                    } else {
                        $submit_button.hide();
                        multistep.$btn_next.show();
                    }
                    var $dots = multistep.$dots.find('.dot');
                    $dots.removeClass('active').removeClass('completed');
                    for (var step = 1; step <= multistep.numSteps; step++) {
                        if (step < multistep.currentStep) {
                            $dots.eq(step - 1).addClass('completed');
                        } else if (step == multistep.currentStep) {
                            $dots.eq(step - 1).addClass('active');
                        }
                    }
                },
                should_group_be_shown: function should_group_be_shown(condition) {
                    var show_group = true;
                    for (var and_rule_i = 0; and_rule_i < condition.and_rules.length; and_rule_i++) {
                        var condition_ok = false;
                        var condition_and_rule = condition.and_rules[and_rule_i];
                        var inputField = wpcf7cf_getFieldByName(condition_and_rule.if_field);
                        if (!inputField) continue;
                        var if_val = condition_and_rule.if_value;
                        var operator = condition_and_rule.operator;
                        operator = operator === '≤' ? 'less than or equals' : operator;
                        operator = operator === '≥' ? 'greater than or equals' : operator;
                        operator = operator === '>' ? 'greater than' : operator;
                        operator = operator === '<' ? 'less than' : operator;
                        var $field = operator === 'function' && jQuery("[name=\"".concat(inputField.name, "\"]")).eq(0);
                        condition_ok = this.isConditionTrue(inputField.val, operator, if_val, $field);
                        show_group = show_group && condition_ok;
                    }
                    return show_group;
                },
                isConditionTrue: function isConditionTrue(values, operator) {
                    var testValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
                    var $field = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : jQuery();
                    if (!Array.isArray(values)) {
                        values = [values];
                    }
                    var condition_ok = false;
                    var valuesAreEmpty = values.length === 0 || values.every(function (v) {
                        return !v && v !== 0;
                    });
                    if (operator === 'equals' && testValue === '' && valuesAreEmpty) {
                        return true;
                    }
                    if (operator === 'not equals' && testValue === '' && valuesAreEmpty) {
                        return false;
                    }
                    if (valuesAreEmpty) {
                        if (operator === 'is empty') {
                            condition_ok = true;
                        }
                    } else {
                        if (operator === 'not empty') {
                            condition_ok = true;
                        }
                    }
                    var testValueNumber = isFinite(parseFloat(testValue)) ? parseFloat(testValue) : NaN;
                    if (operator === 'not equals' || operator === 'not equals (regex)') {
                        condition_ok = true;
                    }
                    if (operator === 'function' && typeof window[testValue] == 'function' && window[testValue]($field)) {
                        condition_ok = true;
                    }
                    var regex_patt = /.*/i;
                    var isValidRegex = true;
                    if (operator === 'equals (regex)' || operator === 'not equals (regex)') {
                        try {
                            regex_patt = new RegExp(testValue, 'i');
                        } catch (e) {
                            isValidRegex = false;
                        }
                    }
                    for (var i = 0; i < values.length; i++) {
                        var value = values[i];
                        var valueNumber = isFinite(parseFloat(value)) ? parseFloat(value) : NaN;
                        var valsAreNumbers = !isNaN(valueNumber) && !isNaN(testValueNumber);
                        if (operator === 'equals' && value === testValue || operator === 'equals (regex)' && regex_patt.test(value) || operator === 'greater than' && valsAreNumbers && valueNumber > testValueNumber || operator === 'less than' && valsAreNumbers && valueNumber < testValueNumber || operator === 'greater than or equals' && valsAreNumbers && valueNumber >= testValueNumber || operator === 'less than or equals' && valsAreNumbers && valueNumber <= testValueNumber) {
                            condition_ok = true;
                            break;
                        } else if (operator === 'not equals' && value === testValue || operator === 'not equals (regex)' && regex_patt.test(value)) {
                            condition_ok = false;
                            break;
                        }
                    }
                    return condition_ok;
                }
            };
            jQuery('.wpcf7-form').each(function () {
                wpcf7cf_forms.push(new Wpcf7cfForm(jQuery(this)));
            });
            jQuery('document').ready(function () {
                wpcf7cf_forms.forEach(function (f) {
                    f.displayFields();
                });
            });
            var old_wpcf7ExclusiveCheckbox = jQuery.fn.wpcf7ExclusiveCheckbox;
            jQuery.fn.wpcf7ExclusiveCheckbox = function () {
                return this.find('input:checkbox').on('click', function () {
                    var name = jQuery(this).attr('name');
                    jQuery(this).closest('form').find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false).eq(0).change();
                });
            };
        }),
    "./node_modules/@babel/runtime/helpers/asyncToGenerator.js":
        /*!*****************************************************************!*\
          !*** ./node_modules/@babel/runtime/helpers/asyncToGenerator.js ***!
          \*****************************************************************/
        /*! no static exports found */
        (function (module, exports) {
            function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
                try {
                    var info = gen[key](arg);
                    var value = info.value;
                } catch (error) {
                    reject(error);
                    return;
                }
                if (info.done) {
                    resolve(value);
                } else {
                    Promise.resolve(value).then(_next, _throw);
                }
            }

            function _asyncToGenerator(fn) {
                return function () {
                    var self = this,
                        args = arguments;
                    return new Promise(function (resolve, reject) {
                        var gen = fn.apply(self, args);

                        function _next(value) {
                            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
                        }

                        function _throw(err) {
                            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
                        }
                        _next(undefined);
                    });
                };
            }
            module.exports = _asyncToGenerator;
        }),
    "./node_modules/@babel/runtime/regenerator/index.js":
        /*!**********************************************************!*\
          !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
          \**********************************************************/
        /*! no static exports found */
        (function (module, exports, __webpack_require__) {
            module.exports = __webpack_require__(
                /*! regenerator-runtime */
                "./node_modules/regenerator-runtime/runtime.js");
        }),
    "./node_modules/es6-promise-promise/index.js":
        /*!***************************************************!*\
          !*** ./node_modules/es6-promise-promise/index.js ***!
          \***************************************************/
        /*! no static exports found */
        (function (module, exports, __webpack_require__) {
            module.exports = __webpack_require__(
                /*! es6-promise */
                "./node_modules/es6-promise/dist/es6-promise.js").Promise;
        }),
    "./node_modules/es6-promise/dist/es6-promise.js":
        /*!******************************************************!*\
          !*** ./node_modules/es6-promise/dist/es6-promise.js ***!
          \******************************************************/
        /*! no static exports found */
        (function (module, exports, __webpack_require__) {
            (function (process, global) {
                var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;
                var require;

                function _typeof(obj) {
                    "@babel/helpers - typeof";
                    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                        _typeof = function _typeof(obj) {
                            return typeof obj;
                        };
                    } else {
                        _typeof = function _typeof(obj) {
                            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
                        };
                    }
                    return _typeof(obj);
                }
                /*!
                 * @overview es6-promise - a tiny implementation of Promises/A+.
                 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
                 * @license   Licensed under MIT license
                 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
                 * @version   3.3.1
                 */
                (function (global, factory) {
                    (false ? undefined : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : undefined;
                })(this, function () {
                    'use strict';

                    function objectOrFunction(x) {
                        return typeof x === 'function' || _typeof(x) === 'object' && x !== null;
                    }

                    function isFunction(x) {
                        return typeof x === 'function';
                    }
                    var _isArray = undefined;
                    if (!Array.isArray) {
                        _isArray = function _isArray(x) {
                            return Object.prototype.toString.call(x) === '[object Array]';
                        };
                    } else {
                        _isArray = Array.isArray;
                    }
                    var isArray = _isArray;
                    var len = 0;
                    var vertxNext = undefined;
                    var customSchedulerFn = undefined;
                    var asap = function asap(callback, arg) {
                        queue[len] = callback;
                        queue[len + 1] = arg;
                        len += 2;
                        if (len === 2) {
                            if (customSchedulerFn) {
                                customSchedulerFn(flush);
                            } else {
                                scheduleFlush();
                            }
                        }
                    };

                    function setScheduler(scheduleFn) {
                        customSchedulerFn = scheduleFn;
                    }

                    function setAsap(asapFn) {
                        asap = asapFn;
                    }
                    var browserWindow = typeof window !== 'undefined' ? window : undefined;
                    var browserGlobal = browserWindow || {};
                    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
                    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
                    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

                    function useNextTick() {
                        return function () {
                            return process.nextTick(flush);
                        };
                    }

                    function useVertxTimer() {
                        return function () {
                            vertxNext(flush);
                        };
                    }

                    function useMutationObserver() {
                        var iterations = 0;
                        var observer = new BrowserMutationObserver(flush);
                        var node = document.createTextNode('');
                        observer.observe(node, {
                            characterData: true
                        });
                        return function () {
                            node.data = iterations = ++iterations % 2;
                        };
                    }

                    function useMessageChannel() {
                        var channel = new MessageChannel();
                        channel.port1.onmessage = flush;
                        return function () {
                            return channel.port2.postMessage(0);
                        };
                    }

                    function useSetTimeout() {
                        var globalSetTimeout = setTimeout;
                        return function () {
                            return globalSetTimeout(flush, 1);
                        };
                    }
                    var queue = new Array(1000);

                    function flush() {
                        for (var i = 0; i < len; i += 2) {
                            var callback = queue[i];
                            var arg = queue[i + 1];
                            callback(arg);
                            queue[i] = undefined;
                            queue[i + 1] = undefined;
                        }
                        len = 0;
                    }

                    function attemptVertx() {
                        try {
                            var r = require;
                            var vertx = __webpack_require__(
                                /*! vertx */
                                1);
                            vertxNext = vertx.runOnLoop || vertx.runOnContext;
                            return useVertxTimer();
                        } catch (e) {
                            return useSetTimeout();
                        }
                    }
                    var scheduleFlush = undefined;
                    if (isNode) {
                        scheduleFlush = useNextTick();
                    } else if (BrowserMutationObserver) {
                        scheduleFlush = useMutationObserver();
                    } else if (isWorker) {
                        scheduleFlush = useMessageChannel();
                    } else if (browserWindow === undefined && "function" === 'function') {
                        scheduleFlush = attemptVertx();
                    } else {
                        scheduleFlush = useSetTimeout();
                    }

                    function then(onFulfillment, onRejection) {
                        var _arguments = arguments;
                        var parent = this;
                        var child = new this.constructor(noop);
                        if (child[PROMISE_ID] === undefined) {
                            makePromise(child);
                        }
                        var _state = parent._state;
                        if (_state) {
                            (function () {
                                var callback = _arguments[_state - 1];
                                asap(function () {
                                    return invokeCallback(_state, child, callback, parent._result);
                                });
                            })();
                        } else {
                            subscribe(parent, child, onFulfillment, onRejection);
                        }
                        return child;
                    }

                    function resolve(object) {
                        var Constructor = this;
                        if (object && _typeof(object) === 'object' && object.constructor === Constructor) {
                            return object;
                        }
                        var promise = new Constructor(noop);
                        _resolve(promise, object);
                        return promise;
                    }
                    var PROMISE_ID = Math.random().toString(36).substring(16);

                    function noop() {}
                    var PENDING = void 0;
                    var FULFILLED = 1;
                    var REJECTED = 2;
                    var GET_THEN_ERROR = new ErrorObject();

                    function selfFulfillment() {
                        return new TypeError("You cannot resolve a promise with itself");
                    }

                    function cannotReturnOwn() {
                        return new TypeError('A promises callback cannot return that same promise.');
                    }

                    function getThen(promise) {
                        try {
                            return promise.then;
                        } catch (error) {
                            GET_THEN_ERROR.error = error;
                            return GET_THEN_ERROR;
                        }
                    }

                    function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
                        try {
                            then.call(value, fulfillmentHandler, rejectionHandler);
                        } catch (e) {
                            return e;
                        }
                    }

                    function handleForeignThenable(promise, thenable, then) {
                        asap(function (promise) {
                            var sealed = false;
                            var error = tryThen(then, thenable, function (value) {
                                if (sealed) {
                                    return;
                                }
                                sealed = true;
                                if (thenable !== value) {
                                    _resolve(promise, value);
                                } else {
                                    fulfill(promise, value);
                                }
                            }, function (reason) {
                                if (sealed) {
                                    return;
                                }
                                sealed = true;
                                _reject(promise, reason);
                            }, 'Settle: ' + (promise._label || ' unknown promise'));
                            if (!sealed && error) {
                                sealed = true;
                                _reject(promise, error);
                            }
                        }, promise);
                    }

                    function handleOwnThenable(promise, thenable) {
                        if (thenable._state === FULFILLED) {
                            fulfill(promise, thenable._result);
                        } else if (thenable._state === REJECTED) {
                            _reject(promise, thenable._result);
                        } else {
                            subscribe(thenable, undefined, function (value) {
                                return _resolve(promise, value);
                            }, function (reason) {
                                return _reject(promise, reason);
                            });
                        }
                    }

                    function handleMaybeThenable(promise, maybeThenable, then$$) {
                        if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
                            handleOwnThenable(promise, maybeThenable);
                        } else {
                            if (then$$ === GET_THEN_ERROR) {
                                _reject(promise, GET_THEN_ERROR.error);
                            } else if (then$$ === undefined) {
                                fulfill(promise, maybeThenable);
                            } else if (isFunction(then$$)) {
                                handleForeignThenable(promise, maybeThenable, then$$);
                            } else {
                                fulfill(promise, maybeThenable);
                            }
                        }
                    }

                    function _resolve(promise, value) {
                        if (promise === value) {
                            _reject(promise, selfFulfillment());
                        } else if (objectOrFunction(value)) {
                            handleMaybeThenable(promise, value, getThen(value));
                        } else {
                            fulfill(promise, value);
                        }
                    }

                    function publishRejection(promise) {
                        if (promise._onerror) {
                            promise._onerror(promise._result);
                        }
                        publish(promise);
                    }

                    function fulfill(promise, value) {
                        if (promise._state !== PENDING) {
                            return;
                        }
                        promise._result = value;
                        promise._state = FULFILLED;
                        if (promise._subscribers.length !== 0) {
                            asap(publish, promise);
                        }
                    }

                    function _reject(promise, reason) {
                        if (promise._state !== PENDING) {
                            return;
                        }
                        promise._state = REJECTED;
                        promise._result = reason;
                        asap(publishRejection, promise);
                    }

                    function subscribe(parent, child, onFulfillment, onRejection) {
                        var _subscribers = parent._subscribers;
                        var length = _subscribers.length;
                        parent._onerror = null;
                        _subscribers[length] = child;
                        _subscribers[length + FULFILLED] = onFulfillment;
                        _subscribers[length + REJECTED] = onRejection;
                        if (length === 0 && parent._state) {
                            asap(publish, parent);
                        }
                    }

                    function publish(promise) {
                        var subscribers = promise._subscribers;
                        var settled = promise._state;
                        if (subscribers.length === 0) {
                            return;
                        }
                        var child = undefined,
                            callback = undefined,
                            detail = promise._result;
                        for (var i = 0; i < subscribers.length; i += 3) {
                            child = subscribers[i];
                            callback = subscribers[i + settled];
                            if (child) {
                                invokeCallback(settled, child, callback, detail);
                            } else {
                                callback(detail);
                            }
                        }
                        promise._subscribers.length = 0;
                    }

                    function ErrorObject() {
                        this.error = null;
                    }
                    var TRY_CATCH_ERROR = new ErrorObject();

                    function tryCatch(callback, detail) {
                        try {
                            return callback(detail);
                        } catch (e) {
                            TRY_CATCH_ERROR.error = e;
                            return TRY_CATCH_ERROR;
                        }
                    }

                    function invokeCallback(settled, promise, callback, detail) {
                        var hasCallback = isFunction(callback),
                            value = undefined,
                            error = undefined,
                            succeeded = undefined,
                            failed = undefined;
                        if (hasCallback) {
                            value = tryCatch(callback, detail);
                            if (value === TRY_CATCH_ERROR) {
                                failed = true;
                                error = value.error;
                                value = null;
                            } else {
                                succeeded = true;
                            }
                            if (promise === value) {
                                _reject(promise, cannotReturnOwn());
                                return;
                            }
                        } else {
                            value = detail;
                            succeeded = true;
                        }
                        if (promise._state !== PENDING) {} else if (hasCallback && succeeded) {
                            _resolve(promise, value);
                        } else if (failed) {
                            _reject(promise, error);
                        } else if (settled === FULFILLED) {
                            fulfill(promise, value);
                        } else if (settled === REJECTED) {
                            _reject(promise, value);
                        }
                    }

                    function initializePromise(promise, resolver) {
                        try {
                            resolver(function resolvePromise(value) {
                                _resolve(promise, value);
                            }, function rejectPromise(reason) {
                                _reject(promise, reason);
                            });
                        } catch (e) {
                            _reject(promise, e);
                        }
                    }
                    var id = 0;

                    function nextId() {
                        return id++;
                    }

                    function makePromise(promise) {
                        promise[PROMISE_ID] = id++;
                        promise._state = undefined;
                        promise._result = undefined;
                        promise._subscribers = [];
                    }

                    function Enumerator(Constructor, input) {
                        this._instanceConstructor = Constructor;
                        this.promise = new Constructor(noop);
                        if (!this.promise[PROMISE_ID]) {
                            makePromise(this.promise);
                        }
                        if (isArray(input)) {
                            this._input = input;
                            this.length = input.length;
                            this._remaining = input.length;
                            this._result = new Array(this.length);
                            if (this.length === 0) {
                                fulfill(this.promise, this._result);
                            } else {
                                this.length = this.length || 0;
                                this._enumerate();
                                if (this._remaining === 0) {
                                    fulfill(this.promise, this._result);
                                }
                            }
                        } else {
                            _reject(this.promise, validationError());
                        }
                    }

                    function validationError() {
                        return new Error('Array Methods must be provided an Array');
                    };
                    Enumerator.prototype._enumerate = function () {
                        var length = this.length;
                        var _input = this._input;
                        for (var i = 0; this._state === PENDING && i < length; i++) {
                            this._eachEntry(_input[i], i);
                        }
                    };
                    Enumerator.prototype._eachEntry = function (entry, i) {
                        var c = this._instanceConstructor;
                        var resolve$$ = c.resolve;
                        if (resolve$$ === resolve) {
                            var _then = getThen(entry);
                            if (_then === then && entry._state !== PENDING) {
                                this._settledAt(entry._state, i, entry._result);
                            } else if (typeof _then !== 'function') {
                                this._remaining--;
                                this._result[i] = entry;
                            } else if (c === Promise) {
                                var promise = new c(noop);
                                handleMaybeThenable(promise, entry, _then);
                                this._willSettleAt(promise, i);
                            } else {
                                this._willSettleAt(new c(function (resolve$$) {
                                    return resolve$$(entry);
                                }), i);
                            }
                        } else {
                            this._willSettleAt(resolve$$(entry), i);
                        }
                    };
                    Enumerator.prototype._settledAt = function (state, i, value) {
                        var promise = this.promise;
                        if (promise._state === PENDING) {
                            this._remaining--;
                            if (state === REJECTED) {
                                _reject(promise, value);
                            } else {
                                this._result[i] = value;
                            }
                        }
                        if (this._remaining === 0) {
                            fulfill(promise, this._result);
                        }
                    };
                    Enumerator.prototype._willSettleAt = function (promise, i) {
                        var enumerator = this;
                        subscribe(promise, undefined, function (value) {
                            return enumerator._settledAt(FULFILLED, i, value);
                        }, function (reason) {
                            return enumerator._settledAt(REJECTED, i, reason);
                        });
                    };

                    function all(entries) {
                        return new Enumerator(this, entries).promise;
                    }

                    function race(entries) {
                        var Constructor = this;
                        if (!isArray(entries)) {
                            return new Constructor(function (_, reject) {
                                return reject(new TypeError('You must pass an array to race.'));
                            });
                        } else {
                            return new Constructor(function (resolve, reject) {
                                var length = entries.length;
                                for (var i = 0; i < length; i++) {
                                    Constructor.resolve(entries[i]).then(resolve, reject);
                                }
                            });
                        }
                    }

                    function reject(reason) {
                        var Constructor = this;
                        var promise = new Constructor(noop);
                        _reject(promise, reason);
                        return promise;
                    }

                    function needsResolver() {
                        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
                    }

                    function needsNew() {
                        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
                    }

                    function Promise(resolver) {
                        this[PROMISE_ID] = nextId();
                        this._result = this._state = undefined;
                        this._subscribers = [];
                        if (noop !== resolver) {
                            typeof resolver !== 'function' && needsResolver();
                            this instanceof Promise ? initializePromise(this, resolver) : needsNew();
                        }
                    }
                    Promise.all = all;
                    Promise.race = race;
                    Promise.resolve = resolve;
                    Promise.reject = reject;
                    Promise._setScheduler = setScheduler;
                    Promise._setAsap = setAsap;
                    Promise._asap = asap;
                    Promise.prototype = {
                        constructor: Promise,
                        then: then,
                        'catch': function _catch(onRejection) {
                            return this.then(null, onRejection);
                        }
                    };

                    function polyfill() {
                        var local = undefined;
                        if (typeof global !== 'undefined') {
                            local = global;
                        } else if (typeof self !== 'undefined') {
                            local = self;
                        } else {
                            try {
                                local = Function('return this')();
                            } catch (e) {
                                throw new Error('polyfill failed because global object is unavailable in this environment');
                            }
                        }
                        var P = local.Promise;
                        if (P) {
                            var promiseToString = null;
                            try {
                                promiseToString = Object.prototype.toString.call(P.resolve());
                            } catch (e) {}
                            if (promiseToString === '[object Promise]' && !P.cast) {
                                return;
                            }
                        }
                        local.Promise = Promise;
                    }
                    polyfill();
                    Promise.polyfill = polyfill;
                    Promise.Promise = Promise;
                    return Promise;
                });
            }.call(this, __webpack_require__(
                /*! ./../../process/browser.js */
                "./node_modules/process/browser.js"), __webpack_require__(
                /*! ./../../webpack/buildin/global.js */
                "./node_modules/webpack/buildin/global.js")))
        }),
    "./node_modules/process/browser.js":
        /*!*****************************************!*\
          !*** ./node_modules/process/browser.js ***!
          \*****************************************/
        /*! no static exports found */
        (function (module, exports) {
            var process = module.exports = {};
            var cachedSetTimeout;
            var cachedClearTimeout;

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }

            function defaultClearTimeout() {
                throw new Error('clearTimeout has not been defined');
            }
            (function () {
                try {
                    if (typeof setTimeout === 'function') {
                        cachedSetTimeout = setTimeout;
                    } else {
                        cachedSetTimeout = defaultSetTimout;
                    }
                } catch (e) {
                    cachedSetTimeout = defaultSetTimout;
                }
                try {
                    if (typeof clearTimeout === 'function') {
                        cachedClearTimeout = clearTimeout;
                    } else {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                } catch (e) {
                    cachedClearTimeout = defaultClearTimeout;
                }
            })();

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    return setTimeout(fun, 0);
                }
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    return cachedSetTimeout(fun, 0);
                } catch (e) {
                    try {
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch (e) {
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }
            }

            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    return clearTimeout(marker);
                }
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    return cachedClearTimeout(marker);
                } catch (e) {
                    try {
                        return cachedClearTimeout.call(null, marker);
                    } catch (e) {
                        return cachedClearTimeout.call(this, marker);
                    }
                }
            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;
                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            process.nextTick = function (fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            };

            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            process.title = 'browser';
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = '';
            process.versions = {};

            function noop() {}
            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.prependListener = noop;
            process.prependOnceListener = noop;
            process.listeners = function (name) {
                return [];
            };
            process.binding = function (name) {
                throw new Error('process.binding is not supported');
            };
            process.cwd = function () {
                return '/';
            };
            process.chdir = function (dir) {
                throw new Error('process.chdir is not supported');
            };
            process.umask = function () {
                return 0;
            };
        }),
    "./node_modules/regenerator-runtime/runtime.js":
        /*!*****************************************************!*\
          !*** ./node_modules/regenerator-runtime/runtime.js ***!
          \*****************************************************/
        /*! no static exports found */
        (function (module, exports, __webpack_require__) {
            (function (module) {
                function _typeof(obj) {
                    "@babel/helpers - typeof";
                    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                        _typeof = function _typeof(obj) {
                            return typeof obj;
                        };
                    } else {
                        _typeof = function _typeof(obj) {
                            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
                        };
                    }
                    return _typeof(obj);
                }
                var runtime = function (exports) {
                    "use strict";
                    var Op = Object.prototype;
                    var hasOwn = Op.hasOwnProperty;
                    var undefined;
                    var $Symbol = typeof Symbol === "function" ? Symbol : {};
                    var iteratorSymbol = $Symbol.iterator || "@@iterator";
                    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
                    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

                    function wrap(innerFn, outerFn, self, tryLocsList) {
                        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
                        var generator = Object.create(protoGenerator.prototype);
                        var context = new Context(tryLocsList || []);
                        generator._invoke = makeInvokeMethod(innerFn, self, context);
                        return generator;
                    }
                    exports.wrap = wrap;

                    function tryCatch(fn, obj, arg) {
                        try {
                            return {
                                type: "normal",
                                arg: fn.call(obj, arg)
                            };
                        } catch (err) {
                            return {
                                type: "throw",
                                arg: err
                            };
                        }
                    }
                    var GenStateSuspendedStart = "suspendedStart";
                    var GenStateSuspendedYield = "suspendedYield";
                    var GenStateExecuting = "executing";
                    var GenStateCompleted = "completed";
                    var ContinueSentinel = {};

                    function Generator() {}

                    function GeneratorFunction() {}

                    function GeneratorFunctionPrototype() {}
                    var IteratorPrototype = {};
                    IteratorPrototype[iteratorSymbol] = function () {
                        return this;
                    };
                    var getProto = Object.getPrototypeOf;
                    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
                    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
                        IteratorPrototype = NativeIteratorPrototype;
                    }
                    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
                    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
                    GeneratorFunctionPrototype.constructor = GeneratorFunction;
                    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

                    function defineIteratorMethods(prototype) {
                        ["next", "throw", "return"].forEach(function (method) {
                            prototype[method] = function (arg) {
                                return this._invoke(method, arg);
                            };
                        });
                    }
                    exports.isGeneratorFunction = function (genFun) {
                        var ctor = typeof genFun === "function" && genFun.constructor;
                        return ctor ? ctor === GeneratorFunction || (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
                    };
                    exports.mark = function (genFun) {
                        if (Object.setPrototypeOf) {
                            Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
                        } else {
                            genFun.__proto__ = GeneratorFunctionPrototype;
                            if (!(toStringTagSymbol in genFun)) {
                                genFun[toStringTagSymbol] = "GeneratorFunction";
                            }
                        }
                        genFun.prototype = Object.create(Gp);
                        return genFun;
                    };
                    exports.awrap = function (arg) {
                        return {
                            __await: arg
                        };
                    };

                    function AsyncIterator(generator, PromiseImpl) {
                        function invoke(method, arg, resolve, reject) {
                            var record = tryCatch(generator[method], generator, arg);
                            if (record.type === "throw") {
                                reject(record.arg);
                            } else {
                                var result = record.arg;
                                var value = result.value;
                                if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
                                    return PromiseImpl.resolve(value.__await).then(function (value) {
                                        invoke("next", value, resolve, reject);
                                    }, function (err) {
                                        invoke("throw", err, resolve, reject);
                                    });
                                }
                                return PromiseImpl.resolve(value).then(function (unwrapped) {
                                    result.value = unwrapped;
                                    resolve(result);
                                }, function (error) {
                                    return invoke("throw", error, resolve, reject);
                                });
                            }
                        }
                        var previousPromise;

                        function enqueue(method, arg) {
                            function callInvokeWithMethodAndArg() {
                                return new PromiseImpl(function (resolve, reject) {
                                    invoke(method, arg, resolve, reject);
                                });
                            }
                            return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
                        }
                        this._invoke = enqueue;
                    }
                    defineIteratorMethods(AsyncIterator.prototype);
                    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
                        return this;
                    };
                    exports.AsyncIterator = AsyncIterator;
                    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
                        if (PromiseImpl === void 0) PromiseImpl = Promise;
                        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
                        return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
                            return result.done ? result.value : iter.next();
                        });
                    };

                    function makeInvokeMethod(innerFn, self, context) {
                        var state = GenStateSuspendedStart;
                        return function invoke(method, arg) {
                            if (state === GenStateExecuting) {
                                throw new Error("Generator is already running");
                            }
                            if (state === GenStateCompleted) {
                                if (method === "throw") {
                                    throw arg;
                                }
                                return doneResult();
                            }
                            context.method = method;
                            context.arg = arg;
                            while (true) {
                                var delegate = context.delegate;
                                if (delegate) {
                                    var delegateResult = maybeInvokeDelegate(delegate, context);
                                    if (delegateResult) {
                                        if (delegateResult === ContinueSentinel) continue;
                                        return delegateResult;
                                    }
                                }
                                if (context.method === "next") {
                                    context.sent = context._sent = context.arg;
                                } else if (context.method === "throw") {
                                    if (state === GenStateSuspendedStart) {
                                        state = GenStateCompleted;
                                        throw context.arg;
                                    }
                                    context.dispatchException(context.arg);
                                } else if (context.method === "return") {
                                    context.abrupt("return", context.arg);
                                }
                                state = GenStateExecuting;
                                var record = tryCatch(innerFn, self, context);
                                if (record.type === "normal") {
                                    state = context.done ? GenStateCompleted : GenStateSuspendedYield;
                                    if (record.arg === ContinueSentinel) {
                                        continue;
                                    }
                                    return {
                                        value: record.arg,
                                        done: context.done
                                    };
                                } else if (record.type === "throw") {
                                    state = GenStateCompleted;
                                    context.method = "throw";
                                    context.arg = record.arg;
                                }
                            }
                        };
                    }

                    function maybeInvokeDelegate(delegate, context) {
                        var method = delegate.iterator[context.method];
                        if (method === undefined) {
                            context.delegate = null;
                            if (context.method === "throw") {
                                if (delegate.iterator["return"]) {
                                    context.method = "return";
                                    context.arg = undefined;
                                    maybeInvokeDelegate(delegate, context);
                                    if (context.method === "throw") {
                                        return ContinueSentinel;
                                    }
                                }
                                context.method = "throw";
                                context.arg = new TypeError("The iterator does not provide a 'throw' method");
                            }
                            return ContinueSentinel;
                        }
                        var record = tryCatch(method, delegate.iterator, context.arg);
                        if (record.type === "throw") {
                            context.method = "throw";
                            context.arg = record.arg;
                            context.delegate = null;
                            return ContinueSentinel;
                        }
                        var info = record.arg;
                        if (!info) {
                            context.method = "throw";
                            context.arg = new TypeError("iterator result is not an object");
                            context.delegate = null;
                            return ContinueSentinel;
                        }
                        if (info.done) {
                            context[delegate.resultName] = info.value;
                            context.next = delegate.nextLoc;
                            if (context.method !== "return") {
                                context.method = "next";
                                context.arg = undefined;
                            }
                        } else {
                            return info;
                        }
                        context.delegate = null;
                        return ContinueSentinel;
                    }
                    defineIteratorMethods(Gp);
                    Gp[toStringTagSymbol] = "Generator";
                    Gp[iteratorSymbol] = function () {
                        return this;
                    };
                    Gp.toString = function () {
                        return "[object Generator]";
                    };

                    function pushTryEntry(locs) {
                        var entry = {
                            tryLoc: locs[0]
                        };
                        if (1 in locs) {
                            entry.catchLoc = locs[1];
                        }
                        if (2 in locs) {
                            entry.finallyLoc = locs[2];
                            entry.afterLoc = locs[3];
                        }
                        this.tryEntries.push(entry);
                    }

                    function resetTryEntry(entry) {
                        var record = entry.completion || {};
                        record.type = "normal";
                        delete record.arg;
                        entry.completion = record;
                    }

                    function Context(tryLocsList) {
                        this.tryEntries = [{
                            tryLoc: "root"
                        }];
                        tryLocsList.forEach(pushTryEntry, this);
                        this.reset(true);
                    }
                    exports.keys = function (object) {
                        var keys = [];
                        for (var key in object) {
                            keys.push(key);
                        }
                        keys.reverse();
                        return function next() {
                            while (keys.length) {
                                var key = keys.pop();
                                if (key in object) {
                                    next.value = key;
                                    next.done = false;
                                    return next;
                                }
                            }
                            next.done = true;
                            return next;
                        };
                    };

                    function values(iterable) {
                        if (iterable) {
                            var iteratorMethod = iterable[iteratorSymbol];
                            if (iteratorMethod) {
                                return iteratorMethod.call(iterable);
                            }
                            if (typeof iterable.next === "function") {
                                return iterable;
                            }
                            if (!isNaN(iterable.length)) {
                                var i = -1,
                                    next = function next() {
                                        while (++i < iterable.length) {
                                            if (hasOwn.call(iterable, i)) {
                                                next.value = iterable[i];
                                                next.done = false;
                                                return next;
                                            }
                                        }
                                        next.value = undefined;
                                        next.done = true;
                                        return next;
                                    };
                                return next.next = next;
                            }
                        }
                        return {
                            next: doneResult
                        };
                    }
                    exports.values = values;

                    function doneResult() {
                        return {
                            value: undefined,
                            done: true
                        };
                    }
                    Context.prototype = {
                        constructor: Context,
                        reset: function reset(skipTempReset) {
                            this.prev = 0;
                            this.next = 0;
                            this.sent = this._sent = undefined;
                            this.done = false;
                            this.delegate = null;
                            this.method = "next";
                            this.arg = undefined;
                            this.tryEntries.forEach(resetTryEntry);
                            if (!skipTempReset) {
                                for (var name in this) {
                                    if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                                        this[name] = undefined;
                                    }
                                }
                            }
                        },
                        stop: function stop() {
                            this.done = true;
                            var rootEntry = this.tryEntries[0];
                            var rootRecord = rootEntry.completion;
                            if (rootRecord.type === "throw") {
                                throw rootRecord.arg;
                            }
                            return this.rval;
                        },
                        dispatchException: function dispatchException(exception) {
                            if (this.done) {
                                throw exception;
                            }
                            var context = this;

                            function handle(loc, caught) {
                                record.type = "throw";
                                record.arg = exception;
                                context.next = loc;
                                if (caught) {
                                    context.method = "next";
                                    context.arg = undefined;
                                }
                                return !!caught;
                            }
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                var record = entry.completion;
                                if (entry.tryLoc === "root") {
                                    return handle("end");
                                }
                                if (entry.tryLoc <= this.prev) {
                                    var hasCatch = hasOwn.call(entry, "catchLoc");
                                    var hasFinally = hasOwn.call(entry, "finallyLoc");
                                    if (hasCatch && hasFinally) {
                                        if (this.prev < entry.catchLoc) {
                                            return handle(entry.catchLoc, true);
                                        } else if (this.prev < entry.finallyLoc) {
                                            return handle(entry.finallyLoc);
                                        }
                                    } else if (hasCatch) {
                                        if (this.prev < entry.catchLoc) {
                                            return handle(entry.catchLoc, true);
                                        }
                                    } else if (hasFinally) {
                                        if (this.prev < entry.finallyLoc) {
                                            return handle(entry.finallyLoc);
                                        }
                                    } else {
                                        throw new Error("try statement without catch or finally");
                                    }
                                }
                            }
                        },
                        abrupt: function abrupt(type, arg) {
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                                    var finallyEntry = entry;
                                    break;
                                }
                            }
                            if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
                                finallyEntry = null;
                            }
                            var record = finallyEntry ? finallyEntry.completion : {};
                            record.type = type;
                            record.arg = arg;
                            if (finallyEntry) {
                                this.method = "next";
                                this.next = finallyEntry.finallyLoc;
                                return ContinueSentinel;
                            }
                            return this.complete(record);
                        },
                        complete: function complete(record, afterLoc) {
                            if (record.type === "throw") {
                                throw record.arg;
                            }
                            if (record.type === "break" || record.type === "continue") {
                                this.next = record.arg;
                            } else if (record.type === "return") {
                                this.rval = this.arg = record.arg;
                                this.method = "return";
                                this.next = "end";
                            } else if (record.type === "normal" && afterLoc) {
                                this.next = afterLoc;
                            }
                            return ContinueSentinel;
                        },
                        finish: function finish(finallyLoc) {
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                if (entry.finallyLoc === finallyLoc) {
                                    this.complete(entry.completion, entry.afterLoc);
                                    resetTryEntry(entry);
                                    return ContinueSentinel;
                                }
                            }
                        },
                        "catch": function _catch(tryLoc) {
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var entry = this.tryEntries[i];
                                if (entry.tryLoc === tryLoc) {
                                    var record = entry.completion;
                                    if (record.type === "throw") {
                                        var thrown = record.arg;
                                        resetTryEntry(entry);
                                    }
                                    return thrown;
                                }
                            }
                            throw new Error("illegal catch attempt");
                        },
                        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
                            this.delegate = {
                                iterator: values(iterable),
                                resultName: resultName,
                                nextLoc: nextLoc
                            };
                            if (this.method === "next") {
                                this.arg = undefined;
                            }
                            return ContinueSentinel;
                        }
                    };
                    return exports;
                }((false ? undefined : _typeof(module)) === "object" ? module.exports : {});
                try {
                    regeneratorRuntime = runtime;
                } catch (accidentalStrictMode) {
                    Function("r", "regeneratorRuntime = r")(runtime);
                }
            }.call(this, __webpack_require__(
                /*! ./../webpack/buildin/module.js */
                "./node_modules/webpack/buildin/module.js")(module)))
        }),
    "./node_modules/webpack/buildin/global.js":
        /*!***********************************!*\
          !*** (webpack)/buildin/global.js ***!
          \***********************************/
        /*! no static exports found */
        (function (module, exports) {
            function _typeof(obj) {
                "@babel/helpers - typeof";
                if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                    _typeof = function _typeof(obj) {
                        return typeof obj;
                    };
                } else {
                    _typeof = function _typeof(obj) {
                        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
                    };
                }
                return _typeof(obj);
            }
            var g;
            g = function () {
                return this;
            }();
            try {
                g = g || new Function("return this")();
            } catch (e) {
                if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
            }
            module.exports = g;
        }),
    "./node_modules/webpack/buildin/module.js":
        /*!***********************************!*\
          !*** (webpack)/buildin/module.js ***!
          \***********************************/
        /*! no static exports found */
        (function (module, exports) {
            module.exports = function (module) {
                if (!module.webpackPolyfill) {
                    module.deprecate = function () {};
                    module.paths = [];
                    if (!module.children) module.children = [];
                    Object.defineProperty(module, "loaded", {
                        enumerable: true,
                        get: function get() {
                            return module.l;
                        }
                    });
                    Object.defineProperty(module, "id", {
                        enumerable: true,
                        get: function get() {
                            return module.i;
                        }
                    });
                    module.webpackPolyfill = 1;
                }
                return module;
            };
        }),
    0:
        /*!*****************************************************!*\
          !*** multi es6-promise-promise ./js/scripts_es6.js ***!
          \*****************************************************/
        /*! no static exports found */
        (function (module, exports, __webpack_require__) {
            __webpack_require__(
                /*! es6-promise-promise */
                "./node_modules/es6-promise-promise/index.js");
            module.exports = __webpack_require__(
                /*! ./js/scripts_es6.js */
                "./js/scripts_es6.js");
        }),
    1:
        /*!***********************!*\
          !*** vertx (ignored) ***!
          \***********************/
        /*! no static exports found */
        (function (module, exports) {})
});