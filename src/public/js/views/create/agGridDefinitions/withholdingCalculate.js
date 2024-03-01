function withholdingAmountCalculate(percent, kdv_price) {
    if (!!percent && !!kdv_price) {
        let percentl = Number(String(percent).replace(",", "."));
        let kdv_pricel = Number(String(kdv_price).replace(",", "."));
        if (percentl && kdv_pricel) {
            return Number(kdv_pricel * (percentl / 100));
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function kdvBaseCalculate(percent, amount_discounted, status) {
    if (!!percent && !!amount_discounted) {
        let percentl = Number(String(percent).replace(",", "."));
        let amount_discountedl = Number(
            String(amount_discounted).replace(",", ".")
        );
        if (percentl && amount_discountedl) {
            let amount = 0;
            switch (status) {
                case "Dahil":
                    amount = amount_discountedl / (1 + percentl / 100);
                    break;
                case "Hariç":
                    amount = amount_discountedl;
                    break;
                default:
                    break;
            }
            return !!Number(amount) ? Number(amount) : 0;
        } else {
            return !!Number(amount_discountedl)
                ? Number(amount_discountedl)
                : 0;
        }
    } else {
        return !!Number(String(amount_discounted).replace(",", "."))
            ? Number(String(amount_discounted).replace(",", "."))
            : 0;
    }
}
