class withholdingTaxCellEditor {
    // gets called once before the renderer is used

    /**
     *
     * <select class="form-control select2" id="itemname-select" name="itemname-select"></select>
     *
     */
    init(params) {
        let tax_codes;
        // create the cell
        this.eInput = document.createElement("select");
        this.eInput.className = "form-control";
        this.eInput.style = "width: 400px;";
        this.eInput.id = "withholdingtax-select";
        this.eInput.name = "withholdingtax-select";
        setTimeout(() => {
            $(this.eInput).select2({
                placeholder: "Tevkifat Kodu seçiniz.....",
                // dropdownParent: $(this.eInput).parent(),
                width: "400px",
            });
            $.ajax({
                type: "get",
                url: "/api/v1.0/internal/definitions/withholdingtaxes",
                success: function (response) {
                    tax_codes = response;
                    response.forEach((withholdingtax) => {
                        let option = new Option(
                            `${withholdingtax.code} - ${withholdingtax.name}`,
                            withholdingtax.code,
                            false,
                            false
                        );
                        $("#withholdingtax-select").append(option);
                        $("#withholdingtax-select").val("");
                    });
                },
                complete: () => {
                    $("#withholdingtax-select").select2("open");
                },
            });
            $(this.eInput).change((e) => {
                params.stopEditing();
                let selected_tax = tax_codes.find(
                    (e) => e.code == $(this.eInput).val()
                );
                if (selected_tax.percent) {
                    params.node.setDataValue(
                        "withholdingTax.percent",
                        selected_tax.percent
                    );
                } else {
                    params.node.setDataValue("withholdingTax.percent", 0);
                }
            });
        }, 100);
    }

    // gets called once when grid ready to insert the element
    getGui() {
        return this.eInput;
    }

    // focus and select can be done after the gui is attached
    afterGuiAttached() {
        this.eInput.focus();
    }

    // returns the new value after editing
    getValue() {
        const value = $("#withholdingtax-select").val()
            ? $("#withholdingtax-select").val()
            : "";
        return `${value}`;
    }

    // any cleanup we need to be done here
    destroy() {
        // $("#withholdingtax-select").select2("destroy");
        // but this example is simple, no cleanup, we could  even leave this method out as it's optional
    }
}
