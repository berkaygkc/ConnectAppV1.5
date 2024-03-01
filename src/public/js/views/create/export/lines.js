const selectionChangeEvent = (e) => {
    if (linesGridOptions.api.getSelectedRows().length > 0) {
        $("#lines-collective-process-group").attr("hidden", false);
    } else {
        $("#lines-collective-process-group").attr("hidden", true);
    }
};

const calculate = () => {
    let price_total = 0,
        discount_total = 0,
        kdv_total = 0,
        kdv_base_total = 0,
        kdv_0 = 0,
        kdv_1 = 0,
        kdv_10 = 0,
        kdv_20 = 0,
        kdv_0_base = 0,
        kdv_1_base = 0,
        kdv_10_base = 0,
        kdv_20_base = 0,
        withholdingTax_amount = 0,
        payable_amount = 0,
        line_counter = 0,
        add_tax_total = 0;
    linesGridOptions.api.forEachNode((row, index) => {
        line_counter++;
        price_total += Number(row.data.totals.amount);
        discount_total += Number(row.data.discount.amount);
        kdv_total += Number(row.data.kdv.price);
        kdv_base_total += Number(row.data.kdv.base);
        withholdingTax_amount += Number(row.data.withholdingTax.amount);
        if (row.data.taxes.length > 0) {
            row.data.taxes.forEach((tax) => {
                add_tax_total += Number(tax.amount);
            });
        }
        let base = Number(row.data.kdv.base),
            percent = Number(row.data.kdv.percent),
            price = Number(row.data.kdv.price);
        switch (percent) {
            case 0:
                kdv_0_base += base;
                break;
            case 1:
                kdv_1_base += base;
                kdv_1 += price;
                break;
            case 10:
                kdv_10_base += base;
                kdv_10 += price;
                break;
            case 20:
                kdv_20_base += base;
                kdv_20 += price;
                break;
            default:
                break;
        }
        payable_amount += Number(row.data.totals.amount_payable);
    });
    $("#lineExtensionAmount").text(
        `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(price_total)}`
    );
    $("#payableAmount").text(
        `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(payable_amount)}`
    );
    $("#payable-label").text(
        `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(payable_amount)}`
    );
    $("#line-counter").text(line_counter);

    $("#kdvMatrahTotal").text(
        `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_base_total)}`
    );
    $("#kdv0Matrah").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_0_base)
    );
    $("#kdv1Matrah").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_1_base)
    );
    $("#kdv10Matrah").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_10_base)
    );
    $("#kdv20Matrah").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_20_base)
    );

    $("#kdvPriceTotal").text(
        `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_total)}`
    );
    $("#kdv0Tutar").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_0)
    );
    $("#kdv1Tutar").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_1)
    );
    $("#kdv8Tutar").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_10)
    );
    $("#kdv18Tutar").text(
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: $("#currency-codes").val(),
        }).format(kdv_20)
    );

    if (discount_total !== 0) {
        $("#discountDiv").slideDown(250);
        $("#discountAmount").text(
            `${new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: $("#currency-codes").val(),
            }).format(discount_total)}`
        );
    } else {
        $("#discountDiv").slideUp(250);
    }

    if (withholdingTax_amount !== 0) {
        $("#withholdingTaxDiv").slideDown(250);
        $("#withholdingTaxAmount").text(
            `${new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: $("#currency-codes").val(),
            }).format(withholdingTax_amount)}`
        );
    } else {
        $("#withholdingTaxDiv").slideUp(250);
    }

    if (add_tax_total !== 0) {
        $("#add-tax-div").slideDown(250);
        $("#addTaxesTotal").text(
            `${new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: $("#currency-codes").val(),
            }).format(add_tax_total)}`
        );
    } else {
        $("#add-tax-div").slideUp(250);
    }
};

const valueChangeEvent = (e) => {
    let columns = [
        "quantities.quantity",
        "prices.price",
        "kdv.status",
        "kdv.percent",
        "discount.percent",
        "discount.amount",
        "withholdingTax.percent",
        "withholdingTax.amount",
        "totals.amount_payable",
    ];
    let columnsDetail = [
        "item.name",
        "quantities.unit_code",
        "quantities.quantity",
        "taxes",
    ];
    if (!e) {
        calculate();
        // detailRefresh();
    } else if (e.type === "cellValueChanged") {
        if (columns.includes(e.column.colId)) {
            calculate();
        }
        if (columnsDetail.includes(e.column.colId)) {
            detailRefresh(e.node);
        }
    } else if (e.type === "rowDataUpdated" || e.type == "rowValueChanged") {
        calculate();
        detailRefresh(e.node);
    }
};

