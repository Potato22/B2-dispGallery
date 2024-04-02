(() => {
    console.log('init')
    let nsfwOff = true;
    async function fetchDisplay() {
        console.log('async fetchDisplay')
        try {
            //call
            console.log('attempting to call')
            const response = await fetch('https://pottob2-dispgallery.pottoart.workers.dev/api/v1/list_all_files');
            if (!response.ok) {
                throw new Error('Something went wrong while trying to fetch files', response.status);
            }
            //await json return
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('*blows up json with mind*', error.message);
            return null;
        }
    }
    fetchDisplay()
        .then(data => {
            if (data) {
                console.log('Fetched files:', data);
                console.log("delivered")
                console.log("filtering")
                //data processing
                const displayImages = [];
                const losslessImages = [];

                data.forEach(item => {
                    if (item.contentType.includes('image/')) {
                        let nameVariable, urlDisplay, dateUploaded, nsfw;

                        if (item.name.includes('display/')) {
                            nameVariable = 'nameLossy';
                            urlDisplay = 'urlLossy';
                            dateUploaded = 'date';
                            displayImages.push({
                                [nameVariable]: item.name.replace(/(?:display|lossless)\//, '').replace('nsfw/', '').replace('sketch/', '').split('.')[0],
                                [urlDisplay]: item.url,
                                [dateUploaded]: item.uploadTime,
                                sketch: item.url.includes('sketch') ? true : null,
                                nsfw: item.url.includes('nsfw') ? true : null
                            });
                        } else if (item.name.includes('lossless/')) {
                            nameVariable = 'nameLossless';
                            losslessImages.push({
                                [nameVariable]: item.name.replace(/(?:display|lossless)\//, '').replace('nsfw/', '').split('.')[0],
                                urlLossless: item.url,
                                date: item.uploadTime
                            });
                        }
                    }
                });

                displayImages.sort((a, b) => new Date(b.date) - new Date(a.date));
                const displayCount = displayImages.slice(0, 10);

                console.log("Display Data:", displayCount);
                console.log("Lossless Data:", losslessImages);

                const latestWorkGrid = document.getElementById('latestWorks');
                const imgDataFragment = document.createDocumentFragment();

                displayCount.forEach(item => {
                    const img = new Image();
                    const losslessLinko = document.createElement('p');
                    img.setAttribute('style', 'position: relative; max-width:100%; overflow: hidden;');
                    img.src = item.urlLossy;
                    img.alt = item.nameLossy; // remove file ext
                    img.dataset.flag = item.nsfw ? 'true' : 'false';
                    img.dataset.sketch = item.sketch ? 'true' : 'false';
                    
                    const matchingLossless = losslessImages.find(x => x.nameLossless === item.nameLossy);
                    if (matchingLossless) {
                        losslessLinko.textContent = 'lossless: ' + matchingLossless.urlLossless;
                        img.dataset.lossless = matchingLossless.urlLossless;
                    } else if (item.sketch) {
                        losslessLinko.textContent = 'Sketch: ' + item.urlLossy;
                    } else {
                        losslessLinko.textContent = 'No lossless version available';
                        img.dataset.lossless = false;
                    }
                    
                    img.dataset.lossless = losslessImages.find(x => x.nameLossless === item.nameLossy) ?
                        losslessImages.find(x => x.nameLossless === item.nameLossy).urlLossless :
                        false;
                    imgDataFragment.append(img);
                    imgDataFragment.append(losslessLinko); // appended the paragraph element
                });

                latestWorkGrid.replaceChildren(imgDataFragment);
            } else {
                alert("Either something went horribly-horribly wrong on Potto's B2 or the bucket is just that empty that nothing gets listed. One is worse than the other. Wondering how on earth did they managed to mess that up? Honestly string theory might just be more comprehensive than their head.");
            }
        })
        .catch(error => {
            console.error('Error during fetch:', error);
        });
})();