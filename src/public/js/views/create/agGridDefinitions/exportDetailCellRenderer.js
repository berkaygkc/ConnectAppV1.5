class ExportDetailCellRenderer {
    init(params) {
        this.eGui = document.createElement("div");
        this.eGui.className = "d-grid";
        this.eGui.innerHTML = `<button type="button" class="btn btn-xs rounded-pill btn-primary waves-effect">Detay</button>`;
        this.eGui.addEventListener("click", (e) => {
            $("#edit-line-form")[0].reset();
            setTimeout(() => {
                $("#export-detail-row-id").val(params.data.id);
                $("#line-gtip-no").val(params.data.delivery.gtip);
                $("#line-teslim")
                    .val(params.data.delivery.terms)
                    .trigger("change");
                $("#line-gonderim")
                    .val(params.data.delivery.transport)
                    .trigger("change");
                $("#line-gtb-no").val(params.data.delivery.trace);
                $("#line-case-no").val(params.data.delivery.package.no);
                $("#line-case-quantity").val(
                    params.data.delivery.package.quantity
                );
                $("#line-case-unit")
                    .val(params.data.delivery.package.unit)
                    .trigger("change");
                $("#line-case-brand").val(params.data.delivery.package.brand);
                $("#line-address").val(params.data.delivery.address.address);
                $("#line-district").val(params.data.delivery.address.district);
                $("#line-city").val(params.data.delivery.address.city);
                $("#line-country").val(params.data.delivery.address.country);
                $("#line-postal").val(params.data.delivery.address.postal_code);
                $("#edit-line-export").modal("show");
            }, 100);
        });
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        if (this.eGui) {
            this.eGui.removeEventListener("click", this.eventListener);
        }
    }
}
