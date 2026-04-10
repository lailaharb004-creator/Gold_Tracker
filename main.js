let labels = [];
let prices = [];
let currentCurrency = 'USD';
let previousValues = null;
let currentPeriod = 'live';

const ctx = document.getElementById('goldChart').getContext('2d');

const goldChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Gold Price (USD)',
            data: prices,
            borderColor: '#f3c623',
            borderWidth: 2,
            backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx: c, chartArea } = chart;
                if (!chartArea) return 'transparent';
                const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(243,198,35,0.22)');
                gradient.addColorStop(1, 'rgba(243,198,35,0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#f3c623',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#10375c',
                titleColor: 'rgba(255,255,255,0.6)',
                bodyColor: '#f3c623',
                bodyFont: { weight: '600', size: 14 },
                titleFont: { size: 12 },
                padding: 10,
                borderColor: 'rgba(243,198,35,0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (item) => `$${item.parsed.y.toLocaleString(undefined, {minimumFractionDigits:2})}`,
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: 'rgba(248,250,252,0.4)',
                    font: { size: 11, family: 'Inter, sans-serif' },
                    maxTicksLimit: 8,
                    maxRotation: 0,
                }
            },
            y: {
                beginAtZero: false,
                position: 'right',
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                border: { display: false, dash: [4, 4] },
                ticks: {
                    color: 'rgba(248,250,252,0.4)',
                    font: { size: 11, family: 'Inter, sans-serif' },
                    maxTicksLimit: 6,
                    callback: (val) => `$${val.toLocaleString()}`,
                }
            }
        }
    }
});


function setChartPeriod(period) {
    currentPeriod = period;

    document.querySelectorAll('.chart-btn').forEach(btn => {
        const label = period === 'live' ? 'Live' : period;
        btn.classList.toggle('active', btn.textContent.trim() === label);
    });

    if (period === 'live') {
        goldChart.data.labels = labels;
        goldChart.data.datasets[0].data = prices;
        goldChart.update();
        return;
    }

    fetchHistoricalData(period);
}


async function fetchHistoricalData(period) {
    const loadingEl = document.getElementById('chart-loading');
    if (loadingEl) loadingEl.classList.add('visible');

    const today = new Date();
    const dates = generateDateRange(period, today);

    try {
        const results = await Promise.all(
            dates.map(async (date) => {
                const dateStr = formatDate(date);
                try {
                    const res = await fetch(`https://api.gold-api.com/price/XAU/history?date=${dateStr}`);
                    const data = await res.json();
                    return { date: dateStr, price: data.price ?? null };
                } catch {
                    return { date: dateStr, price: null };
                }
            })
        );

        const valid = results.filter(r => r.price != null && !isNaN(r.price));
        const histLabels = valid.map(r => formatLabel(r.date, period));
        const histPrices = valid.map(r => parseFloat(r.price));

        goldChart.data.labels = histLabels;
        goldChart.data.datasets[0].data = histPrices;
        goldChart.update();

    } catch (err) {
        console.error('Historical data fetch failed:', err);
    } finally {
        if (loadingEl) loadingEl.classList.remove('visible');
    }
}

function generateDateRange(period, endDate) {
    const days = period === '1D' ? 1 : period === '1W' ? 7 : 30;
    const result = [];
    for (let i = days; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        result.push(d);
    }
    return result;
}

