let order_date,
    payment_means_date,
    all_taxes,
    sgk_start_date,
    sgk_end_date,
    sgk_exemptions;
const blockPage = (message) => {
    $.blockUI({
        message: `
        <div class="loader-block d-flex justify-content-center">
            <div class="sk-bounce me-3">
                <div class="sk-bounce-dot"></div>
                <div class="sk-bounce-dot"></div>
            </div>
            <p class="mb-0">${message}</p>
        </div>`,
        css: {
            backgroundColor: "transparent",
            border: "0",
        },
        overlayCSS: {
            opacity: 0.5,
        },
    });
};

let currentsTemplate = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: "/create/invoice/currents/%QUERY",
        wildcard: "%QUERY",
        rateLimitWait: 750,
    },
});

let taxOfficeTemplate = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace("dc_Birim"),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    identify: function (obj) {
        return obj.ID;
    },
    prefetch: { url: "/json/tax-office.json" },
});

function renderTaxOffice(q, sync) {
    taxOfficeTemplate.search(q, sync);
}

let countriesTemplate = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    identify: function (obj) {
        return obj.isoCode;
    },
    prefetch: "/json/country.json",
});

function renderCountries(q, sync) {
    if (q === "") {
        sync(countriesTemplate.get("TR"));
    } else {
        countriesTemplate.search(q, sync);
    }
}

let statesTemplate = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: "/create/invoice/states",
        prepare: function (query, settings) {
            settings.type = "POST";
            settings.contentType = "application/json; charset=UTF-8";
            settings.data = JSON.stringify(query);
            return settings;
        },
        rateLimitWait: 750,
    },
});

function renderStates(q, sync, async) {
    if ($("#customer-country-code").val()) {
        statesTemplate.search(
            { key: q, c_code: $("#customer-country-code").val() },
            sync,
            async
        );
    } else {
        statesTemplate.search({ key: q }, sync, async);
    }
}

let districtTemplate = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: "/create/invoice/district",
        prepare: function (query, settings) {
            settings.type = "POST";
            settings.contentType = "application/json; charset=UTF-8";
            settings.data = JSON.stringify(query);
            return settings;
        },
        rateLimitWait: 750,
    },
});

function renderDistrict(q, sync, async) {
    if ($("#customer-city-code").val() || $("#customer-country-code").val()) {
        districtTemplate.search(
            {
                key: q,
                c_code: $("#customer-country-code").val(),
                s_code: $("#customer-city-code").val(),
            },
            sync,
            async
        );
    } else {
        districtTemplate.search({ key: q }, sync, async);
    }
}
let beforeunload = (e) => {
    return (e.returnValue =
        "Değişiklikler kaydedilmeyecek! Çıkmak istediğinize emin misiniz?");
};
window.addEventListener("beforeunload", beforeunload);