const nodeDetailRefresh = (node) => {
    if (node?.expanded) {
        node.setExpanded(false);
        setTimeout(() => {
            node.setExpanded(true);
        }, 100);
    }
    if (node?.parent?.expanded) {
        // masterGridApi.refreshCells({ rowNodes: [nodeApi] });
    }
};

const detailRefresh = (node) => {
    if (node?.expanded) {
        node.setExpanded(false);
        setTimeout(() => {
            node.setExpanded(true);
        }, 100);
    }
    if (node?.parent?.expanded) {
        // node.parent.setExpanded(false);
        // node.parent.refreshCells({ rowNodes: [node.parent] });
    }
};

const newData = {
    item: {
        seller_code: "",
        buyer_code: "",
        name: "",
    },
    quantities: {
        quantity: 0,
        unit_code: "ADET",
    },
    prices: {
        price: 0,
    },
    kdv: {
        status: "Hariç",
        percent: 0,
        price: 0,
        base: 0,
    },
    withholdingTax: {
        code: "",
        percent: 0,
        amount: 0,
    },
    discount: {
        percent: 0,
        amount: 0,
    },
    totals: {
        amount: 0,
        amount_discounted: 0,
        amount_payable: 0,
    },
    delivery: {},
    taxes: [],
    calculations: {
        baz_tutar: 0,
        hesap_tutar: 0,
        kdv_matrah: 0,
        kdvli_tutar: 0,
        vergili_tutar: 0,
        odenecek_tutar: 0,
        matraha_dahil_vergi: 0,
        matraha_dahil_olmayan_vergi: 0,
        tevkifat_tutari: 0,
    },
};

