window.addEventListener('DOMContentLoaded',async (event) => {
    await getAndAppendWebinars();
});

async function fetchGet(url, headers = {}, options = {}){
    try {
        const basePath = options.different ? '' : '/webinar';
        url = basePath + url;
        const webitkn = sessionStorage.getItem('webitkn');
        const response = await fetch(url, 
            {headers : {
                contentType: 'application/json',
                "Authorization": webitkn,
                 ...headers
                }
            });
        if (!response.ok && response.status == 401) {
            return location.replace('/');
        }
        const parsedResponse = options.notjson ? response : await response.json();
        !options.notoken && sessionStorage.setItem('webitkn', response.headers.get('Authorization'));
        return parsedResponse;
    } catch (error) {
        throw error;
    }
}

async function fetchPost(url, data , headers = {}, options = {}){
    try {
        const basePath = options.different ? '' : '/webinarn';
        url = basePath + url;
        const response = await fetch(url, 
            {   method: 'POST', 
                body: JSON.stringify(data), 
                headers:{
                    contentType: 'application/json',
                    "Authorization": sessionStorage.getItem('webitkn'), 
                    ...headers}
            });
        if (!response.ok && response.status == 401) {
            return location.replace('/');
        }
        const parsedResponse = options.notjson ? response : await response.json();
        !options.notoken && sessionStorage.setItem('webitkn', response.headers.get('Authorization'));
        return parsedResponse;
    } catch (error) {
        throw error;
    }
}

async function getAndAppendWebinars(){
    try {
    const {webinars} = await fetchGet('/getwebinars');
    makeWebinarCards(webinars);
    attachWebinarFilter();
    } catch (error) {
        console.log(error);
    }
}

function attachWebinarFilter () {
    // Select elements
    const categoryTabs = document.querySelectorAll('.web-category-tab');
    const webinarCards = document.querySelectorAll('.web-webinar-card');
    const emptyMessage = document.querySelector('.web-empty-message');

    // Add click event listeners to category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Update active tab styling
            categoryTabs.forEach(t => t.classList.remove('web-active'));
            this.classList.add('web-active');

            // Get selected category
            const category = this.getAttribute('data-category');
            let visibleCards = 0;

            // Fade out all cards first
            const webinarsGrid = document.querySelector('.web-webinars-grid');
            webinarsGrid.style.opacity = '0';
            webinarsGrid.style.transform = 'translateY(20px)';

            setTimeout(() => {
                // Filter cards based on category
                webinarCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    // Reset animation delays
                    card.style.transitionDelay = '0s';

                    if (category === 'all' || category === cardCategory) {
                        card.style.display = 'flex';
                        card.classList.remove('web-hidden');
                        visibleCards++;
                    } else {
                        card.style.display = 'none';
                        card.classList.add('web-hidden');
                    }
                });

                // Show/hide empty message
                if (visibleCards === 0) {
                    emptyMessage.classList.remove('web-hidden');
                } else {
                    emptyMessage.classList.add('web-hidden');
                }

                // Show grid container first
                webinarsGrid.style.opacity = '1';
                webinarsGrid.style.transform = 'translateY(0)';

                // Then animate cards sequentially
                setTimeout(() => {
                    animateCardsSequentially(webinarCards);
                }, 100);

            }, 300);
        });
    });
}

function animateCardsSequentially(webinarCards) {
    const visibleCards = Array.from(webinarCards).filter(card => !card.classList.contains('web-hidden'));

    visibleCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = `${index * 0.15}s`;

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });
}

function makeWebinarCards(webinarsArray){
    const allWebinarsContainer = document.querySelector('#all-webinars');
    allWebinarsContainer.innerHTML = '';
    let cards = '';
    try {
        if(Array.isArray(webinarsArray) && webinarsArray.length > 0){
                webinarsArray.forEach(webinar => {
                    const {dateString, timezones, agentAction, 
                        certificateDownloaded, giveTestGetCertificateButtonText, 
                        webinarActionButton, webinarStatus, currentStatus} 
                        = getDynamicElements(webinar);

                    cards += `<div class="web-webinar-card" data-category="${currentStatus}" data-id="${webinar.webid}">
                        <div class="web-webinar-image-container">
                            <img src="/webinar/assetts/bali.jpg" alt="France Expert Webinar"
                                class="web-webinar-image">
                            <div class="web-webinar-title-overlay">
                                <div class="web-webinar-prefix">Webinar on</div>
                                <h3 class="web-webinar-title">${webinar.title}</h3>
                            </div>
                            ${webinarStatus}
                        </div>
                        <div class="web-webinar-details">
                            <div class="web-webinar-date">${dateString} at:</div>
                            <div class="web-webinar-times">
                                
                            </div>
                            <div class="web-webinar-actions">
                                ${webinarActionButton}
                                ${giveTestGetCertificateButtonText}
                            </div>
                        </div>
                    </div>`;
            });
            allWebinarsContainer.innerHTML = cards;
        }else{
        }
    } catch (error) {
        console.log(error);
    }
}

