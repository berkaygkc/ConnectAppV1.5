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
        field: "tax_name",
        headerName: "Vergi Adı",
        filter: true,
        width: 250,
    },
    {
        field: "tax_code",
        headerName: "Vergi Kodu",
        filter: true,
        hide: true,
    },
    {
        field: "percent",
        headerName: "Yüzde",
        filter: true,
        hide: true,
    },
    {
        field: "year",
        headerName: "Yıl",
        filter: true,
    },
    {
        field: "month",
        headerName: "Ay",
        filter: true,
    },
    {
        field: "total_out",
        headerName: "Giden Fatura Vergi Toplamı",
        aggFunc: "sum",
        width: 200,
        valueFormatter: (params) => {
            let price = params.data ? params.data.total_out : params.value;
            if (price) {
                if (String(price).search(/\,/) != -1) {
                    price = String(price).replace(",", ".");
                }
            }
            return Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
            }).format(price);
        },
        filter: "agNumberColumnFilter",
    },
    {
        field: "total_in",
        headerName: "Gelen Fatura Vergi Toplamı",
        aggFunc: "sum",
        width: 200,
        valueFormatter: (params) => {
            let price = params.data ? params.data.total_in : params.value;
            if (price) {
                if (String(price).search(/\,/) != -1) {
                    price = String(price).replace(",", ".");
                }
            }
            return Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
            }).format(price);
        },
        filter: "agNumberColumnFilter",
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

document.addEventListener("DOMContentLoaded", function () {
    var gridDiv = document.querySelector("#current-movements-list");
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.showLoadingOverlay();
    $.ajax({
        method: "GET",
        url: `/reports/vergi-raporu/data`,
        success: function (response) {
            console.log(response);
            gridOptions.api.setRowData(response.data);
            const instance_year = gridOptions.api.getFilterInstance("year");
            const instance_month = gridOptions.api.getFilterInstance("month");
            let date = new Date();
            instance_year.setModel({ values: [date.getFullYear()] });
            instance_month.setModel({ values: [date.getMonth()] });
            gridOptions.api.onFilterChanged();
            gridOptions.api.hideOverlay();
        },
    });
});
