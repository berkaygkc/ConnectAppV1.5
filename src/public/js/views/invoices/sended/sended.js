let detail_loading;
$(document).ready(function () {
    const invoice_table = $("#invoices").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/invoices/sended",
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
            { data: "invoice_no" },
            { data: "receiver_name" },
            { data: "receiver_tax" },
            { data: "invoice_date" },
            { data: "invoice_payable" },
            { data: "currency_code" },
            { data: "invoice_profile" },
            { data: "invoice_type" },
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
                    return `<i class="text-${color}">${types_array[0]}: ${data}</i><br><b>${row["invoice_no"]}</b>`;
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
                    return `${data}<br>${Number(row["invoice_payable"]).toFixed(
                        2
                    )} ${row["currency_code"]}`;
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
                    <span class="badge bg-label-${type} d-block mt-1">${row["invoice_type"]}</span>`;
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
                    <button id="preview-invoice" type="button" class="btn  btn-icon btn-info waves-effect waves-light preview-button">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>`;
                    switch (row.status_code) {
                        case 200:
                            buttons += `<li>
                                            <a id="check-status" class="dropdown-item">
                                                <i class="fa-regular fa-pen-to-square fa-sm"></i> Durum Sorgula
                                            </a>
                                        </li>
                                        <li>
                                            <a id="pdf-download" class="dropdown-item">
                                                <i class="fa-regular fa-pen-to-square fa-sm"></i> PDF Olarak İndir
                                            </a>
                                        </li> 
                                        `;
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

    $("#status").each(function () {
        var $this = $(this);
        $this
            .wrap('<div class="position-relative"></div>')
            .select2({
                dropdownParent: $this.parent(),
                placeholder: "Fatura Durumu",
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

    $("#iframe-print").on("click", function () {
        let myIframe = document.getElementById("invoiceFrame").contentWindow;
        myIframe.focus();
        myIframe.print();

        return false;
    });

    $("#invoices tbody").on("click", "#pdf-download", function (e) {
        let data = invoice_table.row($(this).parents("tr")).data();
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
                    fetch(blobUrl)
                        .then((res) => res.text())
                        .then(async (html) => {
                            let worker = html2pdf();
                            await worker.set({
                                margin: 0.2,
                                filename: `${data.invoice_no} - ${data.receiver_name}.pdf`,
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
                            await worker.save();
                        });
                } catch (error) {
                    console.error(error);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    });

    $("#invoices tbody").on("click", "#check-status", function () {
        let data = invoice_table.row($(this).parents("tr")).data();
        $.ajax({
            type: "GET",
            url: `/invoices/sended/${data.id}/check/status`,
            success: function (response) {
                console.log("response :>> ", response);
                Swal.fire({
                    title: response.summary,
                    text: `${data.invoice_no} numaralı faturanın durumu`,
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

    $("#invoices tbody").on("click", "#mark-not-sended", function () {
        let data = invoice_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `${data.erp_no} numaralı faturayı gönderilmedi olarak işaretlemek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "DELETE",
                    url: `/invoices/sended/${data.id}/mark/send`,
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

    $("#invoices tbody").on("click", "#mark-resolved", function () {
        let data = invoice_table.row($(this).parents("tr")).data();
        Swal.fire({
            title: `${data.erp_no} numaralı faturayı çözüldü olarak işaretlemek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                return $.ajax({
                    type: "PUT",
                    url: `/invoices/sended/${data.id}/mark/resolve`,
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

    $("#invoices tbody").on("click", "#status-label", function () {
        let data = invoice_table.row($(this).parents("tr")).data();
        if (data.status_code != 200) {
            console.log("data.status_desc :>> ", data.status_desc);
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
                Swal.fire({
                    html: `
                        <div class="spinner-border spinner-border-lg text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>İşlem devam ediyor...</p>
                        <div class="progress">
                            <div id="progress-sending-selected" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>`,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                });
                const pdfDoc = await PDFLib.PDFDocument.create();
                let promises = [];
                let counter = 0;
                clicked.each(async (id, index) => {
                    promises.push(async () => {
                        let data = invoice_table.data().filter((e) => e.id == id)[0];
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
                            counter += 0.3;
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter.toFixed(2)) /
                                        promises.length +
                                        "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter.toFixed(2)) / promises.length
                                )
                                .text(
                                    `${counter.toFixed(2)}/${clicked.length}`
                                );
                            let processor = new XSLTProcessor();
                            processor.importStylesheet(xslDoc);
                            let result = processor.transformToDocument(xmlDoc);
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
                            counter += 0.3;
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter.toFixed(2)) /
                                        promises.length +
                                        "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter.toFixed(2)) / promises.length
                                )
                                .text(
                                    `${counter.toFixed(2)}/${clicked.length}`
                                );
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
                            const donorPdfDoc = await PDFLib.PDFDocument.load(
                                arrayBuffer
                            );
                            const docLength = donorPdfDoc.getPageCount();
                            for (var k = 0; k < docLength; k++) {
                                const [donorPage] = await pdfDoc.copyPages(
                                    donorPdfDoc,
                                    [k]
                                );
                                pdfDoc.addPage(donorPage);
                            }
                            counter += 0.4;
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter.toFixed(2)) /
                                        promises.length +
                                        "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter.toFixed(2)) / promises.length
                                )
                                .text(
                                    `${counter.toFixed(2)}/${clicked.length}`
                                );
                        } catch (error) {
                            console.error(error);
                        }
                    });
                });
                await Promise.all(promises.map((p) => p())).then(() => {
                    Swal.fire({
                        title: "İşlem tamamlandı!",
                        html: `PDF dosyası indirilmeye hazır.<br>`,
                        allowOutsideClick: false,
                        showConfirmButton: true,
                        confirmButtonText: "İndir",
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const pdfDataUri = await pdfDoc.saveAsBase64({
                                dataUri: true,
                            });
                            const linkSource1 = pdfDataUri;
                            const downloadLink1 = document.createElement("a");
                            const fileName1 = `Tek Sayfa PDF Gönderilmiş Faturalar.pdf`;
                            downloadLink1.href = linkSource1;
                            downloadLink1.download = fileName1;
                            downloadLink1.click();
                        }
                    });
                });
            }
        });
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    html: `
                        <div class="spinner-border spinner-border-lg text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>İşlem devam ediyor...</p>
                        <div class="progress">
                            <div id="progress-sending-selected" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>`,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                });
                let zip = new JSZip();
                let promises = [];
                let counter = 0;
                clicked.each(async (id, index) => {
                    promises.push(async () => {
                        let data = invoice_table.data().filter((e) => e.id == id)[0];
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
                            counter += 0.3;
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter.toFixed(2)) /
                                        promises.length +
                                        "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter.toFixed(2)) / promises.length
                                )
                                .text(
                                    `${counter.toFixed(2)}/${clicked.length}`
                                );
                            let processor = new XSLTProcessor();
                            processor.importStylesheet(xslDoc);
                            let result = processor.transformToDocument(xmlDoc);
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
                            counter += 0.3;
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter.toFixed(2)) /
                                        promises.length +
                                        "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter.toFixed(2)) / promises.length
                                )
                                .text(
                                    `${counter.toFixed(2)}/${clicked.length}`
                                );
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
                            let pdf_blob = new Blob([arrayBuffer], {
                                type: "application/pdf",
                            });
                            zip.file(
                                `${data.invoice_no} - ${data.receiver_name}.pdf`,
                                pdf_blob
                            );
                            counter += 0.4;
                            $("#progress-sending-selected")
                                .css(
                                    "width",
                                    (100 * counter.toFixed(2)) /
                                        promises.length +
                                        "%"
                                )
                                .attr(
                                    "aria-valuenow",
                                    (100 * counter.toFixed(2)) / promises.length
                                )
                                .text(
                                    `${counter.toFixed(2)}/${clicked.length}`
                                );
                        } catch (error) {
                            console.error(error);
                        }
                    });
                });
                await Promise.all(promises.map((p) => p())).then(() => {
                    Swal.fire({
                        title: "İşlem tamamlandı!",
                        html: `<p>Zip dosyası indirilmeye hazır.</p>`,
                        allowOutsideClick: false,
                        showConfirmButton: true,
                        confirmButtonText: "İndir",
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            zip.generateAsync({
                                type: "blob",
                                compression: "DEFLATE",
                            }).then((zipBlob) => {
                                saveAs(
                                    zipBlob,
                                    "Toplu PDF Gönderilmiş Faturalar.zip",
                                    "application/zip"
                                );
                            });
                        }
                    });
                });
            }
        });
    });
});
