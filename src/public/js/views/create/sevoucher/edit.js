let sevoucher_edit_id = null;

async function delay(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

$(document).ready(function () {
    const fillForm = async (data) => {
        await delay(1250);
        // ! Customer Part
        $("#customer-name")
            .typeahead("val", data.Customer.Name)
            .trigger("focusout");
        $("#customer-tax")
            .typeahead("val", data.Customer.TaxNumber)
            .trigger("focusout");
        $("#customer-address").typeahead("val", data.Customer.Address);
        $("#customer-district").typeahead("val", data.Customer.District);
        $("#customer-city").typeahead("val", data.Customer.City);
        $("#customer-country").typeahead("val", data.Customer.Country);
        $("#customer-tax-office").typeahead("val", data.Customer.TaxOffice);
        $("#customer-phone").val(data.Customer.PhoneNumber);
        $("#customer-mail").val(data.Customer.Mail);
        $("#customer-postal").val(data.Customer.PostalCode);
        $("#customer-web").val(data.Customer.Website);

        // ! Sevoucher Part
        $("#currency-codes").val(data.sys.currency.code).trigger("change");
        $("#exchange-rate").val(data.sys.exchange_rate);
        let sevoucher_date_object = new Date(
            `${data.IssueDateTime.split("T")[0]} ${
                data.IssueDateTime.split("T")[1]
            }`
        );
        sevoucher_date.setDate(sevoucher_date_object);
        if (data.sys.number_serie.length > 3) {
            $("#make-manuel-serie").trigger("click");
            $("#manuel-sevoucher-number").val(data.sys.number_serie);
        } else {
            $("#sevoucher-serie").val(data.sys.number_serie).trigger("change");
        }
        $("#sevoucher-template")
            .val(data.sys.external.template_id)
            .trigger("change");
        $("#sevoucher-kdv-exemption")
            .val(data.sys.tax_exemption_reason.KDV)
            .trigger("change");

        // ! Sevoucher Line Part
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
                }
            });
        });
        // ! Sevoucher Notes Part
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
        $.unblockUI();
    };

    const urlParams = new URLSearchParams(window.location.search);
    sevoucher_edit_id = urlParams.get("key");
    if (sevoucher_edit_id) {
        blockPage("SM Makbuz bilgileriniz getiriliyor...");
        $("#edit-id").val(sevoucher_edit_id);
        $.ajax({
            type: "GET",
            url: `/create/sevoucher/detail/${sevoucher_edit_id}`,
            success: async function (response) {
                await fillForm(response);
            },
            error: function (error) {
                window.location.href = "/create/sevoucher";
            },
        });
    }
});
