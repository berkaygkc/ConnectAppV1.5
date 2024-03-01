let customer_first_time = true;
let invoice_date;
const urlParams = new URLSearchParams(window.location.search);
invoice_edit_id = urlParams.get("key");

$(document).ready(function () {
    invoice_date = $("#invoice-date").flatpickr({
        locale: "tr",
        defaultDate: invoice_edit_id ? null : new Date(),
        dateFormat: "d.m.Y H:i",
        enableTime: true,
        defaultHour: 0,
        defaultMinute: 0,
        onReady: function (selectedDates, dateStr, instance) {
            $("#invoice-date-label").text(
                instance.formatDate(new Date(), "d.m.Y")
            );
        },
        onChange: function (selectedDates, dateStr, instance) {
            $("#invoice-date-label").text(
                instance.formatDate(selectedDates[0], "d.m.Y")
            );
            $("#manuel-invoice-number").inputmask("option", {
                mask: `&{3}${invoice_date.formatDate(
                    invoice_date.selectedDates[0],
                    "Y"
                )}9{9}`,
            });
        },
    });
    $("#manuel-invoice-number").inputmask({
        mask: `&{3}${invoice_date.formatDate(
            invoice_date.selectedDates[0],
            "Y"
        )}9{9}`,
        onBeforePaste: function (pastedValue, opts) {
            let serie = pastedValue.substring(0, 3);
            let number = pastedValue.slice(-9);
            return (
                serie +
                invoice_date.formatDate(invoice_date.selectedDates[0], "Y") +
                number
            );
        },
        jitMasking: true,
    });
    $("#manuel-invoice-number").on("focusout", function () {
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
                        "#customer-collapse-header,#invoice-part,#lines-part,#action-btns,#buyer-customer-part-vs,#payment-means-part-vs"
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
                    "#customer-collapse-header,#invoice-part,#lines-part,#action-btns,#buyer-customer-part-vs,#payment-means-part-vs"
                ).slideDown(250);
                if ($("#invoice-profile").val() == "KAMU") {
                    if (!$("#buyer-customer-address").val()) {
                        $("#buyer-customer-address").val(
                            $("#customer-address").val()
                        );
                    }
                    if (!$("#buyer-customer-tax-office").val()) {
                        $("#buyer-customer-tax-office").val(
                            $("#customer-tax-office").val()
                        );
                    }
                    if (!$("#buyer-customer-phone").val()) {
                        $("#buyer-customer-phone").val(
                            $("#customer-phone").val()
                        );
                    }
                    if (!$("#buyer-customer-district").val()) {
                        $("#buyer-customer-district").val(
                            $("#customer-district").val()
                        );
                    }
                    if (!$("#buyer-customer-city").val()) {
                        $("#buyer-customer-city").val(
                            $("#customer-city").val()
                        );
                    }
                    if (!$("#buyer-customer-country").val()) {
                        $("#buyer-customer-country").val(
                            $("#customer-country").val()
                        );
                    }
                    if (!$("#buyer-customer-mail").val()) {
                        $("#buyer-customer-mail").val(
                            $("#customer-mail").val()
                        );
                    }
                    if (!$("#buyer-customer-postal").val()) {
                        $("#buyer-customer-postal").val(
                            $("#customer-postal").val()
                        );
                    }
                }
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
        $("#customer-etiket-list").empty().trigger("change");
        $("#customer-einvoice-etiket-counter").text("0").slideUp(250);
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
                    response.data.forEach((liability) => {
                        if (
                            liability.role == "PK" &&
                            liability.document_type == "Invoice"
                        ) {
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
                            $("#customer-name")
                                .val(liability.title)
                                .trigger("focusout");
                            if (liability.aliases.length > 0) {
                                $("#customer-einvoice-etiket-counter")
                                    .text(liability.aliases.length)
                                    .slideDown(250);
                            } else {
                                $("#customer-einvoice-etiket-counter")
                                    .text(liability.aliases.length)
                                    .slideUp(250);
                            }
                            if (liability.type == "KAMU") {
                                $(
                                    "#invoice-profile>option[value=EARSIVFATURA]"
                                ).attr("disabled", "disabled");
                                $(
                                    "#invoice-profile>option[value=TICARIFATURA]"
                                ).attr("disabled", "disabled");
                                $(
                                    "#invoice-profile>option[value=TEMELFATURA]"
                                ).attr("disabled", "disabled");
                                $(
                                    "#invoice-profile>option[value=KAMU]"
                                ).removeAttr("disabled");

                                $("#invoice-profile").val() != "KAMU"
                                    ? $("#invoice-profile")
                                          .val("KAMU")
                                          .trigger("change")
                                    : "";
                                $("#make-auto-serie").click();
                            } else if (liability.vkn_tckn == "1234567804") {
                                $(
                                    "#invoice-profile>option[value=EARSIVFATURA]"
                                ).attr("disabled", "disabled");
                                $("#invoice-profile>option[value=KAMU]").attr(
                                    "disabled",
                                    "disabled"
                                );
                                $(
                                    "#invoice-profile>option[value=TICARIFATURA]"
                                ).attr("disabled", "disabled");
                                $(
                                    "#invoice-profile>option[value=TEMELFATURA]"
                                ).removeAttr("disabled");
                                $(
                                    "#invoice-profile>option[value=TEMELFATURA]"
                                ).removeAttr("disabled");
                                $("#invoice-profile").val() != "TEMELFATURA"
                                    ? $("#invoice-profile")
                                          .val("TEMELFATURA")
                                          .trigger("change")
                                    : "";
                                $("#invoice-type").val("SGK").trigger("change");
                                $("#make-manuel-serie").click();
                            } else {
                                /*if (liability.type == "OZEL")*/
                                $(
                                    "#invoice-profile>option[value=EARSIVFATURA]"
                                ).attr("disabled", "disabled");
                                $("#invoice-profile>option[value=KAMU]").attr(
                                    "disabled",
                                    "disabled"
                                );
                                $(
                                    "#invoice-profile>option[value=TICARIFATURA]"
                                ).removeAttr("disabled");
                                $(
                                    "#invoice-profile>option[value=TEMELFATURA]"
                                ).removeAttr("disabled");
                                $("#invoice-profile").val() != "TEMELFATURA" &&
                                $("#invoice-profile").val() != "TICARIFATURA"
                                    ? $("#invoice-profile")
                                          .val("TICARIFATURA")
                                          .trigger("change")
                                    : "";

                                $("#make-auto-serie").click();
                            }
                            $("#earchive-part").slideUp(250);
                            $("#customer-liability-label")
                                .text("e-Fatura Mükellefi")
                                .removeClass("bg-label-warning")
                                .addClass("bg-label-linkedin")
                                .slideDown(250);
                            $("#customer-collapse-header")
                                .removeClass("bg-label-warning")
                                .addClass("bg-label-linkedin");
                            $("#customer-collapse-header-title")
                                .removeClass("bg-warning")
                                .addClass("bg-linkedin");
                            $("#earchive-serie")
                                .next(".select2-container")
                                .hide();
                            $("#einvoice-serie")
                                .next(".select2-container")
                                .show();
                            $("#earchive-template")
                                .next(".select2-container")
                                .hide();
                            $("#einvoice-template")
                                .next(".select2-container")
                                .show();
                        }
                    });
                },
                error: (err) => {
                    $("#invoice-profile>option[value=EARSIVFATURA]").removeAttr(
                        "disabled"
                    );
                    $("#invoice-profile>option[value=KAMU]").attr(
                        "disabled",
                        "disabled"
                    );
                    $("#invoice-profile>option[value=TICARIFATURA]").attr(
                        "disabled",
                        "disabled"
                    );
                    $("#invoice-profile>option[value=TEMELFATURA]").attr(
                        "disabled",
                        "disabled"
                    );

                    $("#invoice-profile").val() != "EARSIVFATURA"
                        ? $("#invoice-profile")
                              .val("EARSIVFATURA")
                              .trigger("change")
                        : "";
                    $("#earchive-part").slideDown(250);
                    $("#customer-einvoice-etiket-counter")
                        .text("0")
                        .slideUp(250);
                    $("#customer-liability-label")
                        .text("e-Fatura Mükellefi Değil")
                        .removeClass("bg-label-linkedin")
                        .addClass("bg-label-warning")
                        .slideDown(250);
                    $("#customer-collapse-header")
                        .removeClass("bg-label-linkedin")
                        .addClass("bg-label-warning");
                    $("#customer-collapse-header-title")
                        .removeClass("bg-linkedin")
                        .addClass("bg-warning");
                    $("#earchive-serie").next(".select2-container").show();
                    $("#einvoice-serie").next(".select2-container").hide();
                    $("#earchive-template").next(".select2-container").show();
                    $("#einvoice-template").next(".select2-container").hide();
                    $("#make-auto-serie").click();
                },
                complete: () => {
                    $.unblockUI();
                },
            });
        }
    });
});
