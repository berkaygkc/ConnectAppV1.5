$(document).ready(function () {
    $("#customer-name").focusout((e) => {
        $("#customer-name-label").text($("#customer-name").val());
    });
    $("#customer-tax").focusout((e) => {
        $("#customer-tax-label").text($("#customer-tax").val());
    });
    $("#buyer-customer-name").focusout((e) => {
        $("#buyer-customer-name-label").text($("#buyer-customer-name").val());
    });
    $("#buyer-customer-tax").focusout((e) => {
        $("#buyer-customer-tax-label").text($("#buyer-customer-tax").val());
    });
    $("#seller-supplier-name").focusout((e) => {
        $("#seller-supplier-name-label").text($("#seller-supplier-name").val());
    });
    $("#seller-supplier-tax").focusout((e) => {
        $("#seller-supplier-tax-label").text($("#seller-supplier-tax").val());
    });
    $("#originator-customer-name").focusout((e) => {
        $("#originator-customer-name-label").text($("#originator-customer-name").val());
    });
    $("#originator-customer-tax").focusout((e) => {
        $("#originator-customer-tax-label").text($("#originator-customer-tax").val());
    });

});