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
            console.error('Error while fetching files:', error.message);
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
                const pulledData = data.filter(item => item.contentType.includes('image/')).map(item => {
                    let nameVariable, urlVariable, dateUploaded, nsfw;

                    if (item.name.includes('display/')) {
                        nameVariable = 'nameLossy';
                        urlVariable = 'urlLossy';
                        dateUploaded = 'date';
                    } else if (item.name.includes('lossless/')) {
                        nameVariable = 'nameLossless';
                        urlVariable = 'urlLossless';
                    }

                    if (item.url.includes('nsfw')) {
                        nsfw = true;
                    }

                    return {
                        [nameVariable]: item.name.replace(/(?:display|lossless)\//, '').replace('nsfw/', '').split('.')[0],
                        [urlVariable]: item.url,
                        [dateUploaded]: item.uploadTime,
                        [nsfw]: nsfw || null
                    };
                });
                console.log(pulledData);

                pulledData.sort((a, b) => a.dateUploaded - b.dateUploaded);
                const displayCount = pulledData.slice(0, 10);


                const latestWorkGrid = document.getElementById('latestWorks');

                const imgDataFragment = document.createDocumentFragment();

                
                for (const item of displayCount) {
                    if (!item.urlLossless) {
                        console.log(pulledData.nsfw)
                        if (pulledData.nsfw === true) {
                            alert('hi')
                        }
                        const img = new Image();
                        img.setAttribute('style', 'position: relative; max-width:100%; overflow: hidden;');
                        img.setAttribute('lossless', item.urlLossless);
                        img.src = item.urlLossy;
                        img.alt = item.nameLossy; // remove file ext
                        imgDataFragment.append(img);
                    }
                }
                latestWorkGrid.replaceChildren(imgDataFragment);
            } else {
                alert("Either something went horribly-horribly wrong on Potto's B2 or the bucket is just that empty that nothing gets listed. One is worse than the other. Wondering how on earth did they managed to mess that up? Honestly string theory might just be more comprehensive than their head.");
            }
        })
        .catch(error => {
            console.error('Error during fetch:', error);
        });
})();