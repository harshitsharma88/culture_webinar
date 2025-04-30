window.addEventListener('DOMContentLoaded',async (event) => {
    await getAndAppendWebinars();
});


async function fetchGet(url, headers = {}, options = {}){
    const basePath = options.different ? '' : '/webinar';
    url = basePath + url;
    const response = await fetch(url, {contentType: 'application/json', ...headers});
    return await response.json();
}

async function fetchPost(url, data , headers = {}, options = {}){
    const basePath = options.different ? '' : '/webinar';
    url = basePath + url;
    const response = await fetch(url, {method: 'POST', body: JSON.stringify(data), contentType: 'application/json', ...headers});
    return await response.json();
}

async function getAndAppendWebinars(){
    try {
    const {webinars} = await fetchGet('/getwebinars');
    console.log(webinars);
    const list = document.getElementById('webinar-list');
    webinars.forEach(w => {
        const div = document.createElement('div');
        div.className = 'webinar-card';
        div.innerHTML = `
          <h3>${w.Webcountry}</h3>
          <p>${w.Webcountry}</p>
          <p>${new Date(w.WebDate).toLocaleString()}</p>
          ${w.status === 'passed' ? '<a href="/webinar/api/download?webinar=' + w.id + '">Download Certificate</a>' :
            w.status === 'failed' ? '<a href="/webinar/test?id=' + w.id + '">Retry Test</a>' :
            '<a href="/webinar/test?id=' + w.id + '">Start Test</a>'}
        `;
        list.appendChild(div);
      });
    } catch (error) {
        console.log(error);
    }
}
