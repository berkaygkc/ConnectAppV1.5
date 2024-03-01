$(document).ready(function () {
    $("#driver-id").inputmask("99999999999");
    const drivers_table = $("#drivers-table").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ordering: false,
        ajax: {
            url: "/datatablesQuery/definitions/despatches/driver",
        },
        columns: [
            { data: "id" },
            { data: "name_surname" },
            { data: "nationality" },
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

    $("#driver-save").click((e) => {
        const name = $("#driver-name").val();
        const surname = $("#driver-surname").val();
        let errors = "";
        if (!name) {
            errors += "- Şoför adı belirlemek zorunludur! <br>";
        }
        if (!surname) {
            errors += "- Şoför soyadı belirlemek zorunludur! <br>";
        }
        if (!$("#driver-id").inputmask("isComplete")) {
            errors += "- Şoför TC Kimlik 11 hane olmak zorundadır! <br>";
        }
        if (errors) {
            toastr["error"](errors, "Hata", {
                closeButton: true,
                tapToDismiss: true,
            });
            return;
        }
        let body = {
            Name: $("#driver-name").val(),
            Surname: $("#driver-surname").val(),
            ID: $("#driver-id").val(),
            is_default: $("#driver-isdefault").is(":checked"),
        };
        $.ajax({
            type: "POST",
            url: `/definitions/despatches/driver`,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(body),
            success: function (response) {
                Swal.fire({
                    title: "Başarılı!",
                    text: "Şoför başarıyla eklendi!",
                    icon: "success",
                }).then((e) => {
                    $("#driver-name").val("");
                    $("#driver-surname").val("");
                    $("#driver-id").val("");
                    drivers_table.draw();
                    $("#driver-modal").modal("hide");
                });
            },
            error: function (err) {
                console.log(err);
                Swal.fire(
                    "Hata!!",
                    "Hata Detayı : " + JSON.stringify(response.responseJSON),
                    "error"
                ).then((e) => {
                    $("#driver-name").val("");
                    $("#driver-surname").val("");
                    $("#driver-id").val("");
                    drivers_table.draw();
                    $("#driver-modal").modal("hide");
                });
            },
        });
    });

    $("#drivers-table tbody").on("click", "#make-default", function () {
        let data = drivers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name_surname +
                " isimli şoförü varsayılan yapmak istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: `/definitions/despatches/driver/${data.id}/default`,
                    success: function (response) {
                        drivers_table.draw();
                        toastr["success"](
                            `${data.name_surname} isimli şoför başarıyla varsayılan yapıldı!`,
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
                        drivers_table.draw();
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

    $("#drivers-table tbody").on("click", "#make-undefault", function () {
        let data = drivers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name_surname +
                " isimli şoförü varsayılandan çıkarmak istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "DELETE",
                    url: `/definitions/despatches/driver/${data.id}/default`,
                    success: function (response) {
                        drivers_table.draw();
                        toastr["success"](
                            `${data.name_surname} isimli şoför başarıyla varsayılandan çıkarıldı!`,
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
                        drivers_table.draw();
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

    $("#drivers-table tbody").on("click", "#make-aktif", function () {
        let data = drivers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name_surname +
                " adlı şoförü aktif etmek istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: `/definitions/despatches/driver/${data.id}/status`,
                    success: function (response) {
                        drivers_table.draw();
                        toastr["success"](
                            `${data.name_surname} adlı şoför başarıyla aktif edildi!`,
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
                        drivers_table.draw();
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

    $("#drivers-table tbody").on("click", "#make-pasif", function () {
        let data = drivers_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name_surname +
                " adlı şoförü pasif etmek istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "DELETE",
                    url: `/definitions/despatches/driver/${data.id}/status`,
                    success: function (response) {
                        drivers_table.draw();
                        toastr["success"](
                            `${data.name_surname} adlı şoför başarıyla pasif edildi!`,
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
                        drivers_table.draw();
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
