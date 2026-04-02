
let labels = [];
let prices = [];
let currentCurrency = 'USD';

const ctx = document.getElementById('goldChart').getContext('2d');
const goldChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Gold Price (USD)',
            data: prices,
            borderWidth: 4,
            borderColor: 'gold',
            backgroundColor: 'rgba(255,215,0,0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: false }
        }
    },
    plugins: {
    legend: {
        display: false
    }
}
});













function Calculate_Gold_Values(priceUSD) {
    const gram24 = priceUSD / 31.1035;
    const gram22 = gram24 * (22 / 24); // العيار المستخدم لليرات
    const gram21 = gram24 * (21 / 24);
    const gram18 = gram24 * (18 / 24);

    return {
        ounce: priceUSD,
        gram24: gram24,
        gram21: gram21,
        gram18: gram18,
        rashadi: gram22 * 7.20, // وزن الليرة الرشادي
        english: gram22 * 8.00  // وزن الليرة الإنجليزي
    };
}

function getUSDToJOD(callback) {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
    .then(response => response.json())
    .then(data => {
        callback(data.rates.JOD);
    })
    .catch(error => {
        console.error("Currency API failed", error);
        callback(null);
    });
}

function getGoldPrice() {
    fetch("https://api.gold-api.com/price/XAU")
    .then(response => response.json())
    .then(data => {
        const priceUSD = data.price;
        const time = new Date().toLocaleTimeString();
        const baseValues = Calculate_Gold_Values(priceUSD);

        getUSDToJOD(function(usdToJod) {
            const rate = (currentCurrency === 'JOD' && usdToJod) ? usdToJod : 1;
            
            const display = {
                ounce: (baseValues.ounce * rate).toFixed(2),
                g24: (baseValues.gram24 * rate).toFixed(2),
                g21: (baseValues.gram21 * rate).toFixed(2),
                g18: (baseValues.gram18 * rate).toFixed(2),
                rashadi: (baseValues.rashadi * rate).toFixed(2),
                english: (baseValues.english * rate).toFixed(2)
            };

            if(document.getElementById('tick-usd')) document.getElementById('tick-usd').textContent = display.ounce;
            if(document.getElementById('tick-24k')) document.getElementById('tick-24k').textContent = display.g24;
            if(document.getElementById('tick-21k')) document.getElementById('tick-21k').textContent = display.g21;
            if(document.getElementById('tick-18k')) document.getElementById('tick-18k').textContent = display.g18;
            if(document.getElementById('tick-rashadi')) document.getElementById('tick-rashadi').textContent = display.rashadi;
            if(document.getElementById('tick-english')) document.getElementById('tick-english').textContent = display.english;

            if(document.getElementById('ounce-price')) document.getElementById('ounce-price').textContent = display.ounce;
            if(document.getElementById('gram-24k')) document.getElementById('gram-24k').textContent = display.g24;
            if(document.getElementById('gram-21k')) document.getElementById('gram-21k').textContent = display.g21;
            if(document.getElementById('gram-18k')) document.getElementById('gram-18k').textContent = display.g18;
            if(document.getElementById('rashadi-price')) document.getElementById('rashadi-price').textContent = display.rashadi;
            if(document.getElementById('english-price')) document.getElementById('english-price').textContent = display.english;

            labels.push(time);
            prices.push(priceUSD);
            if (labels.length > 100) { 
                labels.shift(); 
                prices.shift(); 
            }
            goldChart.update();
        });
    })
    .catch(error => console.error("Gold API failed", error));
}

function toggleCurrency(currency) {
    currentCurrency = currency;
    
    const usdBtn = document.querySelector('button[onclick="toggleCurrency(\'USD\')"]');
    const jodBtn = document.querySelector('button[onclick="toggleCurrency(\'JOD\')"]');
    
    if (currency === 'USD') {
        if(usdBtn) usdBtn.classList.add('active');
        if(jodBtn) jodBtn.classList.remove('active');
    } else {
        if(jodBtn) jodBtn.classList.add('active');
        if(usdBtn) usdBtn.classList.remove('active');
    }
    
    getGoldPrice();
}

getGoldPrice();
setInterval(getGoldPrice, 5000);


