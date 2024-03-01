class itemSelectCellEditor {
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
        this.eInput.id = "itemname-select";
        this.eInput.name = "itemname-select";
        this.item_type = params.data.item.type;
        setTimeout(() => {
            $(this.eInput)
                .wrap('<div class="position-relative"></div>')
                .select2({
                    width: "style",
                    ajax: {
                        url: `/definitions/items/${
                            this.item_type == "Stok"
                                ? 1
                                : this.item_type == "Hammadde"
                                ? 2
                                : this.item_type == "Mamül"
                                ? 3
                                : 4
                        }/list.select2`,
                        dataType: "json",
                        delay: 250,
                        data: function (params) {
                            return {
                                q: params.term,
                                page: params.page,
                            };
                        },
                    },
                    placeholder: "Stok ara",
                });
            $(this.eInput).select2("open");
            $(this.eInput).change((e) => {
                params.stopEditing();
                if (params.data.item.code) {
                    $.ajax({
                        type: "GET",
                        url: `/definitions/items/items/${this.eInput.value}`,
                        dataType: "json",
                        complete: (result) => {
                            if (result.responseJSON.status) {
                                params.node.setDataValue(
                                    "item.name",
                                    result.responseJSON.detail.name
                                );
                                params.node.setDataValue(
                                    "item.id",
                                    result.responseJSON.detail.id
                                );
                                params.node.setDataValue(
                                    "quantities.unit_code_2",
                                    result.responseJSON.detail.Units[0]
                                        .readable_unit
                                );
                                params.node.setDataValue(
                                    "quantities.unit_code_1",
                                    result.responseJSON.detail.Units[0]
                                        .readable_unit
                                );
                                params.node.setDataValue(
                                    "prices.price",
                                    result.responseJSON.detail.sales_price
                                );
                                if (
                                    $(
                                        'input[name="sells-type"]:checked'
                                    ).val() == "invoice"
                                ) {
                                    params.node.setDataValue(
                                        "kdv.percent",
                                        result.responseJSON.detail
                                            .sales_kdv_tax_percent
                                    );
                                }
                            } else {
                                params.node.setDataValue("item.name", null);
                                params.node.setDataValue("item.id", null);
                                params.node.setDataValue(
                                    "quantities.unit_code_2",
                                    null
                                );
                                params.node.setDataValue(
                                    "quantities.unit_code_1",
                                    null
                                );
                                params.node.setDataValue("prices.price", null);
                            }
                        },
                    });
                } else {
                    params.node.setDataValue("item.name", null);
                    params.node.setDataValue("item.id", null);
                }
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
        return this.eInput.value;
    }

    // any cleanup we need to be done here
    destroy() {
        // but this example is simple, no cleanup, we could  even leave this method out as it's optional
    }
}
