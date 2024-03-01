const selectionChangeEvent = (e) => {
    if (linesGridOptions.api.getSelectedRows().length > 0) {
        $("#lines-collective-process-group").attr("hidden", false);
    } else {
        $("#lines-collective-process-group").attr("hidden", true);
    }
};

const calculate = () => {
    let line_counter = 0;
    linesGridOptions.api.forEachNode((row, index) => {
        line_counter++;
    });
    $("#line-counter").text(line_counter);
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
    discount: {
        percent: 0,
        amount: 0,
    },
    totals: {
        amount: 0,
        amount_discounted: 0,
        amount_payable: 0,
    },
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
                hide: true,
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
                        currency: 'TRY'
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
        suppressColumnsToolPanel: true,
        children: [
            {
                field: "discount.percent",
                headerName: "İndirim Oranı",
                width: "100px",
                editable: true,
                suppressColumnsToolPanel: true,
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
                suppressColumnsToolPanel: true,
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
                        currency: 'TRY'
                    }).format(price);
                },
            },
        ],
    },
    {
        field: "kdv",
        headerName: "KDV",
        suppressColumnsToolPanel: true,
        children: [
            {
                field: "kdv.status",
                headerName: "KDV Durum",
                width: "100px",
                editable: true,
                suppressColumnsToolPanel: true,
                hide: true,
                cellEditor: "agSelectCellEditor",
                cellEditorParams: {
                    values: ["Hariç", "Dahil"],
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
                suppressColumnsToolPanel: true,
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
                suppressColumnsToolPanel: true,
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
                        currency: 'TRY'
                    }).format(params.data.kdv.base);
                },
            },
            {
                field: "kdv.price",
                headerName: "KDV Tutar",
                width: "100px",
                suppressColumnsToolPanel: true,
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
                        currency: 'TRY'
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
                hide: true,
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
                        currency: 'TRY'
                    }).format(params.data.totals.amount);
                },
            },
            {
                field: "totals.amount_discounted",
                headerName: "Hesaplanan Tutar",
                suppressColumnsToolPanel: true,
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
                        currency: 'TRY'
                    }).format(params.data.totals.amount_discounted);
                },
            },
            {
                field: "totals.amount_payable",
                headerName: "Ödenecek Tutar",
                width: "100px",
                suppressColumnsToolPanel: true,
                hide: true,
                // valueGetter: (params) => {
                //     params.data.totals.amount_payable =
                //         params.data.calculations.odenecek_tutar;
                //     return params.data.totals.amount_payable;
                // },
                valueFormatter: (params) => {
                    return new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: 'TRY'
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
];

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
    onSelectionChanged: selectionChangeEvent,
    onCellValueChanged: calculate,
    onRowDataUpdated: calculate,
    onRowValueChanged: calculate,
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
    $("#currency-codes").on("change", (e) => {
        calculate();
    });
    $("#read-lines").click((e) => {
        const selectedData = linesGridOptions.api.getSelectedNodes();
        selectedData.forEach((node) => {
            console.log("node.data :>> ", node.data);
        });
    });
});