let linesColumnsDefs = [
    {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerClass: "checkbox",
        pinned: "left",
        width: "70px",
        field: "checkboxBtn",
        resizable: false,
        lockPosition: "left",
        rowDrag: true,
        suppressAutoSize: true,
        suppressColumnsToolPanel: true,
        suppressSizeToFit: true,
    },
    {
        field: "detail",
        headerName: "",
        width: "40px",
        resizable: false,
        suppressAutoSize: true,
        suppressColumnsToolPanel: true,
        pinned: "left",
        lockPosition: "left",
        cellRenderer: "agGroupCellRenderer",
    },
    {
        field: "process",
        headerName: "",
        width: "35px",
        resizable: false,
        suppressAutoSize: true,
        suppressColumnsToolPanel: true,
        pinned: "left",
        lockPosition: "left",
        cellRenderer: DeleteCellRenderer,
    },
    {
        field: "item",
        headerName: "Mal/Hizmet ",
        children: [
            {
                field: "item.name",
                headerName: "Adı",
                editable: true,
                lockPosition: "left",
                width: "300px",
            },
        ],
    },
    {
        field: "quantities",
        headerName: "Miktar Detayları",
        children: [
            {
                field: "quantities.quantity",
                headerName: "Miktar",
                editable: true,
                width: "100px",
                cellEditor: NumericCellEditor,
                valueSetter: (params) => {
                    params.data.quantities.quantity = params.newValue;
                    // params.node.setDataValue(
                    //     "totals.amount",
                    //     numericMultiplication(
                    //         String(params.newValue),
                    //         String(params.data.prices.price)
                    //     )
                    // );
                    params.node.setDataValue(
                        "calculations.baz_tutar",
                        numericMultiplication(
                            String(params.data.quantities.quantity),
                            String(params.data.calculations.birim_fiyat)
                        )
                    );
                    params.node.setDataValue("discount.percent", 0);
                    params.node.setDataValue("discount.amount", 0);
                    return true;
                },
            },
            {
                field: "quantities.unit_code",
                headerName: "Birim",
                width: "100px",
                editable: true,
                cellEditor: unitSelectCellEditor,
                cellEditorPopup: true,
                suppressNavigable: true,
            },
        ],
    },
    {
        field: "prices",
        headerName: "Fiyatlar",
        children: [
            {
                field: "prices.price",
                headerName: "Birim Fiyat",
                width: "100px",
                editable: true,
                cellEditor: NumericCellEditor,
                valueFormatter: (params) => {
                    let price = params.data.prices.price;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(price);
                },
                valueSetter: (params) => {
                    params.data.prices.price = params.newValue;
                    // params.node.setDataValue(
                    //     "totals.amount",
                    //     numericMultiplication(
                    //         String(params.data.quantities.quantity),
                    //         String(params.newValue)
                    //     )
                    // );
                    params.node.setDataValue(
                        "calculations.birim_fiyat",
                        kdvStatusUnitPriceCalculate(
                            params.data.kdv.percent,
                            params.data.prices.price,
                            params.data.kdv.status
                        )
                    );
                    params.node.setDataValue("discount.percent", 0);
                    params.node.setDataValue("discount.amount", 0);
                    return true;
                },
            },
        ],
    },
    {
        field: "discount",
        headerName: "İndirim",
        children: [
            {
                field: "discount.percent",
                headerName: "İndirim Oranı",
                width: "100px",
                editable: true,
                hide: true,
                cellEditor: NumericCellEditor,
                valueSetter: (params) => {
                    params.data.discount.percent = params.newValue;
                    params.data.discount.amount = discountAmountCalculate(
                        params.data.calculations.baz_tutar,
                        params.newValue
                    );
                    params.node.setDataValue(
                        "calculations.hesap_tutar",
                        amountDiscountedCalculate(
                            String(params.data.calculations.baz_tutar),
                            String(params.data.discount.amount)
                        )
                    );
                    return true;
                },
                valueFormatter: (params) => {
                    return `% ${params.data.discount.percent}`;
                },
            },
            {
                field: "discount.amount",
                headerName: "İndirim Tutarı",
                width: "100px",
                editable: true,
                hide: true,
                cellEditor: NumericCellEditor,
                valueSetter: (params) => {
                    params.data.discount.amount = params.newValue;
                    params.data.discount.percent = discountPercentCalculate(
                        params.data.calculations.baz_tutar,
                        params.newValue
                    );
                    params.node.setDataValue(
                        "calculations.hesap_tutar",
                        amountDiscountedCalculate(
                            String(params.data.calculations.baz_tutar),
                            String(params.data.discount.amount)
                        )
                    );
                    // params.node.setDataValue(
                    //     "totals.amount_discounted",
                    //     amountDiscountedCalculate(
                    //         String(params.data.totals.amount),
                    //         String(params.newValue)
                    //     )
                    // );
                    return true;
                },
                valueFormatter: (params) => {
                    let price = params.data.discount.amount;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(price);
                },
            },
        ],
    },
    {
        field: "kdv",
        headerName: "KDV",
        children: [
            {
                field: "kdv.status",
                headerName: "KDV Durum",
                width: "100px",
                editable: true,
                hide: true,
                cellEditor: "agRichSelectCellEditor",
                cellEditorPopup: true,
                cellEditorParams: {
                    values: ["Hariç", "Dahil"],
                    searchDebounceDelay: 500,
                    formatValue: (value) => value.toUpperCase(),
                },
                valueSetter: (params) => {
                    params.data.kdv.status = params.newValue;
                    params.node.setDataValue(
                        "calculations.birim_fiyat",
                        kdvStatusUnitPriceCalculate(
                            params.data.kdv.percent,
                            params.data.prices.price,
                            params.data.kdv.status
                        )
                    );
                    // params.node.setDataValue(
                    //     "kdv.base",
                    //     kdvBaseCalculate(
                    //         params.data.kdv.percent,
                    //         params.data.totals.amount_discounted,
                    //         params.newValue
                    //     )
                    // );
                    // params.node.setDataValue(
                    //     "kdv.price",
                    //     kdvAmountCalculate(
                    //         params.data.kdv.percent,
                    //         params.data.totals.amount_discounted,
                    //         params.newValue
                    //     )
                    // );
                    return true;
                },
            },
            {
                field: "kdv.percent",
                headerName: "KDV Oranı",
                width: "100px",
                editable: true,
                hide: true,
                cellEditor: NumericCellEditor,
                valueSetter: (params) => {
                    params.data.kdv.percent = params.newValue;
                    if (params.data.kdv.status == "Dahil") {
                        params.node.setDataValue(
                            "calculations.birim_fiyat",
                            kdvStatusUnitPriceCalculate(
                                params.data.kdv.percent,
                                params.data.prices.price,
                                params.data.kdv.status
                            )
                        );
                    } else {
                        params.node.setDataValue(
                            "calculations.kdv_tutar",
                            kdvAmountCalculate(
                                params.data.kdv.percent,
                                params.data.calculations.kdv_matrah,
                                params.data.kdv.status
                            )
                        );
                    }

                    // params.node.setDataValue(
                    //     "kdv.base",
                    //     kdvBaseCalculate(
                    //         params.newValue,
                    //         params.data.totals.amount_discounted,
                    //         params.data.kdv.status
                    //     )
                    // );
                    // params.node.setDataValue(
                    //     "kdv.price",
                    //     kdvAmountCalculate(
                    //         params.newValue,
                    //         params.data.totals.amount_discounted,
                    //         params.data.kdv.status
                    //     )
                    // );

                    return true;
                },
                valueFormatter: (params) => {
                    return `% ${params.data.kdv.percent}`;
                },
            },
            {
                field: "kdv.base",
                headerName: "KDV Matrah",
                width: "100px",
                hide: true,
                // valueGetter: (params) => {
                //     params.data.kdv.base = params.data.calculations.kdv_matrah;
                //     return params.data.kdv.base;
                // },
                // valueSetter: (params) => {
                //     params.data.kdv.base = params.newValue;
                //     if (params.data.withholdingTax?.percent) {
                //         params.node.setDataValue(
                //             "totals.amount_payable",
                //             numericExtraction(
                //                 numericCollection(
                //                     params.data.kdv.price,
                //                     params.newValue
                //                 ),
                //                 params.data.withholdingTax.amount
                //             )
                //         );
                //     } else {
                //         params.node.setDataValue(
                //             "totals.amount_payable",
                //             numericCollection(
                //                 params.data.kdv.price,
                //                 params.newValue
                //             )
                //         );
                //     }
                //     return true;
                // },
                valueFormatter: (params) => {
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(params.data.kdv.base);
                },
            },
            {
                field: "kdv.price",
                headerName: "KDV Tutar",
                width: "100px",
                hide: true,
                // valueGetter: (params) => {
                //     params.data.kdv.price = params.data.calculations.kdv_tutar;
                //     return params.data.kdv.price;
                // },
                valueSetter: (params) => {
                    params.data.kdv.price = params.newValue;
                    if (params.data.withholdingTax?.percent) {
                        params.node.setDataValue(
                            "withholdingTax.amount",
                            withholdingAmountCalculate(
                                String(params.data.withholdingTax.percent),
                                String(params.newValue)
                            )
                        );
                    }
                    return true;
                },
                valueFormatter: (params) => {
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(params.data.kdv.price);
                },
            },
        ],
    },
    {
        field: "totals",
        headerName: "Toplamlar",
        children: [
            {
                field: "totals.amount",
                headerName: "Tutar",
                width: "100px",
                // valueGetter: (params) => {
                //     params.data.totals.amount =
                //         params.data.calculations.hesap_tutar;
                //     return params.data.totals.amount;
                // },
                // valueSetter: (params) => {
                //     params.data.totals.amount = params.newValue;
                //     params.node.setDataValue(
                //         "totals.amount_discounted",
                //         amountDiscountedCalculate(
                //             String(params.newValue),
                //             String(params.data.discount.amount)
                //         )
                //     );
                //     return true;
                // },
                valueFormatter: (params) => {
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(params.data.totals.amount);
                },
            },
            {
                field: "totals.amount_discounted",
                headerName: "Hesaplanan Tutar",
                hide: true,
                width: "100px",
                // valueGetter: (params) => {
                //     params.data.totals.amount_discounted =
                //         params.data.calculations.indirimli_tutar;
                //     return params.data.totals.amount_discounted;
                // },
                // valueSetter: (params) => {
                //     params.data.totals.amount_discounted = params.newValue;
                //     params.node.setDataValue(
                //         "kdv.base",
                //         kdvBaseCalculate(
                //             params.data.kdv.percent,
                //             params.data.totals.amount_discounted,
                //             params.data.kdv.status
                //         )
                //     );
                //     params.node.setDataValue(
                //         "kdv.price",
                //         kdvAmountCalculate(
                //             params.data.kdv.percent,
                //             params.data.totals.amount_discounted,
                //             params.data.kdv.status
                //         )
                //     );
                // },
                valueFormatter: (params) => {
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(params.data.totals.amount_discounted);
                },
            },
            {
                field: "totals.amount_payable",
                headerName: "Ödenecek Tutar",
                width: "100px",
                // valueGetter: (params) => {
                //     params.data.totals.amount_payable =
                //         params.data.calculations.odenecek_tutar;
                //     return params.data.totals.amount_payable;
                // },
                valueFormatter: (params) => {
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: $("#currency-codes").val(),
                    }).format(params.data.totals.amount_payable);
                },
            },
            {
                field: "calculations.birim_fiyat",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.birim_fiyat = params.newValue;
                    params.node.setDataValue(
                        "calculations.baz_tutar",
                        numericMultiplication(
                            String(params.data.quantities.quantity),
                            String(params.data.calculations.birim_fiyat)
                        )
                    );
                    return true;
                },
            },
            {
                field: "calculations.baz_tutar",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.baz_tutar = params.newValue;
                    params.data.discount.amount = discountAmountCalculate(
                        params.newValue,
                        params.data.discount.percent
                    );
                    params.node.setDataValue(
                        "calculations.hesap_tutar",
                        amountDiscountedCalculate(
                            String(params.data.calculations.baz_tutar),
                            String(params.data.discount.amount)
                        )
                    );
                    params.node.setDataValue(
                        "totals.amount",
                        params.data.calculations.baz_tutar
                    );
                    return true;
                },
            },
            {
                field: "calculations.hesap_tutar",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.hesap_tutar = params.newValue;
                    params.node.setDataValue(
                        "calculations.kdv_matrah",
                        numericCollection(
                            params.data.calculations.hesap_tutar,
                            params.data.calculations.matraha_dahil_vergi
                        )
                    );
                    let new_taxes = [];
                    params.data.taxes.forEach((tax) => {
                        new_taxes.push({
                            ...tax,
                            amount:
                                (params.newValue * parseFloat(tax.percent)) /
                                100,
                        });
                    });
                    params.node.setDataValue("taxes", new_taxes);
                    return true;
                },
            },
            {
                field: "calculations.kdv_matrah",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.kdv_matrah = params.newValue;
                    params.node.setDataValue("kdv.base", params.newValue);
                    params.node.setDataValue(
                        "totals.amount_discounted",
                        params.newValue
                    );
                    params.node.setDataValue(
                        "calculations.kdv_tutar",
                        kdvAmountCalculate(
                            params.data.kdv.percent,
                            params.data.calculations.kdv_matrah,
                            params.data.kdv.status
                        )
                    );
                    return true;
                },
            },
            {
                field: "calculations.kdv_tutar",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.kdv_tutar = params.newValue;
                    params.node.setDataValue(
                        "kdv.price",
                        params.data.calculations.kdv_tutar
                    );
                    params.node.setDataValue(
                        "calculations.kdvli_tutar",
                        numericCollection(
                            params.data.calculations.kdv_matrah,
                            params.data.calculations.kdv_tutar
                        )
                    );
                    return true;
                },
            },

            {
                field: "calculations.kdvli_tutar",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.kdvli_tutar = params.newValue;
                    params.node.setDataValue(
                        "calculations.vergili_tutar",
                        numericCollection(
                            params.data.calculations.kdvli_tutar,
                            params.data.calculations.matraha_dahil_olmayan_vergi
                        )
                    );
                    return true;
                },
            },
            {
                field: "calculations.vergili_tutar",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.vergili_tutar = params.newValue;
                    let number = params.data.calculations.vergili_tutar;
                    if (params.data.withholdingTax?.percent) {
                        number = numericExtraction(
                            number,
                            params.data.withholdingTax.amount
                        );
                    }
                    params.node.setDataValue(
                        "calculations.odenecek_tutar",
                        number
                    );
                    return true;
                },
            },
            {
                field: "calculations.odenecek_tutar",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.calculations.odenecek_tutar = params.newValue;
                    params.node.setDataValue(
                        "totals.amount_payable",
                        params.data.calculations.odenecek_tutar
                    );
                    return true;
                },
            },
            {
                field: "calculations.matraha_dahil_vergi",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    // params.data.calculations.odenecek_tutar = params.newValue;
                    // params.node.setDataValue(
                    //     "totals.amount_payable",
                    //     params.data.calculations.odenecek_tutar
                    // );

                    params.data.calculations.matraha_dahil_vergi =
                        params.newValue;
                    params.node.setDataValue(
                        "calculations.kdv_matrah",
                        numericCollection(
                            params.data.calculations.hesap_tutar,
                            params.data.calculations.matraha_dahil_vergi
                        )
                    );

                    return true;
                },
            },
            {
                field: "calculations.matraha_dahil_olmayan_vergi",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    // params.data.calculations.odenecek_tutar = params.newValue;
                    // params.node.setDataValue(
                    //     "totals.amount_payable",
                    //     params.data.calculations.odenecek_tutar
                    // );
                    params.data.calculations.matraha_dahil_olmayan_vergi =
                        params.newValue;
                    params.node.setDataValue(
                        "calculations.vergili_tutar",
                        numericCollection(
                            params.data.calculations.kdvli_tutar,
                            params.data.calculations.matraha_dahil_olmayan_vergi
                        )
                    );
                    return true;
                },
            },
            {
                field: "taxes",
                suppressColumnsToolPanel: true,
                hide: true,
                valueSetter: (params) => {
                    params.data.taxes = params.newValue;
                    // params.node.setDataValue(
                    //     "totals.amount_payable",
                    //     params.data.calculations.odenecek_tutar
                    // );
                    let number_dahil = 0;
                    let number_dahil_olmayan = 0;
                    params.data.taxes.forEach((tax) => {
                        if (Number(tax.base_stat) === 1) {
                            if (Number(tax.base_calculate) === 1) {
                                number_dahil = numericCollection(
                                    number_dahil,
                                    tax.amount
                                );
                            } else {
                                number_dahil = numericExtraction(
                                    number_dahil,
                                    tax.amount
                                );
                            }
                        } else if (Number(tax.base_stat) === 0) {
                            if (Number(tax.base_calculate) === 1) {
                                number_dahil_olmayan = numericCollection(
                                    number_dahil_olmayan,
                                    tax.amount
                                );
                            } else {
                                number_dahil_olmayan = numericExtraction(
                                    number_dahil_olmayan,
                                    tax.amount
                                );
                            }
                        }
                    });
                    params.node.setDataValue(
                        "calculations.matraha_dahil_vergi",
                        number_dahil
                    );
                    params.node.setDataValue(
                        "calculations.matraha_dahil_olmayan_vergi",
                        number_dahil_olmayan
                    );
                    return true;
                },
            },
        ],
    },
    {
        field: "export_detail",
        headerName: "İhracat",
        width: "90px",
        resizable: false,
        suppressAutoSize: true,
        suppressColumnsToolPanel: true,
        pinned: "left",
        lockPosition: "left",
        cellRenderer: ExportDetailCellRenderer,
        cellStyle: {
            textAlign: "center",
            height: "100%",
            display: "flex ",
            "justify-content": "center",
            "align-items": "center ",
            padding: "0px",
            margin: "0px",
        },
    },
];

