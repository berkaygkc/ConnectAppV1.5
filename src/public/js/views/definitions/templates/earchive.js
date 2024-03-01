$(document).ready(function () {
    const earchive_table = $("#earchive-templates-table").DataTable({
        language: {
            url: "/vendor/libs/datatables/language/dataTables.tr.json",
        },
        serverSide: true,
        processing: true,
        ordering: false,
        ajax: {
            url: "/datatablesQuery/definitions/templates/2",
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
                    let buttons = `
                            <li>
                                <a id="download-template" class="dropdown-item" href="#"> İndir</a>
                            </li>`;
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
                            <button type="button" class="btn btn-icon btn-label-info waves-effect waves-light" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" style="">
                                <li>
                                    <a class="dropdown-item" href="#"> Normal</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#"> İskontolu</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#"> İhracat</a>
                                </li>
                            </ul>
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

    $("#earchive-save-from-file").click((e) => {
        let file = $("#earchive-template-file").prop("files")[0];
        const templateName = $("#earchive-template-name").val();

        let errors = "";
        if (file) {
            if (
                file.type != "application/xml" &&
                file.type != "application/xslt" &&
                file.type != "application/xslt+xml" &&
                file.type != "text/xml" &&
                file.type != "text/xslt" &&
                file.type != "text/xslt+xml"
            ) {
                errors += "- Belge tipi sadece xslt tipinde olabilir! <br>";
            }
            if (file.size > 1000000) {
                errors += "- Belge boyutu 1 MB'tan büyük olamaz! <br>";
            }
        } else {
            errors += "- Belge eklenmek zorunludur! <br>";
        }

        if (!templateName) {
            errors += "- Şablon adı belirlemek zorunludur! <br>";
        }

        if (templateName.length > 50) {
            errors += "Şablon adı 50 karakterden uzun olamaz! <br>";
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
        formData.append("template", file);
        formData.append("name", templateName);
        formData.append("is_default", $("#earchive-isdefault").is(":checked"));
        fetch("/definitions/templates/2", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.text())
            .then((result) => {
                const response = JSON.parse(result);
                if (response.status) {
                    Swal.fire({
                        title: "Başarılı!",
                        text: "Şablonunuz başarıyla yüklendi!",
                        icon: "success",
                    }).then((e) => {
                        $("#earchive-template-file").val("");
                        $("#earchive-template-name").val("");
                        earchive_table.draw();
                        $("#earchive-fromfile").modal("hide");
                    });
                } else {
                    Swal.fire(
                        "Hata!!",
                        "Hata Detayı : " +
                            JSON.stringify(response.responseJSON),
                        "error"
                    ).then((e) => {
                        $("#earchive-template-file").val("");
                        $("#earchive-template-name").val("");
                        earchive_table.draw();
                        $("#earchive-fromfile").modal("hide");
                    });
                }
            });
    });

    $("#earchive-templates-table tbody").on(
        "click",
        "#download-template",
        function () {
            let data = earchive_table.row($(this).parents("tr")).data();
            Swal.fire({
                title:
                    data.name +
                    " isimli şablonu indirmek istediğinize emin misiniz?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: `Evet`,
                cancelButtonText: `Hayır`,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "GET",
                        url: `/definitions/templates/2/${data.id}`,
                        success: function (response) {
                            earchive_table.draw();
                            let b64_data = response.data;
                            let a = document.createElement("a");
                            a.href =
                                "data:application/octet-stream;base64," +
                                b64_data;
                            a.download = data.name + ".xslt";
                            a.click();
                            toastr["success"](
                                `${data.name} isimli şablon başarıyla indirildi!`,
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
                            earchive_table.draw();
                            toastr["error"](JSON.stringify(err), "Hata", {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            });
                        },
                    });
                }
            });
        }
    );

    $("#earchive-templates-table tbody").on(
        "click",
        "#make-default",
        function () {
            let data = earchive_table.row($(this).parents("tr")).data();
            Swal.fire({
                title:
                    data.name +
                    " isimli şablonu varsayılan yapmak istediğinize emin misiniz?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: `Evet`,
                cancelButtonText: `Hayır`,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "PUT",
                        url: `/definitions/templates/2/${data.id}/default`,
                        success: function (response) {
                            earchive_table.draw();
                            toastr["success"](
                                `${data.name} isimli şablon başarıyla varsayılan yapıldı!`,
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
                            earchive_table.draw();
                            toastr["error"](JSON.stringify(err), "Hata", {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            });
                        },
                    });
                }
            });
        }
    );

    $("#earchive-templates-table tbody").on(
        "click",
        "#make-aktif",
        function () {
            let data = earchive_table.row($(this).parents("tr")).data();
            Swal.fire({
                title:
                    data.name +
                    " isimli şablonu aktif etmek istediğinize emin misiniz?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: `Evet`,
                cancelButtonText: `Hayır`,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "PUT",
                        url: `/definitions/templates/2/${data.id}/status`,
                        success: function (response) {
                            earchive_table.draw();
                            toastr["success"](
                                `${data.name} isimli şablon başarıyla aktif edildi!`,
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
                            earchive_table.draw();
                            toastr["error"](JSON.stringify(err), "Hata", {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            });
                        },
                    });
                }
            });
        }
    );

    $("#earchive-templates-table tbody").on(
        "click",
        "#make-pasif",
        function () {
            let data = earchive_table.row($(this).parents("tr")).data();
            Swal.fire({
                title:
                    data.name +
                    " isimli şablonu pasif etmek istediğinize emin misiniz?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: `Evet`,
                cancelButtonText: `Hayır`,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "DELETE",
                        url: `/definitions/templates/2/${data.id}/status`,
                        success: function (response) {
                            earchive_table.draw();
                            toastr["success"](
                                `${data.name} isimli şablon başarıyla pasif edildi!`,
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
                            earchive_table.draw();
                            toastr["error"](JSON.stringify(err), "Hata", {
                                closeButton: true,
                                tapToDismiss: false,
                                progressBar: true,
                            });
                        },
                    });
                }
            });
        }
    );
});
