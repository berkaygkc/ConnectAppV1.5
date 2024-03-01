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
    const despatch_table = $("#despatches").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        ordering: false,
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/documents/despatches",
            data: (d) => {
                return $.extend({}, d, {
                    query: {
                        document: "edespatch",
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
                        reply_status_codes: $("#reply_status").val(),
                        include_erp: true,
                        printed:
                            $("#print_status").val() == ""
                                ? undefined
                                : $("#print_status").val(),
                        read_marked:
                            $("#read_status").val() == ""
                                ? undefined
                                : $("#read_status").val(),
                        profile_ids: $("#profile").val(),
                        type_codes: $("#type").val(),
                    },
                });
            },
        },
        columns: [
            { data: "id" },
            { data: "process" },
            { data: "printed" },
            { data: "dsp_no" },
            { data: "dsp_type" },
            { data: "dsp_profile" },
            { data: "receiver_name" },
            { data: "receiver_tax" },
            { data: "dsp_date" },
            { data: "dsp_env_date" },
            { data: "dsp_total" },
            { data: "dsp_tax" },
            { data: "dsp_currency" },
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
                    <div class="btn-group" role="group">
                        <button id="preview-despatch" type="button" class="btn btn-icon btn-label-info preview-button">
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
                        </ul>
                    </div>`;
                },
            },
            {
                targets: 3,
                width: "1px",
                render: (data, type, row) => {
                    let type_class;
                    switch (row["dsp_type"]) {
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
                            type_class = "linkedin";
                            break;
                    }

                    let profile_type;
                    switch (row["dsp_profile"]) {
                        case "TICARIFATURA":
                            profile_type = "info";
                            break;
                        case "TEMELFATURA":
                            profile_type = "secondary";
                            break;
                        case "IHRACAT":
                            profile_type = "success";
                            break;
                        default:
                            profile_type = "info";
                            break;
                    }
                    return `<i class="fa-solid fa-hashtag fa-sm"></i> <b>${data}</b><br><span class="badge bg-${type_class}">${
                        row["dsp_type"].length > 8
                            ? row["dsp_type"].substring(0, 8) + "."
                            : row["dsp_type"]
                    }</span> | <span class="badge bg-label-${profile_type}">${
                        row["dsp_profile"].length > 8
                            ? row["dsp_profile"].substring(0, 8) + "."
                            : row["dsp_profile"]
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
                    return `<b>İrsaliye: </b>${data}<br><b>Zarf: </b>${row["dsp_env_date"]}`;
                },
            },
            {
                targets: 10,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>Toplam: </b>${data} ${row["dsp_currency"]}<br><b>Vergi: </b>${row["dsp_tax"]} ${row["dsp_currency"]}`;
                },
            },
            {
                targets: 13,
                width: "1px",
                render: (data, type, row) => {
                    let type_class;
                    if (row["percentage"] == 100 && data == 4000) {
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
                targets: 15,
                width: "1px",
                render: (data, type, row) => {
                    let icon;
                    let color;
                    switch (row["reply_code"]) {
                        case 2004:
                            icon = `<button id="preview-no-reply-despatch" type="button" class="btn btn-icon btn-label-warning waves-effect waves-light preview-button">
                                        <i class="fa-solid fa-square fa-xl"></i>
                                    </button>`;
                            break;
                        case 2010:
                            icon = `<button id="preview-reply-despatch" type="button" class="btn btn-icon btn-label-info waves-effect waves-light preview-reply-button">
                                        <i class="fa-regular fa-folder-open"></i>
                                    </button>`;
                            color = "text-info";
                            break;
                        default:
                            icon = "";
                            color = "text-secondary";
                            break;
                    }
                    return icon;
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
                targets: [2, 4, 5, 11, 12, 7, 9, 10, 14, 16, 17],
                visible: false,
            },
        ],
        lengthMenu: [10, 25, 50, 100, 500, 1000],
        dom: '<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p><"col-sm-12 col-md-6"l>>',
        select: {
            // Select style
            style: "multi",
            selector: `tr>td:nth-child(1), tr>td:nth-child(3), tr>td:nth-child(4), tr>td:nth-child(5),
                tr>td:nth-child(6), tr>td:nth-child(8), tr>td:nth-child(9)`,
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
        let query = despatch_table.ajax.params().query;
        changeFilterTags(query);
    };
    const changeFilterTags = (query) => {
        $("#filter-tags-div").empty();
        let tags = "";
        query.q ? (tags += makeFilterTag(query.q)) : null;
        if (query.profile_ids?.length > 0) {
            query.profile_ids.forEach((e) => {
                tags += makeFilterTag(e);
            });
        }
        if (query.type_codes?.length > 0) {
            query.type_codes.forEach((e) => {
                tags += makeFilterTag(e);
            });
        }
        if (query.status_codes?.length > 0) {
            query.status_codes.forEach((e) => {
                let desc = "";
                switch (e) {
                    case "2012":
                        desc = "Belge kuyrukta";
                        break;
                    case "2001":
                        desc = "Belge işleniyor";
                        break;
                    case "2002":
                        desc = "Belge GIB'e gönderildi";
                        break;
                    case "2003":
                        desc = "Belge alıcıya iletildi";
                        break;
                    case "2000":
                        desc = "Belge işlemleri başarı ile tamamlandı";
                        break;
                    case "4000":
                        desc = "Belge hata aldı";
                        break;
                }
                tags += makeFilterTag(desc);
            });
        }
        if (query.reply_status_codes?.length > 0) {
            query.reply_status_codes.forEach((e) => {
                let desc = "";
                switch (e) {
                    case "2004":
                        desc = "İrsaliye yanıtı bekleniyor";
                        break;
                    case "2010":
                        desc =
                            "İrsaliye alıcı tarafından <b class='text-info'>yanıtlandı</b>";
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

    $("#despatches tbody").on("click", "#preview-despatch", function (e) {
        $(e.currentTarget).html(
            `<span class="spinner-grow text-info" role="status" aria-hidden="true"></span>`
        );
        $(".preview-button").attr("disabled", true);

        let data = despatch_table.row($(this).parents("tr")).data();
        $("#despatchFrame").attr("src", "");
        $("#despatch-preview-uuid").val(data.id);
        $("#despatch-preview-dsp-no").val(data.dsp_no);
        let blob, detail;
        $.when(
            $.ajax({
                type: "GET",
                url: `/documents/despatches/export?uuid=${data.id}&type=html&document=edespatch&coding=decoded`,
                success: function (response) {
                    blob = new Blob([response], {
                        type: "text/html",
                    });
                    $("#despatchFrame").attr("src", URL.createObjectURL(blob));
                    $("#despatchFrame").slideDown(500);
                    setTimeout(() => {
                        let iframe = document.querySelector("#despatchFrame");
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
                url: `/documents/despatches/detail?uuid=${data.id}&dir=out&document=edespatch`,
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
            if (detail.status?.gib_status_code) {
                $("#gib-status-label").append(
                    statusCreator(
                        "GIB",
                        detail.status.gib_status_message,
                        detail.status.gib_status_code,
                        detail.status.gib_status_summary
                    )
                );
            }
            $("#reply-label").append(
                replyCreator(
                    detail.status?.reply ? true : false,
                    detail.status.reply?.message,
                    detail.status.reply?.detail,
                    detail.status.reply?.status
                )
            );
            $("#envelope-id").val(detail.envelope_uuid);
            $("#preview-despatch-modal").modal("show");
            markDespatch([data.id], "out", "read", true);
        });
    });

    $("#preview-despatch-modal").on("hide.bs.modal", function () {
        $("#print-label").empty();
        $("#system-status-label").empty();
        $("#gib-status-label").empty();
        $("#reply-label").empty();
        $("#envelope-id").val();
        $("#despatch-preview-uuid").val();
        $("#despatch-preview-dsp-no").val();
    });

    $("#preview-body").click((e) => {
        if (
            !(
                $(e.target).parents(".clickable_area").length ||
                $(e.target).hasClass("clickable_area")
            )
        ) {
            $("#preview-despatch-modal").modal("hide");
        }
    });

    $("#print-despatch-in-preview").click((e) => {
        let uuid = $("#despatch-preview-uuid").val();
        markDespatch([uuid], "out", "print", true);
        $("#print-label").empty();
        let myIframe = document.getElementById("despatchFrame").contentWindow;
        myIframe.focus();
        myIframe.print();
    });

    $("#download-despatch-in-preview").click((e) => {
        let uuid = $("#despatch-preview-uuid").val();
        let dspno = $("#despatch-preview-dsp-no").val();
        $.ajax({
            type: "GET",
            url: `/documents/despatches/export?uuid=${uuid}&type=pdf&document=edespatch`,
            success: function (response) {
                const linkSource = `data:application/pdf;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${dspno}.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });

    $("#despatches tbody").on("click", "#preview-reply-despatch", function (e) {
        $(e.currentTarget).html(
            `<span class="spinner-grow text-info" role="status" aria-hidden="true"></span>`
        );
        $(".preview-reply-button").attr("disabled", true);

        let data = despatch_table.row($(this).parents("tr")).data();
        $("#despatchReplyFrame").attr("src", "");
        $("#reply-despatch-preview-uuid").val(data.id);
        $("#reply-despatch-preview-dsp-no").val(data.dsp_no);
        let blob, detail;
        $.ajax({
            type: "GET",
            url: `/documents/despatches/reply.export?uuid=${data.id}&type=html&document=edespatch&coding=decoded`,
            success: function (response) {
                blob = new Blob([response], {
                    type: "text/html",
                });
                $("#despatchReplyFrame").attr("src", URL.createObjectURL(blob));
                $("#despatchReplyFrame").slideDown(500);
                setTimeout(() => {
                    let iframe = document.querySelector("#despatchReplyFrame");
                    iframe.style.width =
                        String(
                            Number(iframe.contentDocument.body.scrollWidth) <
                                200
                                ? 850
                                : Number(
                                      iframe.contentDocument.body.scrollWidth
                                  ) + 50
                        ) + "px";
                    $("#preview-reply-despatch-modal").modal("show");
                    detail_loading = true;
                    despatch_table.ajax.reload(null, false);
                }, 250);
            },
        });
    });

    $("#despatches tbody").on(
        "click",
        "#preview-no-reply-despatch",
        function (e) {
            toastr["warning"](
                `İrsaliye yanıtı gelmediği için görüntüleme yapılamaz!`,
                "Bilgi",
                {
                    closeButton: true,
                    tapToDismiss: false,
                    progressBar: true,
                }
            );
        }
    );

    $("#preview-reply-despatch-modal").on("hide.bs.modal", function () {
        $("#reply-despatch-preview-uuid").val("");
        $("#reply-despatch-preview-dsp-no").val("");
    });

    $("#preview-reply-body").click((e) => {
        if (
            !(
                $(e.target).parents(".clickable_area").length ||
                $(e.target).hasClass("clickable_area")
            )
        ) {
            $("#preview-reply-despatch-modal").modal("hide");
        }
    });

    $("#print-reply-despatch-in-preview").click((e) => {
        let myIframe =
            document.getElementById("despatchReplyFrame").contentWindow;
        myIframe.focus();
        myIframe.print();
    });

    $("#download-reply-despatch-in-preview").click((e) => {
        let uuid = $("#reply-despatch-preview-uuid").val();
        let dspno = $("#reply-despatch-preview-dsp-no").val();
        $.ajax({
            type: "GET",
            url: `/documents/despatches/reply.export?uuid=${uuid}&type=pdf&document=edespatch`,
            success: function (response) {
                const linkSource = `data:application/pdf;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${dspno}_nolu_irsaliyenin_yaniti.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });

    $("#despatches tbody").on("click", "#mark-read", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        markDespatch([data.id], "out", "read", true);
    });
    $("#despatches tbody").on("click", "#mark-unread", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        markDespatch([data.id], "out", "read", false);
    });
    $("#despatches tbody").on("click", "#mark-print", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        markDespatch([data.id], "out", "print", true);
    });
    $("#despatches tbody").on("click", "#mark-unprint", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        markDespatch([data.id], "out", "print", false);
    });
    $("#despatches tbody").on("click", "#pdf-download", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        $.ajax({
            type: "GET",
            url: `/documents/despatches/export?uuid=${data.id}&type=pdf&document=edespatch`,
            success: function (response) {
                const linkSource = `data:application/pdf;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${data.dsp_no}-${data.receiver_name}.pdf`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });
    $("#despatches tbody").on("click", "#xml-download", function (e) {
        let data = despatch_table.row($(this).parents("tr")).data();
        $.ajax({
            type: "GET",
            url: `/documents/despatches/export?uuid=${data.id}&type=xml&document=edespatch`,
            success: function (response) {
                const linkSource = `data:application/xml;base64,${response.content}`;
                const downloadLink = document.createElement("a");
                const fileName = `${data.dsp_no}.xml`;
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            },
        });
    });

    $("#coll-mark-read").click((e) => {
        let clicked = despatch_table.column(0).checkboxes.selected();
        markDespatch(clicked.toArray(), "out", "read", true);
    });
    $("#coll-mark-unread").click((e) => {
        let clicked = despatch_table.column(0).checkboxes.selected();
        markDespatch(clicked.toArray(), "out", "read", false);
    });
    $("#coll-mark-print").click((e) => {
        let clicked = despatch_table.column(0).checkboxes.selected();
        markDespatch(clicked.toArray(), "out", "print", true);
    });
    $("#coll-mark-unprint").click((e) => {
        let clicked = despatch_table.column(0).checkboxes.selected();
        markDespatch(clicked.toArray(), "out", "print", false);
    });
    $("#coll-pdf-download").click((e) => {
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
            text: `${clicked.length} adet irsaliyeyı toplu PDF olarak indirmek istediğinize emin misiniz?`,
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
                            <h4>İrsaliyeler hazırlanıyor...</h4>
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
                clicked.each((id) => {
                    requests.push({
                        type: "GET",
                        url: `/documents/despatches/export?uuid=${id}&type=pdf&document=edespatch`,
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
                                    <h4>İrsaliyeler Hazırlandı!</h4>
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
                                    "Toplu PDF Giden e-İrsaliyeler.zip",
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
            text: `${clicked.length} adet irsaliyeyı toplu XML olarak indirmek istediğinize emin misiniz?`,
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
                            <h4>İrsaliyeler hazırlanıyor...</h4>
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
                clicked.each((id) => {
                    requests.push({
                        type: "GET",
                        url: `/documents/despatches/export?uuid=${id}&type=xml&document=edespatch`,
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
                                    <h4>İrsaliyeler Hazırlandı!</h4>
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
                                    "Toplu XML Giden e-İrsaliyeler.zip",
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
            text: `${clicked.length} adet irsaliyeyı tek sayfa PDF olarak indirmek istediğinize emin misiniz?`,
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
                            <h4>İrsaliyeler hazırlanıyor...</h4>
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
                clicked.each((id) => {
                    requests.push({
                        type: "GET",
                        url: `/documents/despatches/export?uuid=${id}&type=pdf&document=edespatch`,
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
                                    <h4>İrsaliyeler Hazırlandı!</h4>
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
                            const fileName1 = `Tek Sayfa PDF Giden e-İrsaliye.pdf`;
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
    $("#coll-despatch-xlsx-download").click((e) => {
        let clicked = despatch_table.column(0).checkboxes.selected();
        if (clicked.length < 1) {
            toastr["error"](`En az 1 adet irsaliye seçmelisiniz!`, "Uyarı", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        Swal.fire({
            icon: "question",
            title: "Emin misiniz?",
            text: `${clicked.length} adet irsaliyeyı Excel olarak indirmek istediğinize emin misiniz?`,
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
                            <h4>İrsaliyeler hazırlanıyor...</h4>
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
                        url: `/documents/despatches/detail?uuid=${id}&dir=out&document=edespatch`,
                        success: async (result) => {
                            excelData.push(
                                despatchDetailToJson(result.document)
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
                                    <h4>İrsaliyeler Hazırlandı!</h4>
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
                                "Giden e-İrsaliyeler" + fileExtension
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
        if (status === "successful") {
            color = `success`;
        } else if (status === "failed") {
            color = `danger`;
        } else {
            color = `warning`;
        }

        let cardIcon;
        if (status === "successful") {
            cardIcon = `<i class="fa-solid fa-circle-check"></i>`;
        } else if (status === "failed") {
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

    const replyCreator = (has_reply, reply_message, reply_detail, status) => {
        if (has_reply) {
            let color;
            if (status === "replied") {
                color = `info`;
            } else {
                color = `warning`;
            }

            let cardIcon;
            if (status === "replied") {
                cardIcon = `<i class="fa-solid fa-circle-check"></i>`;
            } else {
                cardIcon = `<i class="fa-regular fa-circle"></i>`;
            }

            return `
                <div class="card bg-${color}">
                    <div class="card-body d-flex justify-content-between align-items-center clickable_area">
                        <div class="card-title mb-0">
                            <h5 class="card-title text-white mb-1 pt-2">İrsaliye Yanıtı</h5>
                            <p class="mb-2 mt-1 text-white">${reply_message}</p>
                            ${
                                status === "rejected"
                                    ? `<p class="mb-2 mt-1 text-white text-decoration-underline">Red Sebebi: ${reply_detail}</p>`
                                    : ""
                            }
                        </div>
                        <div class="card-icon">
                            <span class="badge bg-label-${color} rounded-pill p-2">
                                ${cardIcon}
                            </span>
                        </div>
                    </div>
                </div>`;
        } else {
            return `
                <div class="card bg-label-secondary">
                    <div class="card-body d-flex justify-content-between align-items-center clickable_area">
                        <div class="card-title mb-0">
                            <h5 class="card-title mb-1 pt-2">İrsaliye Yanıtı</h5>
                            <p class="mb-2 mt-1">İrsaliye yanıtı bulunmuyor.</p>
                        </div>
                        <div class="card-icon">
                            <span class="badge bg-secondary rounded-pill p-2">
                                <i class="fa-regular fa-circle"></i>
                            </span>
                        </div>
                    </div>
                </div>`;
        }
    };

    const markDespatch = (uuids, direction, mark, value) => {
        let body = {
            uuids,
            direction,
            mark,
            value,
        };
        $.ajax({
            type: "POST",
            url: "/documents/despatches/mark?document=edespatch",
            headers: {
                "Content-type": "application/json",
            },
            data: JSON.stringify(body),
            success: (response) => {
                detail_loading = true;
                despatch_table.ajax.reload(null, false);
            },
            error: (err) => {
                console.log(err);
            },
        });
    };

    const despatchDetailToJson = (data) => {
        return {
            UUID: data.uuid,
            "İrsaliye No": data.id,
            "İrsaliye Tarihi": data.issue_date,
            "Gönderim Tarihi": data.received_at,
            Profili: data.profile_id,
            Tipi: data.type_code,
            "Gönderici Ünvan": data.sender.name,
            "Gönderici VKN/TCKN": data.sender.vkn_tckn,
            "Alıcı Ünvan": data.receiver.name,
            "Alıcı VKN/TCKN": data.receiver.vkn_tckn,
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