$(document).ready(function () {
    $(".bootstrap-maxlength-input").each(function () {
        $(this).maxlength({
            warningClass: "label label-success bg-success text-white",
            limitReachedClass: "label label-danger",
            separator: " / ",
            validate: true,
            threshold: +this.getAttribute("maxlength"),
        });
    });
    $("#customer-tax").inputmask({ mask: "9999999999[9]", jitMasking: true });
    $("#exchange-rate").inputmask({
        alias: "numeric",
        allowMinus: false,
        digits: 8,
    });
    $("#tax-percent").inputmask({
        alias: "numeric",
        allowMinus: false,
        digits: 2,
    });
    $("#customer-etiket-list").select2({
        placeholder: "Etiket seçimi...",
        dropdownParent: $("#customer-etiket-list").parent(),
        width: "resolve",
        language: "tr",
    });

    $("#customer-name")
        .typeahead(null, {
            name: "customer-name",
            display: "name",
            source: currentsTemplate,
            highlight: true,
            templates: {
                pending: (q) => {
                    return `
                        <div class="loader-block d-flex justify-content-center">
                            <div class="sk-wave sk-primary">
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                            </div>
                        </div>
                        `;
                },
                notFound: () => {
                    return ``;
                },
                suggestion: function (data) {
                    return (
                        "<div><strong>" +
                        data.name +
                        "</strong> – " +
                        data.tax_number +
                        "</div>"
                    );
                },
            },
        })
        .bind(
            "typeahead:select typeahead:autocomplete",
            function (ev, suggestion) {
                $("#customer-tax")
                    .typeahead("val", suggestion.tax_number)
                    .trigger("focusout");
                $("#customer-tax-office").typeahead(
                    "val",
                    suggestion.tax_office
                );
                $("#customer-address").typeahead("val", suggestion.address);
                $("#customer-district").typeahead("val", suggestion.district);
                $("#customer-city").typeahead("val", suggestion.city);
                $("#customer-country").typeahead("val", suggestion.country);
                $("#customer-phone").val(suggestion.phone_number);
                $("#customer-mail").val(suggestion.mail);
                $("#customer-postal").val(suggestion.postal_code);
                $("#customer-web").val(suggestion.website);
                $(".content-wrapper").trigger("click");
            }
        );

    $("#customer-tax")
        .typeahead(null, {
            name: "customer-tax",
            display: "tax_number",
            source: currentsTemplate,
            highlight: true,
            templates: {
                pending: () => {
                    return `
                <div class="loader-block d-flex justify-content-center">
                    <div class="sk-wave sk-primary">
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                    </div>
                </div>
                `;
                },
                notFound: () => {
                    return ``;
                },
                suggestion: function (data) {
                    return (
                        "<div><strong>" +
                        data.tax_number +
                        "</strong> – " +
                        data.name +
                        "</div>"
                    );
                },
            },
        })
        .bind(
            "typeahead:select typeahead:autocomplete",
            function (ev, suggestion) {
                $("#customer-name")
                    .typeahead("val", suggestion.name)
                    .trigger("focusout");
                $("#customer-tax-office").typeahead(
                    "val",
                    suggestion.tax_office
                );
                $("#customer-address").typeahead("val", suggestion.address);
                $("#customer-district").typeahead("val", suggestion.district);
                $("#customer-city").typeahead("val", suggestion.city);
                $("#customer-country").typeahead("val", suggestion.country);
                $("#customer-phone").val(suggestion.phone_number);
                $("#customer-mail").val(suggestion.mail);
                $("#customer-postal").val(suggestion.postal_code);
                $("#customer-web").val(suggestion.website);
                $(".content-wrapper").trigger("click");
            }
        );
    $("#customer-address").typeahead(null, {
        name: "customer-address",
        display: "address",
        source: currentsTemplate,
        highlight: true,
        templates: {
            pending: () => {
                return `
                <div class="loader-block d-flex justify-content-center">
                    <div class="sk-wave sk-primary">
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                    </div>
                </div>
                `;
            },
            notFound: () => {
                return ``;
            },
            suggestion: function (data) {
                return "<div>" + data.address + "</div>";
            },
        },
    });

    $("#customer-tax-office").typeahead(null, {
        name: "customer-tax-office",
        display: "dc_Birim",
        source: taxOfficeTemplate,
        highlight: true,
        templates: {
            pending: () => {
                return `
                <div class="loader-block d-flex justify-content-center">
                    <div class="sk-wave sk-primary">
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                        <div class="sk-wave-rect"></div>
                    </div>
                </div>
                `;
            },
            notFound: () => {
                return ``;
            },
            suggestion: function (data) {
                return "<div>" + data.dc_Birim + "</div>";
            },
        },
    });

    $("#customer-country")
        .typeahead(
            {
                minLength: 0,
                highlight: true,
            },
            {
                name: "customer-country",
                display: "name",
                source: renderCountries,
                templates: {
                    pending: () => {
                        return `
                            <div class="loader-block d-flex justify-content-center">
                                <div class="sk-wave sk-primary">
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                </div>
                            </div>
                            `;
                    },
                    notFound: () => {
                        return ``;
                    },
                    suggestion: function (data) {
                        return `<div>${data.flag} - <strong>${data.name}</strong></div>`;
                    },
                },
            }
        )
        .bind("typeahead:change", function (ev, suggestion) {
            $("#customer-country-code").val("");
        })
        .bind(
            "typeahead:select typeahead:autocomplete",
            function (ev, suggestion) {
                $("#customer-country-code").val(suggestion.isoCode);
            }
        );
    $("#customer-city")
        .typeahead(
            {
                highlight: true,
                minLength: 1,
            },
            {
                name: "customer-city",
                display: "name",
                source: renderStates,
                limit: 10,
                templates: {
                    pending: () => {
                        return `
                            <div class="loader-block d-flex justify-content-center">
                                <div class="sk-wave sk-primary">
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                    <div class="sk-wave-rect"></div>
                                </div>
                            </div>
                            `;
                    },
                    notFound: () => {
                        return ``;
                    },
                    suggestion: function (data) {
                        return "<div>" + data.name + "</div>";
                    },
                },
            }
        )
        .bind("typeahead:change", function (ev, suggestion) {
            $("#customer-city-code").val("");
        })
        .bind(
            "typeahead:select typeahead:autocomplete",
            function (ev, suggestion) {
                $("#customer-city-code").val(suggestion.isoCode);
                if (!$("#customer-country").val()) {
                    $.ajax({
                        type: "GET",
                        url: `/create/invoice/country/${suggestion.countryCode}`,
                        success: function (response) {
                            $("#customer-country").typeahead(
                                "val",
                                response.name
                            );
                            $("#customer-country-code").val(response.isoCode);
                        },
                    });
                }
            }
        );

    $("#customer-district")
        .typeahead(
            {
                highlight: true,
                minLength: 1,
            },
            {
                name: "customer-district",
                display: "name",
                source: renderDistrict,
                limit: 10,
                templates: {
                    pending: () => {
                        return `
                        <div class="loader-block d-flex justify-content-center">
                            <div class="sk-wave sk-primary">
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                                <div class="sk-wave-rect"></div>
                            </div>
                        </div>
                        `;
                    },
                    notFound: () => {
                        return ``;
                    },
                    suggestion: function (data) {
                        return "<div>" + data.name + "</div>";
                    },
                },
            }
        )
        .bind(
            "typeahead:select typeahead:autocomplete",
            function (ev, suggestion) {
                if (!$("#customer-country").val()) {
                    $.ajax({
                        type: "GET",
                        url: `/create/invoice/country/${suggestion.countryCode}`,
                        success: function (response) {
                            $("#customer-country").typeahead(
                                "val",
                                response.name
                            );
                            $("#customer-country-code").val(response.isoCode);
                        },
                    });
                }
                if (!$("#customer-city").val()) {
                    $.ajax({
                        type: "GET",
                        url: `/create/invoice/state/${suggestion.countryCode}/${suggestion.stateCode}`,
                        success: function (response) {
                            $("#customer-city").typeahead("val", response.name);
                            $("#customer-city-code").val(response.isoCode);
                        },
                    });
                }
            }
        );
    $("#invoice-profile")
        .select2({
            placeholder: "Fatura profili seçimi...",
            dropdownParent: $("#invoice-profile").parent(),
            width: "resolve",
            language: "tr",
            data: [
                {
                    id: "TICARIFATURA",
                    text: "Ticari Fatura",
                },
                {
                    id: "TEMELFATURA",
                    text: "Temel Fatura",
                },
                {
                    id: "EARSIVFATURA",
                    text: "e-Arşiv Faturası",
                },
                {
                    id: "KAMU",
                    text: "Kamu Faturası",
                },
            ],
        })
        .change((e) => {
            let type = $("#invoice-profile").val();
            let visible_label = "";
            switch (type) {
                case "TICARIFATURA":
                    visible_label = "Ticari";
                    break;
                case "TEMELFATURA":
                    visible_label = "Temel";
                    break;
                case "EARSIVFATURA":
                    visible_label = "e-Arşiv";
                    break;
                case "KAMU":
                    visible_label = "Kamu";
                    break;
            }
            $("#invoice-profile-label").text(visible_label);
            if (type == "TICARIFATURA" && $("#invoice-type").val() == "IADE") {
                $("#invoice-profile").val("TEMELFATURA").trigger("change");
                toastr["info"](
                    "Fatura tipi İade olduğu için fatura profili Ticari seçilemez",
                    "Bilgi"
                );
            }
            if (type == "EARSIVFATURA") {
                $("#earchive-part").slideDown(250);
            } else {
                $("#earchive-part").slideUp(250);
            }
            if (type == "KAMU") {
                $("#buyer-customer-checkbox")
                    .prop("checked", true)
                    .prop("disabled", true)
                    .trigger("change");
                $("#payment-means-checkbox")
                    .prop("checked", true)
                    .prop("disabled", true)
                    .trigger("change");
            }
        });
    $("#invoice-type")
        .select2({
            placeholder: "Fatura tipi seçimi...",
            dropdownParent: $("#invoice-type").parent(),
            width: "resolve",
            language: "tr",
            data: [
                {
                    id: "SATIS",
                    text: "Satış Faturası",
                },
                {
                    id: "IADE",
                    text: "İade Faturası",
                },
                {
                    id: "ISTISNA",
                    text: "İstisna Faturası",
                },
                {
                    id: "TEVKIFAT",
                    text: "Tevkifatlı Fatura",
                },
                // {
                //     id: "OZELMATRAH",
                //     text: "Özel Matrah Faturası",
                // },
                {
                    id: "SGK",
                    text: "SGK Faturası",
                },
            ],
        })
        .change((e) => {
            let type = $("#invoice-type").val();
            let visible_label = "";
            switch (type) {
                case "SATIS":
                    visible_label = "Satış";
                    break;
                case "IADE":
                    visible_label = "İade";
                    break;
                case "ISTISNA":
                    visible_label = "İstisna";
                    break;
                case "TEVKIFAT":
                    visible_label = "Tevkifat";
                    break;
                // case "OZELMATRAH":
                //     visible_label = "Özel Matrah";
                //     break;
                case "SGK":
                    visible_label = "SGK";
                    break;
            }
            $("#invoice-type-label").text(visible_label);
            if (
                type == "IADE" &&
                $("#invoice-profile").val() == "TICARIFATURA"
            ) {
                $("#invoice-profile").val("TEMELFATURA").trigger("change");
                toastr["info"](
                    "Fatura tipi Temel Fatura olarak güncellendi.",
                    "Bilgi"
                );
            }
            if (type == "ISTISNA") {
                $("#exemptions-part").slideDown(250);
            } else {
                $("#exemptions-part").slideUp(250);
            }
            if (type == "SGK") {
                $("#sgk-part").slideDown(250);
            } else {
                $("#sgk-part").slideUp(250);
            }
            if (type == "TEVKIFAT") {
                linesColumnsDefs.splice(7, 0, tevkifatColumns);
                linesGridOptions.api.setColumnDefs(linesColumnsDefs);
                $("#collective-withholding-tax-btn").show();
            } else {
                let has_tevkifat = 0;
                linesColumnsDefs = linesColumnsDefs.filter((column) => {
                    if (column.field == "withholdingTax") {
                        has_tevkifat = 1;
                    }
                    return column.field != "withholdingTax";
                });
                if (has_tevkifat) {
                    linesGridOptions.api.forEachNode((row, index) => {
                        row.setDataValue("withholdingTax.code", "");
                        row.setDataValue("withholdingTax.percent", 0);
                        row.setDataValue("withholdingTax.amount", 0);
                    });
                }
                linesGridOptions.api.setColumnDefs(linesColumnsDefs);
                $("#collective-withholding-tax-btn").hide();
            }
        });
    $("#earchive-send-type").select2({
        placeholder: "e-Arşiv Gönderim Tipi",
        dropdownParent: $("#earchive-send-type").parent(),
        width: "resolve",
        language: "tr",
        data: [
            {
                id: "ELEKTRONIK",
                text: "Elektronik",
            },
            {
                id: "KAGIT",
                text: "Kağıt",
            },
        ],
    });
    $("#earchive-sell-type").select2({
        placeholder: "e-Arşiv Gönderim Tipi",
        dropdownParent: $("#earchive-send-type").parent(),
        width: "resolve",
        language: "tr",
        data: [
            {
                id: "NORMAL",
                text: "Normal Satış",
            },
        ],
    });
    $("#invoice-kdv-exemption").select2({
        placeholder: "İstisna kodu seçimi...",
        dropdownParent: $("#invoice-kdv-exemption").parent(),
        width: "resolve",
        allowClear: true,
        language: "tr",
        // minimumResultsForSearch: Infinity,
        // ajax: {
        //     url: "/create/invoice/exemptions/istisna",
        //     dataType: "json",
        // },
    });
    $("#make-manuel-serie").click((e) => {
        $("#inv-no-status").val("1");
        $("#oto-serie-div").hide("slide", {}, 250);
        setTimeout(() => {
            $("#manuel-serie-div").show("slide", {}, 250);
        }, 300);
    });
    $("#make-auto-serie").click((e) => {
        if ($("#manuel-invoice-number").val() != "") {
            toastr["info"](
                "Fatura numarası manuel olarak girildiği için otomatik seri oluşturulamaz.",
                "Bilgi"
            );
            return;
        }
        $("#inv-no-status").val("0");
        $("#manuel-serie-div").hide("slide", {}, 250);
        setTimeout(() => {
            $("#oto-serie-div").show("slide", {}, 250);
        }, 300);
    });
    $("#einvoice-serie").select2({
        placeholder: "e-Fatura Serisi",
        dropdownParent: $("#einvoice-serie").parent(),
        width: "resolve",
    });
    $("#earchive-serie").select2({
        placeholder: "e-Arşiv Serisi",
        dropdownParent: $("#earchive-serie").parent(),
        width: "resolve",
    });
    $("#einvoice-template").select2({
        placeholder: "e-Fatura Şablonu",
        dropdownParent: $("#einvoice-template").parent(),
        width: "resolve",
    });
    $("#earchive-template").select2({
        placeholder: "e-Arşiv Şablonu",
        dropdownParent: $("#earchive-template").parent(),
        width: "resolve",
    });
    $("#tax-select").select2({
        placeholder: "Vergiler",
        dropdownParent: $("#tax-select").parent(),
        width: "resolve",
    });
    $("#invoice-sgk-type").select2({
        placeholder: "SGK Fatura Tipi",
        dropdownParent: $("#invoice-sgk-type").parent(),
        width: "resolve",
    });
    $("#currency-codes")
        .select2({
            placeholder: "Para Birimi",
            dropdownParent: $("#currency-codes").parent(),
            width: "resolve",
        })
        .change((e) => {
            let code = $("#currency-codes").val();
            if (code != "TRY") {
                $("#currecy-code-text").text(`1 ${code} =`);
                $("#currency-code-div").switchClass("col-12", "col-6", 250);
                setTimeout(() => {
                    $("#exchange-rate-div").show("slide", {}, 250);
                }, 300);
            } else {
                $("#currecy-code-text").text("");
                $("#exchange-rate-div").hide("slide", {}, 250);
                setTimeout(() => {
                    $("#currency-code-div").switchClass("col-6", "col-12", 250);
                }, 250);
            }
        });
    $("#payment-means-code")
        .select2({
            placeholder: "Ödeme şekli seçiniz...",
            dropdownParent: $("#payment-means-code").parent(),
            width: "resolve",
            language: "tr",
            allowClear: true,
            data: [
                {
                    id: 1,
                    text: "1 - Ödeme Tipi Muhtelif",
                },
                {
                    id: 10,
                    text: "10 - Nakit",
                },
                {
                    id: 20,
                    text: "20 - Çek",
                },
                {
                    id: 23,
                    text: "23 - Banka Çeki",
                },
                {
                    id: 42,
                    text: "42 - Havale / EFT",
                },
                {
                    id: 48,
                    text: "48 - Kredi Kartı / Banka Kartı",
                },
            ],
        })
        .val("")
        .trigger("change");
    $("#payment-means-channel")
        .select2({
            placeholder: "Ödeme kanalı seçiniz...",
            dropdownParent: $("#payment-means-channel").parent(),
            width: "resolve",
            allowClear: true,
            language: "tr",
            data: [
                {
                    id: 1,
                    text: "1 - Posta",
                },
                {
                    id: 2,
                    text: "2 - Hava Yolu İle Posta",
                },
                {
                    id: 3,
                    text: "3 - Telgraf",
                },
                {
                    id: 4,
                    text: "4 - Teleks",
                },
                {
                    id: 5,
                    text: "5 - SWIFT",
                },
                {
                    id: 6,
                    text: "6 - Diğer İletişim Ağları",
                },
                {
                    id: 7,
                    text: "7 - Tanımlı Olmayan Ağlar",
                },
                {
                    id: 8,
                    text: "8 - Fedwire",
                },
                {
                    id: 9,
                    text: "9 - Bankadan Elle",
                },
                {
                    id: 10,
                    text: "10 - Taahhütlü Hava Yolu ile Posta",
                },
                {
                    id: 11,
                    text: "11 - Taahhütlü Posta",
                },
                {
                    id: 12,
                    text: "12 - Kurye",
                },
                {
                    id: 13,
                    text: "13 - Özel Kurye",
                },
                {
                    id: 14,
                    text: "14 - Uluslararası Para Transferi",
                },
                {
                    id: 15,
                    text: "15 - Ulusal Para Transferi",
                },
                {
                    id: "ZZZ",
                    text: "ZZZ - Karşılıklı Belirlenen Yol",
                },
            ],
        })
        .val("")
        .trigger("change");

    order_date = $("#order-date").flatpickr({
        locale: "tr",
        dateFormat: "d.m.Y",
    });

    payment_means_date = $("#payment-means-date").flatpickr({
        locale: "tr",
        dateFormat: "d.m.Y",
    });

    sgk_start_date = $("#invoice-sgk-start-date").flatpickr({
        locale: "tr",
        dateFormat: "d.m.Y",
    });

    sgk_end_date = $("#invoice-sgk-end-date").flatpickr({
        locale: "tr",
        dateFormat: "d.m.Y",
    });

    $("#buyer-customer-copy-from-customer").click((e) => {
        $("#buyer-customer-name").val($("#customer-name").val());
        $("#buyer-customer-tax").val($("#customer-tax").val());
        $("#buyer-customer-address").val($("#customer-address").val());
        $("#buyer-customer-tax-office").val($("#customer-tax-office").val());
        $("#buyer-customer-phone").val($("#customer-phone").val());
        $("#buyer-customer-district").val($("#customer-district").val());
        $("#buyer-customer-city").val($("#customer-city").val());
        $("#buyer-customer-country").val($("#customer-country").val());
        $("#buyer-customer-mail").val($("#customer-mail").val());
        $("#buyer-customer-postal").val($("#customer-postal").val());
    });

    $.ajax({
        type: "get",
        url: "/create/invoice/exemptions/istisna",
        success: function (response) {
            response.results.forEach((exemption) => {
                let option = new Option(
                    exemption.text,
                    exemption.id,
                    false,
                    false
                );
                $("#invoice-kdv-exemption")
                    .append(option)
                    .val(null)
                    .trigger("change");
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/definitions/series/1/select",
        success: function (response) {
            response.results.forEach((serie) => {
                if (serie.status) {
                    let option = new Option(
                        `${serie.text}${
                            serie.is_default ? " - Varsayılan" : ""
                        }`,
                        serie.text,
                        false,
                        serie.is_default
                    );
                    $("#einvoice-serie").append(option);
                }
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/definitions/series/2/select",
        success: function (response) {
            response.results.forEach((serie) => {
                if (serie.status) {
                    let option = new Option(
                        `${serie.text}${
                            serie.is_default ? " - Varsayılan" : ""
                        }`,
                        serie.text,
                        false,
                        serie.is_default
                    );
                    $("#earchive-serie").append(option);
                }
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/definitions/templates/1/select",
        success: function (response) {
            response.results.forEach((template) => {
                if (template.status) {
                    let option = new Option(
                        `${template.text}${
                            template.is_default ? " - Varsayılan" : ""
                        }`,
                        template.id,
                        false,
                        template.is_default
                    );
                    $("#einvoice-template").append(option);
                }
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/definitions/templates/2/select",
        success: function (response) {
            response.results.forEach((template) => {
                if (template.status) {
                    let option = new Option(
                        `${template.text}${
                            template.is_default ? " - Varsayılan" : ""
                        }`,
                        template.id,
                        false,
                        template.is_default
                    );
                    $("#earchive-template").append(option);
                }
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/api/v1.0/internal/definitions/currency",
        success: function (response) {
            response.forEach((currency) => {
                let option;
                if (currency.code != "TRY") {
                    option = new Option(
                        `${currency.code} - ${currency.name}`,
                        currency.code,
                        false,
                        false
                    );
                }
                $("#currency-codes").append(option);
            });
        },
    });
    $.ajax({
        type: "get",
        url: "/create/invoice/taxes",
        success: function (response) {
            all_taxes = response.results;
            response.results.forEach((tax) => {
                let option = new Option(
                    `${tax.code} - ${tax.name}`,
                    tax.code,
                    false,
                    false
                );
                $("#tax-select").append(option).val(null).trigger("change");
            });
        },
    });

    $.ajax({
        type: "get",
        url: "/create/invoice/exemptions/SGK/SGK",
        success: function (response) {
            sgk_exemptions = response.results;
            response.results.forEach((tax) => {
                let option = new Option(tax.name, tax.code, false, false);
                $("#invoice-sgk-type")
                    .append(option)
                    .val(null)
                    .trigger("change");
            });
        },
    });
});
