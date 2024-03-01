class dateSelectorCellEditor {
    // gets called once before the renderer is used

    /**
     *
     * <select class="form-control select2" id="itemname-select" name="itemname-select"></select>
     *
     */

    init(params) {
        // create the cell
        this.eInput = document.createElement("input");
        this.eInput.className = "form-control";
        this.eInput.id = "date-selector";
        this.eInput.name = "date-selector";
        setTimeout(() => {
            this.datePicker = $(this.eInput).flatpickr({
                locale: "tr",
                dateFormat: "d.m.Y",
                onChange: function (selectedDates, dateStr, instance) {
                    instance.close();
                },
            });
        }, 300);
    }

    // gets called once when grid ready to insert the element
    getGui() {
        return this.eInput;
    }

    // focus and select can be done after the gui is attached
    afterGuiAttached() {
        this.datePicker.open();
    }

    isCancelBeforeStart() {
        return this.cancelBeforeStart;
    }

    // returns the new value after editing
    getValue() {
        const value = this.datePicker.formatDate(
            this.datePicker.selectedDates[0],
            "Y-m-d"
        );
        return value;
    }

    // any cleanup we need to be done here
    destroy() {
        // but this example is simple, no cleanup, we could  even leave this method out as it's optional
    }
}
