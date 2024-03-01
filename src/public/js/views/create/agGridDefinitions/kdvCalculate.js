function kdvAmountCalculate(percent, amount_discounted, status) {
    if (!!percent && !!amount_discounted) {
        let percentl = Number(String(percent).replace(",", "."));
        let amount_discountedl = Number(
            String(amount_discounted).replace(",", ".")
        );
        if (percentl && amount_discountedl) {
            let amount = amount_discountedl * (percentl / 100);
            return Number(amount);
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
            let amount = amount_discountedl;
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

function kdvStatusUnitPriceCalculate(percent, unit_price, status) {
    if ((!!percent || percent == 0) && !!unit_price) {
        let percentl = Number(String(percent).replace(",", "."));
        let unit_pricel = Number(String(unit_price).replace(",", "."));
        if ((percentl || percentl == 0) && unit_pricel) {
            let amount = 0;
            switch (status) {
                case "Dahil":
                    amount = unit_pricel / (1 + percentl / 100);
                    break;
                case "Hariç":
                    amount = unit_pricel;
                    break;
                default:
                    break;
            }
            return Number(amount);
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}
