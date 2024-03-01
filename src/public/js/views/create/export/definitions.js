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
            {key: q, c_code: $("#customer-country-code").val()},
            sync,
            async
        );
    } else {
        statesTemplate.search({key: q}, sync, async);
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
        districtTemplate.search({key: q}, sync, async);
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
    $("#customer-tax").inputmask({
        mask: "[9999999999999999999]",
        jitMasking: true,
    });
    $("#line-case-quantity").inputmask({
        alias: "numeric",
        digits: 8,
    });
    $("#line-case-quantity").inputmask({
        alias: "numeric",
        digits: 8,
    });
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
    $("#einvoice-template").select2({
        placeholder: "e-Fatura Şablonu",
        dropdownParent: $("#einvoice-template").parent(),
        width: "resolve",
    });
    $("#tax-select").select2({
        placeholder: "Vergiler",
        dropdownParent: $("#tax-select").parent(),
        width: "resolve",
    });
    $("#line-teslim").select2({
        placeholder: "Teslim Şartını seçiniz...",
        dropdownParent: $("#line-teslim").parent(),
        width: "resolve",
        language: "tr",
        allowClear: true,
        data: [
            {text: "CFR - Masraflar ve Navlun", id: "CFR"},
            {text: "CIF - Masraflar, Sigorta ve Navlun", id: "CIF"},
            {text: "CIP - Taşıma ve Sigorta Ücreti", id: "CIP"},
            {text: "CPT - Ödenen Taşıma Ücreti", id: "CPT"},
            {text: "DAF - Sınırdan Teslim", id: "DAF"},
            {text: "DDP - Ödenen Gümrük Ücreti", id: "DDP"},
            {text: "DDU - Ödenmeyen Gümrük Ücreti", id: "DDU"},
            {text: "DEQ - Rıhtımdan Teslim", id: "DEQ"},
            {text: "DES - Gemiden Teslim", id: "DES"},
            {text: "EXW - Fabrikadan Teslim", id: "EXW"},
            {text: "FAS - Gemide Ücretsiz", id: "FAS"},
            {text: "FCA - Ücretsiz Taşıma", id: "FCA"},
            {text: "FOB - Güvertede Teslim", id: "FOB"},
            {text: "DAP - Belirlenen Yerde Teslim", id: "DAP"},
            {text: "DAT - Terminalde Teslim", id: "DAT"},
        ],
    });
    $("#line-gonderim").select2({
        placeholder: "Gönderim Şeklini seçiniz...",
        dropdownParent: $("#line-gonderim").parent(),
        width: "resolve",
        language: "tr",
        allowClear: true,
        data: [
            {id: 1, text: "1 - Deniz Taşımacılığı"},
            {id: 2, text: "2 - Demiryolu Taşımacılığı"},
            {id: 3, text: "3 - Karayolu Taşımacılığı"},
            {id: 4, text: "4 - Hava Taşımacılığı"},
            {id: 5, text: "5 - Posta"},
            {id: 6, text: "6 - Kombine Taşımacılık"},
            {id: 7, text: "7 - Sabit Nakliyat"},
            {id: 8, text: "8 - Ülke İçi Su Taşımacılığı"},
            {id: 9, text: "9 - Uygun Olmayan Taşıma Şekli"},
        ],
    });
    $("#line-case-unit").select2({
        placeholder: "Kap Cinsi seçebilirisiniz...",
        dropdownParent: $("#line-case-unit").parent(),
        width: "resolve",
        language: "tr",
        allowClear: true,
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
                    .val(301)
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
        url: "/api/v1.0/internal/definitions/packagetypes",
        success: function (response) {
            response.forEach((packagetype) => {
                let option;
                if (packagetype.code != "TRY") {
                    option = new Option(
                        `${packagetype.name}`,
                        packagetype.code,
                        false,
                        false
                    );
                }
                $("#line-case-unit").append(option);
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
});
