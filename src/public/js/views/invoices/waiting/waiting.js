let detail_loading, einvoice_serie_options, earchive_serie_options;
$(document).ready(function () {
    const invoice_table = $("#invoices").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/invoices/waiting",
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
                });
            },
        },
        columns: [
            { data: "id" },
            { data: "erp_no" },
            { data: "receiver_name" },
            { data: "receiver_tax" },
            { data: "invoice_date" },
            { data: "invoice_payable" },
            { data: "currency_code" },
            { data: "invoice_profile" },
            { data: "invoice_type" },
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
                orderable: false,
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
                    return `
                    <span class="badge bg-label-${color} d-block mb-1">${types_array[0]}</span>
                    <span class="badge bg-label-secondary d-block mb-1"><b class="text-dark"><i class="fa-solid fa-hashtag"></i> ${data}</b></span>`;
                },
            },
            {
                targets: 2,
                render: (data, type, row) => {
                    return `${
                        String(data).length > 25
                            ? String(data).substring(0, 25) + "..."
                            : String(data)
                    }<br>${row["receiver_tax"]}`;
                },
            },
            {
                targets: 4,
                orderable: false,
                render: (data, type, row) => {
                    return `${data}<br>${Number(row["invoice_payable"]).toFixed(
                        2
                    )} ${row["currency_code"]}`;
                },
            },
            {
                targets: 7,
                orderable: false,
                render: (data, types, row) => {
                    let profile = "";
                    let type = "";
                    switch (data) {
                        case "TICARIFATURA":
                            profile = "success";
                            break;
                        case "TEMELFATURA":
                            profile = "info";
                            break;
                        case "EARSIVFATURA":
                            profile = "warning";
                            break;
                        default:
                            profile = "secondary";
                            break;
                    }
                    switch (row["invoice_type"]) {
                        case "SATIS":
                            type = "warning";
                            break;
                        case "IADE":
                            type = "info";
                            break;
                        case "ISTISNA":
                            type = "primary";
                            break;
                        default:
                            type = "secondary";
                            break;
                    }
                    return `
                    <span class="badge bg-${profile} bg-glow d-block">${data}</span>
                    <span class="badge bg-label-${type} d-block mt-1">${row["invoice_type"]}</span>`;
                },
            },
            {
                targets: 9,
                className: "dt-right",
                width: "10px",
                orderable: false,
                render: (data, type, row) => {
                    let barcode_button = "";
                    try {
                        if (
                            row.notes.filter((note) =>
                                note?.Note?.includes("KargoKodu")
                            ).length ||
                            row.notes.filter((note) =>
                                note?.Note?.includes("Barkod")
                            ).length
                        ) {
                            barcode_button = `<li><a id="show-barcode" class="dropdown-item" href="#">
                                                <i class="fa-solid fa-barcode fa-sm me-2"></i>Barkod Etiketi Görüntüle </a>
                                            </li>`;
                        }
                    } catch (error) {}
                    
                    let refresh_button = "";
                    if (row.erp_type.split(":")[1] == "rahatLocalApp") {
                        refresh_button = `<li><a id="refresh-local-inv" class="dropdown-item" href="#">
                                            <i class="fa-solid fa-retweet fa-sm me-2"></i>Sıfırla/Yenile </a>
                                        </li>`;
                    }
                    let edit_button = "";
                    if (row.invoice_profile === "IHRACAT") {
                        edit_button = `<li><a id="edit-invoice" href="/create/invoice/export?key=${row.id}" class="dropdown-item" href="#">
                                            <i class="fa-regular fa-pen-to-square fa-sm me-2"></i>Düzenle</a>
                                        </li>`;
                    } else {
                        edit_button = `<li><a id="edit-invoice" href="/create/invoice?key=${row.id}" class="dropdown-item" href="#">
                                            <i class="fa-regular fa-pen-to-square fa-sm me-2"></i>Düzenle</a>
                                        </li>`;
                    }
                    return `<div class="btn-group" role="group">
                                <button type="button" class="btn btn-icon btn-label-warning waves-effect" 
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" style="">
                                    ${barcode_button}
                                    ${edit_button}
                                    ${refresh_button}
                                    <li><a id="mark-sended" class="dropdown-item" href="#">
                                        <i class="fa-regular fa-square-check fa-sm me-2"></i>Gönderilmiş İşaretle</a>
                                    </li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li><a id="xml-download" class="dropdown-item" href="#">
                                    <i class="fa-regular fa-file-code fa-sm me-2"></i>XML İndir</a>
                                    </li>
                                </ul>
                                <button id="preview-invoice" type="button" class="btn  btn-icon btn-info waves-effect waves-light preview-button">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                </button>
                                ${
                                    permissions.documents.send_with_serie
                                        ? `<button id="send-invoice-with-serie" type="button" class="btn btn-icon btn-success waves-effect waves-light">
                                                <i class="fa-solid fa-paper-plane"></i>
                                            </button>`
                                        : `<button id="send-invoice" type="button" class="btn btn-icon btn-success waves-effect waves-light">
                                                <i class="fa-solid fa-paper-plane"></i>
                                            </button>`
                                }
                            </div>`;
                },
            },
            {
                targets: [3, 5, 6, 8],
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
    $("#invoices").on("processing.dt", function (e, settings, processing) {
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
        invoice_table.draw();
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

    let invoiceTime = $("#invoice-time").flatpickr({
        locale: "tr",
        dateFormat: "H:i:S",
        enableTime: true,
        noCalendar: true,
        enableSeconds: true,
    });

    $("#invoice-profile").select2({
        placeholder: "Fatura profili seçimi...",
        dropdownParent: $("#invoice-profile").parent(),
        width: "resolve",
        allowClear: true,
        language: "tr",
        data: [
            {
                id: "TICARIFATURA",
                text: "Ticari Fatura",
            },
            {
                id: "TEMELFATURA",
                text: "Temel Fatura",
            },
            {
                id: "EARSIVFATURA",
                text: "e-Arşiv Faturası",
            },
        ],
    });
    $("#invoice-type")
        .select2({
            placeholder: "Fatura tipi seçimi...",
            dropdownParent: $("#invoice-type").parent(),
            width: "resolve",
            allowClear: true,
            language: "tr",
            data: [
                {
                    id: "SATIS",
                    text: "Satış Faturası",
                },
                {
                    id: "IADE",
                    text: "İade Faturası",
                },
                {
                    id: "ISTISNA",
                    text: "İstisna Faturası",
                },
            ],
        })
        .change((e) => {
            let type = $("#invoice-type").val();
            if (type == "ISTISNA") {
                $("#exemption-div").slideDown(250);
            } else {
                $("#exemption-div").slideUp(250);
            }
        });

    $("#invoice-exemption-code").select2({
        placeholder: "İstisna kodu seçimi...",
        dropdownParent: $("#invoice-exemption-code").parent(),
        width: "resolve",
        allowClear: true,
        language: "tr",
        minimumResultsForSearch: Infinity,
        ajax: {
            url: "/invoices/waiting/exemptions/istisna",
            dataType: "json",
        },
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

    $("#invoices tbody").on("click", "#preview-invoice", function (e) {
        $(e.currentTarget).html(
            `<span class="spinner-grow text-white" role="status" aria-hidden="true"></span>`
        );
        $(".preview-button").attr("disabled", true);

        let data = invoice_table.row($(this).parents("tr")).data();
        $("#invoiceFrame").attr("src", "");
        let xml;
        let xslt;
        $.when(
            $.ajax({
                // First Request
                url: `/invoices/waiting/${data.id}/xml`,
                type: "get",
                success: function (xmls) {
                    xml = xmls;
                },
            }),
            $.ajax({
                // First Request
                url: `/invoices/waiting/${data.id}/xslt`,
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
                    $("#invoiceFrame").attr("src", URL.createObjectURL(blob));
                    $("#preview-invoice-modal").modal("show");
                    detail_loading = true;
                    invoice_table.ajax.reload(null, false);
                } catch (error) {
                    console.error(error);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    });

    $("#invoices tbody").on("click", "#show-barcode", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        $("#barcodeFrame").attr("src", "");
        $.ajax({
            type: "GET",
            url: `/invoices/waiting/${data.id}/barcode`,
            success: function (response) {
                console.log(response);
                var blob = new Blob([response], {
                    type: "text/html;charset=UTF-8",
                });
                console.log(blob, URL.createObjectURL(blob));
                $("#barcodeFrame").attr("src", URL.createObjectURL(blob));
            },
        });
        // $("#barcodeFrame").attr("src", URL.createObjectURL(blob));
        $("#barcode-etiket-modal").modal("show");
    });

    $("#invoices tbody").on("click", "#xml-download", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        $.ajax({
            url: `/invoices/waiting/${data.id}/xml`,
            type: "get",
            success: function (xmls) {
                var blob = new Blob(
                    [
                        typeof xmls == "string"
                            ? xmls
                            : new XMLSerializer().serializeToString(xmls),
                    ],
                    { type: "text/xml" }
                );
                saveAs(blob, `${data.erp_no}-${data.receiver_name}.xml`);
            },
        });
    });

    $("#invoices tbody").on("click", "#refresh-local-inv", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `Burada yapılan tüm değişiklikler kaybolacak ve ${
                data.erp_type.split(":")[0]
            } uygulamasındaki haline getirilicektir!!`,
            text: `${data.erp_no} numaralı faturayı yenilemek istediğinize emin misiniz? `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "patch",
                    url: `/invoices/waiting/${data.id}`,
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
                    Swal.fire({
                        title: `1 dakika içerisinde yenilenecektir!`,
                        text: `Yenileme bildirimi başarılı! 1 dakika içerisinde fatura yenilecektir!`,
                        icon: "success",
                    });
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                }
            })
            .catch((err) => {
                Swal.fire("Hata!!", "Bir hata oluştu!", "error").then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                });
            });
    });

    $("#invoices tbody").on("click", "#mark-sended", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `${data.erp_no} numaralı faturayı gönderildi olarak işaretlemek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "put",
                    url: `/invoices/waiting/${data.id}/mark/send`,
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
                        `Başarıyla gönderildi işaretlendi!`,
                        "Başarılı",
                        {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        }
                    );
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                }
            })
            .catch((err) => {
                Swal.fire("Hata!!", "Bir hata oluştu!", "error").then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                });
            });
    });

    $("#iframe-print").on("click", function () {
        let myIframe = document.getElementById("invoiceFrame").contentWindow;
        myIframe.focus();
        myIframe.print();

        return false;
    });

    $("#iframe-barcode-print").on("click", function () {
        let myIframe = document.getElementById("barcodeFrame").contentWindow;
        myIframe.focus();
        myIframe.print();

        return false;
    });

    $("#invoices tbody").on("click", "#send-invoice", function () {
        let data = invoice_table.row($(this).parents("tr")).data();
        sendSingleSelected(data);
    });

    $("#invoices tbody").on("click", "#send-invoice-with-serie", function () {
        let data = invoice_table.row($(this).parents("tr")).data();
        sendSingleWithSerie(data);
    });

    $("#coll-mark-sended").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        if (clicked.length < 2) {
            toastr["error"](`En az 2 adet fatura seçmelisiniz!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        Swal.fire({
            icon: "question",
            title: "Emin misiniz?",
            text: `${clicked.length} adet faturayı gönderildi olarak işaretlemek istediğinize emin misiniz?`,
            showConfirmButton: true,
            confirmButtonText: "Evet, işaretle",
            showCancelButton: true,
            cancelButtonText: "Hayır, işaretleme",
            confirmButtonColor: "#59c9a5",
            cancelButtonColor: "#f67e7d",
        }).then((result) => {
            if (result.isConfirmed) {
                let cancelled = false;
                const requests = [];
                Swal.fire({
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    showDenyButton: false,
                    showCancelButton: true,
                    cancelButtonText: "Durdur",
                    html: `
                            <h4>Faturalar işaretleniyor...</h4>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-success">Başarılı : <b id="success-counter">0</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-danger">Hatalı : <b id="error-counter">0</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-secondary">Kalan : <b id="last-counter">${clicked.length}</b></p>
                            </blockquote>
                            <br>
                            <div class="progress">
                                <div id="progress-sending-selected" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            `,
                }).then((e) => {
                    if (e.dismiss === "cancel") {
                        cancelled = true;
                    } else {
                        console.log(e);
                    }
                });
                let counter = 0;
                let errored = 0;
                let successed = 0;
                let total = clicked.length;
                let error_list = "";
                clicked.each((id) => {
                    requests.push({
                        type: "put",
                        url: `/invoices/waiting/${id}/mark/send`,
                        success: (success) => {
                            successed++;
                            $("#success-counter").text(
                                Number($("#success-counter").text()) + 1
                            );
                        },
                        error: (error) => {
                            errored++;
                            let error_detail = "";
                            try {
                                error_detail = error.responseJSON?.data.map(
                                    (err) => {
                                        return `${err.message} <br>`;
                                    }
                                );
                            } catch (terror) {
                                error_detail = error.responseJSON?.data
                                    ? error.responseJSON?.data
                                    : error.responseJSON;
                            }
                            error_list += `<tr><td>${id}</td><td>${JSON.stringify(
                                error_detail
                            )}</td></tr>`;
                            $("#error-counter").text(
                                Number($("#error-counter").text()) + 1
                            );
                        },
                        complete: () => {
                            counter++;
                            $("#last-counter").text(requests.length - counter);
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter) / requests.length + "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter) / requests.length
                                );
                        },
                    });
                });
                ajaxThrottle({
                    requests: requests,
                    limit: 1,
                    cancellationToken: () => cancelled,
                    onAllSettled: () => {
                        Swal.fire({
                            showConfirmButton: true,
                            showDenyButton: errored ? true : false,
                            showCancelButton: false,
                            confirmButtonText: "Tamam",
                            denyButtonText: errored ? "Hata Detayları" : "",
                            html: `
                                    <h4>Gönderim tamamlandı!</h4>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${
                                            counter + 1
                                        }</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                                    </blockquote>
                                    `,
                        }).then((e) => {
                            invoice_table.columns().checkboxes.deselect(true);
                            invoice_table.draw();
                            if (e.isDenied) {
                                Swal.fire({
                                    html: `
                                        <table style="width:100%" class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style="width:20%">ID</th>
                                                    <th>Hata</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-border-bottom-0">
                                                ${error_list}
                                            </tbody>
                                        </table>`,
                                    showConfirmButton: true,
                                    width: "45em",
                                    showCancelButton: false,
                                    confirmButtonText: "Tamam",
                                });
                            }
                        });
                    },
                    onAnyFailed: () => {},
                    onCancelled: () => {
                        Swal.fire({
                            showConfirmButton: true,
                            showDenyButton: errored ? true : false,
                            showCancelButton: false,
                            confirmButtonText: "Tamam",
                            denyButtonText: errored ? "Hata Detayları" : "",
                            html: `
                                    <h4>İşlem İptal Edildi!</h4>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${
                                            counter + 1
                                        }</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                                    </blockquote>
                                    `,
                        }).then((e) => {
                            invoice_table.columns().checkboxes.deselect(true);
                            invoice_table.draw();
                            if (e.isDenied) {
                                Swal.fire({
                                    html: `
                                        <table style="width:100%" class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style="width:20%">ID</th>
                                                    <th>Hata</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-border-bottom-0">
                                                ${error_list}
                                            </tbody>
                                        </table>`,
                                    showConfirmButton: true,
                                    width: "45em",
                                    showCancelButton: false,
                                    confirmButtonText: "Tamam",
                                });
                            }
                        });
                    },
                });
            }
        });
    });

    $("#send-selected").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        if (!clicked.length) {
            toastr["error"](`En az 1 adet fatura seçmelisiniz!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        if (clicked.length > 1) {
            Swal.fire({
                icon: "question",
                html: `<h4>Seçilen <b>${clicked.length}</b> adet faturayı göndermek istediğinize emin misiniz?</h4>
                        <div class="form-check form-check-primary mt-3">
                            <input class="form-check-input" type="checkbox" id="oto-print">
                            <label class="form-check-label" for="oto-print">Otomatik Yazdır</label>
                        </div>
                        <div class="form-check form-check-primary mt-3">
                            <input class="form-check-input" type="checkbox" id="oto-pdf">
                            <label class="form-check-label" for="oto-pdf">Otomatik PDF İndir</label>
                        </div>`,
                preConfirm: () => {
                    return {
                        oto_print: $("#oto-print").is(":checked"),
                        oto_pdf: $("#oto-pdf").is(":checked"),
                    };
                },
                showConfirmButton: true,
                confirmButtonText: "Evet, gönder",
                showCancelButton: true,
                cancelButtonText: "Hayır, gönderme",
                confirmButtonColor: "#59c9a5",
                cancelButtonColor: "#f67e7d",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let { oto_print, oto_pdf } = result.value;
                    sendMultipleSelected(clicked, oto_print, oto_pdf);
                }
            });
        } else {
            sendSingleSelected(clicked[0]);
        }
    });

    $("#add-from-excel-button").click((e) => {
        let excel = document.getElementById("invoice-excel-file").files[0];
        if (!excel) {
            toastr["error"](`Excel yüklenmesi zorunludur!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        $("#add-from-excel-modal").modal("hide");
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            let data = e.target.result;
            let workbook = XLSX.read(data, {
                type: "binary",
            });
            workbook.SheetNames.forEach(async (sheet) => {
                let datas = XLSX.utils.sheet_to_row_object_array(
                    workbook.Sheets[sheet]
                );
                let invoicesArray = [];
                let invoiceData = {};
                for (let i = 0; i < datas.length; i++) {
                    if (datas[i - 1]) {
                        if (
                            invoiceData.document.IssueDateTime ==
                                calculatExcelDate(datas[i].FaturaTarihi) &&
                            invoiceData.document.Type == datas[i].FaturaTip &&
                            invoiceData.document.Customer.TaxNumber ==
                                String(datas[i].VKNTCKN) &&
                            invoiceData.document.Customer.TaxOffice ==
                                datas[i].VergiDairesi &&
                            invoiceData.document.Customer.Name ==
                                datas[i].Unvan &&
                            invoiceData.document.Customer.Address ==
                                datas[i].Adres &&
                            invoiceData.document.Customer.District ==
                                datas[i].Ilce &&
                            invoiceData.document.Customer.City ==
                                datas[i].Sehir &&
                            invoiceData.document.Customer.Phone ==
                                datas[i].TelCep &&
                            invoiceData.document.Customer.Mail == datas[i].Mail
                        ) {
                            let allowance = {};
                            if (datas[i].IskontoOrani) {
                                allowance = {
                                    Allowance: {
                                        Percent: Number(datas[i].IskontoOrani),
                                    },
                                };
                            }
                            let withholding = {};
                            if (datas[i].KDVTevkifatKodu) {
                                withholding = {
                                    WithholdingTax: {
                                        Code: Number(datas[i].KDVTevkifatKodu),
                                    },
                                };
                            }
                            invoiceData.document.Lines.push({
                                Name: datas[i].UrunAdi,
                                Quantity: Number(datas[i].Miktar),
                                UnitCode: datas[i].Birim,
                                Price: Number(datas[i].BirimFiyat),
                                KDV: {
                                    Percent: Number(datas[i].KDVOrani),
                                },
                                ...allowance,
                                ...withholding,
                            });
                            if (i == datas.length - 1) {
                                invoicesArray.push(invoiceData);
                                invoiceData = {};
                            }
                        } else {
                            invoicesArray.push(invoiceData);
                            invoiceData = {};
                            let allowance = {};
                            if (datas[i].IskontoOrani) {
                                allowance = {
                                    Allowance: {
                                        Percent: Number(datas[i].IskontoOrani),
                                    },
                                };
                            }
                            let withholding = {};
                            if (datas[i].KDVTevkifatKodu) {
                                withholding = {
                                    WithholdingTax: {
                                        Code: Number(datas[i].KDVTevkifatKodu),
                                    },
                                };
                            }
                            let exemptionCode = {};
                            if (datas[i].KDVIstisnaKodu) {
                                exemptionCode = {
                                    TaxExemptions: {
                                        KDV: datas[i].KDVIstisnaKodu,
                                    },
                                };
                            }
                            let paymentMeans = {};
                            if (datas[i].VadeTarihi) {
                                paymentMeans = {
                                    PaymentMeans: {
                                        MeansCode: 1,
                                        ChannelCode: "ZZZ",
                                        DueDate: `${moment(
                                            excelDateToJSDate(
                                                datas[i].VadeTarihi
                                            )
                                        ).format("YYYY-MM-DD")}`,
                                        AccountNumber: "0",
                                    },
                                };
                            }
                            invoiceData = {
                                document: {
                                    External: {
                                        ID: uuidv4(),
                                        RefNo: uuidv4().substring(0, 8),
                                        Type: "Excel",
                                    },
                                    IssueDateTime: calculatExcelDate(
                                        datas[i].FaturaTarihi
                                    ),
                                    Type: datas[i].FaturaTip,
                                    Notes: [
                                        { Note: datas[i].Not1 },
                                        { Note: datas[i].Not2 },
                                        {
                                            Note: datas[i].SubeAdi
                                                ? `Şube Adı : ${datas[i].SubeAdi}`
                                                : "",
                                        },
                                    ],
                                    Customer: {
                                        TaxNumber: String(datas[i].VKNTCKN),
                                        TaxOffice: datas[i].VergiDairesi,
                                        Name: datas[i].Unvan,
                                        Address: datas[i].Adres,
                                        District: datas[i].Ilce,
                                        City: datas[i].Sehir,
                                        Country: "Türkiye",
                                        PostalCode: null,
                                        Phone: datas[i].TelCep,
                                        Mail: datas[i].Mail,
                                    },
                                    ...paymentMeans,
                                    ...exemptionCode,
                                    Lines: [
                                        {
                                            Name: datas[i].UrunAdi,
                                            Quantity: Number(datas[i].Miktar),
                                            UnitCode: datas[i].Birim,
                                            Price: Number(datas[i].BirimFiyat),
                                            KDV: {
                                                Percent: Number(
                                                    datas[i].KDVOrani
                                                ),
                                            },
                                            ...allowance,
                                            ...withholding,
                                        },
                                    ],
                                },
                            };
                            if (i == datas.length - 1) {
                                invoicesArray.push(invoiceData);
                                invoiceData = {};
                            }
                        }
                    } else {
                        let allowance = {};
                        if (datas[i].IskontoOrani) {
                            allowance = {
                                Allowance: {
                                    Percent: Number(datas[i].IskontoOrani),
                                },
                            };
                        }
                        let withholding = {};
                        if (datas[i].KDVTevkifatKodu) {
                            withholding = {
                                WithholdingTax: {
                                    Code: Number(datas[i].KDVTevkifatKodu),
                                },
                            };
                        }
                        let exemptionCode = {};
                        if (datas[i].KDVIstisnaKodu) {
                            exemptionCode = {
                                TaxExemptions: {
                                    KDV: datas[i].KDVIstisnaKodu,
                                },
                            };
                        }
                        let paymentMeans = {};
                        if (datas[i].VadeTarihi) {
                            paymentMeans = {
                                PaymentMeans: {
                                    MeansCode: 1,
                                    ChannelCode: "ZZZ",
                                    DueDate: `${moment(
                                        excelDateToJSDate(datas[i].VadeTarihi)
                                    ).format("YYYY-MM-DD")}`,
                                    AccountNumber: "0",
                                },
                            };
                        }
                        invoiceData = {
                            document: {
                                External: {
                                    ID: uuidv4(),
                                    RefNo: uuidv4().substring(0, 8),
                                    Type: "Excel",
                                },
                                IssueDateTime: calculatExcelDate(
                                    datas[i].FaturaTarihi
                                ),
                                Type: datas[i].FaturaTip,
                                Notes: [
                                    { Note: datas[i].Not1 },
                                    { Note: datas[i].Not2 },
                                    {
                                        Note: datas[i].SubeAdi
                                            ? `Şube Adı : ${datas[i].SubeAdi}`
                                            : "",
                                    },
                                ],
                                Customer: {
                                    TaxNumber: String(datas[i].VKNTCKN),
                                    TaxOffice: datas[i].VergiDairesi,
                                    Name: datas[i].Unvan,
                                    Address: datas[i].Adres,
                                    District: datas[i].Ilce,
                                    City: datas[i].Sehir,
                                    Country: "Türkiye",
                                    PostalCode: null,
                                    Phone: datas[i].TelCep,
                                    Mail: datas[i].Mail,
                                },
                                ...paymentMeans,
                                ...exemptionCode,
                                Lines: [
                                    {
                                        Name: datas[i].UrunAdi,
                                        Quantity: Number(datas[i].Miktar),
                                        UnitCode: datas[i].Birim,
                                        Price: Number(datas[i].BirimFiyat),
                                        KDV: {
                                            Percent: Number(datas[i].KDVOrani),
                                        },
                                        ...allowance,
                                        ...withholding,
                                    },
                                ],
                            },
                        };
                        if (i == datas.length - 1) {
                            invoicesArray.push(invoiceData);
                            invoiceData = {};
                        }
                    }
                }
                addInvoicesFromExcel(invoicesArray);
            });
        };
        fileReader.readAsBinaryString(excel);
    });

    const sendMultipleSelected = async (clicked, oto_print, oto_pdf) => {
        let cancelled = false;
        const requests = [];
        Swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            showConfirmButton: false,
            showDenyButton: false,
            showCancelButton: true,
            cancelButtonText: "Durdur",
            html: `
                    <h4>Faturalar gönderiliyor...</h4>
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">0</b></p>
                    </blockquote>
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">0</b></p>
                    </blockquote>
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0 text-secondary">Kalan : <b id="last-counter">${clicked.length}</b></p>
                    </blockquote>
                    <br>
                    <div class="progress">
                        <div id="progress-sending-selected" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    `,
        }).then((e) => {
            if (e.dismiss === "cancel") {
                cancelled = true;
            } else {
                console.log(e);
            }
        });
        let counter = 0;
        let errored = 0;
        let successed = 0;
        let success_list = [];
        let total = clicked.length;
        let error_list = "";
        clicked.each((id) => {
            requests.push({
                type: "POST",
                url: "/invoices/waiting/" + id,
                success: (success) => {
                    success_list.push(id);
                    successed++;
                    $("#success-counter").text(
                        Number($("#success-counter").text()) + 1
                    );
                },
                error: (error) => {
                    errored++;
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
                    error_list += `<tr><td>${id}</td><td>${JSON.stringify(
                        error_detail
                    )}</td></tr>`;
                    $("#error-counter").text(
                        Number($("#error-counter").text()) + 1
                    );
                },
                complete: () => {
                    counter++;
                    $("#last-counter").text(requests.length - counter);
                    $("#progress-sending-selected")
                        .css("width", (100 * counter) / requests.length + "%")
                        .attr(
                            "aria-valuenow",
                            (100 * counter) / requests.length
                        );
                },
            });
        });
        ajaxThrottle({
            requests: requests,
            limit: 1,
            cancellationToken: () => cancelled,
            onAllSettled: async () => {
                if (oto_pdf || oto_print) {
                    counter--;
                    Swal.fire({
                        showConfirmButton: false,
                        showDenyButton: false,
                        showCancelButton: false,
                        html: `<div class="spinner-border text-primary" role="status">
                                    <span class="sr-only">Loading...</span>
                                </div>
                                <h4 class="mt-3">PDF'ler oluşturuluyor...</h4>`,
                    });
                    await printOrPdf(success_list, oto_print, oto_pdf);
                }
                Swal.fire({
                    showConfirmButton: true,
                    showDenyButton: errored ? true : false,
                    showCancelButton: false,
                    confirmButtonText: "Tamam",
                    denyButtonText: errored ? "Hata Detayları" : "",
                    html: `
                            <h4>Gönderim tamamlandı!</h4>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${
                                    counter + 1
                                }</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                            </blockquote>
                            `,
                }).then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                    if (e.isDenied) {
                        Swal.fire({
                            html: `
                                <table style="width:100%" class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th style="width:20%">ID</th>
                                            <th>Hata</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table-border-bottom-0">
                                        ${error_list}
                                    </tbody>
                                </table>`,
                            showConfirmButton: true,
                            width: "45em",
                            showCancelButton: false,
                            confirmButtonText: "Tamam",
                        });
                    }
                });
            },
            onAnyFailed: () => {},
            onCancelled: () => {
                Swal.fire({
                    showConfirmButton: true,
                    showDenyButton: errored ? true : false,
                    showCancelButton: false,
                    confirmButtonText: "Tamam",
                    denyButtonText: errored ? "Hata Detayları" : "",
                    html: `
                            <h4>İşlem İptal Edildi!</h4>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${
                                    counter + 1
                                }</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                            </blockquote>
                            `,
                }).then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                    if (e.isDenied) {
                        Swal.fire({
                            html: `
                                <table style="width:100%" class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th style="width:20%">ID</th>
                                            <th>Hata</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table-border-bottom-0">
                                        ${error_list}
                                    </tbody>
                                </table>`,
                            showConfirmButton: true,
                            width: "45em",
                            showCancelButton: false,
                            confirmButtonText: "Tamam",
                        });
                    }
                });
            },
        });
    };

    const sendSingleSelected = (data) => {
        Swal.fire({
            title: `${
                data.erp_no ? data.erp_no + " numaralı" : "Seçili"
            } faturayı göndermek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "POST",
                    url: `/invoices/waiting/${data.id ? data.id : data}`,
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
                    Swal.fire({
                        title: "Başarılı!",
                        text: "Faturanız başarıyla gönderildi!",
                        icon: "success",
                    }).then((e) => {
                        invoice_table.columns().checkboxes.deselect(true);
                        invoice_table.draw();
                    });
                }
            })
            .catch((err) => {
                let error_detail = "";
                try {
                    error_detail = err.responseJSON.data.map((error) => {
                        return `${error.message} <br>`;
                    });
                } catch (error) {
                    error_detail = err.responseJSON?.data
                        ? err.responseJSON?.data
                        : err.responseJSON;
                }
                Swal.fire(
                    "Hata!!",
                    "" + JSON.stringify(error_detail),
                    "error"
                ).then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                });
            });
    };

    const sendSingleWithSerie = (data) => {
        Swal.fire({
            html: `
                <h2>Seri seçiniz!</h2>
                <div class="mb-3">
                    <label for="serie-select" class="form-label">Fatura Serisi</label>
                        <select id="serie-select" class="form-select">
                            ${
                                data.invoice_profile == "EARSIVFATURA"
                                    ? earchive_serie_options
                                    : einvoice_serie_options
                            }
                        </select>
                </div>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Gönder`,
            cancelButtonText: `İptal`,
            preConfirm: () => {
                if (!$("#serie-select").val()) {
                    Swal.showValidationMessage("Seri seçimi zorunludur!");
                } else {
                    return $.ajax({
                        type: "POST",
                        url: `/invoices/waiting/${
                            data.id ? data.id : data
                        }?serie=${$("#serie-select").val()}`,
                        success: function (response) {
                            return true;
                        },
                    });
                }
            },
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
        })
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Başarılı!",
                        text: "Faturanız başarıyla gönderildi!",
                        icon: "success",
                    }).then((e) => {
                        invoice_table.columns().checkboxes.deselect(true);
                        invoice_table.draw();
                    });
                }
            })
            .catch((err) => {
                let error_detail = "";
                try {
                    error_detail = err.responseJSON.data.map((error) => {
                        return `${error.message} <br>`;
                    });
                } catch (error) {
                    error_detail = err.responseJSON?.data
                        ? err.responseJSON?.data
                        : err.responseJSON;
                }
                Swal.fire(
                    "Hata!!",
                    "" + JSON.stringify(error_detail),
                    "error"
                ).then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                });
            });
    };

    const addInvoicesFromExcel = (clicked) => {
        let cancelled = false;
        const requests = [];
        Swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            showConfirmButton: false,
            showDenyButton: false,
            showCancelButton: true,
            cancelButtonText: "Durdur",
            html: `
                    <h4>Faturalar yükleniyor...</h4>
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">0</b></p>
                    </blockquote>
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">0</b></p>
                    </blockquote>
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0 text-secondary">Kalan : <b id="last-counter">${clicked.length}</b></p>
                    </blockquote>
                    <br>
                    <div class="progress">
                        <div id="progress-sending-selected" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    `,
        }).then((e) => {
            if (e.dismiss === "cancel") {
                cancelled = true;
            } else {
                console.log(e);
            }
        });
        let counter = 0;
        let errored = 0;
        let successed = 0;
        let total = clicked.length;
        let error_list = "";
        let result_jsons = [];
        clicked.forEach((id) => {
            requests.push({
                type: "POST",
                url: "/invoices/waiting",
                headers: {
                    "Content-type": "application/json",
                },
                data: JSON.stringify(id),
                success: (success) => {
                    result_jsons.push({
                        Durum: "Başarılı",
                        Detay: success,
                    });
                    successed++;
                    $("#success-counter").text(
                        Number($("#success-counter").text()) + 1
                    );
                },
                error: (error) => {
                    errored++;
                    result_jsons.push({
                        Durum: "Hatalı",
                        Detay: error,
                    });
                    $("#error-counter").text(
                        Number($("#error-counter").text()) + 1
                    );
                },
                complete: () => {
                    counter++;
                    $("#last-counter").text(requests.length - counter);
                    $("#progress-sending-selected")
                        .css("width", (100 * counter) / requests.length + "%")
                        .attr(
                            "aria-valuenow",
                            (100 * counter) / requests.length
                        );
                },
            });
        });
        ajaxThrottle({
            requests: requests,
            limit: 1,
            cancellationToken: () => cancelled,
            onAllSettled: () => {
                Swal.fire({
                    showConfirmButton: true,
                    showDenyButton: errored ? true : false,
                    showCancelButton: false,
                    confirmButtonText: "Tamam",
                    denyButtonText: errored ? "Hata Detayları" : "",
                    html: `
                            <h4>Yükleme tamamlandı!</h4>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${
                                    counter + 1
                                }</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                            </blockquote>
                            `,
                }).then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                });
            },
            onAnyFailed: () => {},
            onCancelled: () => {
                Swal.fire({
                    showConfirmButton: true,
                    showDenyButton: errored ? true : false,
                    showCancelButton: false,
                    confirmButtonText: "Tamam",
                    denyButtonText: errored ? "Hata Detayları" : "",
                    html: `
                            <h4>İşlem İptal Edildi!</h4>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${
                                    counter + 1
                                }</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                            </blockquote>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                            </blockquote>
                            `,
                }).then((e) => {
                    invoice_table.columns().checkboxes.deselect(true);
                    invoice_table.draw();
                    if (e.isDenied) {
                    }
                });
            },
        });
    };

    const printOrPdf = async (clicked, oto_print, oto_pdf) => {
        return new Promise(async (resolve, reject) => {
            try {
                const pdfDoc = await PDFLib.PDFDocument.create();
                if (oto_print || oto_pdf) {
                    let promises = [];
                    clicked.forEach(async (id, index) => {
                        promises.push(async () => {
                            let data = invoice_table
                                .data()
                                .filter((e) => e.id == id)[0];
                            let xml = await $.ajax({
                                type: "GET",
                                url: `/invoices/waiting/${data.id}/xml`,
                            });
                            let xslt = await $.ajax({
                                type: "GET",
                                url: `/invoices/waiting/${data.id}/xslt`,
                            });
                            try {
                                let parser = new DOMParser();
                                let xmlDoc, xslDoc;
                                if (typeof xml == "string") {
                                    xmlDoc = parser.parseFromString(
                                        xml,
                                        "application/xml"
                                    );
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
                                let result =
                                    processor.transformToDocument(xmlDoc);
                                let blob = new Blob(
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
                                let blobUrl = URL.createObjectURL(blob);
                                let res = await fetch(blobUrl);
                                let html = await res.text();
                                let worker = html2pdf();
                                await worker.set({
                                    margin: 0.2,
                                    filename: `${data.id}.pdf`,
                                    html2canvas: {
                                        width: 800,
                                        logging: false,
                                    },
                                    jsPDF: {
                                        unit: "in",
                                        format: "a4",
                                        orientation: "portrait",
                                    },
                                });
                                await worker.from(html);
                                let arrayBuffer = await worker.output(
                                    "arraybuffer"
                                );
                                const donorPdfDoc =
                                    await PDFLib.PDFDocument.load(arrayBuffer);
                                const docLength = donorPdfDoc.getPageCount();
                                for (var k = 0; k < docLength; k++) {
                                    const [donorPage] = await pdfDoc.copyPages(
                                        donorPdfDoc,
                                        [k]
                                    );
                                    pdfDoc.addPage(donorPage);
                                }
                            } catch (error) {
                                console.error(error);
                            }
                        });
                    });
                    await Promise.all(promises.map((p) => p()));
                }
                if (oto_pdf) {
                    const pdfDataUri = await pdfDoc.saveAsBase64({
                        dataUri: true,
                    });
                    const linkSource1 = pdfDataUri;
                    const downloadLink1 = document.createElement("a");
                    const fileName1 = `${new Date()}.pdf`;
                    downloadLink1.href = linkSource1;
                    downloadLink1.download = fileName1;
                    downloadLink1.click();
                }
                if (oto_print) {
                    printJS({
                        printable: await pdfDoc.saveAsBase64(),
                        type: "pdf",
                        base64: true,
                    });
                }
                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    };

    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        );
    }

    function calculatExcelDate(input) {
        let output = "";
        if (moment(input, "D.M.YYYY").isValid()) {
            output = `${moment(input, "D.M.YYYY").format(
                "YYYY-MM-DD"
            )}T00:00:00`;
        } else if (moment(excelDateToJSDate(input)).isValid()) {
            output = `${moment(excelDateToJSDate(input)).format(
                "YYYY-MM-DD"
            )}T00:00:00`;
        } else {
            output = "error";
        }
        return output;
    }

    function excelDateToJSDate(serial) {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);

        var fractional_day = serial - Math.floor(serial) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        return new Date(
            date_info.getFullYear(),
            date_info.getMonth(),
            date_info.getDate(),
            hours,
            minutes,
            seconds
        );
    }

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

    $.ajax({
        type: "get",
        url: "/definitions/series/1/select",
        success: function (response) {
            einvoice_serie_options = "<option value=''>Seçiniz</option>";
            response.results.forEach((serie) => {
                if (serie.status) {
                    einvoice_serie_options += `<option value="${serie.text}">${serie.text}</option>`;
                }
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/definitions/series/2/select",
        success: function (response) {
            earchive_serie_options = "<option value=''>Seçiniz</option>";
            response.results.forEach((serie) => {
                if (serie.status) {
                    earchive_serie_options += `<option value="${serie.text}">${serie.text}</option>`;
                }
            });
        },
    });
});