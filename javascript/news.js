// let url = "https://gnews.io/api/v4/search?q=XAU&apikey=27cce719ffb889b71fa73a0217674462";

// async function fetchNews() {
//     try {
//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.articles) {
//             displayNews(data.articles);
//         }
//     } catch (error) {
//         console.error("خطأ في جلب الأخبار:", error);
//     }
// }

// function displayNews(articles) {
//     const newsContainer = document.getElementById('news-container'); 
//     if (!newsContainer) return;

//     const html = articles.slice(0, 3).map(article => `
//         <div class="col-md-4 mb-4">
//             <div class="card h-100 border-0 shadow-sm hover-scale" style="border-radius: 15px;">
//                 <img src="${article.image || '../assets/img/default-news.jpg'}" 
//                      class="card-img-top" 
//                      style="height: 180px; object-fit: cover; border-top-left-radius: 15px; border-top-right-radius: 15px;">
//                 <div class="card-body">
//                     <h6 class="fw-bold text-navy">${article.title}</h6>
//                     <p class="small text-muted text-truncate-3">${article.description}</p>
//                     <a href="${article.url}" target="_blank" class="btn btn-link p-0 text-orange fw-bold">Read More</a>
//                 </div>
//             </div>
//         </div>
//     `).join('');

//     newsContainer.innerHTML = html;
// }


// fetchNews();


// setInterval(fetchNews, 3600000);