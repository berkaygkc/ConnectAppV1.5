let despatch_edit_id = null;

async function delay(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

$(document).ready(function () {
    const fillForm = async (data) => {
        await delay(1250);
        // ! Customer Part
        $("#customer-name")
            .typeahead("val", data.Customer.Name)
            .trigger("focusout");
        $("#customer-tax")
            .typeahead("val", data.Customer.TaxNumber)
            .trigger("focusout");
        $("#customer-address").typeahead("val", data.Customer.Address);
        $("#customer-district").typeahead("val", data.Customer.District);
        $("#customer-city").typeahead("val", data.Customer.City);
        $("#customer-country").typeahead("val", data.Customer.Country);
        $("#customer-tax-office").typeahead("val", data.Customer.TaxOffice);
        $("#customer-phone").val(data.Customer.PhoneNumber);
        $("#customer-mail").val(data.Customer.Mail);
        $("#customer-postal").val(data.Customer.PostalCode);
        $("#customer-web").val(data.Customer.Website);

        // ! Despatch Part
        let despatch_date_object = new Date(
            `${data.IssueDateTime.split("T")[0]} ${
                data.IssueDateTime.split("T")[1]
            }`
        );
        despatch_date.setDate(despatch_date_object);
        let actual_despatch_date_object = new Date(
            `${data.sys.shipment.delivery.actual.split("T")[0]} ${
                data.sys.shipment.delivery.actual.split("T")[1]
            }`
        );
        actual_despatch_date.setDate(actual_despatch_date_object);
        if (data.Shipment.DriverID) {
            $("#driver").val(data.Shipment.DriverID).trigger("change");
        }
        if (data.Shipment.CarrierID) {
            $("#carrier").val(data.Shipment.CarrierID).trigger("change");
        }
        if (data.sys.number_serie.length > 3) {
            $("#make-manuel-serie").trigger("click");
            $("#manuel-despatch-number").val(data.sys.number_serie);
        } else {
            $("#edespatch-serie").val(data.sys.number_serie).trigger("change");
        }
        $("#edespatch-template")
            .val(data.sys.external.template_id)
            .trigger("change");

        // ! Order Part
        if (data.Order?.Date) {
            $("#order-despatches-checkbox")
                .prop("checked", true)
                .trigger("change");
            order_date.setDate(new Date(data.Order.Date));
            $("#order-no").val(data.Order.Value);
        }
        // ! despatch Line Part
        data.Lines.forEach((line, index) => {
            $("#lines-add-row").trigger("click");
            linesGridOptions.api.forEachLeafNode(async (node, agindex) => {
                if (index === agindex) {
                    node.setDataValue("item.name", line.Name);
                    node.setDataValue("quantities.quantity", line.Quantity);
                    node.setDataValue("prices.price", line.Price);
                    if (line.UnitCode.length <= 3) {
                        let finded_unit_response = await fetch(
                            "/api/v1.0/internal/definitions/unit/code/" +
                                line.UnitCode
                        );
                        let finded_unit = await finded_unit_response.json();
                        if (finded_unit.name) {
                            node.setDataValue(
                                "quantities.unit_code",
                                finded_unit.name
                            );
                        } else {
                            node.setDataValue(
                                "quantities.unit_code",
                                line.UnitCode
                            );
                        }
                    } else {
                        node.setDataValue(
                            "quantities.unit_code",
                            line.UnitCode
                        );
                    }
                }
            });
        });
        // ! despatch Notes Part
        if (data.Notes.length > 0) {
            data.Notes.forEach((note, index) => {
                $("#notes-add-row").trigger("click");
                notesGridOptions.api.forEachLeafNode((node, agindex) => {
                    if (index === agindex) {
                        node.setDataValue("note", note.Note);
                    }
                });
            });
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    despatch_edit_id = urlParams.get("key");
    if (despatch_edit_id) {
        blockPage("İrsaliye bilgileriniz getiriliyor...");
        $("#edit-id").val(despatch_edit_id);
        $.ajax({
            type: "GET",
            url: `/create/despatch/detail/${despatch_edit_id}`,
            success: async function (response) {
                await fillForm(response);
            },
            error: function (error) {
                window.location.href = "/create/despatch";
            },
        });
    }
});
