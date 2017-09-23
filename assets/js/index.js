
$(document).ready(function () {



    var trigger = $('.hamburger'),
         overlay = $('.overlay'),
        isClosed = false;

    trigger.click(function () {
        hamburger_cross();
    });

    function hamburger_cross() {

        if (isClosed == true) {
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    }

    $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
    });


    //login
    $(".sign-up").submit(function (event) {
        
        var username = $(".sign-up-username").val();
        var password = $(".sign-up-password").val();
        if (username.trim().length > 0 && password.trim().length > 0) {
            var formData = new FormData();
            formData.append("action", "login");

            formData.append("username", username);
            formData.append("password", password);

            $.ajax({
                url: "RegistrationService.ashx", //You can replace this with MVC/WebAPI/PHP/Java etc
                method: "post",
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data == "True") {
                        window.sessionStorage.setItem("loggedin", "yes");
                        window.location = "admin.html";
                    } else {
                        alert(data);
                    }

                },
                error: function (error) {
                    alert(error.message);
                    $("input#username").focus();
                }

            });
        } else {
            alert("Please enter valid Username/Password");
            $("input#username").focus();
        }


        //  toggleViewHistory();
        //   $("#loginModal").model('hide');


        event.preventDefault();
    });


    $("#logout").click(function () {
        window.sessionStorage.setItem("loggedin", "no");
        window.location = "./registration.html";
        // toggleViewHistory();
    })

    var toggleViewHistory = function () {

        if (window.sessionStorage.getItem("loggedin") == "yes")
            $("#reghistory").css({ 'display': 'block' })
        else
            $("#reghistory").css({ 'display': 'none' })
    }

    toggleViewHistory();


    $('#contact_form').bootstrapValidator({

        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            first_name: {
                validators: {
                    stringLength: {
                        min: 2,
                    },
                    notEmpty: {
                        message: 'Please supply your first name'
                    }
                }
            },
            last_name: {
                validators: {
                    stringLength: {
                        min: 2,
                    },
                    notEmpty: {
                        message: 'Please supply your last name'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'Please supply your email address'
                    },
                    emailAddress: {
                        message: 'Please supply a valid email address'
                    }
                }
            },
            phone: {
                validators: {
                    notEmpty: {
                        message: 'Please supply your phone number'
                    },
                    phone: {
                        country: 'US',
                        message: 'Please supply a vaild phone number with area code'
                    }
                }
            },
            address: {
                validators: {
                    stringLength: {
                        min: 8,
                    },
                    notEmpty: {
                        message: 'Please supply your street address'
                    }
                }
            },
            city: {
                validators: {
                    stringLength: {
                        min: 4,
                    },
                    notEmpty: {
                        message: 'Please supply your city'
                    }
                }
            },
            state: {
                validators: {
                    notEmpty: {
                        message: 'Please select your state'
                    }
                }
            },
            zip: {
                validators: {
                    notEmpty: {
                        message: 'Please supply your zip code'
                    },
                    zipCode: {
                        country: 'US',
                        message: 'Please supply a vaild zip code'
                    }
                }
            },
            serial: {
                validators: {
                    notEmpty: {
                        message: 'Please supply Screen Serial Number'
                    }
                }
            },
            purchase_receipt: {
                validators: {
                    notEmpty: {
                        message: 'Please supply Purchase Receipt'
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {


        //// Prevent form submission
        e.preventDefault();

        //// Get the form instance
        //var $form = $(e.target);

        //// Get the BootstrapValidator instance
        //var bv = $form.data('bootstrapValidator');

        //getting form into Jquery Wrapper Instance to enable JQuery Functions on form                    
        var form = $("#contact_form");

        //Serializing all For Input Values (not files!) in an Array Collection so that we can iterate this collection later.
        var params = form.serializeArray();

        ////Getting Files Collection
        var files = $("input[name='purchase_receipt']")[0].files;

        //  //Declaring new Form Data Instance  
        var formData = new FormData();

        if (files.length > 0) {
            formData.append(files[0].name, files[0]);
        }

        //Looping through uploaded files collection in case there is a Multi File Upload. This also works for single i.e simply remove MULTIPLE attribute from file control in HTML.  
        //for (var i = 0; i < files.length; i++) {
        //    formData.append(files[i].name, files[i]);
        //}

        //Now Looping the parameters for all form input fields and assigning them as Name Value pairs. 
        $(params).each(function (index, element) {
            if (element.name == "hasService") {
                var radioelements = $("input[name='hasService']");
                radioelements[0].checked
                    ? formData.append(element.name, "yes")
                    : formData.append(element.name, "no");
            }
            else
                formData.append(element.name, element.value);
        });


        //disabling Submit Button so that user cannot press Submit Multiple times
        var btn = $("#btnRegister");
        btn.val("Uploading...");
        btn.prop("disabled", true);
        formData.append("action", "save");



        $.ajax({
            url: "/RegistrationService.ashx", //You can replace this with MVC/WebAPI/PHP/Java etc
            method: "post",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                if (data == "success") {
                    $('#contact_form').hide();
                    $("#success_message").show();
                } else {
                    alert(data);
                }

            },
            error: function (error) {
                console.log(error);

                alert("Error : " + error.responseText);
            }

        });

        // Use Ajax to submit form data
        //$.post($form.attr('action'), $form.serialize(), function(result) {
        //    console.log(result);
        //}, 'json');


    });
});
