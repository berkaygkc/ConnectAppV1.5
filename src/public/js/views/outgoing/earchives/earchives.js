let detail_loading;
const isLastDay = (dt) => {
    var test = new Date(dt.getTime()),
        month = test.getMonth();

    test.setDate(test.getDate() + 1);
    return test.getMonth() !== month;
};

const isFirstDay = (dt) => {
    var test = new Date(dt.getTime()),
        month = test.getMonth();

    test.setDate(test.getDate() - 1);
    return test.getMonth() !== month;
};

$(document).ready(function () {
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
    $("#previousMonth").click((e) => {
        const fdate_value = fdateObject.selectedDates[0];
        let new_fdate, new_ldate;
        if (isFirstDay(fdate_value)) {
            new_fdate = new Date(
                fdate_value.getFullYear(),
                fdate_value.getMonth() - 1,
                1
            );
            new_ldate = new Date(
                fdate_value.getFullYear(),
                fdate_value.getMonth(),
                0
            );
        } else {
            new_fdate = new Date(
                fdate_value.getFullYear(),
                fdate_value.getMonth(),
                1
            );
            new_ldate = new Date(
                fdate_value.getFullYear(),
                fdate_value.getMonth() + 1,
                0
            );
        }
        ldateObject.setDate(new_ldate);
        fdateObject.setDate(new_fdate);
        searchTable();
    });
    $("#nextMonth").click((e) => {
        const ldate_value = ldateObject.selectedDates[0];
        let new_fdate, new_ldate;
        if (isLastDay(ldate_value)) {
            new_fdate = new Date(
                ldate_value.getFullYear(),
                ldate_value.getMonth() + 1,
                1
            );
            new_ldate = new Date(
                ldate_value.getFullYear(),
                ldate_value.getMonth() + 2,
                0
            );
        } else {
            new_fdate = new Date(
                ldate_value.getFullYear(),
                ldate_value.getMonth(),
                1
            );
            new_ldate = new Date(
                ldate_value.getFullYear(),
                ldate_value.getMonth() + 1,
                0
            );
        }
        ldateObject.setDate(new_ldate);
        fdateObject.setDate(new_fdate);
        searchTable();
    });
    const invoice_table = $("#invoices").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        ordering: false,
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/documents/invoices",
            data: (d) => {
                return $.extend({}, d, {
                    query: {
                        document: "earchive",
                        direction: "out",
                        sort_by: "issue_date",
                        start_date: fdateObject.formatDate(
                            fdateObject.selectedDates[0],
                            "Y-m-d"
                        ),
                        end_date: ldateObject.formatDate(
                            ldateObject.selectedDates[0],
                            "Y-m-d"
                        ),
                        sort_defs: [
                            {
                                field: $("#order").val(),
                                direction: $("#dir").val(),
                            },
                        ],
                        q: $("#searchbox").val(),
                        page_size: Number(d.length),
                        page_index: Number(d.start) / Number(d.length) + 1,
                        status_codes: $("#status").val(),
                        include_erp: true,
                        printed:
                            $("#print_status").val() == ""
                                ? undefined
                                : $("#print_status").val(),
                        read_marked:
                            $("#read_status").val() == ""
                                ? undefined
                                : $("#read_status").val(),
                        type_codes: $("#type").val(),
                    },
                });
            },
        },
        columns: [
            { data: "id" },
            { data: "process" },
            { data: "printed" },
            { data: "inv_no" },
            { data: "inv_type" },
            { data: "inv_profile" },
            { data: "receiver_name" },
            { data: "receiver_tax" },
            { data: "inv_date" },
            { data: "inv_env_date" },
            { data: "inv_total" },
            { data: "inv_tax" },
            { data: "inv_currency" },
            { data: "status_code" },
            { data: "status_description" },
            { data: "reply" },
            { data: "reply_code" },
            { data: "percentage" },
            { data: "readed" },
        ],
        columnDefs: [
            {
                // For Checkboxes
                targets: 0,
                width: "1px",
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
                className: "dt-center",
                width: "1px",
                render: (data, type, row) => {
                    let read_button, print_button;
                    if (row["printed"]) {
                        print_button = `<li><a id="mark-unprint" class="dropdown-item">Yazdırıl<b>ma</b>dı İşaretle</a></li>`;
                    } else {
                        print_button = `<li><a id="mark-print" class="dropdown-item">Yazdırıldı İşaretle</a></li>`;
                    }
                    if (row["readed"]) {
                        read_button = `<li><a id="mark-unread" class="dropdown-item">Okun<b>ma</b>dı İşaretle</a></li>`;
                    } else {
                        read_button = `<li><a id="mark-read" class="dropdown-item">Okundu İşaretle</a></li>`;
                    }
                    return `
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button id="preview-invoice" type="button" class="btn btn-icon btn-label-info waves-effect waves-light preview-button">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-label-warning btn-icon dropdown-toggle hide-arrow waves-effect waves-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-grip-vertical"></i></button>
                        <ul class="dropdown-menu dropdown-menu-end" style="">
                            <li><a id="pdf-download" class="dropdown-item"><i class="fa-regular fa-file-pdf me-2"></i>PDF İndir</a></li>
                            <li><a id="xml-download" class="dropdown-item"><i class="fa-regular fa-file-code me-2"></i>XML İndir</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            ${read_button}
                            ${print_button}
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a id="send-mail" class="dropdown-item"><i class="fa-solid fa-share me-2"></i>Mail Gönder</a></li>
                        </ul>
                    </div>`;
                },
            },
            {
                targets: 3,
                width: "1px",
                render: (data, type, row) => {
                    let type_class;
                    switch (row["inv_type"]) {
                        case "SATIS":
                            type_class = "success";
                            break;
                        case "ISTISNA":
                            type_class = "warning";
                            break;
                        case "TEVKIFAT":
                            type_class = "linkedin";
                            break;
                        case "IADE":
                            type_class = "slack";
                            break;
                        default:
                            type_class = "info";
                            break;
                    }
                    return `<i class="fa-solid fa-hashtag fa-sm"></i> <b>${data}</b><br><span class="badge bg-${type_class}">${
                        row["inv_type"].length > 8
                            ? row["inv_type"].substring(0, 8) + "."
                            : row["inv_type"]
                    }</span>`;
                },
            },
            {
                targets: 6,
                render: (data, type, row) => {
                    return `<b>${
                        data.length > 20 ? data.substring(0, 20) + "..." : data
                    }</b><br>${row["receiver_tax"]}`;
                },
            },
            {
                targets: 8,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>Fatura: </b>${data}<br><b>Zarf: </b>${row["inv_env_date"]}`;
                },
            },
            {
                targets: 10,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>Toplam: </b>${data} ${row["inv_currency"]}<br><b>Vergi: </b>${row["inv_tax"]} ${row["inv_currency"]}`;
                },
            },
            {
                targets: 13,
                width: "1px",
                render: (data, type, row) => {
                    let type_class;
                    if (row["percentage"] == 100 && data == 2009) {
                        type_class = "danger";
                    } else if (row["percentage"] == 100) {
                        type_class = "success";
                    } else {
                        type_class = "warning";
                    }
                    if (row["status_description"]) {
                        return `<b>${
                            row["status_description"].length > 20
                                ? row["status_description"].substring(0, 20) +
                                  "..."
                                : row["status_description"]
                        }</b><br><div class="progress" style="height: 0.4rem;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-${type_class}" role="progressbar" style="width: ${
                            row["percentage"]
                        }%" aria-valuenow="${
                            row["percentage"]
                        }" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>`;
                    } else {
                        return ``;
                    }
                },
            },
            {
                targets: 18,
                className: "dt-center mr-5",
                width: "1px",
                render: (data, type, row) => {
                    let read = "";
                    let print = "";
                    if (data) {
                        read = `<i class="text-success fa-solid fa-envelope-open fa-xl me-1" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-original-title="Okunma Tarihi: ${data}"></i>`;
                    } else {
                        read = `<i class="text-warning fa-solid fa-envelope fa-xl me-1"></i>`;
                    }
                    if (row["printed"]) {
                        print = `<i class="text-success fa-solid fa-print fa-xl me-2" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-original-title="Yazdırılma Tarihi: ${row["printed"]}"></i>`;
                    } else {
                        print = `<i class="text-warning fa-solid fa-print fa-xl me-2"></i>`;
                    }
                    return `${read}| ${print}`;
                },
            },
            {
                targets: [2, 4, 5, 11, 12, 7, 9, 14, 15, 16, 17],
                visible: false,
            },
        ],
        lengthMenu: [10, 25, 50, 100, 500, 1000],
        dom: '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p><"col-sm-12 col-md-6"l>>',
        select: {
            // Select style
            style: "multi",
            selector: `tr>td:nth-child(1), tr>td:nth-child(3), tr>td:nth-child(4), tr>td:nth-child(5),
                tr>td:nth-child(6), tr>td:nth-child(7), tr>td:nth-child(8), tr>td:nth-child(9)`,
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
        let query = invoice_table.ajax.params().query;
        changeFilterTags(query);
    };
    const changeFilterTags = (query) => {
        $("#filter-tags-div").empty();
        let tags = "";
        query.q ? (tags += makeFilterTag(query.q)) : null;
        if (query.type_codes?.length > 0) {
            query.type_codes.forEach((e) => {
                tags += makeFilterTag(e);
            });
        }
        if (query.status_codes?.length > 0) {
            query.status_codes.forEach((e) => {
                let desc = "";
                switch (e) {
                    case "2001":
                        desc = "Belge işleniyor";
                        break;
                    case "2007":
                        desc = "Belge raporu gönderilecek";
                        break;
                    case "2008":
                        desc = "Belge raporu gönderildi";
                        break;
                    case "2009":
                        desc = "Belge <b class='text-danger'>İPTAL</b> edildi";
                        break;
                }
                tags += makeFilterTag(desc);
            });
        }
        if (query.printed) {
            if (query.printed === "true") {
                tags += makeFilterTag("Yazdırıldı");
            } else {
                tags += makeFilterTag("Yazdırıl<b>MA</b>dı");
            }
        }
        if (query.read_marked) {
            if (query.read_marked === "true") {
                tags += makeFilterTag("Okundu");
            } else {
                tags += makeFilterTag("Okun<b>MA</b>dı");
            }
        }
        if (tags) {
            $("#filter-tags-div").append(`
            <p id="filter-tags" style="margin-bottom: 0.5rem;">Filtreler:
                ${tags}
            </p>`);
        }
    };
    const makeFilterTag = (data) => {
        return `<span class="badge bg-label-primary mx-1 mb-1">${data}</span>`;
    };

    $("#submit-fo").click((e) => {
        $("#offcanvasEnd").offcanvas("hide");
        searchTable();
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
            `<span class="spinner-grow text-info" role="status" aria-hidden="true"></span>`
        );
        $(".preview-button").attr("disabled", true);

        let data = invoice_table.row($(this).parents("tr")).data();
        $("#invoiceFrame").attr("src", "");
        $("#invoice-preview-uuid").val(data.id);
        $("#invoice-preview-inv-no").val(data.inv_no);
        $("#invoice-preview-integrator").val(data.integrator);
        let blob, detail;
        $.when(
            $.ajax({
                type: "GET",
                url: `/documents/invoices/export?uuid=${data.id}&type=html&document=earchive&coding=decoded&integrator=${data.integrator}`,
                success: function (response) {
                    blob = new Blob([response], {
                        type: "text/html",
                    });
                    $("#invoiceFrame").attr("src", URL.createObjectURL(blob));
                    $("#invoiceFrame").slideDown(500);
                    setTimeout(() => {
                        let iframe = document.querySelector("#invoiceFrame");
                        iframe.style.width =
                            String(
                                Number(
                                    iframe.contentDocument.body.scrollWidth
                                ) < 200
                                    ? 800
                                    : Number(
                                          iframe.contentDocument.body
                                              .scrollWidth
                                      ) + 50
                            ) + "px";
                    }, 250);
                },
            }),
            $.ajax({
                type: "GET",
                url: `/documents/invoices/detail?uuid=${data.id}&dir=out&document=earchive`,
                success: function (response) {
                    detail = response.document;
                },
            })
        ).then((e) => {
            $("#print-label").append(printObjectCreator(detail.is_printed));
            if (detail.status?.status_code) {
                $("#system-status-label").append(
                    statusCreator(
                        "Sistem",
                        detail.status.message,
                        detail.status.status_code,
                        detail.status.status
                    )
                );
            }
            buttonsCreator(detail.status.status_code);

            // detail.status.status_code != 2009
            //     ? null //$("#cancel-invoice-in-preview").slideDown(100)
            //     : null;
            // $("#gib-status-label").append(
            //     statusCreator(
            //         "GIB",
            //         detail.status.gib_status_message,
            //         detail.status.gib_status_code,
            //         detail.status.gib_status_summary
            //     )
            // );
            // $("#reply-label").append(
            //     replyCreator(
            //         detail.status.reply ? true : false,
            //         detail.status.reply?.message,
            //         detail.status.reply?.detail,
            //         detail.status.reply?.status
            //     )
            // );
            $("#envelope-id").val(detail.envelope_uuid);
            $("#preview-invoice-modal").modal("show");
            markInvoice([data.id], "out", "read", true);
        });
    });

    $("#preview-invoice-modal").on("hide.bs.modal", function () {
        $("#print-label").empty();
        $("#system-status-label").empty();
        // $("#gib-status-label").empty();
        $("#cancel-invoice-in-preview").unbind();
        $("#cancel-invoice-in-preview").remove();
        $("#invoice-preview-uuid").val("");
        $("#invoice-preview-inv-no").val("");
        $("#invoice-preview-integrator").val("");
    });

    $("#preview-body").click((e) => {
        if (
            !(
                $(e.target).parents(".clickable_area").length ||
                $(e.target).hasClass("clickable_area")
            )
        ) {
            $("#preview-invoice-modal").modal("hide");
        }
    });

    $("#print-invoice-in-preview").click((e) => {
        let uuid = $("#invoice-preview-uuid").val();
        markInvoice([uuid], "out", "print", true);
        $("#print-label").empty();
        let myIframe = document.getElementById("invoiceFrame").contentWindow;
        myIframe.focus();
        myIframe.print();
    });
    $("#download-invoice-in-preview").click((e) => {
        let uuid = $("#invoice-preview-uuid").val();
        let invno = $("#invoice-preview-inv-no").val();
        let integrator = $("#invoice-preview-integrator").val();
        $.ajax({
            type: "GET",
            url: `/documents/invoices/export?uuid=${uuid}&type=pdf&document=earchive&integrator=${integrator}`,
            success: function (response) {
                const linkSource = `data:application/pdf;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${invno}.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });

    $("#invoices tbody").on("click", "#mark-read", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        markInvoice([data.id], "out", "read", true);
    });
    $("#invoices tbody").on("click", "#mark-unread", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        markInvoice([data.id], "out", "read", false);
    });
    $("#invoices tbody").on("click", "#mark-print", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        markInvoice([data.id], "out", "print", true);
    });
    $("#invoices tbody").on("click", "#mark-unprint", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        markInvoice([data.id], "out", "print", false);
    });
    $("#invoices tbody").on("click", "#pdf-download", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        $.ajax({
            type: "GET",
            url: `/documents/invoices/export?uuid=${data.id}&type=pdf&document=earchive&integrator=${data.integrator}`,
            success: function (response) {
                const linkSource = `data:application/pdf;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${data.inv_no}-${data.receiver_name}.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });
    $("#invoices tbody").on("click", "#xml-download", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
        $.ajax({
            type: "GET",
            url: `/documents/invoices/export?uuid=${data.id}&type=xml&document=earchive&integrator=${data.integrator}`,
            success: function (response) {
                const linkSource = `data:application/xml;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${data.inv_no}.xml`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });

    $("#invoices tbody").on("click", "#send-mail", function (e) {
        Swal.fire({
            icon: "question",
            title: "Emin misiniz?",
            text: "Faturayı mail olarak göndermek istediğinize emin misiniz?",
            showConfirmButton: true,
            confirmButtonText: "Evet, gönder",
            showCancelButton: true,
            cancelButtonText: "Hayır, gönderme",
            confirmButtonColor: "#59c9a5",
            cancelButtonColor: "#f67e7d",
        }).then((result) => {
            if (result.isConfirmed) {
                let data = invoice_table.row($(this).parents("tr")).data();
                let body = {
                    uuid: data.id,
                    direction: "out",
                };
                $.ajax({
                    type: "POST",
                    url: "/documents/invoices/mail?document=earchive",
                    headers: {
                        "Content-type": "application/json",
                    },
                    data: JSON.stringify(body),
                    success: (response) => {
                        detail_loading = true;
                        invoice_table.ajax.reload(null, false);
                        Swal.fire({
                            icon: "success",
                            title: "Başarılı",
                            text: "Fatura mail gönderme işlemi sıraya alındı!",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    },
                    error: (err) => {
                        console.log(err);
                        Swal.fire({
                            icon: "error",
                            title: "Hata",
                            html: `Fatura mail gönderme işlemi sıraya alınırken bir hata oluştu! 
                            <br> <b>Detay : ${err.responseJSON.data}</b> `,
                        });
                    },
                });
            }
        });
    });

    $("#coll-mark-read").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        markInvoice(clicked.toArray(), "out", "read", true);
    });
    $("#coll-mark-unread").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        markInvoice(clicked.toArray(), "out", "read", false);
    });
    $("#coll-mark-print").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        markInvoice(clicked.toArray(), "out", "print", true);
    });
    $("#coll-mark-unprint").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        markInvoice(clicked.toArray(), "out", "print", false);
    });
    $("#coll-pdf-download").click((e) => {
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
            text: `${clicked.length} adet faturayı toplu PDF olarak indirmek istediğinize emin misiniz?`,
            showConfirmButton: true,
            confirmButtonText: "Evet, indir",
            showCancelButton: true,
            cancelButtonText: "Hayır, indirme",
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
                            <h4>Faturalar hazırlanıyor...</h4>
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
                let zip = new JSZip();
                clicked.each((id, index) => {
                    let data = invoice_table
                        .data()
                        .filter((e) => e.id == id)[0];
                    requests.push({
                        type: "GET",
                        url: `/documents/invoices/export?uuid=${id}&type=pdf&document=earchive&integrator=${data.integrator}`,
                        success: async (result) => {
                            const linkSource = `data:application/pdf;base64,${result.content}`;
                            const r = await fetch(linkSource);
                            const blob = await r.blob();
                            zip.file(`${id}.pdf`, blob);

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
                            confirmButtonText: "Dosyayı İndir",
                            html: `
                                    <h4>Faturalar Hazırlandı!</h4>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-secondary">Toplam : <b>${
                                            counter + 1
                                        }</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                                    </blockquote>
                                    ${
                                        errored
                                            ? `
                                        <table style="width:100%" class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style="width:20%">UUID</th>
                                                    <th>Hata</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-border-bottom-0">
                                                ${error_list}
                                            </tbody>
                                        </table>
                                    `
                                            : ""
                                    } 
                                    `,
                        }).then((e) => {
                            zip.generateAsync({
                                type: "blob",
                                compression: "DEFLATE",
                            }).then((zipBlob) => {
                                saveAs(
                                    zipBlob,
                                    "Toplu PDF Giden e-Arşivler.zip",
                                    "application/zip"
                                );
                            });
                        });
                    },
                    onAnyFailed: () => {},
                    onCancelled: () => {
                        toastr["info"](`İşlem iptal edildi.`, "İptal edildi", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });
    $("#coll-xml-download").click((e) => {
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
            text: `${clicked.length} adet faturayı toplu XML olarak indirmek istediğinize emin misiniz?`,
            showConfirmButton: true,
            confirmButtonText: "Evet, indir",
            showCancelButton: true,
            cancelButtonText: "Hayır, indirme",
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
                            <h4>Faturalar hazırlanıyor...</h4>
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
                let zip = new JSZip();
                clicked.each((id, index) => {
                    let data = invoice_table
                        .data()
                        .filter((e) => e.id == id)[0];
                    requests.push({
                        type: "GET",
                        url: `/documents/invoices/export?uuid=${id}&type=xml&document=earchive&integrator=${data.integrator}`,
                        success: async (result) => {
                            const linkSource = `data:application/xml;base64,${result.content}`;
                            const r = await fetch(linkSource);
                            const blob = await r.blob();
                            zip.file(`${id}.xml`, blob);

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
                            confirmButtonText: "Dosyayı İndir",
                            html: `
                                    <h4>Faturalar Hazırlandı!</h4>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-secondary">Toplam : <b>${
                                            counter + 1
                                        }</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                                    </blockquote>
                                    ${
                                        errored
                                            ? `
                                        <table style="width:100%" class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style="width:20%">UUID</th>
                                                    <th>Hata</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-border-bottom-0">
                                                ${error_list}
                                            </tbody>
                                        </table>
                                    `
                                            : ""
                                    } 
                                    `,
                        }).then((e) => {
                            zip.generateAsync({
                                type: "blob",
                                compression: "DEFLATE",
                            }).then((zipBlob) => {
                                saveAs(
                                    zipBlob,
                                    "Toplu XML Giden e-Arşivler.zip",
                                    "application/zip"
                                );
                            });
                        });
                    },
                    onAnyFailed: () => {},
                    onCancelled: () => {
                        toastr["info"](`İşlem iptal edildi.`, "İptal edildi", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });
    $("#coll-pdf-one-page-download").click((e) => {
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
            text: `${clicked.length} adet faturayı tek sayfa PDF olarak indirmek istediğinize emin misiniz?`,
            showConfirmButton: true,
            confirmButtonText: "Evet, indir",
            showCancelButton: true,
            cancelButtonText: "Hayır, indirme",
            confirmButtonColor: "#59c9a5",
            cancelButtonColor: "#f67e7d",
        }).then(async (result) => {
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
                            <h4>Faturalar hazırlanıyor...</h4>
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
                const pdfDoc = await PDFLib.PDFDocument.create();
                clicked.each((id, index) => {
                    let data = invoice_table
                        .data()
                        .filter((e) => e.id == id)[0];
                    requests.push({
                        type: "GET",
                        url: `/documents/invoices/export?uuid=${id}&type=pdf&document=earchive&integrator=${data.integrator}`,
                        success: async (result) => {
                            const linkSource = `data:application/pdf;base64,${result.content}`;
                            const donorPdfBytes = await fetch(linkSource).then(
                                (res) => res.arrayBuffer()
                            );
                            const donorPdfDoc = await PDFLib.PDFDocument.load(
                                donorPdfBytes
                            );
                            const docLength = donorPdfDoc.getPageCount();
                            for (var k = 0; k < docLength; k++) {
                                const [donorPage] = await pdfDoc.copyPages(
                                    donorPdfDoc,
                                    [k]
                                );
                                pdfDoc.addPage(donorPage);
                            }

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
                            confirmButtonText: "Dosyayı İndir",
                            html: `
                                    <h4>Faturalar Hazırlandı!</h4>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-secondary">Toplam : <b>${
                                            counter + 1
                                        }</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                                    </blockquote>
                                    ${
                                        errored
                                            ? `
                                        <table style="width:100%" class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style="width:20%">UUID</th>
                                                    <th>Hata</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-border-bottom-0">
                                                ${error_list}
                                            </tbody>
                                        </table>
                                    `
                                            : ""
                                    } 
                                    `,
                        }).then(async (e) => {
                            const pdfDataUri = await pdfDoc.saveAsBase64({
                                dataUri: true,
                            });
                            const linkSource1 = pdfDataUri;
                            const downloadLink1 = document.createElement("a");
                            const fileName1 = `Tek Sayfa PDF Giden e-Arşiv.pdf`;
                            downloadLink1.href = linkSource1;
                            downloadLink1.download = fileName1;
                            downloadLink1.click();
                        });
                    },
                    onAnyFailed: () => {},
                    onCancelled: () => {
                        toastr["info"](`İşlem iptal edildi.`, "İptal edildi", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });
    $("#coll-invoice-xlsx-download").click((e) => {
        let clicked = invoice_table.column(0).checkboxes.selected();
        if (clicked.length < 1) {
            toastr["error"](`En az 1 adet fatura seçmelisiniz!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        Swal.fire({
            icon: "question",
            title: "Emin misiniz?",
            text: `${clicked.length} adet faturayı Excel olarak indirmek istediğinize emin misiniz?`,
            showConfirmButton: true,
            confirmButtonText: "Evet, indir",
            showCancelButton: true,
            cancelButtonText: "Hayır, indirme",
            confirmButtonColor: "#59c9a5",
            cancelButtonColor: "#f67e7d",
        }).then(async (result) => {
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
                            <h4>Faturalar hazırlanıyor...</h4>
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
                const fileType =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                const fileExtension = ".xlsx";
                let excelData = [];
                clicked.each((id) => {
                    requests.push({
                        type: "GET",
                        url: `/documents/invoices/detail?uuid=${id}&dir=out&document=earchive`,
                        success: async (result) => {
                            excelData.push(
                                invoiceDetailToJson(result.document)
                            );
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
                            confirmButtonText: "Dosyayı İndir",
                            html: `
                                    <h4>Faturalar Hazırlandı!</h4>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-secondary">Toplam : <b>${
                                            counter + 1
                                        }</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-success">Başarılı : <b id="success-counter">${successed}</b></p>
                                    </blockquote>
                                    <blockquote class="blockquote mt-3">
                                        <p class="mb-0 text-danger">Hatalı : <b id="error-counter">${errored}</b></p>
                                    </blockquote>
                                    ${
                                        errored
                                            ? `
                                        <table style="width:100%" class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style="width:20%">UUID</th>
                                                    <th>Hata</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-border-bottom-0">
                                                ${error_list}
                                            </tbody>
                                        </table>
                                    `
                                            : ""
                                    } 
                                    `,
                        }).then(async (e) => {
                            const workSheet =
                                XLSX.utils.json_to_sheet(excelData);
                            const workBook = {
                                Sheets: { GDNEFTR: workSheet },
                                SheetNames: ["GDNEFTR"],
                            };
                            const excelBuffer = XLSX.write(workBook, {
                                bookType: "xlsx",
                                type: "array",
                            });
                            const fileData = new Blob([excelBuffer], {
                                type: fileType,
                            });
                            saveAs(
                                fileData,
                                "Giden e-Arşivler" + fileExtension
                            );
                        });
                    },
                    onAnyFailed: () => {},
                    onCancelled: () => {
                        toastr["info"](`İşlem iptal edildi.`, "İptal edildi", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });

    const printObjectCreator = (isPrinted) => {
        let main = document.createElement("div");
        main.classList.add("card");
        let cardbody = document.createElement("div");
        cardbody.classList.add("card-body", "clickable_area");
        let span = document.createElement("span");
        span.classList.add("badge", "badge-center", "me-3");
        span.classList.add(isPrinted ? "bg-success" : "bg-warning");
        span.innerHTML = `<i class="fa-solid fa-print fa-xs"></i>`;
        cardbody.appendChild(span);
        cardbody.innerHTML += `<b>${
            isPrinted ? `Yazdırıldı` : "Yazdırılmadı"
        }</b>`;
        main.appendChild(cardbody);
        return main;
    };

    const statusCreator = (type, system_status_detail, status_code, status) => {
        let color;
        if (status === "reported") {
            color = `success`;
        } else if (status === "cancelled") {
            color = `danger`;
        } else {
            color = `warning`;
        }

        let cardIcon;
        if (status === "reported") {
            cardIcon = `<i class="fa-solid fa-circle-check"></i>`;
        } else if (status === "cancelled") {
            cardIcon = `<i class="fa-solid fa-circle-xmark"></i>`;
        } else {
            cardIcon = `<i class="fa-regular fa-circle"></i>`;
        }

        return `
        <div class="card bg-label-${color}">
            <div class="card-body d-flex justify-content-between align-items-center clickable_area">
                <div class="card-title mb-0">
                    <h5 class="card-title mb-1 pt-2">${type} Durumu</h5>
                    <p class="mb-2 mt-1">${system_status_detail}</p>
                </div>
                <div class="card-icon">
                    <span class="badge bg-${color}">${status_code}</span>
                </div>
            </div>
        </div>`;
    };

    const buttonsCreator = (can_cancelled) => {
        if (can_cancelled != 2009) {
            $("#detail-buttons").append(
                `<button id="cancel-invoice-in-preview" class="btn btn-label-pinterest d-grid w-100 mb-2 waves-effect" hidden>
                    <span class="d-flex align-items-center justify-content-center text-nowrap"><i class="fa-regular fa-circle-xmark fa-xs me-2"></i>İptal Et</span>
                </button>`
            );
            $("#cancel-invoice-in-preview").click((e) => {
                let invno = $("#invoice-preview-inv-no").val();
                Swal.fire({
                    icon: "question",
                    title: "Emin misiniz?",
                    text: `${invno} numaralı faturayı iptal etmek istediğinize emin misiniz?`,
                    showConfirmButton: true,
                    confirmButtonText: "Evet, iptal et",
                    showCancelButton: true,
                    cancelButtonText: "Hayır, etme",
                    confirmButtonColor: "#59c9a5",
                    cancelButtonColor: "#f67e7d",
                }).then((result) => {
                    if (result.isConfirmed) {
                        let uuid = $("#invoice-preview-uuid").val();
                        $.ajax({
                            type: "POST",
                            url: "/documents/invoices/cancel?document=earchive",
                            headers: {
                                "Content-type": "application/json",
                            },
                            data: JSON.stringify({ uuid }),
                            success: (response) => {
                                $("#system-status-label").empty();
                                $("#cancel-invoice-in-preview").unbind();
                                $("#cancel-invoice-in-preview").remove();
                                invoice_table.ajax.reload(null, false);
                                toastr["success"](
                                    `Fatura başarıyla iptal edildi.`,
                                    "Başarılı",
                                    {
                                        closeButton: true,
                                        tapToDismiss: false,
                                        progressBar: true,
                                    }
                                );
                                setTimeout(() => {
                                    $("#system-status-label").append(
                                        statusCreator(
                                            "Sistem",
                                            "Belge iptal edildi.",
                                            2009,
                                            "cancelled"
                                        )
                                    );
                                }, 200);
                            },
                            error: (err) => {
                                console.log(err);
                                toastr["error"](
                                    `Fatura iptal edilirken hata oluştu! ${err.responseJSON?.data[0]?.message}`,
                                    "Hata",
                                    {
                                        closeButton: true,
                                        tapToDismiss: false,
                                        progressBar: true,
                                    }
                                );
                            },
                        });
                    }
                });
            });
        }
    };

    const markInvoice = (uuids, direction, mark, value) => {
        let body = {
            uuids,
            direction,
            mark,
            value,
        };
        $.ajax({
            type: "POST",
            url: "/documents/invoices/mark?document=earchive",
            headers: {
                "Content-type": "application/json",
            },
            data: JSON.stringify(body),
            success: (response) => {
                detail_loading = true;
                invoice_table.ajax.reload(null, false);
            },
            error: (err) => {
                console.log(err);
            },
        });
    };

    const invoiceDetailToJson = (data) => {
        let taxObject = {
            "KDV0 Matrah": 0,
            "KDV0 Tutar": 0,
            "KDV1 Matrah": 0,
            "KDV1 Tutar": 0,
            "KDV8 Matrah": 0,
            "KDV8 Tutar": 0,
            "KDV10 Matrah": 0,
            "KDV10 Tutar": 0,
            "KDV18 Matrah": 0,
            "KDV18 Tutar": 0,
            "KDV20 Matrah": 0,
            "KDV20 Tutar": 0,
        };
        let oivObject = {
            "ÖİV Tutarı": 0,
        };
        for (tax of data.tax.subtotals) {
            if (tax.code == "0015") {
                if (tax.percent == 0) {
                    taxObject["KDV0 Matrah"] = tax.taxable;
                    taxObject["KDV0 Tutar"] = tax.amount;
                } else if (tax.percent == 1) {
                    taxObject["KDV1 Matrah"] = tax.taxable;
                    taxObject["KDV1 Tutar"] = tax.amount;
                } else if (tax.percent == 8) {
                    taxObject["KDV8 Matrah"] = tax.taxable;
                    taxObject["KDV8 Tutar"] = tax.amount;
                } else if (tax.percent == 10) {
                    taxObject["KDV10 Matrah"] = tax.taxable;
                    taxObject["KDV10 Tutar"] = tax.amount;
                } else if (tax.percent == 18) {
                    taxObject["KDV18 Matrah"] = tax.taxable;
                    taxObject["KDV18 Tutar"] = tax.amount;
                } else if (tax.percent == 20) {
                    taxObject["KDV20 Matrah"] = tax.taxable;
                    taxObject["KDV20 Tutar"] = tax.amount;
                }
            } else if (tax.code == "4080") {
                oivObject["ÖİV Tutarı"] = tax.amount;
            } else if (tax.code == "4081") {
                oivObject["ÖİV Tutarı"] = tax.amount;
            }
        }
        let statusObject = {
            "Fatura Durumu": "Durum Bulunamadı",
        };
        if (data.status?.summary) {
            statusObject["Fatura Durumu"] = data.status.summary;
        }
        return {
            UUID: data.uuid,
            "Fatura No": data.id,
            "Fatura Tarihi": data.issue_date,
            "Gönderim Tarihi": data.received_at,
            Profili: data.profile_id,
            Tipi: data.type_code,
            "Gönderici Ünvan": data.sender.name,
            "Gönderici VKN/TCKN": data.sender.vkn_tckn,
            "Alıcı Ünvan": data.receiver.name,
            "Alıcı VKN/TCKN": data.receiver.vkn_tckn,
            "Sipariş No": data.order_id ? data.order_id : "",
            "Para Birimi": data.payable_currency,
            "Ödenecek Tutar": data.payable,
            "Vergiler Hariç Toplam": data.tax_exclusive,
            "Vergiler Toplamı": data.tax.amount,
            "İndirim Tutarı": data.allowance,
            ...taxObject,
            ...oivObject,
            ...statusObject,
        };
    };

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
