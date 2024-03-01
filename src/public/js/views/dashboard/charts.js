(function () {
    let cardColor, headingColor, legendColor, labelColor, borderColor;
    if (isDarkStyle) {
        cardColor = config.colors_dark.cardColor;
        labelColor = config.colors_dark.textMuted;
        legendColor = config.colors_dark.bodyColor;
        headingColor = config.colors_dark.headingColor;
        borderColor = config.colors_dark.borderColor;
    } else {
        cardColor = config.colors.cardColor;
        labelColor = config.colors.textMuted;
        legendColor = config.colors.bodyColor;
        headingColor = config.colors.headingColor;
        borderColor = config.colors.borderColor;
    }

    const chartColors = {
        donut: {
            series1: "#C2F9BB",
            series2: "#DD5050",
            series3: "#F79763",
            series4: "#CECDCD",
        },
    };

    const invoiceTrackerEl = document.querySelector("#invoiceTracker"),
        invoiceTrackerOptions = {
            chart: {
                height: "auto",
                width: "100%",
                parentHeightOffset: 0,
                type: "donut",
            },
            labels: ["Başarılı", "Hatalı", "İşaretli", "Gönderilmemiş"],
            series: [
                Number($("#total-success-invoice").val()),
                Number($("#total-error-invoice").val()),
                Number($("#total-mark-invoice").val()),
                Number($("#total-waiting-invoice").val()),
            ],
            colors: [
                chartColors.donut.series1,
                chartColors.donut.series2,
                chartColors.donut.series3,
                chartColors.donut.series4,
            ],
            stroke: {
                width: 0,
            },
            dataLabels: {
                enabled: false,
                formatter: function (val, opt) {
                    return parseInt(val) + "%";
                },
            },
            legend: {
                show: true,
                position: "bottom",
            },
            tooltip: {
                theme: false,
            },
            grid: {
                padding: {
                    top: 15,
                    right: -20,
                    left: -20,
                },
            },
            states: {
                hover: {
                    filter: {
                        type: "none",
                    },
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: "70%",
                        labels: {
                            show: true,
                            value: {
                                fontSize: "1.375rem",
                                fontFamily: "Public Sans",
                                color: headingColor,
                                fontWeight: 600,
                                offsetY: -15,
                                formatter: function (val) {
                                    return parseInt(val) + "%";
                                },
                            },
                            name: {
                                offsetY: 20,
                                fontFamily: "Public Sans",
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                color: config.colors.secondary,
                                fontSize: ".8125rem",
                                label: "Gönderim Oranı",
                                fontFamily: "Public Sans",
                                formatter: function (w) {
                                    return `%${$(
                                        "#total-percent-invoice"
                                    ).val()}`;
                                },
                            },
                        },
                    },
                },
            },
        };
    if (typeof invoiceTrackerEl !== undefined && invoiceTrackerEl !== null) {
        const invoiceTrackerChart = new ApexCharts(
            invoiceTrackerEl,
            invoiceTrackerOptions
        );
        invoiceTrackerChart.render();
    }

    const despatchTrackerEl = document.querySelector("#despatchTracker"),
        despatchTrackerOptions = {
            chart: {
                height: "auto",
                width: "100%",
                parentHeightOffset: 0,
                type: "donut",
            },
            labels: ["Başarılı", "Hatalı", "İşaretli", "Gönderilmemiş"],
            series: [
                Number($("#total-success-despatch").val()),
                Number($("#total-error-despatch").val()),
                Number($("#total-mark-despatch").val()),
                Number($("#total-waiting-despatch").val()),
            ],
            colors: [
                chartColors.donut.series1,
                chartColors.donut.series2,
                chartColors.donut.series3,
                chartColors.donut.series4,
            ],
            stroke: {
                width: 0,
            },
            dataLabels: {
                enabled: false,
                formatter: function (val, opt) {
                    return parseInt(val) + "%";
                },
            },
            legend: {
                show: true,
                position: "bottom",
            },
            tooltip: {
                theme: false,
            },
            grid: {
                padding: {
                    top: 15,
                    right: -20,
                    left: -20,
                },
            },
            states: {
                hover: {
                    filter: {
                        type: "none",
                    },
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: "70%",
                        labels: {
                            show: true,
                            value: {
                                fontSize: "1.375rem",
                                fontFamily: "Public Sans",
                                color: headingColor,
                                fontWeight: 600,
                                offsetY: -15,
                                formatter: function (val) {
                                    return parseInt(val) + "%";
                                },
                            },
                            name: {
                                offsetY: 20,
                                fontFamily: "Public Sans",
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                color: config.colors.secondary,
                                fontSize: ".8125rem",
                                label: "Gönderim Oranı",
                                fontFamily: "Public Sans",
                                formatter: function (w) {
                                    return `%${$(
                                        "#total-percent-despatch"
                                    ).val()}`;
                                },
                            },
                        },
                    },
                },
            },
        };
    if (typeof despatchTrackerEl !== undefined && despatchTrackerEl !== null) {
        const despatchTrackerChart = new ApexCharts(
            despatchTrackerEl,
            despatchTrackerOptions
        );
        despatchTrackerChart.render();
    }
})();
