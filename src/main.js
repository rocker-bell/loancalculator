// element selection declaration (input/output)
function calculate() {
    let amount = document.getElementById('amount');
    let annual_interest = document.getElementById('annual');
    let yearly_repayment = document.getElementById('years');
    let Zipcode = document.getElementById('Zipcode');
    let Mounthly_payment = document.getElementById('Payment');
    let Total_payment = document.getElementById('Total');
    let Total_Interest = document.getElementById('interest');

    // change float number to real numbers and calculate amout per attribute

    let principal = parseFloat(amount.value);
    let interest = parseFloat(annual_interest.value) / 100 / 12;
    let payments = parseFloat(yearly_repayment.value) * 12;

    // compute the mounthly payment figure

    let x = Math.pow(1 + interest, payments);
    let mounthly = (principal * x * interest) / (x - 1);

    // check output if finite number

    if (isFinite(mounthly)) {
        Mounthly_paymen.value = mounthly.toFixed(2);
        Total_payment.innerHtml = (mounthly * payments).toFixed(2);
        Total_Interest.innerHtml = ((mounthly * payments) - principal).toFixed(2);

        save(amount.value, annual_interest.value, yearly_repayment.value, Zipcode.value);


        try {
            getLenders(amount.value, annual_interest.value, yearly_repayment.value, Zipcode.value)
        }

        catch (e) {

        }

        chart(principal, interest, mounthly, payments);


    } else {
        Mounthly_payment.innerHtml = "";
        Total_payment.innerHtml = "";
        Total_Interest.innerHtml = "";
        chart();
    }

}

function save(amount, annual_interest, yearly_repayment, Zipcode) {
    if (window.localStorage) {
        localStorage.loan_amount = amount;
        localStorage.loan_apr = annual_interest;
        localStorage.loan_years = yearly_repayment;
        localStorage.loan_zipcode = Zipcode;
    }
}

window.onload = function () {
    if (window.localStorage && localStorage.loan_amount) {
        document.getElementById('amount').value = localStorage.loan_amount;
        document.getElementById('annual').value = localStorage.loan_apr;
        document.getElementById('years').value = localStorage.loan_years;
        document.getElementById('zipcode').value = localStorage.loan_zipcode;
    }
};


function getLenders(amount, annual_interest, yearly_repayment, Zipcode) {
    if (!window.XMLHttpRequest) return;

    let ad = document.getElementById("lenders");
    if (!ad) return;

    let url = "getLenders.php" +
        "?amt=" + encodeURIComponent(amount) +
        "&apr=" + encodeURIComponent(annual_interest) +
        "&yrs=" + encodeURIComponent(yearly_repayment) +
        "&zip=" + encodeURIComponent(Zipcode);


    let req = new XMLHttpRequest();
    req.open("GET", url);
    req.send(null);

    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            let response = req.responseText;
            let lenders = JSON.parse(response);

            let list = "";
            for (let i = 0; i < lenders.length; i++) {
                list += "<li><a href='" + lenders[i].url + "'>" + lenders[i].name + "</a>";
            }

            ad.innerHTML = "<ul>" + list + "</ul>";
        }
    }

}


function chart(principal, interest, mounthly, payments) {
    let graph = document.getElementById("graph");
    graph.width = graph.width;

    if (arguments.length == 0 || !graph.getContext) return;

    let g = graph.getContext("2d");
    let width = graph.width, height = graph.height;


    function paymentToX(payments) {
        return payments * width / payments;
    }

    function amountToY(amount) {
        return height - (amount * height / mounthly * payments * 1.05)
    }

    g.moveTo(paymentToX(0), amountToY(0));
    g.lineTo(paymentToX(payments), amountToY(mounthly * payments));
    g.lineTo(paymentToX(payments), amountToY(0));
    g.closePath();
    g.fillStyle = "#f88";
    g.fill();
    g.font = "bold 12px sans-serif";
    g.fillText("Total Interest Payments", 20, 20);

    let equity = 0;
    g.beginPath();
    g.moveTo(paymentToX(0), amountToY(0));

    for (let p = 0; p <= payments; p++) {
        let thisMonthsInterest = (principal - equity) * interest;
        equity += (mounthly - thisMonthsInterest);
        g.lineTo(paymentToX(p), amountToY(equity));
    }

    g.lineTo(paymentToX(payments), amountToY(0));
    g.closePath();
    g.fillStyle = "green";
    g.fill();
    g.fillText("Total Equity", 20, 35);

    let bal = principal;
    g.beginPath();
    g.moveTo(paymentToX(0), amountToY(bal));
    for (let p = 1; p <= payments; p++) {
        let thisMonthsInterest = bal * interest;
        bal -= (mounthly - thisMonthsInterest);
        g.lineTo(paymentToX(p), amountToY(bal));

    }

    g.lineWidth = "3";
    g.stroke();
    g.fillStyle = "black";
    g.fillText("Loan Balance", 20, 50);


    g.textAlign = "Center";
    let y = amountToY(0);
    for (let year = 1; year * 12 <= payments; year++) {
        let x = paymentToX(year * 12);
        g.fillRect(x - 0.5, y - 3, 1, 3);
        if (year == 1) g.fillText("Year", x, y - 5);
        if (year % 5 == 0 && year * 12 !== payments)
            g.fillText(String(year), x, y - 5);
    }

    g.textAlign = "right";
    g.textBaseline = "middle";
    let ticks = [mounthly * payments, principal];
    let rightEdge = paymentToX(payments);
    for (let i = 0; i < ticks.length; i++) {
        let y = amountToY(ticks[i]);
        g.fillRect(rightEdge - 3, y - 0.5, 3, 1);
        g.fillText(String(ticks[i].toFixed(0)), rightEdge - 5, y);
    }
}
