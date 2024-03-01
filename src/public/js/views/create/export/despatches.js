let despatchColumnsDef = [
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
        field: "despatch_date",
        headerName: "İrsaliye Tarihi",
        editable: true,
        cellEditor: dateSelectorCellEditor,
        cellEditorPopup: true,
        suppressNavigable: true,
    },
    {
        field: "despatch_number",
        headerName: "İrsaliye Numarası",
        editable: true,
    },
];
let despatchesGridOptions = {
    defaultColDef: {
        resizable: true,
        suppressMenu: true,
        singleClickEdit: true,
    },
    columnDefs: despatchColumnsDef,
    stopEditingWhenCellsLoseFocus: true,
    rowData: [],
    rowDragManaged: true,
    animateRows: true,
    localeText: AG_GRID_LOCALE_TR,
    rowSelection: "multiple",
};

document.addEventListener("DOMContentLoaded", async function () {
    despatchesDiv = document.querySelector("#despatches-grid");
    new agGrid.Grid(despatchesDiv, despatchesGridOptions);
    setTimeout(() => {
        despatchesGridOptions.api.sizeColumnsToFit();
    }, 250);

    $("#despatches-add-row").click((e) => {
        despatchesGridOptions.api.applyTransaction({
            add: [
                {
                    despatch_date: "",
                    despatch_number: "",
                },
            ],
            addIndex: undefined,
        });
    });
    $("#despatches-delete-selected").click((e) => {
        const selectedData = despatchesGridOptions.api.getSelectedRows();
        const res = despatchesGridOptions.api.applyTransaction({
            remove: selectedData,
        });
    });
});