let tevkifatColumns = {
    field: "withholdingTax",
    headerName: "KDV Tevkifat",
    children: [
        {
            field: "withholdingTax.code",
            headerName: "Kodu",
            width: "100px",
            editable: true,
            cellEditor: withholdingTaxCellEditor,
            cellEditorPopup: true,
        },
        {
            field: "withholdingTax.percent",
            headerName: "Oranı",
            width: "100px",
            editable: false,
            suppressNavigable: true,
            valueSetter: (params) => {
                params.data.withholdingTax.percent = params.newValue;
                params.node.setDataValue(
                    "withholdingTax.amount",
                    withholdingAmountCalculate(
                        String(params.newValue),
                        String(params.data.calculations.kdv_tutar)
                    )
                );
                return true;
            },
            valueFormatter: (params) => {
                return `% ${params.data.withholdingTax.percent}`;
            },
        },
        {
            field: "withholdingTax.amount",
            headerName: "Tutarı",
            width: "100px",
            editable: false,
            suppressNavigable: true,
            valueSetter: (params) => {
                params.data.withholdingTax.amount = params.newValue;
                params.node.setDataValue(
                    "calculations.odenecek_tutar",
                    numericExtraction(
                        params.data.calculations.vergili_tutar,
                        params.data.withholdingTax.amount
                    )
                );
                return true;
            },
            valueFormatter: (params) => {
                return new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: $("#currency-codes").val(),
                }).format(params.data.withholdingTax.amount);
            },
        },
    ],
};

