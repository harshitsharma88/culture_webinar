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
    } catch (error) {
        console.log(error);
    }
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
                        webinarActionButton, webinarStatus} 
                        = getDynamicElements(webinar);

                    cards += `<div class="web-webinar-card" data-category="upcoming" data-id="${webinar.webid}">
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
                                <button class="web-btn web-btn-primary web-tooltip"
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
                                </button>
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
    return {dateString, timezones, agentAction, certificateDownloaded, giveTestGetCertificateButtonText, webinarActionButton, webinarStatus};
}

function getWebinarStatus(webinar, currentStatus){
    // `<div class="web-webinar-status web-status-ongoing">Ongoing</div>`
    return currentStatus == 'past' ? `<div class="web-webinar-status web-status-completed">Completed</div>` 
        : `<div class="web-webinar-status web-status-upcoming">Upcoming</div>`;
}

function getWebinarActionButton(webinar){

}

function giveTestGetCertificateButton(webinar, currentStatus){
    if(webinar.test_exists && currentStatus == 'past'){
        if(webinar.STATUS == 'Passed'){
            return `<button class="web-btn web-btn-secondary web-tooltip"
                onclick="donwloadCertificate('${webinar.country}')" 
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


async function donwloadCertificate(category) {
    console.log("Downloading certificate for category:", category);
    try {
      let certificatebuffer = await fetchGet(`/getcertificate/${category}`, {}, {notjson : true} );
      const blob = await certificatebuffer.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'certificate.png';
      link.click();
    } catch (error) {
        console.error("Error downloading certificate:", error);
    }
  }
