// js/screen.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Clock ---
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'م' : 'ص';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        document.getElementById('current-time').innerText = `${hours}:${minutes} ${ampm}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Dynamic Activities Management ---
    const activities = ['activity-breathing', 'activity-stretch', 'activity-icebreaker', 'activity-tip'];
    let currentActivityIndex = 0;

    function switchDynamicActivity() {
        const currentId = activities[currentActivityIndex];
        const nextActivityIndex = (currentActivityIndex + 1) % activities.length;
        const nextId = activities[nextActivityIndex];

        // Hide current
        const currEl = document.getElementById(currentId);
        if(currEl) currEl.style.display = 'none';

        // Show next
        const nextEl = document.getElementById(nextId);
        if(nextEl) nextEl.style.display = 'block';

        currentActivityIndex = nextActivityIndex;

        // Audio Logic
        const breathAudio = document.getElementById('breath-audio');
        if (breathAudio) {
            if (nextId === 'activity-breathing' || nextId === 'activity-stretch') {
                breathAudio.volume = 0.5;
                breathAudio.play().catch(e => console.log('Audio auto-play prevented:', e));
            } else {
                breathAudio.pause();
                breathAudio.currentTime = 0;
            }
        }
    }

    // Switch dynamic activity every 30 seconds
    setInterval(switchDynamicActivity, 30000);

    // Breathing Text Logic
    const breatheText = document.getElementById('breathe-text');
    if (breatheText) {
        setInterval(() => {
            if(breatheText.innerText === 'تنفس') {
                breatheText.innerText = 'احتفظ به';
                setTimeout(() => {
                    breatheText.innerText = 'زفير ببطء';
                }, 2000);
            } else {
                breatheText.innerText = 'تنفس';
            }
        }, 8000); // syncs with css animation 8s
    }

    // --- Firebase Real-time Listeners ---
    const shoutoutList = document.getElementById('shoutout-list');

    function renderShoutout(docId, data) {
        const div = document.createElement('div');
        div.className = 'shoutout-item';
        div.setAttribute('data-id', docId);
        div.innerHTML = `<strong>إلى: ${data.receiver}</strong> <br> <span style="font-size:1.1rem; color:var(--color-text-dark);">${data.message}</span>`;
        if (shoutoutList) {
            shoutoutList.appendChild(div);
        }
    }

    let isFirstLoad = true;

    try {
        if(window.db) {
            // Listen for Interactions (Announcements & Broadcasts)
            window.interactionsRef
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        const docId = change.doc.id;
                        const data = change.doc.data();

                        if (change.type === 'added') {
                            if (data.type === 'gratitude') {
                                renderShoutout(docId, data);
                                // If it's a new interaction (not initial load), trigger big alert
                                if (!isFirstLoad) {
                                    triggerBigAlert({
                                        title: 'إعلان جديد! 📢',
                                        sender: data.sender,
                                        receiver: data.receiver,
                                        message: data.message
                                    });
                                }
                            } else if (data.type === 'broadcast') {
                                if (!isFirstLoad) {
                                    let emoji = '📢';
                                    if(data.msgType === 'alert') emoji = '🚨';
                                    if(data.msgType === 'congrats') emoji = '🎉';
                                    
                                    triggerBigAlert({
                                        title: `${emoji} ${data.title}`,
                                        sender: 'الإدارة',
                                        receiver: 'الجميع',
                                        message: data.message
                                    });
                                }
                            }
                        } else if (change.type === 'removed') {
                            const itemToRemove = document.querySelector(`.shoutout-item[data-id="${docId}"]`);
                            if(itemToRemove) itemToRemove.remove();
                        }
                    });
                    
                    // Auto-scroll to bottom of shoutout list on new additions
                    if (shoutoutList) {
                        shoutoutList.scrollTop = shoutoutList.scrollHeight;
                    }

                    isFirstLoad = false;
                });

            // Listen for Daily Content Updates
            if(window.dailyContentRef) {
                window.dailyContentRef.doc('current').onSnapshot(doc => {
                    if(doc.exists) {
                        const data = doc.data();
                        if(data.welcomeMsg) {
                            const welcomeEl = document.getElementById('welcome-msg');
                            if(welcomeEl) welcomeEl.innerText = data.welcomeMsg;
                        }
                        if(data.dailyQuote) {
                            const quoteEl = document.getElementById('daily-quote');
                            if(quoteEl) quoteEl.innerText = `"${data.dailyQuote}"`;
                        }
                        if(data.puzzleQuestion) {
                            const puzzleEl = document.getElementById('puzzle-text');
                            if(puzzleEl) puzzleEl.innerText = data.puzzleQuestion;
                        }
                        
                        const imgEl = document.getElementById('daily-image');
                        const ytEl = document.getElementById('youtube-player');
                        
                        if(data.youtubeUrl && data.youtubeUrl.trim() !== '') {
                            // Extract video ID and construct embed URL
                            let videoId = '';
                            try {
                                if(data.youtubeUrl.includes('v=')) {
                                    videoId = data.youtubeUrl.split('v=')[1].split('&')[0];
                                } else if(data.youtubeUrl.includes('youtu.be/')) {
                                    videoId = data.youtubeUrl.split('youtu.be/')[1].split('?')[0];
                                } else {
                                    videoId = data.youtubeUrl; // fallback
                                }
                            } catch(e) {}
                            
                            if(imgEl) imgEl.style.display = 'none';
                            if(ytEl) {
                                ytEl.style.display = 'block';
                                ytEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
                            }
                        } else {
                            if(ytEl) {
                                ytEl.style.display = 'none';
                                ytEl.src = '';
                            }
                            if(imgEl) {
                                imgEl.style.display = 'block';
                                if(data.momentImgUrl) {
                                    imgEl.src = data.momentImgUrl;
                                }
                            }
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.log("Firebase listener failed, possibly not configured.", e);
    }

    function triggerBigAlert(data) {
        // Flash screen
        const overlay = document.getElementById('flash-overlay');
        if(overlay) {
            overlay.classList.add('flash-active');
            setTimeout(() => overlay.classList.remove('flash-active'), 2000);
        }

        // Show Modal
        const alertBox = document.getElementById('big-alert');
        if(alertBox) {
            alertBox.querySelector('.alert-title').innerText = data.title || 'إشعار جديد! 🎉';
            
            const bodyContent = `
                من: <span>${data.sender}</span><br>
                إلى: <span>${data.receiver}</span><br>
                "<span>${data.message}</span>"
            `;
            document.getElementById('alert-body').innerHTML = bodyContent;
            
            alertBox.classList.remove('hidden');
            
            // Hide after 10 seconds
            setTimeout(() => {
                alertBox.classList.add('hidden');
            }, 10000);
        }
    }
});