let linesGridOptions = {
    defaultColDef: {
        resizable: true,
        width: 100,
        suppressMenu: true,
        singleClickEdit: true,
    },
    sideBar: {
        toolPanels: [
            {
                id: "columns",
                labelKey: "columns",
                iconKey: "columns",
                toolPanel: "agColumnsToolPanel",
                toolPanelParams: {
                    suppressRowGroups: true,
                    suppressValues: true,
                    suppressPivots: true,
                    suppressPivotMode: true,
                    suppressColumnSelectAll: true,
                    suppressColumnExpandAll: true,
                },
            },
        ],
    },
    columnDefs: linesColumnsDefs,
    rowData: [],
    rowDragManaged: true,
    domLayout: "autoHeight",
    animateRows: true,
    stopEditingWhenCellsLoseFocus: true,
    localeText: AG_GRID_LOCALE_TR,
    rowSelection: "multiple",
    enableCellChangeFlash: true,
    cellFlashDelay: 2000,
    cellFadeDelay: 500,
    masterDetail: true,
    detailRowAutoHeight: true,
    detailCellRenderer: DetailCellRenderer,
    getRowId: (params) => params.data.id,
    rowClassRules: {
        "line-not-valid": (params) => {
            /**
             * delivery: {
             gtip: "",
             terms: "",
             transport: "",
             trace: "",
             package: {
             no: "",
             quantity: 0,
             unit: "",
             brand: "",
             },

             address: {
             address: "",
             district: "",
             city: "",
             country: "",
             postal_code: "",
             },
             },
             */
            if (
                params.data.delivery.gtip === "" ||
                params.data.delivery.terms === "" ||
                params.data.delivery.transport === "" ||
                params.data.delivery.address.address === "" ||
                params.data.delivery.address.city === "" ||
                params.data.delivery.address.country === ""
            ) {
                return true;
            }
            return false;
        },
        "line-valid": (params) => {
            if (
                params.data.delivery.gtip !== "" &&
                params.data.delivery.terms !== "" &&
                params.data.delivery.transport !== "" &&
                params.data.delivery.address.address !== "" &&
                params.data.delivery.address.city !== "" &&
                params.data.delivery.address.country !== ""
            ) {
                return true;
            }
            return false;
        },
    },
    onSelectionChanged: selectionChangeEvent,
    onCellValueChanged: valueChangeEvent,
    onRowDataUpdated: valueChangeEvent,
    onRowValueChanged: valueChangeEvent,
};

