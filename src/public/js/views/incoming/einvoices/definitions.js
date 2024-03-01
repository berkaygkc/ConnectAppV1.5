$(document).ready(function () {
    $("#status").each(function () {
        var $this = $(this);
        $this
            .wrap('<div class="position-relative"></div>')
            .select2({
                dropdownParent: $this.parent(),
                placeholder: "Fatura Durumu",
                multiple: true,
                closeOnSelect: false,
                allowClear: true,
            })
            .val([])
            .trigger("change");
    });
    $("#reply_status").each(function () {
        var $this = $(this);
        $this
            .wrap('<div class="position-relative"></div>')
            .select2({
                dropdownParent: $this.parent(),
                placeholder: "Yanıt Durumu",
                width: "resolve",
                multiple: true,
                closeOnSelect: false,
                allowClear: true,
            })
            .val([])
            .trigger("change");
    });
    $("#profile").each(function () {
        var $this = $(this);
        $this
            .wrap('<div class="position-relative"></div>')
            .select2({
                dropdownParent: $this.parent(),
                placeholder: "Profil",
                width: "resolve",
                multiple: true,
                closeOnSelect: false,
                allowClear: true,
            })
            .val([])
            .trigger("change");
    });
    $("#type").each(function () {
        var $this = $(this);
        $this
            .wrap('<div class="position-relative"></div>')
            .select2({
                dropdownParent: $this.parent(),
                placeholder: "Tip",
                width: "resolve",
                multiple: true,
                closeOnSelect: false,
                allowClear: true,
            })
            .val([])
            .trigger("change");
    });
    $("#order").each(function () {
        var $this = $(this);
        $this.wrap('<div class="position-relative"></div>').select2({
            dropdownParent: $this.parent(),
            placeholder: "Sıralama",
            width: "resolve",
        });
    });
    $("#dir").each(function () {
        var $this = $(this);
        $this.wrap('<div class="position-relative"></div>').select2({
            dropdownParent: $this.parent(),
            placeholder: "Yönü",
            width: "resolve",
        });
    });
    function renderReaded(option) {
        let $icon = "";
        switch (option.text) {
            case "Okundu":
                $icon =
                    `<i class="fa-regular fa-envelope-open fa-xs me-1"></i> ` +
                    option.text;
                break;
            case "Okunmadı":
                $icon =
                    `<i class="fa-regular fa-envelope fa-xs me-1"></i> ` +
                    option.text;
                break;
            default:
                $icon = option.text;
                break;
        }
        return $icon;
    }
    function renderPrinted(option) {
        let $icon = "";
        switch (option.text) {
            case "Yazdırıldı":
                $icon =
                    `<i class="fa-solid fa-print fa-xs me-1"></i> <i class="fa-solid fa-check fa-xs"></i> ` +
                    option.text;
                break;
            case "Yazdırılmadı":
                $icon =
                    `<i class="fa-solid fa-print fa-xs me-1"></i> <i class="fa-solid fa-xmark fa-xs"></i> ` +
                    option.text;
                break;
            default:
                $icon = option.text;
                break;
        }
        return $icon;
    }
    $("#read_status").each(function () {
        var $this = $(this);
        $this.wrap('<div class="position-relative"></div>').select2({
            dropdownParent: $this.parent(),
            templateResult: renderReaded,
            templateSelection: renderReaded,
            escapeMarkup: function (es) {
                return es;
            },
        });
    });
    $("#print_status").each(function () {
        var $this = $(this);
        $this.wrap('<div class="position-relative"></div>').select2({
            dropdownParent: $this.parent(),
            templateResult: renderPrinted,
            templateSelection: renderPrinted,
            escapeMarkup: function (es) {
                return es;
            },
        });
    });
});
