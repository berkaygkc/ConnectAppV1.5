let invoice_edit_id = null;

async function delay(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

$(document).ready(function () {
    const fillForm = async (data) => {
        await delay(1250);
        console.log(data);
        // ! Customer Part
        $("#customer-name")
            .typeahead("val", data.BuyerCustomer.Name)
            .trigger("focusout");
        $("#customer-tax")
            .typeahead("val", data.BuyerCustomer.TaxNumber)
            .trigger("focusout");
        $("#customer-address").typeahead("val", data.BuyerCustomer.Address);
        $("#customer-district").typeahead("val", data.BuyerCustomer.District);
        $("#customer-city").typeahead("val", data.BuyerCustomer.City);
        $("#customer-country").typeahead("val", data.BuyerCustomer.Country);
        $("#customer-tax-office").typeahead(
            "val",
            data.BuyerCustomer.TaxOffice
        );
        $("#customer-phone").val(data.BuyerCustomer.PhoneNumber);
        $("#customer-mail").val(data.BuyerCustomer.Mail);
        $("#customer-postal").val(data.BuyerCustomer.PostalCode);
        $("#customer-web").val(data.BuyerCustomer.Website);

        // ! Invoice Part
        $("#currency-codes").val(data.sys.currency.code).trigger("change");
        $("#exchange-rate").val(data.sys.exchange_rate);
        let invoice_date_object = new Date(
            `${data.IssueDateTime.split("T")[0]} ${
                data.IssueDateTime.split("T")[1]
            }`
        );
        invoice_date.setDate(invoice_date_object);
        if (data.sys.number_serie.length > 3) {
            $("#make-manuel-serie").trigger("click");
            $("#manuel-invoice-number").val(data.sys.number_serie);
        } else {
            $("#einvoice-serie").val(data.sys.number_serie).trigger("change");
        }
        $("#einvoice-template")
            .val(data.sys.external.template_id)
            .trigger("change");
        $("#invoice-kdv-exemption")
            .val(data.sys.tax_exemption_reason.KDV)
            .trigger("change");

        // ! Despatches Part
        if (data.Despatches?.length > 0) {
            $("#order-despatches-checkbox")
                .prop("checked", true)
                .trigger("change");
            data.Despatches.forEach((despatch, index) => {
                $("#despatches-add-row").trigger("click");
                despatchesGridOptions.api.forEachLeafNode((node, agindex) => {
                    if (index === agindex) {
                        node.setDataValue("despatch_date", despatch.Date);
                        node.setDataValue("despatch_number", despatch.Value);
                    }
                });
            });
        }
        // ! Order Part
        if (data.Order?.Date) {
            $("#order-despatches-checkbox")
                .prop("checked", true)
                .trigger("change");
            order_date.setDate(new Date(data.Order.Date));
            $("#order-no").val(data.Order.Value);
        }
        // ! Invoice Line Part
        data.Lines.forEach((line, index) => {
            $("#lines-add-row").trigger("click");
            linesGridOptions.api.forEachLeafNode(async (node, agindex) => {
                if (index === agindex) {
                    node.setDataValue("item.name", line.Name);
                    node.setDataValue("quantities.quantity", line.Quantity);
                    node.setDataValue("prices.price", line.Price);
                    node.setDataValue("kdv.percent", line.KDV.Percent);
                    if (line.KDV.Status == 2) {
                        linesGridOptions.columnApi.setColumnVisible(
                            "kdv.status",
                            true
                        );
                        node.setDataValue("kdv.status", "Dahil");
                        node.setDataValue(
                            "prices.price",
                            line.Price * (1 + line.KDV.Percent / 100)
                        );
                    }
                    if (line.sys.allowance) {
                        linesGridOptions.columnApi.setColumnVisible(
                            "discount.percent",
                            true
                        );
                        linesGridOptions.columnApi.setColumnVisible(
                            "discount.amount",
                            true
                        );
                        node.setDataValue(
                            "discount.percent",
                            line.sys.allowance.percent
                        );
                    }
                    if (line.sys.withholding) {
                        node.setDataValue(
                            "withholdingTax.code",
                            line.sys.withholding.tax_subs.code
                        );
                        node.setDataValue(
                            "withholdingTax.percent",
                            line.sys.withholding.tax_subs.percent
                        );
                    }
                    line.sys.taxes.tax_subs.forEach((tax) => {
                        if (tax.code != "0015") {
                            let finded_tax = all_taxes.find(
                                (e) => e.code == tax.code
                            );
                            let tax_object = {
                                code: finded_tax.code,
                                name: finded_tax.name,
                                percent: tax.percent,
                                amount: 0,
                                base_stat: finded_tax.base_stat,
                                base_calculate: finded_tax.base_calculate,
                            };
                            node.expanded = true;
                            const newTaxes = [];
                            node.data.taxes.forEach(function (record, index) {
                                newTaxes.push({
                                    code: record.code,
                                    name: record.name,
                                    percent: record.percent,
                                    amount: record.amount,
                                    base_stat: record.base_stat,
                                    base_calculate: record.base_calculate,
                                });
                            });
                            newTaxes.push({
                                ...tax_object,
                                amount:
                                    node.data.calculations.hesap_tutar *
                                    (tax_object.percent / 100),
                            });

                            node.data.taxes = newTaxes;
                            const tran = {
                                update: [node.data],
                            };
                            linesGridOptions.api.applyTransaction(tran);
                        }
                    });

                    if (line.UnitCode.length <= 3) {
                        let finded_unit_response = await fetch(
                            "/api/v1.0/internal/definitions/unit/code/" +
                                line.UnitCode
                        );
                        let finded_unit = await finded_unit_response.json();
                        if (finded_unit.name) {
                            node.setDataValue(
                                "quantities.unit_code",
                                finded_unit.name
                            );
                        } else {
                            node.setDataValue(
                                "quantities.unit_code",
                                line.UnitCode
                            );
                        }
                    } else {
                        node.setDataValue(
                            "quantities.unit_code",
                            line.UnitCode
                        );
                    }

                    node.data.delivery = {
                        gtip: line.Delivery.GTIPNo,
                        terms: line.Delivery.DeliveryTermCode,
                        transport: line.Delivery.TransportModeCode,
                        trace: line.Delivery.ProductTraceID,
                        package: {
                            no: line.Delivery.PackageID,
                            quantity: line.Delivery.PackageQuantity,
                            unit: line.Delivery.PackageTypeCode,
                            brand: line.Delivery.PackageBrandName,
                        },
                        address: {
                            address: line.Delivery.DeliveryAddress.Address,
                            district: line.Delivery.DeliveryAddress.District,
                            city: line.Delivery.DeliveryAddress.City,
                            country: line.Delivery.DeliveryAddress.Country,
                            postal_code: line.Delivery.DeliveryAddress.PostalCode,
                        },
                    };
                    const tran = {
                        update: [node.data],
                    };
                    linesGridOptions.api.applyTransaction(tran);
                }
            });
        });
        // ! Invoice Notes Part
        if (data.Notes.length > 0) {
            data.Notes.forEach((note, index) => {
                $("#notes-add-row").trigger("click");
                notesGridOptions.api.forEachLeafNode((node, agindex) => {
                    if (index === agindex) {
                        node.setDataValue("note", note.Note);
                    }
                });
            });
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    invoice_edit_id = urlParams.get("key");
    if (invoice_edit_id) {
        blockPage("İhracat bilgileriniz getiriliyor...");
        $("#edit-id").val(invoice_edit_id);
        $.ajax({
            type: "GET",
            url: `/create/invoice/detail/${invoice_edit_id}`,
            success: async function (response) {
                await fillForm(response);
            },
            error: function (error) {
                window.location.href = "/create/invoice/export";
            },
        });
    }
});