function getDynamicElements(webinar){
    const [year, month, day] = webinar.web_date.split('-');
    const webinarDate = new Date(year, month - 1, day);
    const currentStatus = new Date() > webinarDate ? 'past' : 'upcoming';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = webinarDate.toLocaleDateString('en-US', options);
    const timezones = webinar.web_time?.split(',') || [];
    const agentAction = webinar.test_exists ? 
            (webinar.AGENTID != null && webinar.AGENTID != "null" && webinar.AGENTID != "undefined" && webinar.AGENTID != "") ? 
                  webinar.status == "Passed" ? "passed" : "failed" : "failed" : 'empty';
    const certificateDownloaded =  webinar.CERTIFICATE_DOWNLOADED == 1 ? true : false;
    const webinarStatus = getWebinarStatus(webinar, currentStatus);
    const webinarActionButton = getWebinarActionButton(webinar, currentStatus);
    const giveTestGetCertificateButtonText = giveTestGetCertificateButton(webinar, currentStatus);
    return {dateString, timezones, agentAction, certificateDownloaded, giveTestGetCertificateButtonText, webinarActionButton, webinarStatus, currentStatus};
}

function getWebinarStatus(webinar, currentStatus){
    // `<div class="web-webinar-status web-status-ongoing">Ongoing</div>`
    return currentStatus == 'past' ? `<div class="web-webinar-status web-status-completed">Completed</div>` 
        : `<div class="web-webinar-status web-status-upcoming">Upcoming</div>`;
}

function getWebinarActionButton(webinar, currentStatus){
   return currentStatus == 'past' ? 
            `<button class="web-btn web-btn-primary web-tooltip"
                    data-tooltip="Watch the recorded session"
                    onclick="getReplayLink(this, '${webinar.webid}')">
                    <svg class="web-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Get the Replay
                </button>` 
                                    
        : `<button class="web-btn web-btn-primary web-tooltip"
                data-tooltip="Register for this webinar">
                <svg class="web-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Register Now
            </button>`;

}

function giveTestGetCertificateButton(webinar, currentStatus){
    if(webinar.test_exists && currentStatus == 'past'){
        if(webinar.STATUS == 'Passed'){
            return `<button class="web-btn web-btn-secondary web-tooltip"
                onclick="donwloadCertificate(this, '${webinar.country}')" 
                data-tooltip="Download Certificate">
                <svg class="web-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            Download Certificate
        </button>`
        }
        // Else give option of giving test
        return `<button class="web-btn web-btn-secondary web-tooltip"
            data-tooltip="Get your certificate" onclick="location.href='/webinar/test?category=${webinar.country}'">
            <svg class="web-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Get Certificate
        </button>`
    }else {
        return ''
    };
}

async function donwloadCertificate(element, category) {
    try {
        const originalTextSpan = element;
        const originalHTML = originalTextSpan.innerHTML;
        element.classList.add('loading');
       originalTextSpan.textContent = 'Downloading...';
      let certificatebuffer = await fetchGet(`/getcertificate/${category}`, {}, {notjson : true, notoken : true} );
      const blob = await certificatebuffer.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'certificate.png';
      element.classList.remove('loading');
      originalTextSpan.innerHTML = originalHTML;
      link.click();
    } catch (error) {
        console.error("Error downloading certificate:", error);
    }
}

async function getReplayLink(element, webinarid){
    const replayRegistModal = document.getElementById('replay-registration-overlay');
    try {
        replayRegistModal.style.display = 'flex';
    } catch (error) {
        console.error("Replay Registration:", error);
    }
}

function closeReplayRegistrationModal() {
    const replayRegistModal = document.getElementById('replay-registration-overlay');
    replayRegistModal.style.display = 'none';
}
