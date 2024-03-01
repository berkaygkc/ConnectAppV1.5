function numericMultiplication(number1, number2) {
    if (!!number1 && !!number2) {
        if (
            Number(number1.replace(",", ".")) &&
            Number(number2.replace(",", "."))
        ) {
            return (
                Number(number1.replace(",", ".")) *
                Number(number2.replace(",", "."))
            );
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function numericCollection(number1, number2) {
    if (
        Number(String(number1).replace(",", ".")) != NaN &&
        Number(String(number2).replace(",", ".")) != NaN
    ) {
        return (
            Number(String(number1).replace(",", ".")) +
            Number(String(number2).replace(",", "."))
        );
    } else return 1;
}

function numericExtraction(number1, number2) {
    if (
        Number(String(number1).replace(",", ".")) != NaN &&
        Number(String(number2).replace(",", ".")) != NaN
    ) {
        return (
            Number(String(number1).replace(",", ".")) -
            Number(String(number2).replace(",", "."))
        );
    } else return 1;
}
