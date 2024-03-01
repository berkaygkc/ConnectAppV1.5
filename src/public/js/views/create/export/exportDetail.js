const makeError = (message) => {
    Swal.fire({
        icon: "error",
        title: "Hata",
        text: message,
    });
};

$(document).ready(function () {
    $("#line-gtip-no").inputmask({mask: "999999999999", jitMasking: true});
    $("#line-gtip-no").on("focusout", function () {
        if ($("#line-gtip-no").inputmask("isComplete")) {
            $.ajax({
                type: "GET",
                url: "/create/invoice/checkgtip/" + $("#line-gtip-no").val(),
                success: function (response) {
                    let data = response;
                    console.log(data, response);
                    $("#gtip-name").text(data.gtipDesc);
                    $("#gtip-desc").text(data.gtip2desc);
                    $("#gtip-detail-link")
                        .attr(
                            "href",
                            "https://ihracatpusulasi.org.tr/imports-by-countries/" +
                            data.gtip6
                        )
                        .attr("target", "_blank");
                    $("#gtip-detail").slideDown(250);
                },
                error: function (error) {
                    $("#gtip-detail").slideUp(250);
                    $("#gtip-name").text("");
                    $("#gtip-desc").text("");
                    $("#gtip-detail-link").attr("href", "#");
                },
            });
        } else {
            $("#gtip-detail").slideUp(250);
            $("#gtip-name").text("");
            $("#gtip-desc").text("");
            $("#gtip-detail-link").attr("href", "#");
        }
    });
    $("#edit-line-form").on("submit", function (e) {
        e.preventDefault();

        if ($("#line-gtip-no").val() == "") {
            makeError("GTIP No alanı boş bırakılamaz.");
            return;
        }
        if (!$("#line-gtip-no").inputmask("isComplete")) {
            makeError("GTIP No alanı 12 haneli olmalıdır.");
            return;
        }
        if ($("#line-teslim").val() == "") {
            makeError("Teslim Şartı alanı boş bırakılamaz.");
            return;
        }
        if ($("#line-gonderim").val() == "") {
            makeError("Gönderim Şekli alanı boş bırakılamaz.");
            return;
        }
        if ($("#line-address").val() == "") {
            makeError("Malın Teslim Adresi alanı boş bırakılamaz.");
            return;
        }
        if ($("#line-city").val() == "") {
            makeError("Malın Teslim Şehri alanı boş bırakılamaz.");
            return;
        }
        if ($("#line-country").val() == "") {
            makeError("Malın Teslim Ülkesi alanı boş bırakılamaz.");
            return;
        }

        let delivery = {
            gtip: $("#line-gtip-no").val(),
            terms: $("#line-teslim").val(),
            transport: $("#line-gonderim").val(),
            trace: $("#line-gtb-no").val(),
            package: {
                no: $("#line-case-no").val(),
                quantity: $("#line-case-quantity").val(),
                unit: $("#line-case-unit").val(),
                brand: $("#line-case-brand").val(),
            },
            address: {
                address: $("#line-address").val(),
                district: $("#line-district").val(),
                city: $("#line-city").val(),
                country: $("#line-country").val(),
                postal_code: $("#line-postal").val(),
            },
        };
        if ($("#export-detail-row-id").val() === 'multiple') {
            let selected_lines = linesGridOptions.api.getSelectedRows();
            if (selected_lines.length > 0) {
                selected_lines.forEach(function (line) {
                    let node = linesGridOptions.api.getRowNode(line.id);
                    node.data.delivery = delivery;
                    node.setDataValue("item.name", node.data.item.name);
                });
            }
        } else {
            let id = $("#export-detail-row-id").val();
            let node = linesGridOptions.api.getRowNode(id);
            node.data.delivery = delivery;
            node.setDataValue("item.name", node.data.item.name);
        }

        $("#edit-line-export").modal("hide");
        $("#edit-line-form")[0].reset();
        $("#line-teslim").val(null).trigger("change");
        $("#line-gonderim").val(null).trigger("change");
        $("#line-case-unit").val(null).trigger("change");
    });
    $("#edit-line-export").on("hidden.bs.modal", function () {
        $("#edit-line-form")[0].reset();
        $("#gtip-detail").slideUp(250);
        $("#gtip-name").text("");
        $("#gtip-desc").text("");
        $("#gtip-detail-link").attr("href", "#");
    });
    $("#collective-export-detail").on("click", function () {
        $("#edit-line-form")[0].reset();
        setTimeout(function () {
            $("#export-detail-row-id").val("multiple");
            $("#edit-line-export").modal("show");
        }, 100);

    });
});
