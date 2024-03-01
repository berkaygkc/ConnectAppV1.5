let customer_first_time = true;
var sevoucher_date;

$(document).ready(function () {
    sevoucher_date = $("#sevoucher-date").flatpickr({
        locale: "tr",
        defaultDate: new Date(),
        dateFormat: "d.m.Y H:i",
        enableTime: true,
        defaultHour: 0,
        defaultMinute: 0,
        onReady: function (selectedDates, dateStr, instance) {
            $("#sevoucher-date-label").text(
                instance.formatDate(new Date(), "d.m.Y")
            );
        },
        onChange: function (selectedDates, dateStr, instance) {
            $("#sevoucher-date-label").text(
                instance.formatDate(selectedDates[0], "d.m.Y")
            );
            let sev_d = sevoucher_date.formatDate(
                sevoucher_date.selectedDates[0],
                "Y"
            );
            $("#manuel-sevoucher-number").inputmask("option", {
                mask: `&{3}${sev_d}9{9}`,
            });
        },
    });
    let sev_d = sevoucher_date.formatDate(sevoucher_date.selectedDates[0], "Y");
    $("#manuel-sevoucher-number").inputmask({
        mask: `&{3}${sev_d}9{9}`,
        onBeforePaste: function (pastedValue, opts) {
            let serie = pastedValue.substring(0, 3);
            let number = pastedValue.slice(-9);
            return (
                serie +
                sevoucher_date.formatDate(
                    sevoucher_date.selectedDates[0],
                    "Y"
                ) +
                number
            );
        },
        jitMasking: true,
    });
    $("#manuel-sevoucher-number").on("focusout", function () {
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
                        "#customer-collapse-header,#sevoucher-part,#lines-part,#action-btns,#buyer-customer-part-vs,#payment-means-part-vs"
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
                    "#customer-collapse-header,#sevoucher-part,#lines-part,#action-btns,#buyer-customer-part-vs,#payment-means-part-vs"
                ).slideDown(250);
                // $(document).unbind("click");
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
            return { status: false, error, error_parts };
        }

        return { status: true };
    };
    $("#customer-name").focusout((e) => {
        $("#customer-name-label").text($("#customer-name").val());
    });
    $("#customer-tax").on("focusout", (e) => {
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
            $("#customer-tax-label").text($("#customer-tax").val());
        }
    });
});
