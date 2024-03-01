let detail_loading;
$(document).ready(function () {
    const despatch_table = $("#despatches").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/despatches/waiting",
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
            { data: "despatch_date" },
            { data: "status_code" },
            { data: "status_detail" },
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
                    return `${data}`;
                },
            },
            {
                targets: 5,
                orderable: false,
                className: "dt-center",
                render: (data, types, row) => {
                    let status = "";
                    let text = "";
                    let result = "";
                    switch (data) {
                        case 100:
                            status = "bg-label-success";
                            text = `<i class="fa-regular fa-square-check fa-xl"></i>&nbsp;&nbsp;Gönderilebilir!`;
                            result = `<span id="status-label" class="badge ${status} d-block">${text}</span>`;
                            break;
                        case 101:
                            status = "bg-danger bg-glow";
                            if (row.status_detail.detail[0]) {
                                text = `<i class="fa-solid fa-square-xmark fa-xl"></i>&nbsp;&nbsp;&nbsp;${row.status_detail.detail[0]}`;
                                result += `<span id="status-label" class="badge ${status} d-block">${text}</span>`;
                            }
                            if (row.status_detail.detail[1]) {
                                text = `<i class="fa-solid fa-square-xmark fa-xl"></i>&nbsp;&nbsp;&nbsp;${row.status_detail.detail[1]}`;
                                result += `<br><span id="status-label" class="badge ${status} d-block">${text}</span>`;
                            }
                            break;
                        default:
                            status = "bg-warning bg-glow";
                            break;
                    }
                    return result;
                },
            },
            {
                targets: 7,
                className: "dt-right",
                width: "10px",
                orderable: false,
                render: (data, type, row) => {
                    let refresh_button = "";
                    if (row.erp_type.split(":")[1] == "rahatLocalApp") {
                        refresh_button = `<li><a class="dropdown-item" href="#">
                                            <i class="fa-solid fa-retweet fa-sm me-2"></i>Sıfırla/Yenile </a>
                                        </li>`;
                    }
                    return `<div class="btn-group" role="group">
                                <button type="button" class="btn btn-icon btn-label-warning waves-effect" 
                                data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" style="">
                                    <li><a id="edit-despatch" href="/create/despatch?key=${row.id}" class="dropdown-item">
                                        <i class="fa-regular fa-pen-to-square fa-sm me-2"></i>Düzenle</a>
                                    </li>
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
                                <button id="preview-despatch" type="button" class="btn  btn-icon btn-info waves-effect waves-light preview-button">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                </button>
                                <button id="send-despatch" type="button" class="btn btn-icon btn-success waves-effect waves-light">
                                    <i class="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>`;
                },
            },
            {
                targets: [3, 6],
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

    let despatchTime = $("#despatch-time").flatpickr({
        locale: "tr",
        dateFormat: "H:i:S",
        enableTime: true,
        noCalendar: true,
        enableSeconds: true,
    });

    let actualDateTime = $("#despatch-actual-datetime").flatpickr({
        locale: "tr",
        dateFormat: "d.m.Y H:i:S",
        enableTime: true,
        enableSeconds: true,
    });

    $("#despatch-driver").select2({
        placeholder: "Şoför seçimi...",
        dropdownParent: $("#despatch-driver").parent(),
        width: "resolve",
        allowClear: true,
        language: "tr",
        ajax: {
            url: "/definitions/despatches/driver/list.select2",
            dataType: "json",
        },
    });

    $("#despatch-carrier").select2({
        placeholder: "Taşıyıcı firma seçimi...",
        dropdownParent: $("#despatch-carrier").parent(),
        width: "resolve",
        allowClear: true,
        language: "tr",
        ajax: {
            url: "/definitions/despatches/carrier/list.select2",
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

    // $("#despatches tbody").on("click", "#edit-despatch", function (e) {
    //     let data = despatch_table.row($(this).parents("tr")).data();
    //     $("#erp-no-header").text(data.erp_no);
    //     $("#edit-despatch-modal").modal("show");
    //     $.ajax({
    //         // First Request
    //         url: `/despatches/waiting/${data.id}/json`,
    //         type: "get",
    //         success: function (json) {
    //             actualDateTime.setDate(
    //                 json.sys.shipment.delivery.actual,
    //                 "",
    //                 "Y-m-d H:i:S"
    //             );
    //             $("#despatch-edit-id").val(data.id);
    //         },
    //     });
    // });

    $("#edit-despatch-save").on("click", function () {
        let id = $("#despatch-edit-id").val();
        let body = {
            time: $("#despatch-time").val(),
            actual: actualDateTime.formatDate(
                actualDateTime.selectedDates[0],
                "Y-m-dTH:i:S"
            ),
            driver_id: $("#despatch-driver").val(),
            carrier_id: $("#despatch-carrier").val(),
        };
        $.ajax({
            type: "put",
            url: `/despatches/waiting/${id}`,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(body),
            success: function (response) {
                $("#edit-despatch-modal").modal("hide");
                toastr["success"](
                    `İrsaliye başarıyla güncellendi!`,
                    "Başarılı",
                    {
                        closeButton: true,
                        tapToDismiss: false,
                        progressBar: true,
                    }
                );
                $("#erp-no-header").text("");
                $("#despatch-edit-id").val("");
                despatch_table.columns().checkboxes.deselect(true);
                despatch_table.draw();
            },
            error: (err) => {
                Swal.fire("Hata!!", "Bir hata oluştu!", "error").then((e) => {
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                });
            },
        });
    });

    $("#edit-despatch-modal").on("hide.bs.modal", function () {
        $("#erp-no-header").text("");
        $("#despatch-edit-id").val("");
        $("#despatch-driver").val("");
        $("#despatch-carrier").val("");
    });

    $("#despatches tbody").on("click", "#xml-download", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        $.ajax({
            url: `/despatches/waiting/${data.id}/xml`,
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

    $("#despatches tbody").on("click", "#mark-sended", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `${data.erp_no} numaralı irsaliyeyi gönderildi olarak işaretlemek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "put",
                    url: `/despatches/waiting/${data.id}/mark/send`,
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

    $("#iframe-print").on("click", function () {
        let myIframe = document.getElementById("despatchFrame").contentWindow;
        myIframe.focus();
        myIframe.print();

        return false;
    });

    $("#despatches tbody").on("click", "#send-despatch", function () {
        let data = despatch_table.row($(this).parents("tr")).data();
        sendSingleSelected(data);
    });

    $("#coll-mark-sended").click((e) => {
        let clicked = despatch_table.column(0).checkboxes.selected();
        if (clicked.length < 2) {
            toastr["error"](`En az 2 adet irsaliye seçmelisiniz!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        Swal.fire({
            icon: "question",
            title: "Emin misiniz?",
            text: `${clicked.length} adet irsaliyeyi gönderildi olarak işaretlemek istediğinize emin misiniz?`,
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
                            <h4>İrsaliyeler işaretleniyor...</h4>
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
                        url: `/despatches/waiting/${id}/mark/send`,
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
                            despatch_table.columns().checkboxes.deselect(true);
                            despatch_table.draw();
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
                            despatch_table.columns().checkboxes.deselect(true);
                            despatch_table.draw();
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
        let clicked = despatch_table.column(0).checkboxes.selected();
        if (!clicked.length) {
            toastr["error"](`En az 1 adet irsaliye seçmelisiniz!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        if (clicked.length > 1) {
            Swal.fire({
                icon: "question",
                title: "Emin misiniz?",
                text: `${clicked.length} adet irsaliyeyi göndermek istediğinize emin misiniz?`,
                showConfirmButton: true,
                confirmButtonText: "Evet, gönder",
                showCancelButton: true,
                cancelButtonText: "Hayır, gönderme",
                confirmButtonColor: "#59c9a5",
                cancelButtonColor: "#f67e7d",
            }).then((result) => {
                if (result.isConfirmed) {
                    sendMultipleSelected(clicked);
                }
            });
        } else {
            sendSingleSelected(clicked[0]);
        }
    });

    $("#add-from-excel-button").click((e) => {
        let excel = document.getElementById("despatch-excel-file").files[0];
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
                let despatchesArray = [];
                let despatchData = {};
                for (let i = 0; i < datas.length; i++) {
                    if (datas[i - 1]) {
                        if (
                            despatchData.document.IssueDateTime ==
                                calculatExcelDate(datas[i].İrsaliyeTarihi) &&
                            despatchData.document.Type ==
                                datas[i].İrsaliyeTip &&
                            despatchData.document.Customer.TaxNumber ==
                                String(datas[i].VKNTCKN) &&
                            despatchData.document.Customer.TaxOffice ==
                                datas[i].VergiDairesi &&
                            despatchData.document.Customer.Name ==
                                datas[i].Unvan &&
                            despatchData.document.Customer.Address ==
                                datas[i].Adres &&
                            despatchData.document.Customer.District ==
                                datas[i].Ilce &&
                            despatchData.document.Customer.City ==
                                datas[i].Sehir &&
                            despatchData.document.Customer.Phone ==
                                datas[i].TelCep &&
                            despatchData.document.Customer.Mail == datas[i].Mail
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
                            despatchData.document.Lines.push({
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
                                despatchesArray.push(despatchData);
                                despatchData = {};
                            }
                        } else {
                            despatchesArray.push(despatchData);
                            despatchData = {};
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
                            despatchData = {
                                integrator: "mimsoft",
                                document: {
                                    External: {
                                        ID: uuidv4(),
                                        RefNo: uuidv4().substring(0, 8),
                                        Type: "Excel",
                                    },
                                    IssueDateTime: calculatExcelDate(
                                        datas[i].İrsaliyeTarihi
                                    ),
                                    Type: datas[i].İrsaliyeTip,
                                    Notes: [
                                        datas[i].Not1,
                                        datas[i].Not2,
                                        datas[i].SubeAdi
                                            ? `Şube Adı : ${datas[i].SubeAdi}`
                                            : "",
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
                        despatchData = {
                            integrator: "mimsoft",
                            document: {
                                External: {
                                    ID: uuidv4(),
                                    RefNo: uuidv4().substring(0, 8),
                                    Type: "Excel",
                                },
                                IssueDateTime: calculatExcelDate(
                                    datas[i].İrsaliyeTarihi
                                ),
                                Type: datas[i].İrsaliyeTip,
                                Notes: [
                                    datas[i].Not1,
                                    datas[i].Not2,
                                    datas[i].SubeAdi
                                        ? `Şube Adı : ${datas[i].SubeAdi}`
                                        : "",
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
                    }
                }
                addDespatchesFromExcel(despatchesArray);
            });
        };
        fileReader.readAsBinaryString(excel);
    });

    const sendMultipleSelected = (clicked) => {
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
                    <h4>İrsaliyeler gönderiliyor...</h4>
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
                type: "POST",
                url: "/despatches/waiting/" + id,
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
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
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
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
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
            } irsaliyeyi göndermek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "POST",
                    url: `/despatches/waiting/${data.id ? data.id : data}`,
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
                        text: "İrsaliyenız başarıyla gönderildi!",
                        icon: "success",
                    }).then((e) => {
                        despatch_table.columns().checkboxes.deselect(true);
                        despatch_table.draw();
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
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                });
            });
    };

    const addDespatchesFromExcel = (clicked) => {
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
                    <h4>İrsaliyeler yükleniyor...</h4>
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
                url: "/despatches/waiting",
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
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
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
                    despatch_table.columns().checkboxes.deselect(true);
                    despatch_table.draw();
                    if (e.isDenied) {
                    }
                });
            },
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
});
