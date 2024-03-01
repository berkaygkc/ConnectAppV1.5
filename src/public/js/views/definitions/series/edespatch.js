$(document).ready(function () {
    $("#edespatch-serie-name").inputmask("(A|9)(A|9)[A|9]");

    const edespatch_table = $("#edespatch-series-table").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ordering: false,
        ajax: {
            url: "/datatablesQuery/definitions/series/3",
        },
        columns: [
            { data: "id" },
            { data: "name" },
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
                targets: 2,
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
                targets: 3,
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
                targets: 4,
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

    $("#edespatch-save-serie").click((e) => {
        const serieName = $("#edespatch-serie-name").val();
        let errors = "";
        if (!serieName) {
            errors += "- Seri kodu belirlemek zorunludur! <br>";
        }
        if (!$("#edespatch-serie-name").inputmask("isComplete")) {
            errors += "- Seri kodu en az 2 hane olmak zorundadır! <br>";
        }
        if (errors) {
            toastr["error"](errors, "Hata", {
                closeButton: true,
                tapToDismiss: false,
                progressBar: true,
            });
            return;
        }
        let formData = new FormData();
        formData.append("serie", serieName);
        formData.append("is_default", $("#edespatch-isdefault").is(":checked"));
        fetch("/definitions/series/3", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.text())
            .then((result) => {
                const response = JSON.parse(result);
                if (response.status) {
                    Swal.fire({
                        title: "Başarılı!",
                        text: "Seriniz başarıyla eklendi!",
                        icon: "success",
                    }).then((e) => {
                        $("#edespatch-serie-name").val("");
                        edespatch_table.draw();
                        $("#edespatch-serie-modal").modal("hide");
                    });
                } else {
                    Swal.fire(
                        "Hata!!",
                        "Hata Detayı : " +
                            JSON.stringify(response.responseJSON),
                        "error"
                    ).then((e) => {
                        $("#edespatch-serie-name").val("");
                        edespatch_table.draw();
                        $("#edespatch-serie-modal").modal("hide");
                    });
                }
            });
    });

    $("#edespatch-series-table tbody").on("click", "#make-default", function () {
        let data = edespatch_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " kodlu seriyi varsayılan yapmak istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: `/definitions/series/3/${data.id}/default`,
                    success: function (response) {
                        edespatch_table.draw();
                        toastr["success"](
                            `${data.name} kodlu seri başarıyla varsayılan yapıldı!`,
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
                        edespatch_table.draw();
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

    $("#edespatch-series-table tbody").on("click", "#make-aktif", function () {
        let data = edespatch_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " kodlu seriyi aktif etmek istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "PUT",
                    url: `/definitions/series/3/${data.id}/status`,
                    success: function (response) {
                        edespatch_table.draw();
                        toastr["success"](
                            `${data.name} kodlu seri başarıyla aktif edildi!`,
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
                        edespatch_table.draw();
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

    $("#edespatch-series-table tbody").on("click", "#make-pasif", function () {
        let data = edespatch_table.row($(this).parents("tr")).data();
        Swal.fire({
            title:
                data.name +
                " kodlu seriyi pasif etmek istediğinize emin misiniz?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Evet`,
            cancelButtonText: `Hayır`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "DELETE",
                    url: `/definitions/series/3/${data.id}/status`,
                    success: function (response) {
                        edespatch_table.draw();
                        toastr["success"](
                            `${data.name} kodlu seri başarıyla pasif edildi!`,
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
                        edespatch_table.draw();
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
