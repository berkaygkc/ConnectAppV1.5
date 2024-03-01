$(document).ready(function () {
    $("#sender-checkbox").on("change", (e) => {
        if ($("#sender-checkbox").prop("checked")) {
            $("#supplier-part").slideDown(250);
        } else {
            $("#supplier-part").slideUp(250);
        }
    });
    $("#order-despatches-checkbox").on("change", (e) => {
        if ($("#order-despatches-checkbox").prop("checked")) {
            $("#order-despatches-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#order-despatches-part";
            }, 250);
        } else {
            $("#order-despatches-part").slideUp(250);
        }
    });
});
