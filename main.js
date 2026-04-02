// main.js

let labels = [];
let prices = [];
let currentCurrency = 'USD';
let previousValues = null; // Store previous fetch values for comparison

const ctx = document.getElementById('goldChart').getContext('2d');
const goldChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Gold Price (USD)',
            data: prices,
            borderWidth: 3,
            borderColor: 'gold',
            backgroundColor: 'rgba(255,215,0,0.15)',
            tension: 0.4,
            pointRadius: 3,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: false }
        }
    }
});

// Helper: Build change indicator HTML (arrow + percentage)
function buildChangeIndicator(current, previous) {
    if (previous == null) return '';
    const diff = current - previous;
    const pct = ((diff / previous) * 100).toFixed(2);
    if (diff > 0) {
        return `<span class="price-change up">▲ ${pct}%</span>`;
    } else if (diff < 0) {
        return `<span class="price-change down">▼ ${Math.abs(pct)}%</span>`;
    } else {
        return `<span class="price-change neutral">— 0.00%</span>`;
    }
}

// Helper: Set text + change indicator on an element pair
function updateWithIndicator(valueId, indicatorId, newVal, prevVal) {
    const el = document.getElementById(valueId);
    const ind = document.getElementById(indicatorId);
    if (el) {
        // Flash animation on update
        el.classList.remove('price-flash');
        void el.offsetWidth; // reflow to restart animation
        el.textContent = newVal;
        if (prevVal !== null) el.classList.add('price-flash');
    }
    if (ind) ind.innerHTML = buildChangeIndicator(parseFloat(newVal), prevVal);
}

// Calculate gold values from USD ounce price
function Calculate_Gold_Values(priceUSD) {
    const gram24 = priceUSD / 31.1035;
    const gram22 = gram24 * (22 / 24);
    const gram21 = gram24 * (21 / 24);
    const gram18 = gram24 * (18 / 24);

    return {
        ounce: priceUSD,
        gram24: gram24,
        gram21: gram21,
        gram18: gram18,
        rashadi: gram22 * 7.20,
        english: gram22 * 8.00
    };
}

// Fetch USD → JOD exchange rate
function getUSDToJOD(callback) {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
    .then(response => response.json())
    .then(data => { callback(data.rates.JOD); })
    .catch(error => { console.error("Currency API failed", error); callback(null); });
}

// Main fetch + update function
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
                ounce:   (baseValues.ounce   * rate).toFixed(2),
                g24:     (baseValues.gram24  * rate).toFixed(2),
                g21:     (baseValues.gram21  * rate).toFixed(2),
                g18:     (baseValues.gram18  * rate).toFixed(2),
                rashadi: (baseValues.rashadi * rate).toFixed(2),
                english: (baseValues.english * rate).toFixed(2)
            };

            // Previous values for comparison
            const prev = previousValues;

            // --- Ticker bar ---
            if (document.getElementById('tick-usd')) document.getElementById('tick-usd').textContent = display.ounce;
            if (document.getElementById('tick-24k')) document.getElementById('tick-24k').textContent = display.g24;
            if (document.getElementById('tick-21k')) document.getElementById('tick-21k').textContent = display.g21;
            if (document.getElementById('tick-18k')) document.getElementById('tick-18k').textContent = display.g18;
            if (document.getElementById('tick-rashadi')) document.getElementById('tick-rashadi').textContent = display.rashadi;
            if (document.getElementById('tick-english')) document.getElementById('tick-english').textContent = display.english;

            // Ticker change arrow (ounce only)
            if (document.getElementById('tick-usd-change')) {
                document.getElementById('tick-usd-change').innerHTML = buildChangeIndicator(
                    parseFloat(display.ounce),
                    prev ? parseFloat(prev.ounce) : null
                );
            }

            // --- Main price cards with indicators ---
            updateWithIndicator('ounce-price',   'ind-ounce',   display.ounce,   prev ? parseFloat(prev.ounce)   : null);
            updateWithIndicator('gram-24k',      'ind-24k',     display.g24,     prev ? parseFloat(prev.g24)     : null);
            updateWithIndicator('gram-21k',      'ind-21k',     display.g21,     prev ? parseFloat(prev.g21)     : null);
            updateWithIndicator('gram-18k',      'ind-18k',     display.g18,     prev ? parseFloat(prev.g18)     : null);
            updateWithIndicator('rashadi-price', 'ind-rashadi', display.rashadi, prev ? parseFloat(prev.rashadi) : null);
            updateWithIndicator('english-price', 'ind-english', display.english, prev ? parseFloat(prev.english) : null);

            // --- Chart (always USD) ---
            labels.push(time);
            prices.push(priceUSD);
            if (labels.length > 100) { labels.shift(); prices.shift(); }
            goldChart.update();

            // Save current as previous
            previousValues = { ...display };
        });
    })
    .catch(error => console.error("Gold API failed", error));
}

// Currency toggle
function toggleCurrency(currency) {
    currentCurrency = currency;
    previousValues = null; // Reset comparison when switching currency

    const usdBtn = document.querySelector('button[onclick="toggleCurrency(\'USD\')"]');
    const jodBtn = document.querySelector('button[onclick="toggleCurrency(\'JOD\')"]');

    if (currency === 'USD') {
        if (usdBtn) usdBtn.classList.add('active');
        if (jodBtn) jodBtn.classList.remove('active');
    } else {
        if (jodBtn) jodBtn.classList.add('active');
        if (usdBtn) usdBtn.classList.remove('active');
    }

    getGoldPrice();
}

// Start
getGoldPrice();
setInterval(getGoldPrice, 5000);
