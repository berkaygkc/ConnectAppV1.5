let detail_loading;

$(document).ready(function () {
    const current_table = $("#currents").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        ordering: false,
        serverSide: true,
        processing: true,
        ajax: {
            url: "/datatablesQuery/currents",
            data: (d) => {
                return $.extend({}, d, {
                    query: {
                        q: $("#searchbox").val(),
                    },
                });
            },
        },
        columns: [
            { data: "id" },
            { data: "process" },
            { data: "name" },
            { data: "tax_number" },
            { data: "tax_office" },
            { data: "address" },
            { data: "city" },
            { data: "district" },
            { data: "phone_number" },
            { data: "mail" },
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
                    return `
                    <div class="btn-group" role="group" aria-label="Basic example">
                    <a href="/currents/${row.id}"><button id="preview-current" type="button" class="btn btn-icon btn-primary waves-effect waves-light preview-button">
                            <i class="fa-solid fa-list-ol"></i>
                        </button></a>
                    </div>`;
                },
            },
            {
                targets: 2,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>${
                        data.length > 35 ? data.substring(0, 35) + "..." : data
                    }</b>`;
                },
            },
            {
                targets: 3,
                render: (data, type, row) => {
                    return `<b>${
                        data.length == 11 ? `TC: ${data}` : `VKN: ${data}`
                    }</b>`;
                },
            },
            {
                targets: 4,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>${
                        data
                            ? data.length > 20
                                ? data.substring(0, 20) + "..."
                                : data
                            : ""
                    }</b>`;
                },
            },
            {
                targets: 5,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>Adres:</b> ${
                        data
                            ? data.length > 20
                                ? data.substring(0, 20) + "..."
                                : data
                            : ""
                    } <br>
                    ${
                        row["district"]
                            ? row["district"] > 20
                                ? row["district"].substring(0, 20) + "..."
                                : row["district"]
                            : ""
                    }<b> / </b>
                    ${
                        row["city"]
                            ? row["city"] > 20
                                ? row["city"].substring(0, 20) + "..."
                                : row["city"]
                            : ""
                    }`;
                },
            },
            {
                targets: 8,
                width: "1px",
                render: (data, type, row) => {
                    return `<b>Tel:</b> ${
                        data
                            ? data.length > 15
                                ? data.substring(0, 15) + "..."
                                : data
                            : ""
                    } <br>
                    <b>Mail:</b> ${
                        row["mail"]
                            ? row["mail"] > 35
                                ? row["mail"].substring(0, 35) + "..."
                                : row["mail"]
                            : ""
                    }`;
                },
            },
            {
                targets: [6, 7, 9],
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
    $("#currents").on("processing.dt", function (e, settings, processing) {
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
        current_table.draw();
    };
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
    $("#add-from-excel-button").click((e) => {
        let excel = document.getElementById("current-excel-file").files[0];
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
                datas = datas.map((data) => {
                    return {
                        name: data["Ünvan"],
                        tax_number: data["Vergi/TC No"],
                        tax_office: data["Vergi Dairesi"],
                        address: data["Adres"],
                        district: data["İlçe"],
                        city: data["İl"],
                        country: data["Ülke"],
                        phone_number: data["Telefon"],
                        mail: data["Mail"],
                        postal_code: data["Posta Kodu"],
                        website: data["Web Sitesi"],
                    }
                });
                console.log(datas);
                addCurrentsFromExcel(datas);
            });
        };
        fileReader.readAsBinaryString(excel);
    });
    const addCurrentsFromExcel = (clicked) => {
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
                    <h4>Cariler yükleniyor...</h4>
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
                url: "/currents/upsert",
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
                    html: `
                            <h4>Yükleme tamamlandı!</h4>
                            <blockquote class="blockquote mt-3">
                                <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${counter + 1
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
                    current_table.columns().checkboxes.deselect(true);
                    current_table.draw();
                });
            },
            onAnyFailed: () => { },
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
                                <p class="mb-0 text-secondary">Toplam Gönderilen : <b>${counter + 1
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
                    current_table.columns().checkboxes.deselect(true);
                    current_table.draw();
                    if (e.isDenied) {
                    }
                });
            },
        });
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
