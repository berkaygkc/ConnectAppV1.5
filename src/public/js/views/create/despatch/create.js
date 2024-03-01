function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

const clearNumber = (number) => {
    return Number(String(number).replace(",", "."));
};

$(document).ready(function () {
    const validateDespatch = () => {
        blockPage("İrsaliyeniz doğrulanıyor...");
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
                title: "İrsaliye doğrulanırken hata oluştu!",
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
            lines.push({
                Name: node.data.item.name,
                Quantity: clearNumber(node.data.quantities.quantity),
                Price: clearNumber(node.data.prices.price),
                UnitCode: node.data.quantities.unit_code,
            });
        });
        let notes = [];
        notesGridOptions.api.forEachLeafNode((node, index) => {
            if (node.data.note) {
                notes.push({ Note: node.data.note });
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
        let sellerSupplier = {};
        if ($("#seller-supplier-tax").val()) {
            sellerSupplier = {
                SellerSupplier: {
                    TaxNumber: $("#seller-supplier-tax").val(),
                    TaxOffice: $("#seller-supplier-tax-office").val(),
                    Name: $("#seller-supplier-name").val(),
                    Address: $("#seller-supplier-address").val(),
                    District: $("#seller-supplier-district").val(),
                    City: $("#seller-supplier-city").val(),
                    Country: $("#seller-supplier-country").val(),
                    PostalCode: $("#seller-supplier-postal").val(),
                    Phone: $("#seller-supplier-phone").val(),
                    Mail: $("#seller-supplier-mail").val(),
                },
            };
        }
        let originatorCustomer = {};
        if ($("#originator-customer-tax").val()) {
            originatorCustomer = {
                OriginatorCustomer: {
                    TaxNumber: $("#originator-customer-tax").val(),
                    TaxOffice: $("#originator-customer-tax-office").val(),
                    Name: $("#originator-customer-name").val(),
                    Address: $("#originator-customer-address").val(),
                    District: $("#originator-customer-district").val(),
                    City: $("#originator-customer-city").val(),
                    Country: $("#originator-customer-country").val(),
                    PostalCode: $("#originator-customer-postal").val(),
                    Phone: $("#originator-customer-phone").val(),
                    Mail: $("#originator-customer-mail").val(),
                },
            };
        }

        let deliveryAddress = {};
        if ($("#delivery-address-address").val()) {
            deliveryAddress = {
                Address: {
                    Address: $("#delivery-address-address").val(),
                    District: $("#delivery-address-district").val(),
                    City: $("#delivery-address-city").val(),
                    Country: $("#delivery-address-country").val(),
                    PostalCode: $("#delivery-address-postal").val(),
                },
            };
        }

        let driver_id = $("#driver").val();
        let carrier_id = $("#carrier").val();

        let despatchData = {
            document: {
                External: {
                    ID: uuidv4(),
                    RefNo: String(Date.now()).substring(2, 11),
                    Type: `Rahat Belge:belgeApp:${new Date().getDate()}:${new Date().getMonth()}`,
                },
                IssueDateTime: despatch_date.formatDate(
                    despatch_date.selectedDates[0],
                    "Y-m-d\\TH:i:S"
                ),
                Profile: $("#despatch-profile").val(),
                Type: $("#despatch-type").val(),
                NumberOrSerie:
                    $("#dsp-no-status").val() == 0
                        ? $("#customer-etiket-list").val()
                            ? $("#edespatch-serie").val()
                            : $("#earchive-serie").val()
                        : $("#manuel-despatch-number").val(),
                TemplateID: $("#customer-etiket-list").val()
                    ? $("#edespatch-template").val()
                    : $("#earchive-template").val(),
                Notes: notes,
                Order: order,
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
                ...sellerSupplier,
                ...originatorCustomer,
                Lines: lines,
                Shipment: {
                    DriverID: driver_id ? Number(driver_id) : null,
                    CarrierID: carrier_id ? Number(carrier_id) : null,
                    Delivery: {
                        ActualDateTime: actual_despatch_date.formatDate(
                            actual_despatch_date.selectedDates[0],
                            "Y-m-d\\TH:i:S"
                        ),
                        ...deliveryAddress,
                    },
                },
            },
        };
        return despatchData;
    };

    $("#xml-download").click((e) => {
        if (!validateDespatch()) {
            return false;
        }
        blockPage("İrsaliye XML dosyası indirilmek için oluşturuluyor...");
        let json = createJson();
        $.ajax({
            type: "POST",
            url: "/create/despatch/xml",
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
                saveAs(blob, "Yeniİrsaliye.xml");
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
        if (!validateDespatch()) {
            return false;
        }
        blockPage("İrsaliye JSON dosyası indirilmek için oluşturuluyor...");
        let json = createJson();
        try {
            var blob = new Blob([JSON.stringify(json, null, 2)], {
                type: "application/json",
            });
            saveAs(blob, "Yeniİrsaliye.json");
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

    $("#preview-created-despatch").click((e) => {
        $("#despatchFrame").attr("src", "");
        if (!validateDespatch()) {
            return false;
        }
        blockPage("İrsaliye görüntüsü önizlemek için oluşturuluyor...");
        let xml;
        let xslt;
        let json = createJson();
        $.when(
            $.ajax({
                type: "POST",
                url: "/create/despatch/xml",
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
                url: `/create/despatch/xslt/${$("#edespatch-template").val()}`,
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
                    $("#despatchFrame").attr("src", URL.createObjectURL(blob));
                    $.unblockUI();
                    $("#preview-despatch-modal").modal("show");
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

    $("#print-despatch-in-preview").click((e) => {
        let myIframe = document.getElementById("despatchFrame").contentWindow;
        myIframe.focus();
        myIframe.print();
    });

    $("#save-created-despatch").click((e) => {
        if (!validateDespatch()) {
            return false;
        }
        Swal.fire({
            title: `Girdiğiniz irsaliyeyi ${
                despatch_edit_id ? "güncellemek" : "taslak olarak kaydetmek"
            } istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Eminim, kaydet`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                let json = createJson();
                let type, url;
                if (despatch_edit_id) {
                    type = "PUT";
                    url = `/create/despatch/draft/${despatch_edit_id}`;
                } else {
                    type = "POST";
                    url = "/create/despatch/draft";
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
                        text: "İrsaliyeniz başarıyla kaydedildi! Yeni irsaliye oluşturmak ister misiniz?",
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: `Yeni İrsaliye Oluştur`,
                        cancelButtonText: `Taslaklara Git`,
                    }).then((e) => {
                        if (e.isConfirmed) {
                            window.location.href = "/create/despatch";
                        } else {
                            window.location.href = "/despatches/waiting";
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

    $("#send-created-despatch").click((e) => {
        if (!validateDespatch()) {
            return false;
        }
        Swal.fire({
            title: `${
                despatch_edit_id ? "Güncellediğiniz" : "Girdiğiniz"
            } irsaliyeyi göndermek istediğinize emin misiniz?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Eminim, gönder`,
            cancelButtonText: `Hayır`,
            preConfirm: () => {
                let json = createJson();
                let type, url;
                if (despatch_edit_id) {
                    type = "PUT";
                    url = `/create/despatch/send/${despatch_edit_id}`;
                } else {
                    type = "POST";
                    url = "/create/despatch/send";
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
                        text: "İrsaliyeniz başarıyla gönderildi! Yeni irsaliye oluşturmak ister misiniz?",
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonText: `Yeni İrsaliye Oluştur`,
                        cancelButtonText: `Gönderilmişlere Git`,
                    }).then((e) => {
                        if (e.isConfirmed) {
                            window.location.href = "/create/despatch";
                        } else {
                            window.location.href = "/despatches/sended";
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
