const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
});

const allEqual = (arr) => arr.every((v) => v === arr[0]);

const columnDefs = [
    {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerClass: "checkbox",
        pinned: "left",
        width: "40px",
        field: "checkboxBtn",
        resizable: false,
        lockPosition: "left",
        suppressAutoSize: true,
        suppressColumnsToolPanel: true,
        suppressMenu: true,
    },
    {
        field: "uuid",
        hide: true,
        suppressColumnsToolPanel: true,
    },
    {
        headerName: "Tarih Bilgileri",
        children: [
            {
                field: "date.full_date",
                headerName: "Tarih",
                columnGroupShow: "closed",
                filter: "agDateColumnFilter",
            },
            {
                field: "date.day",
                headerName: "Gün",
                columnGroupShow: "open",
                filter: "agNumberColumnFilter",
            },
            {
                field: "date.month",
                headerName: "Ay",
                columnGroupShow: "open",
                filter: "agNumberColumnFilter",
            },
            {
                field: "date.year",
                headerName: "Yıl",
                columnGroupShow: "open",
                filter: "agNumberColumnFilter",
            },
        ],
    },
    {
        headerName: "Belge Bilgileri",
        children: [
            {
                field: "document.direction",
                headerName: "Belge Yönü",
                filter: true,
            },
            {
                field: "document.profile",
                headerName: "Profil",
                filter: "agSetColumnFilter",
            },
            {
                field: "document.type",
                headerName: "Tip",
                filter: "agSetColumnFilter",
            },
            {
                field: "document.number",
                headerName: "Numara",
                filter: true,
            },
            {
                field: "document.status",
                headerName: "Durum",
                filter: true,
            },
            {
                field: "document.reply",
                headerName: "Durum",
                filter: true,
            },
        ],
    },
    {
        headerName: "Toplam Tutarlar",
        children: [
            {
                field: "amount.payable",
                headerName: "Ödenecek",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.amount.payable
                        : params.value;
                    console.log(price);
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "amount.base",
                headerName: "Vergi Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.amount.base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "amount.tax",
                headerName: "Vergi Tutarı",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.amount.tax
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "amount.discount",
                headerName: "İndirim",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.amount.discount
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
        ],
    },
    {
        headerName: "KDV Tutarları",
        children: [
            {
                field: "kdvs.0.base",
                headerName: "%0 - Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["0"].base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.1.base",
                headerName: "%1 - Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["1"].base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.1.price",
                headerName: "%1 - Tutar",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["1"].price
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.8.base",
                headerName: "%8 - Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["8"].base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.8.price",
                headerName: "%8 - Tutar",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["8"].price
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },

            {
                field: "kdvs.10.base",
                headerName: "%10 - Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["10"].base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.10.price",
                headerName: "%10 - Tutar",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["10"].price
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },

            {
                field: "kdvs.18.base",
                headerName: "%18 - Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["18"].base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.18.price",
                headerName: "%18 - Tutar",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["18"].price
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },

            {
                field: "kdvs.20.base",
                headerName: "%20 - Matrah",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["20"].base
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
            {
                field: "kdvs.20.price",
                headerName: "%20 - Tutar",
                aggFunc: "sum",
                valueFormatter: (params) => {
                    let price = params.data
                        ? params.data.kdvs["20"].price
                        : params.value;
                    if (price) {
                        if (String(price).search(/\,/) != -1) {
                            price = String(price).replace(",", ".");
                        }
                    }
                    return params.data?.currency_code
                        ? Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: params.data.currency_code,
                          }).format(price)
                        : price
                        ? price.toFixed(2)
                        : 0;
                },
                filter: "agNumberColumnFilter",
            },
        ],
    },
];

var localeText = AG_GRID_LOCALE_TR;

const gridOptions = {
    defaultColDef: {
        resizable: true,
        width: 120,
        enableRowGroup: true,
        floatingFilter: true,
    },
    sideBar: {
        toolPanels: ["columns"],
    },
    columnDefs: columnDefs,
    rowGroupPanelShow: "always",
    autoGroupColumnDef: {
        minWidth: 300,
        cellRendererParams: {
            innerRenderer: MyInnerRenderer,
        },
    },
    groupIncludeTotalFooter: true,
    rowData: [],
    rowDragManaged: true,
    animateRows: true,
    localeText: localeText,
    rowSelection: "multiple",
};
// http://air.local:4004/currents/24

let currentId = window.location.pathname.split("/")[2];

document.addEventListener("DOMContentLoaded", function () {
    var gridDiv = document.querySelector("#current-movements-list");
    new agGrid.Grid(gridDiv, gridOptions);

    $.ajax({
        method: "GET",
        url: `/currents/${currentId}/invoice`,
        success: function (response) {
            console.log(response.data);
            gridOptions.api.setRowData(response.data);
        },
    });
});
