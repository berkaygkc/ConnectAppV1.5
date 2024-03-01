function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

const findMatrah = (amount, percent) => {
    return (
        Number(String(amount).replace(",", ".")) /
        (1 + Number(String(percent).replace(",", ".")) / 100)
    );
};

const clearNumber = (number) => {
    return Number(String(number).replace(",", "."));
};

$(document).ready(function () {
    const validateInvoice = () => {
        blockPage("Faturanız doğrulanıyor...");
        let errors = "";
        let status = true;
        if ($("#payment-means-code").val()) {
            if (!$("#payment-means-iban").val()) {
                errors +=
                    "\n - Ödeme şekli kodu seçilirse Hesap No / IBAN bilgisi girilmesi gerekmektedir!";
            } else if ($("#invoice-profile").val() == "KAMU") {
                let ibanRegex = new RegExp(
                    "^TR[a-zA-Z0-9]{2}([0-9]{4}){1}([0-9]{1})([a-zA-Z0-9]{3})([a-zA-Z0-9]{4}){3}([a-zA-Z0-9]{2})$"
                );
                if (!ibanRegex.test($("#payment-means-iban").val())) {
                    errors +=
                        "\n - Fatura tipi Kamu ise girilen IBAN bilgisi boşluksuz bir şekilde TR dahil 26 karakterli yazılmalıdır!";
                }
            }
        } else {
            if ($("#payment-means-iban").val()) {
                errors +=
                    "\n - Hesap No / IBAN bilgisi girilirse Ödeme şekli kodu seçilmesi gerekmektedir!";
            }
        }

        if ($("#invoice-profile").val() == "KAMU") {
            if (!$("#payment-means-code").val()) {
                errors +=
                    "\n - Fatura profili Kamu olduğunda Ödeme şekli kodu seçilmelidir!";
            }
            if (!$("#buyer-customer-name").val()) {
                errors +=
                    "\n - Fatura profili Kamu olduğunda Aracı kurum ünvan bilgisi zorunludur!";
            }
            if (!$("#buyer-customer-tax").val()) {
                errors +=
                    "\n - Fatura profili Kamu olduğunda Aracı kurum Vergi kimlik bilgisi zorunludur!";
            }
        }

        if ($("#invoice-type").val() == "SGK") {
            if (!$("#invoice-sgk-type").val()) {
                errors +=
                    "\n - Fatura tipi SGK olduğunda SGK Fatura Tipi seçilmelidir!";
            }
            if (!$("#invoice-sgk-comp-code").val()) {
                errors +=
                    "\n - Fatura tipi SGK olduğunda SGK Şirket Kodu seçilmelidir!";
            }
            if (!$("#invoice-sgk-comp-name").val()) {
                errors +=
                    "\n - Fatura tipi SGK olduğunda SGK Şirket Adı seçilmelidir!";
            }
            if (!$("#invoice-sgk-doc-no").val()) {
                errors +=
                    "\n - Fatura tipi SGK olduğunda Döküman Numarası girilmelidir!";
            }
            if (!$("#invoice-sgk-start-date").val()) {
                errors +=
                    "\n - Fatura tipi SGK olduğunda Dönem Başlangıç Tarihi girilmelidir!";
            }
            if (!$("#invoice-sgk-end-date").val()) {
                errors +=
                    "\n - Fatura tipi SGK olduğunda Dönem Bitiş Tarihi girilmelidir!";
            }
        }

        if (errors) {
            status = false;
        }

        $.unblockUI();
        if (status) {
            return true;
        } else {
            Swal.fire({
                title: "Fatura doğrulanırken hata oluştu!",
                icon: "error",
                text: errors,
                confirmButtonText: "Tamam",
            });
            return false;
        }
    };

    const createJson = () => {
        let lines = [];
        linesGridOptions.api.forEachLeafNode((node, index) => {
            let withholding = {};
            let allowance = {};
            let taxes = {};
            let line = {};
            if (node.data.withholdingTax?.code) {
                withholding = {
                    WithholdingTax: {
                        Code: Number(node.data.withholdingTax.code),
                    },
                };
            }
            if (node.data.discount.percent) {
                allowance = {
                    Allowance: {
                        Percent: Number(node.data.discount.percent),
                    },
                };
            }
            if (node.data.taxes.length > 0) {
                let taxes_a = [];
                node.data.taxes.forEach((tax) => {
                    taxes_a.push({
                        Code: tax.code,
                        Percent: clearNumber(tax.percent),
                    });
                });
                taxes = {
                    Taxes: taxes_a,
                };
            }
            if (node.data.kdv.status == "Hariç") {
                line = {
                    Name: node.data.item.name,
                    Quantity: clearNumber(node.data.quantities.quantity),
                    Price: clearNumber(node.data.prices.price),
                    UnitCode: node.data.quantities.unit_code,
                    KDV: {
                        Status: 1,
                        Percent: clearNumber(node.data.kdv.percent),
                    },
                    ...allowance,
                    ...withholding,
                    ...taxes,
                };
            } else if (node.data.kdv.status == "Dahil") {
                line = {
                    Name: node.data.item.name,
                    Quantity: clearNumber(node.data.quantities.quantity),
                    Price: findMatrah(
                        node.data.prices.price,
                        node.data.kdv.percent
                    ),
                    UnitCode: node.data.quantities.unit_code,
                    KDV: {
                        Status: 2,
                        Percent: clearNumber(node.data.kdv.percent),
                    },
                    ...allowance,
                    ...withholding,
                    ...taxes,
                };
            }
            lines.push(line);
        });
        let notes = [];
        notesGridOptions.api.forEachLeafNode((node, index) => {
            if (node.data.note) {
                notes.push({ Note: node.data.note });
            }
        });
        let despatches = [];
        despatchesGridOptions.api.forEachLeafNode((node, index) => {
            if (node.data.despatch_date && node.data.despatch_number) {
                despatches.push({
                    Date: node.data.despatch_date,
                    Value: node.data.despatch_number,
                });
            }
        });
        let order = null;
        if ($("#order-date").val() && $("#order-no").val()) {
            order = {
                Date: order_date.formatDate(
                    order_date.selectedDates[0],
                    "Y-m-d"
                ),
                Value: $("#order-no").val(),
            };
        }
        let taxExemptions = {};
        if ($("#invoice-kdv-exemption").val()) {
            taxExemptions["KDV"] = Number($("#invoice-kdv-exemption").val());
        }
        let buyerCustomer = {};
        if ($("#buyer-customer-tax").val()) {
            buyerCustomer = {
                BuyerCustomer: {
                    TaxNumber: $("#buyer-customer-tax").val(),
                    TaxOffice: $("#buyer-customer-tax-office").val(),
                    Name: $("#buyer-customer-name").val(),
                    Address: $("#buyer-customer-address").val(),
                    District: $("#buyer-customer-district").val(),
                    City: $("#buyer-customer-city").val(),
                    Country: $("#buyer-customer-country").val(),
                    PostalCode: $("#buyer-customer-postal").val(),
                    Phone: $("#buyer-customer-phone").val(),
                    Mail: $("#buyer-customer-mail").val(),
                },
            };
        }
        let paymentMeans = {};
        if ($("#payment-means-code").val()) {
            paymentMeans = {
                PaymentMeans: {
                    MeansCode: $("#payment-means-code").val(),
                    ChannelCode: $("#payment-means-channel").val(),
                    DueDate: $("#payment-means-date").val()
                        ? payment_means_date.formatDate(
                              payment_means_date.selectedDates[0],
                              "Y-m-d"
                          )
                        : null,
                    AccountNumber: $("#payment-means-iban").val(),
                    PaymentNote: $("#payment-means-description").val(),
                },
            };
        }
        let sgk_object = {};
        if ($("#invoice-type").val() == "SGK") {
            sgk_object = {
                SGK: {
                    Type: $("#invoice-sgk-type").val(),
                    CompCode: $("#invoice-sgk-comp-code").val(),
                    CompName: $("#invoice-sgk-comp-name").val(),
                    DocNo: $("#invoice-sgk-doc-no").val(),
                    StartDate: $("#invoice-sgk-start-date").val()
                        ? sgk_start_date.formatDate(
                              sgk_start_date.selectedDates[0],
                              "Y-m-d"
                          )
                        : null,
                    EndDate: $("#invoice-sgk-end-date").val()
                        ? sgk_end_date.formatDate(
                              sgk_end_date.selectedDates[0],
                              "Y-m-d"
                          )
                        : null,
                },
            };
        }
        let invoiceData = {
            document: {
                External: {
                    ID: uuidv4(),
                    RefNo: String(Date.now()).substring(2, 11),
                    Type: `Rahat Belge:belgeApp:${new Date().getDate()}:${new Date().getMonth()}`,
                },
                IssueDateTime: invoice_date.formatDate(
                    invoice_date.selectedDates[0],
                    "Y-m-d\\TH:i:S"
                ),
                Profile: $("#invoice-profile").val(),
                Type: $("#invoice-type").val(),
                NumberOrSerie:
                    $("#inv-no-status").val() == 0
                        ? $("#customer-etiket-list").val()
                            ? $("#einvoice-serie").val()
                            : $("#earchive-serie").val()
                        : $("#manuel-invoice-number").val(),
                TemplateID: $("#customer-etiket-list").val()
                    ? $("#einvoice-template").val()
                    : $("#earchive-template").val(),
                Notes: notes,
                Despatches: despatches,
                Order: order,
                TaxExemptions: taxExemptions,
                CurrencyCode: $("#currency-codes").val(),
                ExchangeRate: Number($("#exchange-rate").val()),
                Customer: {
                    TaxNumber: $("#customer-tax").val(),
                    TaxOffice: $("#customer-tax-office").val(),
                    Name: $("#customer-name").val(),
                    Address: $("#customer-address").val(),
                    District: $("#customer-district").val(),
                    City: $("#customer-city").val(),
                    Country: $("#customer-country").val(),
                    PostalCode: $("#customer-postal").val(),
                    Phone: $("#customer-phone").val(),
                    Mail: $("#customer-mail").val(),
                    Alias: $("#customer-etiket-list").val(),
                },
                ...buyerCustomer,
                ...paymentMeans,
                ...sgk_object,
                Lines: lines,
            },
        };
        return invoiceData;
    };

    $("#xml-download").click((e) => {
        if (!validateInvoice()) {
            return false;
        }
        blockPage("Fatura XML dosyası indirilmek için oluşturuluyor...");
        let json = createJson();
        $.ajax({
            type: "POST",
            url: "/create/invoice/xml",
            data: JSON.stringify(json),
            headers: {
                "Content-Type": "Application/json",
            },
            success: function (response) {
                var s = new XMLSerializer();
                var newXmlStr = s.serializeToString(response);
                var blob = new Blob([newXmlStr], {
                    type: "application/xml",
                });
                saveAs(blob, "YeniFatura.xml");
            },
            error: function (error) {
                console.error(error);
                Swal.fire({
                    title: "Hata",
                    icon: "error",
                    text: `${
                        error.responseJSON?.error
                            ? JSON.stringify(error.responseJSON.error)
                            : JSON.stringify(error)
                    }`,
                    confirmButtonText: "Tamam",
                });
            },
            complete: () => {
                $.unblockUI();
            },
        });
    });

    $("#json-download").click((e) => {
        if (!validateInvoice()) {
            return false;
        }
        blockPage("Fatura JSON dosyası indirilmek için oluşturuluyor...");
        let json = createJson();
        try {
            var blob = new Blob([JSON.stringify(json, null, 2)], {
                type: "application/json",
            });
            saveAs(blob, "YeniFatura.json");
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Hata",
                icon: "error",
                text: `${
                    error.responseJSON?.error
                        ? JSON.stringify(error.responseJSON.error)
                        : JSON.stringify(error)
                }`,
                confirmButtonText: "Tamam",
            });
        } finally {
            $.unblockUI();
        }
    });

    $("#preview-created-invoice").click((e) => {
        $("#invoiceFrame").attr("src", "");
        if (!validateInvoice()) {
            return false;
        }
        blockPage("Fatura görüntüsü önizlemek için oluşturuluyor...");
        let xml;
        let xslt;
        let json = createJson();
        $.when(
            $.ajax({
                type: "POST",
                url: "/create/invoice/xml",
                data: JSON.stringify(json),
                headers: {
                    "Content-Type": "Application/json",
                },
                success: function (response) {
                    xml = response;
                },
            }),
            $.ajax({
                // First Request
                url: `/create/invoice/xslt/${
                    $("#customer-etiket-list").val()
                        ? $("#einvoice-template").val()
                        : $("#earchive-template").val()
                }`,
                type: "get",
                success: function (xslts) {
                    xslt = xslts;
                },
            })
        )
            .then(function () {
                try {
                    let parser = new DOMParser();
                    let xmlDoc, xslDoc;
                    if (typeof xml == "string") {
                        xmlDoc = parser.parseFromString(xml, "application/xml");
                    } else {
                        xmlDoc = xml;
                    }
                    if (typeof xslt == "string") {
                        xslDoc = parser.parseFromString(
                            xslt,
                            "application/xml"
                        );
                    } else {
                        xslDoc = xslt;
                    }
                    let processor = new XSLTProcessor();
                    processor.importStylesheet(xslDoc);
                    let result = processor.transformToDocument(xmlDoc);
                    var blob = new Blob(
                        [
                            new XMLSerializer().serializeToString(
                                result.doctype
                            ),
                            result.documentElement.innerHTML,
                        ],
                        {
                            type: "text/html",
                        }
                    );
                    $("#invoiceFrame").attr("src", URL.createObjectURL(blob));
                    $.unblockUI();
                    $("#preview-invoice-modal").modal("show");
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        title: "Hata",
                        icon: "error",
                        text: `${
                            error.responseJSON?.error
                                ? JSON.stringify(error.responseJSON.error)
                                : JSON.stringify(error)
                        }`,
                        confirmButtonText: "Tamam",
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                $.unblockUI();
                Swal.fire({
                    title: "Hata",
                    icon: "error",
                    text: `${
                        err.responseJSON?.error
                            ? JSON.stringify(err.responseJSON.error)
                            : JSON.stringify(err)
                    }`,
                    confirmButtonText: "Tamam",
                });
            });
    });

    $("#print-invoice-in-preview").click((e) => {
        let myIframe = document.getElementById("invoiceFrame").contentWindow;
        myIframe.focus();
        myIframe.print();
    });

    $("#save-created-invoice").click((e) => {
        if (!validateInvoice()) {
            return false;
        }
        Swal.fire({
            title: `Girdiğiniz faturayı ${
                invoice_edit_id ? "güncellemek" : "taslak olarak kaydetmek"
            } istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Eminim, kaydet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                let json = createJson();
                let type, url;
                if (invoice_edit_id) {
                    type = "PUT";
                    url = `/create/invoice/draft/${invoice_edit_id}`;
                } else {
                    type = "POST";
                    url = "/create/invoice/draft";
                }
                return $.ajax({
                    type: type,
                    url: url,
                    data: JSON.stringify(json),
                    headers: {
                        "Content-Type": "Application/json",
                    },
                    success: function (response) {
                        return true;
                    },
                });
            },
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
        })
            .then((result) => {
                if (result.isConfirmed) {
                    window.removeEventListener("beforeunload", beforeunload);
                    Swal.fire({
                        title: "Başarılı!",
                        text: "Faturanız başarıyla kaydedildi! Yeni fatura oluşturmak ister misiniz?",
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: `Yeni Fatura Oluştur`,
                        cancelButtonText: `Taslaklara Git`,
                    }).then((e) => {
                        if (e.isConfirmed) {
                            window.location.href = "/create/invoice";
                        } else {
                            window.location.href = "/invoices/waiting";
                        }
                    });
                }
            })
            .catch((err) => {
                let error_detail = "";
                try {
                    error_detail = err.responseJSON.data.map((error) => {
                        return `${error.message} <br>`;
                    });
                } catch (error) {
                    error_detail = err.responseJSON?.data
                        ? err.responseJSON?.data
                        : err.responseJSON;
                }
                Swal.fire("Hata!!", "" + JSON.stringify(error_detail), "error");
            });
    });

    $("#send-created-invoice").click((e) => {
        if (!validateInvoice()) {
            return false;
        }
        Swal.fire({
            title: `${
                invoice_edit_id ? "Güncellediğiniz" : "Girdiğiniz"
            } faturayı göndermek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Eminim, gönder`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                let json = createJson();
                let type, url;
                if (invoice_edit_id) {
                    type = "PUT";
                    url = `/create/invoice/send/${invoice_edit_id}`;
                } else {
                    type = "POST";
                    url = "/create/invoice/send";
                }
                return $.ajax({
                    type: type,
                    url: url,
                    data: JSON.stringify(json),
                    headers: {
                        "Content-Type": "Application/json",
                    },
                    success: function (response) {
                        return true;
                    },
                });
            },
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
        })
            .then((result) => {
                if (result.isConfirmed) {
                    window.removeEventListener("beforeunload", beforeunload);
                    Swal.fire({
                        title: "Başarılı!",
                        text: "Faturanız başarıyla gönderildi! Yeni fatura oluşturmak ister misiniz?",
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: `Yeni Fatura Oluştur`,
                        cancelButtonText: `Gönderilmişlere Git`,
                    }).then((e) => {
                        if (e.isConfirmed) {
                            window.location.href = "/create/invoice";
                        } else {
                            window.location.href = "/invoices/sended";
                        }
                    });
                }
            })
            .catch((err) => {
                let error_detail = "";
                try {
                    error_detail = err.responseJSON.data.map((error) => {
                        return `${error.message} <br>`;
                    });
                } catch (error) {
                    error_detail = err.responseJSON?.data
                        ? err.responseJSON?.data
                        : err.responseJSON;
                }
                Swal.fire("Hata!!", "" + JSON.stringify(error_detail), "error");
            });
    });
});