function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatLabel(dateStr, period) {
    const d = new Date(dateStr + 'T00:00:00');
    if (period === '1W') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


function buildChangeIndicator(current, previous) {
    if (previous == null) return '';
    const diff = current - previous;
    const pct = ((diff / previous) * 100).toFixed(2);
    if (diff > 0) return `<span class="price-change up">▲ ${pct}%</span>`;
    if (diff < 0) return `<span class="price-change down">▼ ${Math.abs(pct)}%</span>`;
    return `<span class="price-change neutral">— 0.00%</span>`;
}

function updateWithIndicator(valueId, indicatorId, newVal, prevVal) {
    const el = document.getElementById(valueId);
    const ind = document.getElementById(indicatorId);
    if (el) {
        el.classList.remove('price-flash');
        void el.offsetWidth;
        el.textContent = newVal;
        if (prevVal !== null) el.classList.add('price-flash');
    }
    if (ind) ind.innerHTML = buildChangeIndicator(parseFloat(newVal), prevVal);
}


function Calculate_Gold_Values(priceUSD) {
    const gram24 = priceUSD / 31.1035;
    const gram22 = gram24 * (22 / 24);
    const gram21 = gram24 * (21 / 24);
    const gram18 = gram24 * (18 / 24);
    return {
        ounce:   priceUSD,
        gram24:  gram24,
        gram21:  gram21,
        gram18:  gram18,
        rashadi: gram22 * 7.20,
        english: gram22 * 8.00,
        bar10g:  gram24 * 10,
    };
}

function getUSDToJOD(callback) {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
        .then(r => r.json())
        .then(data => callback(data.rates.JOD))
        .catch(err => { console.error("Currency API failed", err); callback(null); });
}

function getGoldPrice() {
    fetch("https://api.gold-api.com/price/XAU")
        .then(r => r.json())
        .then(data => {
            const priceUSD = data.price;
            const time = new Date().toLocaleTimeString();
            const baseValues = Calculate_Gold_Values(priceUSD);

            getUSDToJOD(function (usdToJod) {
                const rate = (currentCurrency === 'JOD' && usdToJod) ? usdToJod : 1;

                const display = {
                    ounce:   (baseValues.ounce   * rate).toFixed(2),
                    g24:     (baseValues.gram24  * rate).toFixed(2),
                    g21:     (baseValues.gram21  * rate).toFixed(2),
                    g18:     (baseValues.gram18  * rate).toFixed(2),
                    rashadi: (baseValues.rashadi * rate).toFixed(2),
                    english: (baseValues.english * rate).toFixed(2),
                    bar10g:  (baseValues.bar10g  * rate).toFixed(2),
                };

                const prev = previousValues;

                const tickerMap = {
                    'tick-usd': display.ounce, 'tick-24k': display.g24,
                    'tick-21k': display.g21,   'tick-18k': display.g18,
                    'tick-rashadi': display.rashadi, 'tick-english': display.english,
                    'tick-bar': display.bar10g
                };
                Object.entries(tickerMap).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = val;
                });

                const tickChange = document.getElementById('tick-usd-change');
                if (tickChange) tickChange.innerHTML = buildChangeIndicator(
                    parseFloat(display.ounce), prev ? parseFloat(prev.ounce) : null
                );

                updateWithIndicator('ounce-price',   'ind-ounce',   display.ounce,   prev ? parseFloat(prev.ounce)   : null);
                updateWithIndicator('gram-24k',      'ind-24k',     display.g24,     prev ? parseFloat(prev.g24)     : null);
                updateWithIndicator('gram-21k',      'ind-21k',     display.g21,     prev ? parseFloat(prev.g21)     : null);
                updateWithIndicator('gram-18k',      'ind-18k',     display.g18,     prev ? parseFloat(prev.g18)     : null);
                updateWithIndicator('rashadi-price', 'ind-rashadi', display.rashadi, prev ? parseFloat(prev.rashadi) : null);
                updateWithIndicator('english-price', 'ind-english', display.english, prev ? parseFloat(prev.english) : null);
                updateWithIndicator('bar-price',     'ind-bar',     display.bar10g,  prev ? parseFloat(prev.bar10g)  : null);

                if (currentPeriod === 'live') {
                    labels.push(time);
                    prices.push(priceUSD);
                    if (labels.length > 100) { labels.shift(); prices.shift(); }
                    goldChart.update();
                }

                previousValues = { ...display };
            });
        })
        .catch(err => console.error("Gold API failed", err));
}


function toggleCurrency(currency) {
    currentCurrency = currency;
    previousValues = null;

    document.querySelector('button[onclick="toggleCurrency(\'USD\')"]')?.classList.toggle('active', currency === 'USD');
    document.querySelector('button[onclick="toggleCurrency(\'JOD\')"]')?.classList.toggle('active', currency === 'JOD');

    getGoldPrice();
}

getGoldPrice();
setInterval(getGoldPrice, 5000);

const button = document.getElementById("myButton");
if (button) {
    button.addEventListener("click", function (e) {
        if (!isLogin()) {
            e.preventDefault();
            Swal.fire({
                title: "Access Denied",
                text: "You should Login first 🔒",
                icon: "error",
                timer: 2000,
                showConfirmButton: false,
                willClose: () => { window.location.href = "/pages/login.html"; },
            });
        }
    });
}

const myAssets = document.getElementById("assets");
const loginSignupGroup = document.getElementById("btn-log-sing");
const navContainer = document.querySelector(".navbar-collapse");

if (!isLogin()) {
    if (myAssets) myAssets.style.display = "none";
} else {
    if (loginSignupGroup) loginSignupGroup.style.display = "none";
    if (navContainer) {
        navContainer.insertAdjacentHTML("beforeend", `
            <div id="btn-logout" class="d-flex align-items-center gap-2">
                <a href="#" class="btn btn-register d-flex align-items-center gap-2" onclick="logOut()">
                    <i class="fa-solid fa-right-from-bracket fs-4"></i> Log Out
                </a>
            </div>`);
    }
}
