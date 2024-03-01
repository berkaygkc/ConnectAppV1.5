let customer_first_time = true;
var despatch_date, actual_despatch_date;

$(document).ready(function () {
    despatch_date = $("#despatch-date").flatpickr({
        locale: "tr",
        defaultDate: new Date(),
        dateFormat: "d.m.Y H:i",
        enableTime: true,
        defaultHour: 0,
        defaultMinute: 0,
        onReady: function (selectedDates, dateStr, instance) {
            $("#despatch-date-label").text(
                instance.formatDate(new Date(), "d.m.Y")
            );
        },
        onChange: function (selectedDates, dateStr, instance) {
            $("#despatch-date-label").text(
                instance.formatDate(selectedDates[0], "d.m.Y")
            );
            let dsp_d = despatch_date.formatDate(
                despatch_date.selectedDates[0],
                "Y"
            );
            $("#manuel-despatch-number").inputmask("option", {
                mask: `&{3}${dsp_d}9{9}`,
            });
        },
    });
    let dsp_d = despatch_date.formatDate(despatch_date.selectedDates[0], "Y");
    actual_despatch_date = $("#actual-despatch-date").flatpickr({
        locale: "tr",
        defaultDate: new Date(),
        dateFormat: "d.m.Y H:i",
        enableTime: true,
        defaultHour: 0,
        defaultMinute: 0,
    });
    $("#manuel-despatch-number").inputmask({
        mask: `&{3}${dsp_d}9{9}`,
        onBeforePaste: function (pastedValue, opts) {
            let serie = pastedValue.substring(0, 3);
            let number = pastedValue.slice(-9);
            return (
                serie +
                despatch_date.formatDate(despatch_date.selectedDates[0], "Y") +
                number
            );
        },
        jitMasking: true,
    });
    $("#manuel-despatch-number").on("focusout", function () {
        if ($(this).val().length > 7 && $(this).val().length < 17) {
            let num = $(this).val().substring(7);
            $(this).val(
                $(this).val().substring(0, 7) +
                num.padStart(9, "0").substring(0, 9)
            );
        }
    });
    $(document).click(function (event) {
        var clickover = $(event.target);
        var $navbar = $("#customer-collapse");
        var _opened = $navbar.hasClass("show");
        if (
            _opened === true &&
            !clickover.parents("#customer-collapse").length &&
            !clickover.parents("#loader-block").length
        ) {
            let customer_status = validate_customer_collapse();
            if (!customer_status.status) {
                if (!customer_first_time) {
                    customer_first_time = true;
                    $(
                        "#customer-collapse-header,#despatch-part,#lines-part,#action-btns,#buyer-customer-part,#seller-supplier-part,#originator-customer-part,#order-part"
                    ).slideUp(250);
                }
                $(customer_status.error_parts.join())
                    .addClass("border border-2 border-danger rounded", 250)
                    .effect(
                        "shake",
                        {
                            distance: 5,
                        },
                        650
                    );
                setTimeout(() => {
                    $(customer_status.error_parts.join()).removeClass(
                        "border border-2 border-danger rounded",
                        300
                    );
                }, 2000);
            } else if (customer_first_time) {
                customer_first_time = false;
                $navbar.collapse("hide");
                $(
                    "#customer-collapse-header,#despatch-part,#lines-part,#action-btns"
                ).slideDown(250);
                if ($("#buyer-customer-checkbox").prop("checked")) {
                    $("#buyer-customer-part").slideDown(250);
                }
                if ($("#seller-supplier-checkbox").prop("checked")) {
                    $("#seller-supplier-part").slideDown(250);
                }
                if ($("#originator-customer-checkbox").prop("checked")) {
                    $("#originator-customer-part").slideDown(250);
                }
                if ($("#order-checkbox").prop("checked")) {
                    $("#order-part").slideDown(250);
                }
            }
        }
    });
    let validate_customer_collapse = () => {
        let error = "";
        let error_parts = [];
        if (!$("#customer-name").val()) {
            error += "\n- Alıcı Ünvan / Adı Soyadı zorunludur!";
            error_parts.push("#customer-name-input");
        }
        if (!$("#customer-tax").inputmask("isComplete")) {
            error +=
                "\n- Alıcı Vergi/TC Kimlik Numarası dolu ve 10 veya 11 haneli olmalıdır!";
            error_parts.push("#customer-tax-input");
        }
        if (
            $("#customer-tax").val().length == 10 &&
            !$("#customer-tax-office").val()
        ) {
            error +=
                "\n- Alıcı Vergi Kimlik numarası girilmiş ise vergi dairesi zorunludur!";
            error_parts.push("#customer-tax-office");
        }
        if (!$("#customer-district").val()) {
            error += "\n- Alıcı İlçe bilgisi zorunludur!";
            error_parts.push("#customer-district");
        }
        if (!$("#customer-city").val()) {
            error += "\n- Alıcı İl bilgisi zorunludur!";
            error_parts.push("#customer-city");
        }
        if (!$("#customer-country").val()) {
            error += "\n- Alıcı Ülke bilgisi zorunludur!";
            error_parts.push("#customer-country");
        }

        if (error_parts.length) {
            return {status: false, error, error_parts};
        }

        return {status: true};
    };
    $("#customer-name").focusout((e) => {
        $("#customer-name-label").text($("#customer-name").val());
    });
    $("#customer-tax").on("focusout", (e) => {
        $("#customer-etiket-list").empty().trigger("change");
        $("#customer-etiket-list")
            .next(".select2-container")
            .hide();
        $("#customer-edespatch-etiket-counter").text("0").slideUp(250);
        $("#customer-liability-label").slideUp(250);
        if (!$("#customer-tax").inputmask("isComplete")) {
            $("#customer-tax-label").text("");
            $("#customer-tax-input")
                .addClass("border border-2 border-danger rounded", 250)
                .effect(
                    "shake",
                    {
                        distance: 5,
                    },
                    650
                );
            setTimeout(() => {
                $("#customer-tax-input").removeClass(
                    "border border-2 border-danger rounded",
                    300
                );
            }, 2000);
        } else {
            blockPage("Vergi/TC Kimlik Numarası mükellefiyeti sorgulanıyor...");
            $("#customer-tax-label").text($("#customer-tax").val());
            $.ajax({
                type: "get",
                url: `/api/v1.0/internal/check/liability/${$(
                    "#customer-tax"
                ).val()}`,
                success: function (response) {
                    let find = false;
                    response.data.forEach((liability) => {
                        if (
                            liability.role == "PK" &&
                            liability.document_type == "DespatchAdvice"
                        ) {
                            find = true;
                            liability.aliases.forEach((alias) => {
                                let option = new Option(
                                    alias.name,
                                    alias.name,
                                    false,
                                    false
                                );
                                $("#customer-etiket-list")
                                    .append(option)
                                    .trigger("change")
                                    .slideDown(250);
                            });
                            if (liability.aliases.length > 1) {
                                $("#customer-edespatch-etiket-counter")
                                    .text(liability.aliases.length)
                                    .slideDown(250);
                                $("#customer-name")
                                    .val(liability.title)
                                    .trigger("focusout");
                            } else {
                                $("#customer-edespatch-etiket-counter")
                                    .text(liability.aliases.length)
                                    .slideUp(250);
                            }
                            $("#customer-liability-label")
                                .text("e-İrsaliye Mükellefi")
                                .removeClass("bg-label-warning")
                                .addClass("bg-label-linkedin")
                                .slideDown(250);
                            $("#customer-collapse-header")
                                .removeClass("bg-label-warning")
                                .addClass("bg-label-linkedin");
                            $("#customer-collapse-header-title")
                                .removeClass("bg-warning")
                                .addClass("bg-linkedin");
                        }
                        if (!find) {
                            $("#customer-edespatch-etiket-counter")
                                .text("0")
                                .slideUp(250);
                            $("#customer-liability-label")
                                .text("e-İrsaliye Mükellefi Değil")
                                .removeClass("bg-label-linkedin")
                                .addClass("bg-label-warning")
                                .slideUp(250);
                            $("#customer-collapse-header")
                                .removeClass("bg-label-linkedin")
                                .addClass("bg-label-warning");
                            $("#customer-collapse-header-title")
                                .removeClass("bg-linkedin")
                                .addClass("bg-warning");
                        }
                    });
                },
                error: (err) => {
                    $("#customer-edespatch-etiket-counter")
                        .text("0")
                        .slideUp(250);
                    $("#customer-liability-label")
                        .text("e-İrsaliye Mükellefi Değil")
                        .removeClass("bg-label-linkedin")
                        .addClass("bg-label-warning")
                        .slideUp(250);
                    $("#customer-collapse-header")
                        .removeClass("bg-label-linkedin")
                        .addClass("bg-label-warning");
                    $("#customer-collapse-header-title")
                        .removeClass("bg-linkedin")
                        .addClass("bg-warning");
                },
                complete: () => {
                    $.unblockUI();
                },
            });
        }
    });
});
