const notesSelectionChangeEvent = (e) => {
    if (notesGridOptions.api.getSelectedRows().length > 0) {
        $("#notes-delete-selected").attr("hidden", false);
    } else {
        $("#notes-delete-selected").attr("hidden", true);
    }
};

const calculateNotes = () => {
    let notes_counter = 0;
    notesGridOptions.api.forEachNode((row, index) => {
        notes_counter++;
    });
    $("#notes-counter").text(notes_counter);
};

const valueChangeEventNotes = (e) => {
    let columns = ["note"];
    if (!e) {
        calculateNotes();
    } else if (e.type == "cellValueChanged") {
        if (columns.includes(e.column.colId)) {
            calculate();
        }
    } else if (e.type == "rowDataUpdated") {
        calculateNotes();
    }
};

let noteColumnsDef = [
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
        field: "note",
        headerName: "Not",
        editable: true,
        lockPosition: "left",
    },
];
let notesGridOptions = {
    defaultColDef: {
        resizable: true,
        suppressMenu: true,
        singleClickEdit: true,
    },
    columnDefs: noteColumnsDef,
    stopEditingWhenCellsLoseFocus: true,
    rowData: [],
    rowDragManaged: true,
    animateRows: true,
    localeText: AG_GRID_LOCALE_TR,
    rowSelection: "multiple",
    onSelectionChanged: notesSelectionChangeEvent,
    onCellValueChanged: valueChangeEventNotes,
    onRowDataUpdated: valueChangeEventNotes,
};

document.addEventListener("DOMContentLoaded", async function () {
    notesDiv = document.querySelector("#notes-grid");
    new agGrid.Grid(notesDiv, notesGridOptions);
    setTimeout(() => {
        notesGridOptions.api.sizeColumnsToFit();
    }, 250);

    $("#notes-add-row").click((e) => {
        notesGridOptions.api.applyTransaction({
            add: [
                {
                    note: "",
                },
            ],
            addIndex: undefined,
        });
    });
    $("#notes-delete-selected").click((e) => {
        const selectedData = notesGridOptions.api.getSelectedRows();
        const res = notesGridOptions.api.applyTransaction({
            remove: selectedData,
        });
    });

    $(".default-notes").click(function () {
        notesGridOptions.api.applyTransaction({
            add: [
                {
                    note: $(this).text(),
                },
            ],
            addIndex: undefined,
        });
    });
});