const lineAlert = (type, title, message) => {
    $("#lineAlertHeader").text(title);
    $("#lineAlertBody").text(message);
    $("#linesAlert").attr("class", `alert alert-${type}`);
    $("#linesAlert").slideDown(500);
    setTimeout(() => {
        $("#linesAlert").slideUp(500);
    }, 2000);
};

$(document).ready(function () {
    linesDiv = document.querySelector("#lines-grid");
    new agGrid.Grid(linesDiv, linesGridOptions);

    $("#lines-add-row").click((e) => {
        linesGridOptions.api.applyTransaction({
            add: [
                {
                    id: uuidv4(),
                    detail: "",
                    item: {
                        type: newData.item.type,
                        code: newData.item.code,
                        name: newData.item.name,
                    },
                    quantities: {
                        quantity: newData.quantities.quantity,
                        unit_code: newData.quantities.unit_code,
                    },
                    prices: {
                        price: 0,
                    },
                    kdv: {
                        status: newData.kdv.status,
                        percent: newData.kdv.percent,
                        price: newData.kdv.price,
                        base: newData.kdv.base,
                    },
                    withholdingTax: {
                        code: newData.withholdingTax.code,
                        percent: newData.withholdingTax.percent,
                        amount: newData.withholdingTax.amount,
                    },
                    discount: {
                        percent: newData.discount.percent,
                        amount: newData.discount.amount,
                    },
                    totals: {
                        amount: 0,
                        amount_discounted: 0,
                        amount_payable: 0,
                    },
                    taxes: [],
                    calculations: {
                        birim_fiyat: 0,
                        baz_tutar: 0,
                        hesap_tutar: 0,
                        kdv_matrah: 0,
                        kdv_tutar: 0,
                        kdvli_tutar: 0,
                        vergili_tutar: 0,
                        odenecek_tutar: 0,
                        matraha_dahil_vergi: 0,
                        matraha_dahil_olmayan_vergi: 0,
                        tevkifat_tutari: 0,
                    },
                    delivery: {
                        gtip: "",
                        terms: "",
                        transport: "",
                        trace: "",
                        package: {
                            no: "",
                            quantity: 0,
                            unit: "",
                            brand: "",
                        },
                        address: {
                            address: "",
                            district: "",
                            city: "",
                            country: "",
                            postal_code: "",
                        },
                    },
                },
            ],
            addIndex: undefined,
        });
    });
    $("#collective-delete").click((e) => {
        Swal.fire({
            title: "Emin misiniz?",
            icon: "question",
            text: "Seçili kalemleri silmek istediğinize emin misiniz?",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Evet eminim, Sil",
            cancelButtonText: "Hayır, Silme",
        })
            .then((result) => {
                if (result.isConfirmed) {
                    const selectedData = linesGridOptions.api.getSelectedRows();
                    const res = linesGridOptions.api.applyTransaction({
                        remove: selectedData,
                    });
                }
            })
            .catch((err) => {
            });
    });
    $("#collective-discount").click((e) => {
        Swal.fire({
            input: "text",
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (!!Number(String(value).replace(",", "."))) {
                        resolve();
                    } else {
                        resolve("Geçerli bir sayı giriniz!");
                    }
                });
            },
            inputLabel: "İskonto Oranı",
            width: "20em",
            showCancelButton: true,
            confirmButtonText: "Uygula",
            cancelButtonText: "İptal",
        }).then((result) => {
            if (result.value) {
                const selectedData = linesGridOptions.api.getSelectedNodes();
                selectedData.forEach((node) => {
                    node.setDataValue(
                        "discount.percent",
                        Number(String(result.value).replace(",", "."))
                    );
                });
                lineAlert(
                    "success",
                    "Başarılı",
                    "Toplu iskonto başarıyla uygulandı!"
                );
            }
        });
    });
    $("#collective-kdv-percent").click((e) => {
        Swal.fire({
            input: "number",
            inputLabel: "KDV Oranı",
            width: "16em",
            showCancelButton: true,
            confirmButtonText: "Uygula",
            cancelButtonText: "İptal",
        }).then((result) => {
            if (result.value) {
                const selectedData = linesGridOptions.api.getSelectedNodes();
                selectedData.forEach((node) => {
                    node.setDataValue("kdv.percent", result.value);
                });
                lineAlert(
                    "success",
                    "Başarılı",
                    "Toplu KDV Oranı başarıyla güncellendi!"
                );
            }
        });
    });
    $("#collective-kdv-status").click((e) => {
        Swal.fire({
            input: "select",
            inputOptions: {
                Dahil: "Dahil",
                Hariç: "Hariç",
            },
            inputLabel: "İskonto Oranı",
            width: "20em",
            showCancelButton: true,
            confirmButtonText: "Uygula",
            cancelButtonText: "İptal",
        }).then((result) => {
            if (result.value) {
                const selectedData = linesGridOptions.api.getSelectedNodes();
                selectedData.forEach((node) => {
                    node.setDataValue("kdv.status", result.value);
                });
                lineAlert(
                    "success",
                    "Başarılı",
                    "Toplu KDV Durumu başarıyla güncellendi!"
                );
            }
        });
    });
    $("#collective-withholding-tax").click((e) => {
        let tax_codes;
        $.ajax({
            type: "get",
            url: "/api/v1.0/internal/definitions/withholdingtaxes",
            success: function (response) {
                tax_codes = response;
                let options = {};
                response.forEach((withholdingtax) => {
                    options[
                        withholdingtax.code
                        ] = `${withholdingtax.code} - %${withholdingtax.percent} - ${withholdingtax.name}`;
                    // return {
                    //     [withholdingtax.code]: `${withholdingtax.code} - ${withholdingtax.name}`,
                    // };
                });
                Swal.fire({
                    input: "select",
                    inputOptions: options,
                    inputLabel: "Tevkifat Kodu",
                    width: "20em",
                    showCancelButton: true,
                    confirmButtonText: "Uygula",
                    cancelButtonText: "İptal",
                }).then((result) => {
                    if (result.value) {
                        let selected_tax = tax_codes.find(
                            (e) => e.code == result.value
                        );
                        const selectedData =
                            linesGridOptions.api.getSelectedNodes();
                        selectedData.forEach((node) => {
                            node.setDataValue(
                                "withholdingTax.code",
                                selected_tax.code
                            );
                            node.setDataValue(
                                "withholdingTax.percent",
                                selected_tax.percent
                            );
                        });
                        lineAlert(
                            "success",
                            "Başarılı",
                            "Toplu Tevkifat Kodu başarıyla güncellendi!"
                        );
                    }
                });
            },
        });
    });
    $("#currency-codes").on("change", (e) => {
        calculate();
    });
    $("#tax-percent").on("keyup", (e) => {
        if (e.keyCode == 13) {
            $("#add-taxes-selected").click();
        }
    });
    $("#add-taxes-selected").on("click", (e) => {
        const selectedData = linesGridOptions.api.getSelectedNodes();
        if (selectedData.length == 0) {
            lineAlert("danger", "Hata", "Lütfen en az bir satır seçiniz!");
            return;
        }
        if ($("#tax-select").val() == null) {
            lineAlert("danger", "Hata", "Lütfen bir vergi seçiniz!");
            return;
        }
        if ($("#tax-percent").val() == "") {
            lineAlert("danger", "Hata", "Lütfen bir vergi oranı giriniz!");
            return;
        }
        let finded_tax = all_taxes.find(
            (e) => e.code == $("#tax-select").val()
        );
        let tax = {
            code: finded_tax.code,
            name: finded_tax.name,
            percent: Number(String($("#tax-percent").val()).replace(",", ".")),
            amount: 0,
            base_stat: finded_tax.base_stat,
            base_calculate: finded_tax.base_calculate,
        };
        $("#tax-percent").val("");
        $("#tax-select").val(null).trigger("change");
        selectedData.forEach((node) => {
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
                ...tax,
                amount:
                    node.data.calculations.hesap_tutar * (tax.percent / 100),
            });

            node.data.taxes = newTaxes;
            const tran = {
                update: [node.data],
            };
            linesGridOptions.api.applyTransaction(tran);
            detailRefresh(node);
        });
    });
    $("#read-lines").click((e) => {
        const selectedData = linesGridOptions.api.getSelectedNodes();
        selectedData.forEach((node) => {
            console.log("node.data :>> ", node.data);
        });
    });

    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        );
    }
});
