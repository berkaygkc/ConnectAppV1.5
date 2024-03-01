let detail_loading;
$(document).ready(function () {
    const despatch_table = $("#despatches").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/despatches/sended",
            data: (d) => {
                return $.extend({}, d, {
                    searchbox: $("#searchbox").val(),
                    fdate: fdateObject.formatDate(
                        fdateObject.selectedDates[0],
                        "Y-m-d"
                    ),
                    ldate: ldateObject.formatDate(
                        ldateObject.selectedDates[0],
                        "Y-m-d"
                    ),
                    status_codes: $("#status").val(),
                });
            },
        },
        columns: [
            { data: "id" },
            { data: "erp_no" },
            { data: "despatch_no" },
            { data: "receiver_name" },
            { data: "receiver_tax" },
            { data: "despatch_date" },
            { data: "despatch_payable" },
            { data: "currency_code" },
            { data: "despatch_profile" },
            { data: "despatch_type" },
            { data: "status_code" },
            { data: "status_desc" },
            { data: "process" },
        ],
        columnDefs: [
            {
                // For Checkboxes
                targets: 0,
                searchable: false,
                orderable: false,
                render: function () {
                    return '<input type="checkbox" class="dt-checkboxes form-check-input">';
                },
                checkboxes: {
                    selectRow: true,
                    selectAllRender:
                        '<input type="checkbox" class="form-check-input">',
                },
            },
            {
                targets: 1,
                width: "10%",
                render: (data, types, row) => {
                    let types_array = row.erp_type.split(":");
                    let color;
                    switch (types_array[1]) {
                        case "accountingApp":
                            color = "success";
                            break;
                        case "rahatLocalApp":
                            color = "info";
                            break;
                        case "belgeApp":
                            color = "primary";
                            break;
                        case "externalApp":
                            color = "warning";
                            break;
                        default:
                            color = "secondary";
                            break;
                    }
                    return `<i class="text-${color}">${types_array[0]}: ${data}</i><br><b>${row["despatch_no"]}</b>`;
                },
            },
            {
                targets: 3,
                width: "5%",
                render: (data, type, row) => {
                    return `${
                        String(data).length > 25
                            ? String(data).substring(0, 25) + "..."
                            : String(data)
                    }<br>${row["receiver_tax"]}`;
                },
            },
            {
                targets: 5,
                orderable: false,
                render: (data, type, row) => {
                    return `${data}`;
                },
            },
            {
                targets: 8,
                orderable: false,
                className: "dt-center",
                render: (data, types, row) => {
                    let profile = "secondary";
                    let type = "secondary";
                    return `
                    <span class="badge bg-label-${profile} bg-glow d-block">${data}</span>
                    <span class="badge bg-label-${type} d-block mt-1">${row["despatch_type"]}</span>`;
                },
            },
            {
                targets: 10,
                orderable: false,
                className: "dt-center",
                render: (data, types, row) => {
                    let status = "";
                    let text = "";
                    switch (data) {
                        case 200:
                            status = "bg-label-success";
                            text = `<i class="fa-regular fa-square-check fa-xl"></i>&nbsp;&nbsp;Başarılı`;
                            break;
                        case 201:
                            status = "bg-label-primary";
                            text = `<i class="fa-regular fa-square-check fa-xl"></i>&nbsp;&nbsp;İşaretlendi!`;
                            break;
                        case 400:
                            status = "bg-danger bg-glow";
                            text = `<i class="fa-solid fa-square-xmark fa-xl"></i>&nbsp;&nbsp;&nbsp;Hatalı`;
                            break;
                        default:
                            status = "bg-warning bg-glow";
                            break;
                    }
                    return `
                    <span id="status-label" class="badge ${status} d-block">${text}</span>`;
                },
            },
            {
                targets: 12,
                className: "dt-right",
                width: "10px",
                orderable: false,
                render: (data, type, row) => {
                    let buttons = "";
                    let preview_button = `
                    <button id="preview-despatch" type="button" class="btn  btn-icon btn-info waves-effect waves-light preview-button">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>`;
                    switch (row.status_code) {
                        case 200:
                            buttons += `<li>
                                            <a id="check-status" class="dropdown-item">
                                                <i class="fa-regular fa-pen-to-square fa-sm"></i> Durum Sorgula
                                            </a>
                                        </li>`;
                            break;
                        case 201:
                            buttons += `<li>
                                            <a id="mark-not-sended" class="dropdown-item">
                                                <i class="fa-regular fa-pen-to-square fa-sm"></i> Gönderilmedi olarak işaretle
                                            </a>
                                        </li>`;
                            break;
                        case 400:
                            buttons += `<li>
                                            <a id="mark-not-sended" class="dropdown-item">
                                                <i class="fa-regular fa-pen-to-square fa-sm"></i> Gönderilmedi olarak işaretle
                                            </a>
                                        </li>
                                        <li>
                                            <a id="mark-resolved" class="dropdown-item">
                                                <i class="fa-regular fa-pen-to-square fa-sm"></i> Çözüldü olarak işaretle
                                            </a>
                                        </li>`;
                            preview_button = "";
                            break;
                        default:
                            break;
                    }
                    return `<div class="btn-group" role="group" aria-label="Basic example">
                                ${preview_button}
                                <button type="button" class="btn btn-icon btn-label-warning waves-effect" 
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" style="">
                                    ${buttons}
                                </ul>
                            </div>`;
                },
            },
            {
                targets: [2, 4, 6, 7, 9, 11],
                visible: false,
            },
        ],
        order: [[1, "desc"]],
        dom: '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p><"col-sm-12 col-md-6"l>>',
        select: {
            // Select style
            style: "multi",
            selector:
                "tr>td:nth-child(1), tr>td:nth-child(2), tr>td:nth-child(3), tr>td:nth-child(4), tr>td:nth-child(5)",
        },
    });
    $("#despatches").on("processing.dt", function (e, settings, processing) {
        if (processing && !detail_loading) {
            $("#table-div").block({
                message: `
                    <div class="d-flex justify-content-center">
                        <div class="sk-grid sk-primary">
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                            <div class="sk-grid-cube"></div>
                        </div>
                    </div>`,
                css: {
                    backgroundColor: "transparent",
                    color: "#fff",
                    border: "0",
                },
                overlayCSS: {
                    opacity: 0.8,
                    backgroundColor: isDarkStyle
                        ? config.colors_dark.cardColor
                        : config.colors.cardColor,
                },
            });
        } else {
            detail_loading = false;
            $("#table-div").unblock();
        }
    });
    const searchTable = () => {
        despatch_table.draw();
    };

    let ldate = new Date();
    let fdate = new Date();
    fdate = fdate.setDate(ldate.getDate() - 7);
    let fdateObject = $("#fdate").flatpickr({
        locale: "tr",
        defaultDate: fdate,
        dateFormat: "d.m.Y",
        onChange: function (selectedDates, dateStr, instance) {
            searchTable();
        },
    });
    let ldateObject = $("#ldate").flatpickr({
        locale: "tr",
        defaultDate: ldate,
        dateFormat: "d.m.Y",
        onChange: function (selectedDates, dateStr, instance) {
            searchTable();
        },
    });

    $("#status").each(function () {
        var $this = $(this);
        $this
            .wrap('<div class="position-relative"></div>')
            .select2({
                dropdownParent: $this.parent(),
                placeholder: "İrsaliye Durumu",
                multiple: true,
                closeOnSelect: false,
                allowClear: true,
            })
            .on("change", (e) => {
                searchTable();
            })
            .val([])
            .trigger("change");
    });

    $("#search-button").click((e) => {
        searchTable();
    });
    $("#searchbox").on("focusout", (e) => {
        searchTable();
    });
    $("#searchbox").keypress(function (event) {
        var keycode = event.keyCode ? event.keyCode : event.which;
        if (keycode == "13") {
            searchTable();
        }
    });

    $("#despatches tbody").on("click", "#preview-despatch", function (e) {
        $(e.currentTarget).html(
            `<span class="spinner-grow text-white" role="status" aria-hidden="true"></span>`
        );
        $(".preview-button").attr("disabled", true);

        let data = despatch_table.row($(this).parents("tr")).data();
        $("#despatchFrame").attr("src", "");
        let xml;
        let xslt;
        $.when(
            $.ajax({
                // First Request
                url: `/despatches/waiting/${data.id}/xml`,
                type: "get",
                success: function (xmls) {
                    xml = xmls;
                },
            }),
            $.ajax({
                // First Request
                url: `/despatches/waiting/${data.id}/xslt`,
                type: "get",
                success: function (xslts) {
                    xslt = xslts;
                },
            })
        )
            .then(function () {
                try {
                    let parser = new DOMParser();
                    let xmlDoc, xslDoc;
                    if (typeof xml == "string") {
                        xmlDoc = parser.parseFromString(xml, "application/xml");
                    } else {
                        xmlDoc = xml;
                    }

                    if (typeof xslt == "string") {
                        xslDoc = parser.parseFromString(
                            xslt,
                            "application/xml"
                        );
                    } else {
                        xslDoc = xslt;
                    }
                    let processor = new XSLTProcessor();
                    processor.importStylesheet(xslDoc);
                    let result = processor.transformToDocument(xmlDoc);
                    var blob = new Blob(
                        [
                            new XMLSerializer().serializeToString(
                                result.doctype
                            ),
                            result.documentElement.innerHTML,
                        ],
                        {
                            type: "text/html",
                        }
                    );
                    $("#despatchFrame").attr("src", URL.createObjectURL(blob));
                    $("#preview-despatch-modal").modal("show");
                    detail_loading = true;
                    despatch_table.ajax.reload(null, false);
                } catch (error) {
                    console.error(error);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    });

    $("#iframe-print").on("click", function () {
        let myIframe = document.getElementById("despatchFrame").contentWindow;
        myIframe.focus();
        myIframe.print();

        return false;
    });

    $("#despatches tbody").on("click", "#check-status", function () {
        let data = despatch_table.row($(this).parents("tr")).data();
        $.ajax({
            type: "GET",
            url: `/despatches/sended/${data.id}/check/status`,
            success: function (response) {
                Swal.fire({
                    title: response.summary,
                    text: `${data.despatch_no} numaralı irsaliyenin durumu`,
                    icon: "info",
                });
            },
            error: function (error) {
                let error_detail = "";
                try {
                    error_detail = error.responseJSON?.data.map((err) => {
                        return `${err.message} <br>`;
                    });
                } catch (terror) {
                    error_detail = error.responseJSON?.data
                        ? error.responseJSON?.data
                        : error.responseJSON;
                }
                toastr["error"](JSON.stringify(error_detail), "Hata", {
                    closeButton: true,
                    tapToDismiss: false,
                    progressBar: true,
                });
            },
        });
    });

    $("#despatches tbody").on("click", "#mark-not-sended", function () {
        let data = despatch_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `${data.erp_no} numaralı irsaliyeyi gönderilmedi olarak işaretlemek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "DELETE",
                    url: `/despatches/sended/${data.id}/mark/send`,
                    success: function (response) {
                        return true;
                    },
                });
            },
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
        })
            .then((result) => {
                if (result.isConfirmed) {
                    toastr["success"](
                        `Başarıyla gönderilmedi işaretlendi!`,
                        "Başarılı",
                        {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        }
                    );
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                }
            })
            .catch((err) => {
                Swal.fire("Hata!!", "Bir hata oluştu!", "error").then((e) => {
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                });
            });
    });

    $("#despatches tbody").on("click", "#mark-resolved", function () {
        let data = despatch_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `${data.erp_no} numaralı irsaliyeyi çözüldü olarak işaretlemek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "PUT",
                    url: `/despatches/sended/${data.id}/mark/resolve`,
                    success: function (response) {
                        return true;
                    },
                });
            },
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
        })
            .then((result) => {
                if (result.isConfirmed) {
                    toastr["success"](
                        `Başarıyla çözüldü işaretlendi!`,
                        "Başarılı",
                        {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        }
                    );
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                }
            })
            .catch((err) => {
                Swal.fire("Hata!!", "Bir hata oluştu!", "error").then((e) => {
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                });
            });
    });

    $("#despatches tbody").on("click", "#status-label", function () {
        let data = despatch_table.row($(this).parents("tr")).data();
        if (data.status_code != 200) {
            let error_detail = "";
            error_detail = JSON.parse(data.status_desc).detail?.data[0]?.message
                ? JSON.parse(data.status_desc).detail.data[0]?.message
                : JSON.parse(data.status_desc).detail
                ? JSON.parse(data.status_desc).detail
                : JSON.parse(data.status_desc).description
                ? JSON.parse(data.status_desc).description
                : JSON.parse(data.status_desc);
            Swal.fire({
                icon: "info",
                title: "Detay",
                text: `${error_detail}`,
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: "Tamam",
            });
        }
    });

    function ajaxThrottle(opts) {
        let ajaxReqs = 0;
        const ajaxQueue = [];
        let ajaxActive = 0;
        let cancelled = false;
        let anyFailed = false;
        opts = Object.assign({ limit: 3 }, opts);

        for (const obj of opts.requests) {
            ajaxReqs++;
            const oldSuccess = obj.success;
            const oldError = obj.error;
            const callback = function () {
                if (cancelled) return;
                if (anyFailed) return;
                if (opts.cancellationToken()) {
                    ajaxReqs = 0;
                    ajaxQueue.length = 0;
                    cancelled = true;
                    if (opts.onCancelled) opts.onCancelled();
                    return;
                }
                ajaxReqs--;
                if (ajaxActive === opts.limit) {
                    $.ajax(ajaxQueue.shift());
                } else {
                    ajaxActive--;
                }
                if (ajaxReqs === 0) {
                    if (opts.onAllSettled) opts.onAllSettled();
                }
            };
            obj.success = function (resp, xhr, status) {
                callback();
                if (oldSuccess) oldSuccess(resp, xhr, status);
            };
            obj.error = function (xhr, status, error) {
                callback();
                if (oldError) oldError(xhr, status, error);
                // anyFailed = true
                // ajaxReqs = 0;
                // ajaxQueue.length = 0;
                if (opts.onAnyFailed) opts.onAnyFailed();
            };
            if (ajaxActive === opts.limit) {
                ajaxQueue.push(obj);
            } else {
                ajaxActive++;
                $.ajax(obj);
            }
        }
    }
});
