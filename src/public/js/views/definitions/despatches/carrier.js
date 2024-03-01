$(document).ready(function () {
    $("#carrier-taxnumber").inputmask("9999999999[9]");
    $("#carrier-postal").inputmask("99999");
    const carriers_table = $("#carriers-table").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ordering: false,
        ajax: {
            url: "/datatablesQuery/definitions/despatches/carrier",
        },
        columns: [
            { data: "id" },
            { data: "name" },
            { data: "tax_number" },
            { data: "is_default" },
            { data: "status" },
            { data: "process" },
        ],
        columnDefs: [
            {
                targets: 0,
                visible: false,
            },
            {
                targets: 3,
                className: "dt-center",
                render: (data) => {
                    if (data) {
                        return `<i class="fa-regular fa-circle-check text-success fa-lg"></i>`;
                    } else {
                        return `<i class="fa-regular fa-circle-xmark text-warning fa-lg"></i>`;
                    }
                },
            },
            {
                targets: 4,
                className: "dt-center",
                render: (data) => {
                    if (data) {
                        return `<span class="badge bg-success bg-glow">Aktif</span>`;
                    } else {
                        return `<span class="badge bg-secondary bg-glow">Pasif</span>`;
                    }
                },
            },
            {
                targets: 5,
                className: "dt-right",
                render: (data, type, row) => {
                    let buttons = "";
                    if (!row.is_default && row.status) {
                        buttons += `
                        <li>
                            <a id="make-default" class="dropdown-item" href="#"> Varsayılan Yap</a>
                        </li>`;
                    }
                    if (row.status && !row.is_default) {
                        buttons += `
                        <li>
                            <a id="make-pasif" class="dropdown-item" href="#"> Pasit Et</a>
                        </li>`;
                    }
                    if (row.status && row.is_default) {
                        buttons += `
                        <li>
                            <a id="make-undefault" class="dropdown-item" href="#"> Varsayılandan Çıkar</a>
                        </li>`;
                    }
                    if (!row.status) {
                        buttons += `
                        <li>
                            <a id="make-aktif" class="dropdown-item" href="#"> Aktif Et</a>
                        </li>`;
                    }
                    return `<div class="btn-group" role="group" aria-label="process">
                                <button type="button" class="btn btn-icon btn-label-warning waves-effect waves-light" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" style="">
                                    ${buttons}
                                </ul>
                            </div>`;
                },
            },
        ],
        dom: 't<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p><"col-sm-12 col-md-6"l>>',
    });

    $("#carrier-save").click((e) => {
        const name = $("#carrier-name").val();
        const taxnumber = $("#carrier-taxnumber").val();
        const address = $("#carrier-address").val();
        const city = $("#carrier-city").val();
        const district = $("#carrier-district").val();
        const country = $("#carrier-country").val();
        const postal = $("#carrier-postal").val();
        let errors = "";
        if (!name) {
            errors += "- Firma adı belirlemek zorunludur! <br>";
        }
        if (!taxnumber) {
            errors += "- Firma Vergi/TC belirlemek zorunludur! <br>";
        }
        if (!address) {
            errors += "- Firma Adres belirlemek zorunludur! <br>";
        }
        if (!city) {
            errors += "- Firma İl belirlemek zorunludur! <br>";
        }
        if (!district) {
            errors += "- Firma İlçe belirlemek zorunludur! <br>";
        }
        if (!country) {
            errors += "- Firma Ülke belirlemek zorunludur! <br>";
        }
        if (!postal) {
            errors += "- Firma Posta Kodu belirlemek zorunludur! <br>";
        }
        if (!$("#carrier-taxnumber").inputmask("isComplete")) {
            errors +=
                "- Firma Vergi/TC No 10 veya 11 hane olmak zorundadır! <br>";
        }
        if (errors) {
            toastr["error"](errors, "Hata", {
                closeButton: true,
                tapToDismiss: true,
            });
            return;
        }
        let body = {
            TaxNumber: $("#carrier-taxnumber").val(),
            TaxOffice: $("#carrier-taxoffice").val(),
            Name: $("#carrier-name").val(),
            Address: $("#carrier-address").val(),
            District: $("#carrier-district").val(),
            City: $("#carrier-city").val(),
            Country: $("#carrier-country").val(),
            PostalCode: $("#carrier-postal").val(),
            Phone: $("#carrier-phone").val(),
            Mail: $("#carrier-mail").val(),
            is_default: $("#carrier-isdefault").is(":checked"),
        };
        $.ajax({
            type: "POST",
            url: `/definitions/despatches/carrier`,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(body),
            success: function (response) {
                Swal.fire({
                    title: "Başarılı!",
                    text: "Firma başarıyla eklendi!",
                    icon: "success",
                }).then((e) => {
                    $("#carrier-taxnumber").val("");
                    $("#carrier-taxoffice").val("");
                    $("#carrier-name").val("");
                    $("#carrier-address").val("");
                    $("#carrier-district").val("");
                    $("#carrier-city").val("");
                    $("#carrier-country").val("");
                    $("#carrier-postal").val("");
                    $("#carrier-phone").val("");
                    $("#carrier-mail").val("");
                    carriers_table.draw();
                    $("#carrier-modal").modal("hide");
                });
            },
            error: function (err) {
                console.log(err);
                Swal.fire(
                    "Hata!!",
                    "Hata Detayı : " + JSON.stringify(response.responseJSON),
                    "error"
                ).then((e) => {
                    $("#carrier-taxnumber").val("");
                    $("#carrier-taxoffice").val("");
                    $("#carrier-name").val("");
                    $("#carrier-address").val("");
                    $("#carrier-district").val("");
                    $("#carrier-city").val("");
                    $("#carrier-country").val("");
                    $("#carrier-postal").val("");
                    $("#carrier-phone").val("");
                    $("#carrier-mail").val("");
                    carriers_table.draw();
                    $("#carrier-modal").modal("hide");
                });
            },
        });
    });

    $("#carriers-table tbody").on("click", "#make-default", function () {
        let data = carriers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " isimli firmayı varsayılan yapmak istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: `/definitions/despatches/carrier/${data.id}/default`,
                    success: function (response) {
                        carriers_table.draw();
                        toastr["success"](
                            `${data.name} isimli firma başarıyla varsayılan yapıldı!`,
                            "Başarılı",
                            {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            }
                        );
                    },
                    error: function (err) {
                        console.log(err);
                        carriers_table.draw();
                        toastr["error"](JSON.stringify(err), "Hata", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });

    $("#carriers-table tbody").on("click", "#make-undefault", function () {
        let data = carriers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " isimli firmayı varsayılandan çıkarmak istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "DELETE",
                    url: `/definitions/despatches/carrier/${data.id}/default`,
                    success: function (response) {
                        carriers_table.draw();
                        toastr["success"](
                            `${data.name} isimli firma başarıyla varsayılandan çıkarıldı!`,
                            "Başarılı",
                            {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            }
                        );
                    },
                    error: function (err) {
                        console.log(err);
                        carriers_table.draw();
                        toastr["error"](JSON.stringify(err), "Hata", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });

    $("#carriers-table tbody").on("click", "#make-aktif", function () {
        let data = carriers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " adlı firmayı aktif etmek istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: `/definitions/despatches/carrier/${data.id}/status`,
                    success: function (response) {
                        carriers_table.draw();
                        toastr["success"](
                            `${data.name} adlı firma başarıyla aktif edildi!`,
                            "Başarılı",
                            {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            }
                        );
                    },
                    error: function (err) {
                        console.log(err);
                        carriers_table.draw();
                        toastr["error"](JSON.stringify(err), "Hata", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });

    $("#carriers-table tbody").on("click", "#make-pasif", function () {
        let data = carriers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " adlı firmayı pasif etmek istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "DELETE",
                    url: `/definitions/despatches/carrier/${data.id}/status`,
                    success: function (response) {
                        carriers_table.draw();
                        toastr["success"](
                            `${data.name} adlı firma başarıyla pasif edildi!`,
                            "Başarılı",
                            {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            }
                        );
                    },
                    error: function (err) {
                        console.log(err);
                        carriers_table.draw();
                        toastr["error"](JSON.stringify(err), "Hata", {
                            closeButton: true,
                            tapToDismiss: false,
                            progressBar: true,
                        });
                    },
                });
            }
        });
    });
});
