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
    $("#buyer-customer-checkbox").on("change", (e) => {
        if ($("#buyer-customer-checkbox").prop("checked")) {
            $("#buyer-customer-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#buyer-customer-part";
            }, 250);
        } else {
            $("#buyer-customer-part").slideUp(250);
        }
    });
    $("#payment-means-checkbox").on("change", (e) => {
        if ($("#payment-means-checkbox").prop("checked")) {
            $("#payment-means-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#payment-means-part";
            }, 250);
        } else {
            $("#payment-means-part").slideUp(250);
        }
    });
});
