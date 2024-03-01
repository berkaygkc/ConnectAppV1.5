class DetailCellRenderer {
    init(params) {
        this.params = params;

        // trick to convert string of HTML into DOM object
        var eTemp = document.createElement("div");
        eTemp.innerHTML = this.getTemplate();
        this.eGui = eTemp.firstElementChild;

        this.setupDetailGrid();
    }

    setupDetailGrid() {
        let glob_params = this.params;
        var eDetailGrid = this.eGui.querySelector("#lines-detail-grid");
        let detailGridOptions = {
            columnDefs: [
                {
                    field: "process",
                    headerName: "",
                    width: "35px",
                    resizable: false,
                    suppressAutoSize: true,
                    suppressColumnsToolPanel: true,
                    pinned: "left",
                    lockPosition: "left",
                    cellRenderer: DeleteDetailCellRenderer,
                },
                { field: "code", headerName: "Vergi Kodu", width: "70px" },
                { field: "name", headerName: "Vergi Adı", width: "120px" },
                {
                    field: "percent",
                    headerName: "Oranı",
                    editable: true,
                    width: "70px",
                    cellEditor: NumericCellEditor,
                    valueSetter: function (params) {
                        params.data.percent = params.newValue;
                        params.node.setDataValue(
                            "amount",
                            (glob_params.data.calculations.hesap_tutar *
                                params.newValue) /
                                100
                        );
                        return true;
                    },
                    valueFormatter: (params) => {
                        return `% ${params.data.percent}`;
                    },
                },
                {
                    field: "amount",
                    headerName: "Tutarı",
                    width: "70px",
                    valueSetter: function (params) {
                        params.data.amount = params.newValue;
                        return true;
                    },
                    valueFormatter: (params) => {
                        return new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: $("#currency-codes").val(),
                        }).format(params.data.amount);
                    },
                },
                {
                    field: "base_stat",
                    hide: true,
                    suppressAutoSize: true,
                    suppressColumnsToolPanel: true,
                },
                {
                    field: "base_calculate",
                    hide: true,
                    suppressAutoSize: true,
                    suppressColumnsToolPanel: true,
                },
            ],
            defaultColDef: {
                flex: 1,
                resizable: true,
                width: 100,
                suppressMenu: true,
                singleClickEdit: true,
            },
            domLayout: "autoHeight",
            stopEditingWhenCellsLoseFocus: true,
            localeText: AG_GRID_LOCALE_TR,
            rowData: this.params.data.taxes,
            enableCellChangeFlash: true,
            cellFlashDelay: 2000,
            cellFadeDelay: 500,
            onCellValueChanged: valueChangeEvent,
            onRowDataUpdated: valueChangeEvent,
        };

        new agGrid.Grid(eDetailGrid, detailGridOptions);

        this.detailGridApi = detailGridOptions.api;

        var masterGridApi = this.params.api;
        var rowId = this.params.node.id;
        var nodeApi = this.params.node;

        var gridInfo = {
            id: rowId,
            api: detailGridOptions.api,
            columnApi: detailGridOptions.columnApi,
        };
        masterGridApi.addDetailGridInfo(rowId, gridInfo);

        function valueChangeEvent(e) {
            let taxes = [];

            detailGridOptions.api.forEachNode((node, index) => {
                taxes.push(node.data);
            });
            nodeApi.setDataValue("taxes", taxes);
            if (taxes.length === 0) {
                nodeApi.setExpanded(false);
            }
            $(`#${glob_params.node.id}-ap`).switchClass(
                "bg-label-linkedin",
                "bg-label-success",
                0
            );
            $(`#${glob_params.node.id}-ap`).text(
                new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: $("#currency-codes").val(),
                }).format(glob_params.data.totals.amount_payable)
            );
            setTimeout(() => {
                $(`#${glob_params.node.id}-ap`).switchClass(
                    "bg-label-success",
                    "bg-label-linkedin",
                    2000
                );
            }, 1000);
        }
    }

    getTemplate() {
        var data = this.params.data;
        var template = `
        <div class="card" style="background-color: #f8f0f060;">
            <div class="card-body" style="padding:12px">
                <div class="col-12">
                    <div class="row">
                        <div class="col-8">
                            <div id="lines-detail-grid" style="width: 100%;" class="ag-theme-balham"></div>
                        </div>
                        <div class="col-4">
                            <div class="card bg-label-primary border border-primary">
                                <div class="d-flex row">
                                    <div class="card-body d-flex justify-content-between align-items-center p-2 px-4">
                                        <div class="card-title mb-0">
                                            <strong id="${
                                                this.params.node.id
                                            }-name">${data.item.name}</strong>
                                            <small id="${
                                                this.params.node.id
                                            }-qu">${data.quantities.quantity} ${
            data.quantities.unit_code
        }</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card bg-white mt-1">
                                <div class="d-flex row">
                                    <div class="card-body d-flex justify-content-between align-items-center p-2 px-4">
                                        <div class="card-title mb-0">
                                            <small>
                                                <b>Mal / Hizmet Tutarı</b>
                                            </small>
                                        </div>
                                        <div class="card-icon mx-1">
                                            <span id="${
                                                this.params.node.id
                                            }-ad" class="badge bg-label-linkedin rounded-pill p-2"> ${new Intl.NumberFormat(
            "tr-TR",
            {
                style: "currency",
                currency: $("#currency-codes").val(),
            }
        ).format(data.totals.amount_discounted)} </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card bg-white mt-1">
                                <div class="d-flex row">
                                    <div class="card-body d-flex justify-content-between align-items-center p-2 px-4">
                                        <div class="card-title mb-0">
                                            <small>
                                                <b>KDV Dahil Tutar</b>
                                            </small>
                                        </div>
                                        <div class="card-icon mx-1">
                                            <span id="${
                                                this.params.node.id
                                            }-ap" class="badge bg-label-linkedin rounded-pill p-2"> ${new Intl.NumberFormat(
            "tr-TR",
            {
                style: "currency",
                currency: $("#currency-codes").val(),
            }
        ).format(data.totals.amount_payable)} </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        return template;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return false;
    }

    destroy() {
        var rowId = this.params.node.id;
        var masterGridApi = this.params.api;
        masterGridApi.removeDetailGridInfo(rowId);
        this.detailGridApi.destroy();
    }
}
