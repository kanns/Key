var registrationData = {};

$(document).ready(function () {

    var GetData = function (startdate, enddate, firstload) {


        var formData = new FormData();
        formData.append("startdate", startdate);
        formData.append("enddate", enddate);
        formData.append("action", "getRecords");

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


    $("#btnExport").click(function (e) {

        //  JSONToCSVConvertor(registrationData, "Registration History between ", false);
        var startDate = $('input[name="daterange"]').val().slice(0, 10);
        var endDate = $('input[name="daterange"]').val().slice(12, 22);
        JSONToCSVConvertor(registrationData, "Registration History between "+ startDate + " and "+endDate, true);
    });

    var currentdate = moment(new Date()).format('MM/DD/YYYY');
    $('input[name="daterange"]').daterangepicker({
        format: 'MM/DD/YYYY',
        startDate: moment(),
        endDate: moment(),
        minDate: '01/01/2015',
        maxDate: '12/31/2099',
        dateLimit: {
            days: 366
        },
        showDropdowns: true,
        showWeekNumbers: true,
        alwaysShowCalendars: true,
        timePicker: false,
        timePickerIncrement: 1,
        timePicker12Hour: true,
        linkedCalendars: false,
        ranges: {
            'Today': [moment(currentdate), moment(currentdate)],
            'Yesterday': [moment(currentdate).subtract(1, 'days'), moment(currentdate).subtract(1, 'days')],
            'Last 7 Days': [moment(currentdate).subtract(6, 'days'), moment(currentdate)],
            'Last 30 Days': [moment(currentdate).subtract(29, 'days'), moment(currentdate)],
            'This Month': [moment(currentdate).startOf('month'), moment(currentdate).endOf('month')],
            'Last Month': [moment(currentdate).subtract(1, 'month').startOf('month'), moment(currentdate).subtract(1, 'month').endOf('month')]
        },
        opens: 'left',
        drops: 'down',
        buttonClasses: ['btn', 'btn-sm'],
        applyClass: 'btn-primary',
        cancelClass: 'btn-default',
        separator: ' to ',
        locale: {
            applyLabel: 'Submit',
            cancelLabel: 'Cancel',
            fromLabel: 'From',
            toLabel: 'To',
            customRangeLabel: 'Custom',
            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            firstDay: 1
        }
    },
       function (start, end, label) {
           
           StartDate= start.format('MM/DD/YYYY');
           EndDate= end.format('MM/DD/YYYY');
           GetData(StartDate, EndDate, false);
       });
    var currentdate = moment(new Date()).format('MM/DD/YYYY');
    GetData(currentdate, currentdate, true);
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
        'label': 'Name', // Column header label.
        'property': 'FirstName', // The JSON property you are binding to.
        'sortable': true // Is the column sortable.
    }, {
        'label': 'Email',
        'property': 'Email',
        'sortable': true
    }, {
        'label': 'Phone',
        'property': 'MobileNumber',
        'sortable': true
    }, {
        'label': 'Address',
        'property': 'Address',
        'sortable': true,
        'width': '10%'
    }, {
        'label': 'City',
        'property': 'City',
        'sortable': true
    }, {
        'label': 'State',
        'property': 'State',
        'sortable': true
    }, {
        'label': 'Zip',
        'property': 'Zipcode',
        'sortable': true
    }, {
        'label': 'Serial Number',
        'property': 'WarrantySlno',
        'sortable': true
    }, {
        'label': 'Receipt',
        'property': 'PurchaseReceiptFile',
        'sortable': true,
        'width': '10%'
    }, {
        'label': 'Reg Date',
        'property': 'CreatedDate',
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
        case 'PurchaseReceiptFile':
            {
                if (helpers.rowData[column] == null) {
                    customMarkup = 'N/A';
                } else {
                    customMarkup = '<a target="_blank" href=/uploads/' +
                        helpers.rowData[column] +
                        ' style="color: black" target="_blank"><i class="glyphicon glyphicon-file"></i></a>';
                }
            }
            break;

        case 'FirstName':
            {
                if (helpers.rowData[column] == null) {
                    customMarkup = 'N/A';
                } else {
                    customMarkup = helpers.rowData[column] + " " + helpers.rowData['LastName'];
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



