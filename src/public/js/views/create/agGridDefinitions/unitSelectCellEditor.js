class unitSelectCellEditor {
    // gets called once before the renderer is used

    /**
     *
     * <select class="form-control select2" id="itemname-select" name="itemname-select"></select>
     *
     */

    init(params) {
        // create the cell
        this.eInput = document.createElement("select");
        this.eInput.className = "form-control";
        this.eInput.style = "width: 250px;";
        this.eInput.id = "unitcode-select";
        this.eInput.name = "unitcode-select";
        setTimeout(() => {
            $(this.eInput).select2({
                placeholder: "Birim Kodu seçiniz.....",
                // dropdownParent: $(this.eInput).parent(),
                width: "250px",
            });
            $.ajax({
                type: "get",
                url: "/api/v1.0/internal/definitions/units",
                success: function (response) {
                    response.forEach((unit) => {
                        let option = new Option(
                            unit.name,
                            unit.code,
                            unit.code == "C62" ? true : false,
                            unit.code == "C62" ? true : false
                        );
                        $("#unitcode-select").append(option);
                        $("#unitcode-select").val("");
                    });
                },
                complete: () => {
                    $("#unitcode-select").select2("open");
                },
            });
            $(this.eInput).on("select2:select", (e) => {
                params.stopEditing();
            });
        }, 300);
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
        const value = $("#unitcode-select").select2("data")[0]
            ? $("#unitcode-select").select2("data")[0].text
            : "ADET";
        return value;
    }

    // any cleanup we need to be done here
    destroy() {
        // $("#unitcode-select").select2("destroy");
        // but this example is simple, no cleanup, we could  even leave this method out as it's optional
    }
}
