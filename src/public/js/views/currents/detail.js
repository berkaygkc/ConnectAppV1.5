$(document).ready(function () {
    $("#current-update-button").on("click", function () {
        let body = {
            name: $("#current-name").val(),
            tax_number: $("#current-tax-number").val(),
            tax_office: $("#current-tax-office").val(),
            address: $("#current-address").text(),
            city: $("#current-city").val(),
            district: $("#current-district").val(),
            country: $("#current-country").val(),
            phone_number: $("#current-phone-number").val(),
            mail: $("#current-mail").val(),
            postal_code: $("#current-postal-code").val(),
            website: $("#current-website").val(),
        };
        $.ajax({
            type: "post",
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(body),
            success: function (response) {
                Swal.fire({
                    title: "Başarılı!",
                    text: "Cari başarıyla güncellendi.",
                    icon: "success",
                    confirmButtonText: "Tamam",
                });
            },
            error: function (error) {
                Swal.fire({
                    title: "Hata!",
                    text: "Cari güncellenirken bir hata oluştu.",
                    icon: "error",
                    confirmButtonText: "Tamam",
                });
            },
        });
    });
});
