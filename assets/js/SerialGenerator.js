var registrationData = {};



var CheckLogin = function() {
    if(window.sessionStorage.getItem("loggedin") == null || window.sessionStorage.getItem("loggedin") == "no")
    window.location = "./registration.html";
}

CheckLogin();

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

    $("#logout").click(function () {
        window.sessionStorage.setItem("loggedin", "no");
        window.location = "./registration.html";
        // toggleViewHistory();
    })

    $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
    });

    $('#generate_form').bootstrapValidator({

        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            serial_to_generate: {
                validators: {
                    stringLength: {
                        min: 1
                    },
                    notEmpty: {
                        message: 'Please supply How many Serials to Generate'
                    }
                }
            }
        }
    }).on('success.form.bv',
  function (e) {
      e.preventDefault();
      //disabling Submit Button so that user cannot press Submit Multiple times
      var btn = $("#btnGenerateSerials");
      //btn.val("Generating...");
      btn.prop("disabled", true);
  
      var filterby = $('#select_filterby option:selected').text();;
      var serialsctrl = $('#serial_to_generate');
      GenerateSerials(serialsctrl.val(), filterby, false);
      btn.prop("disabled", false);
      $('#generate_form').bootstrapValidator('resetForm', true);

  });


    var GetData = function (filterby, firstload) {
        
        var formData = new FormData();
        formData.append("filterby", filterby);
        formData.append("action", "GetSerials");

        $.ajax({
            url: "RegistrationService.ashx", //You can replace this with MVC/WebAPI/PHP/Java etc
            method: "post",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                registrationData = JSON.parse(data);;
                // Initialize the repeater.
                initRepeater(firstload);
            },

            error: function(error) {
                console.log(error);
                alert("Error");
            }
        });
    }

    var GenerateSerials = function(serials,filterby, firstload){
        var formData = new FormData();
        formData.append("serials", serials);
        formData.append("filterby", filterby);
        formData.append("action", "GenerateSerials");

        $.ajax({
            url: "RegistrationService.ashx", //You can replace this with MVC/WebAPI/PHP/Java etc
            method: "post",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                var successmsgctrl = $("#success_message");
                var successmsg = 'Success <i class="glyphicon glyphicon-thumbs-up"></i> Generated ';
                successmsgctrl.html(successmsg + "<strong>" + serials + "</strong>  Serial numbers");
                successmsgctrl.show();
                registrationData = JSON.parse(data);
                // Initialize the repeater.
                initRepeater(firstload);
            },

            error: function(error) {
                console.log(error);
                alert("Error");
            }
        });
    }

    $("#btnExport").click(function (e) {
        //  JSONToCSVConvertor(registrationData, "Registration History between ", false);
        //var filterby = $("#filterby option:selected").text();
        JSONToCSVConvertor(registrationData, "Serial Numbers", true);
    });

    //$("#btnGenerateSerials").click(function (e) {
     
    //});


    $('#select_filterby').change(function(){
        var filterby = this.value;
        GetData( filterby, false);
    });
   
    var filterby = $('#select_filterby option:selected').text();
    GetData(filterby, true);
});

var initRepeater = function (firstload) {
    if (firstload) {
        $('#myRepeater').repeater({
            // Setup your custom datasource to handle data retrieval;
            // responsible for any paging, sorting, filtering, searching logic.
            dataSource: staticDataSource,
            // Other options can be placed here as well, such as text to
            // display if no data is returned.
            list_noItemsHTML: "No items found.",
            // See: getfuelux.com/javascript.html#repeater-usage-options
            // for more options to put here.
            list_columnSizing: false,
            //     list_columnSyncing: true,

            list_columnRendered: FileDownloadColumnRenderer
        });
    } else {
        $('#myRepeater').repeater('render');
    }
}

// Define the data to be displayed in the repeater.
function staticDataSource(options, callback) {

    // Define the columns for the grid
    var columns = [{
        'label': 'Serial Number', // Column header label.
        'property': 'Serial_Number', // The JSON property you are binding to.
        'sortable': true // Is the column sortable.
    }, {
        'label': 'Issued Date',
        'property': 'IssuedDate',
        'sortable': true
    }];


    // Set the values that will be used in your dataSource.
    var pageIndex = options.pageIndex;
    var pageSize = options.pageSize;
    var totalItems = registrationData.length;
    var totalPages = Math.ceil(totalItems / pageSize);
    var startIndex = (pageIndex * pageSize) + 1;
    var endIndex = (startIndex + pageSize) - 1;
    if (endIndex > totalItems) {
        endIndex = totalItems;
    }
    var rows = registrationData.slice(startIndex - 1, endIndex);

    // Define the datasource.
    var dataSource = {
        'page': pageIndex,
        'pages': totalPages,
        'count': totalItems,
        'start': startIndex,
        'end': endIndex,
        'columns': columns,
        'items': rows
    };

    //console.log(dataSource);

    // Pass the datasource back to the repeater.
    callback(dataSource);
}

function FileDownloadColumnRenderer(helpers, callback) {

    // determine what column is being rendered
    var column = helpers.columnAttr;

    // get all the data for the entire row
    var rowData = JSON.stringify(helpers.rowData);
    var customMarkup = '';

    // only override the output for specific columns.
    // will default to output the text value of the row item



    switch (column) {
        case 'Serial_Number':
            {
                if (helpers.rowData[column] == null) {
                    customMarkup = 'N/A';
                } else {
                    customMarkup = '<a href="#" data-toggle="modal" data-target="#customerModal"' +
                        helpers.rowData[column] +
                        ' style="color: black">'+helpers.rowData[column]+'</a>';
                }
            }
            break;

       

        default:
            // otherwise, just use the existing text value
            customMarkup = helpers.item.text();
            break;
    }

    helpers.item.html(customMarkup);

    callback();
};



