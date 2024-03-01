$(document).ready(function () {
    $("#sender-checkbox").on("change", (e) => {
        if ($("#sender-checkbox").prop("checked")) {
            $("#supplier-part").slideDown(250);
        } else {
            $("#supplier-part").slideUp(250);
        }
    });
    $("#order-checkbox").on("change", (e) => {
        if ($("#order-checkbox").prop("checked")) {
            $("#order-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#order-part";
            }, 250);
        } else {
            $("#order-part").slideUp(250);
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
    $("#seller-supplier-checkbox").on("change", (e) => {
        if ($("#seller-supplier-checkbox").prop("checked")) {
            $("#seller-supplier-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#seller-supplier-part";
            }, 250);
        } else {
            $("#seller-supplier-part").slideUp(250);
        }
    });
    $("#originator-customer-checkbox").on("change", (e) => {
        if ($("#originator-customer-checkbox").prop("checked")) {
            $("#originator-customer-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#originator-customer-part";
            }, 250);
        } else {
            $("#originator-customer-part").slideUp(250);
        }
    });
    $("#delivery-address-checkbox").on("change", (e) => {
        if ($("#delivery-address-checkbox").prop("checked")) {
            $("#delivery-address-part").slideDown(250);
            setTimeout(() => {
                window.location.href = "#delivery-address-part";
            }, 250);
        } else {
            $("#delivery-address-part").slideUp(250);
        }
    });
});
