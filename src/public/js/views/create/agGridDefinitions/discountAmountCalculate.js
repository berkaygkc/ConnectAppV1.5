function discountAmountCalculate(price, discount_percent) {
    if (!!price && !!discount_percent) {
        if (
            Number(String(price).replace(",", ".")) &&
            Number(String(discount_percent).replace(",", "."))
        ) {
            const amount =
                Number(String(price).replace(",", ".")) *
                (Number(String(discount_percent).replace(",", ".")) / 100);
            return Number(amount);
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function discountPercentCalculate(price, discount_amount) {
    if (!!price && !!discount_amount) {
        if (
            Number(String(price).replace(",", ".")) &&
            Number(String(discount_amount).replace(",", "."))
        ) {
            const percent =
                (Number(String(discount_amount).replace(",", ".")) * 100) /
                Number(String(price).replace(",", "."));
            return Number(percent);
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function amountDiscountedCalculate(amount, amount_discounted) {
    if (!!amount && !!amount_discounted) {
        if (
            Number(String(amount).replace(",", ".")) &&
            Number(String(amount_discounted).replace(",", "."))
        ) {
            return (
                Number(String(amount).replace(",", ".")) -
                Number(String(amount_discounted).replace(",", "."))
            );
        } else {
            return Number(String(amount).replace(",", "."))
                ? Number(String(amount).replace(",", "."))
                : 0;
        }
    } else {
        return Number(String(amount).replace(",", "."))
            ? Number(String(amount).replace(",", "."))
            : 0;
    }
}
