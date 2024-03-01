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
    const validateSevoucher = () => {
        blockPage("SM Makbuzunuz doğrulanıyor...");
        let errors = "";
        let status = true;

        if (errors) {
            status = false;
        }

        $.unblockUI();
        if (status) {
            return true;
        } else {
            Swal.fire({
                title: "SM Makbuzu doğrulanırken hata oluştu!",
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
        let taxExemptions = {};
        if ($("#sevoucher-kdv-exemption").val()) {
            taxExemptions["KDV"] = Number($("#sevoucher-kdv-exemption").val());
        }
        let sevoucherData = {
            document: {
                External: {
                    ID: uuidv4(),
                    RefNo: String(Date.now()).substring(2, 11),
                    Type: `Rahat Belge:belgeApp:${new Date().getDate()}:${new Date().getMonth()}`,
                },
                IssueDateTime: sevoucher_date.formatDate(
                    sevoucher_date.selectedDates[0],
                    "Y-m-d\\TH:i:S"
                ),
                NumberOrSerie:
                    $("#sev-no-status").val() == 0
                        ? $("#sevoucher-serie").val()
                        : $("#manuel-sevoucher-number").val(),
                TemplateID: $("#sevoucher-template").val(),
                Notes: notes,
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
                Lines: lines,
            },
        };
        return sevoucherData;
    };

    $("#xml-download").click((e) => {
        if (!validateSevoucher()) {
            return false;
        }
        blockPage("SM Makbuzu XML dosyası indirilmek için oluşturuluyor...");
        let json = createJson();
        $.ajax({
            type: "POST",
            url: "/create/sevoucher/xml",
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
                saveAs(blob, "YeniSM Makbuzu.xml");
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
        if (!validateSevoucher()) {
            return false;
        }
        blockPage("SM Makbuzu JSON dosyası indirilmek için oluşturuluyor...");
        let json = createJson();
        try {
            var blob = new Blob([JSON.stringify(json, null, 2)], {
                type: "application/json",
            });
            saveAs(blob, "YeniSM Makbuzu.json");
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

    $("#preview-created-sevoucher").click((e) => {
        $("#sevoucherFrame").attr("src", "");
        if (!validateSevoucher()) {
            return false;
        }
        blockPage("SM Makbuzu görüntüsü önizlemek için oluşturuluyor...");
        let xml;
        let xslt;
        let json = createJson();
        $.when(
            $.ajax({
                type: "POST",
                url: "/create/sevoucher/xml",
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
                url: `/create/sevoucher/xslt/${
                    $("#sevoucher-template").val()
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
                    $("#sevoucherFrame").attr("src", URL.createObjectURL(blob));
                    $.unblockUI();
                    $("#preview-sevoucher-modal").modal("show");
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

    $("#print-sevoucher-in-preview").click((e) => {
        let myIframe = document.getElementById("sevoucherFrame").contentWindow;
        myIframe.focus();
        myIframe.print();
    });

    $("#save-created-sevoucher").click((e) => {
        if (!validateSevoucher()) {
            return false;
        }
        Swal.fire({
            title: `Girdiğiniz SM makbuzunu ${
                sevoucher_edit_id ? "güncellemek" : "taslak olarak kaydetmek"
            } istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Eminim, kaydet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                let json = createJson();
                let type, url;
                if (sevoucher_edit_id) {
                    type = "PUT";
                    url = `/create/sevoucher/draft/${sevoucher_edit_id}`;
                } else {
                    type = "POST";
                    url = "/create/sevoucher/draft";
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
                        text: "SM Makbuzunuz başarıyla kaydedildi! Yeni SM makbuzu oluşturmak ister misiniz?",
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: `Yeni SM Makbuzu Oluştur`,
                        cancelButtonText: `Taslaklara Git`,
                    }).then((e) => {
                        if (e.isConfirmed) {
                            window.location.href = "/create/sevoucher";
                        } else {
                            window.location.href = "/sevouchers/waiting";
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

    $("#send-created-sevoucher").click((e) => {
        if (!validateSevoucher()) {
            return false;
        }
        Swal.fire({
            title: `${
                sevoucher_edit_id ? "Güncellediğiniz" : "Girdiğiniz"
            } SM makbuzunu göndermek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Eminim, gönder`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                let json = createJson();
                let type, url;
                if (sevoucher_edit_id) {
                    type = "PUT";
                    url = `/create/sevoucher/send/${sevoucher_edit_id}`;
                } else {
                    type = "POST";
                    url = "/create/sevoucher/send";
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
                        text: "SM Makbuzunuz başarıyla gönderildi! Yeni SM makbuzu oluşturmak ister misiniz?",
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: `Yeni SM Makbuzu Oluştur`,
                        cancelButtonText: `Gönderilmişlere Git`,
                    }).then((e) => {
                        if (e.isConfirmed) {
                            window.location.href = "/create/sevoucher";
                        } else {
                            window.location.href = "/sevouchers/sended";
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
