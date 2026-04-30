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

    // --- Cycle Management ---
    const cycles = ['morning-circle', 'break-circle', 'quiet-circle'];
    let currentCycleIndex = 1; // Start with break circle for demo purposes

    function switchCycle() {
        // Hide all
        cycles.forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        
        // Show next
        currentCycleIndex = (currentCycleIndex + 1) % cycles.length;
        const nextCycleId = cycles[currentCycleIndex];
        document.getElementById(nextCycleId).classList.add('active');

        // Audio Logic & Dynamic Activities
        const breathAudio = document.getElementById('breath-audio');
        
        if (nextCycleId === 'quiet-circle') {
            // Pick a random activity
            const activities = ['activity-breathing', 'activity-stretch', 'activity-icebreaker', 'activity-tip'];
            const randomActivityId = activities[Math.floor(Math.random() * activities.length)];
            
            // Hide all activities
            activities.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.style.display = 'none';
            });
            // Show the selected activity
            const activeActivity = document.getElementById(randomActivityId);
            if(activeActivity) activeActivity.style.display = 'block';

            // Only play music for relaxing activities
            if (breathAudio) {
                if (randomActivityId === 'activity-breathing' || randomActivityId === 'activity-stretch') {
                    breathAudio.volume = 0.5;
                    breathAudio.play().catch(e => console.log('Audio auto-play prevented:', e));
                } else {
                    breathAudio.pause();
                    breathAudio.currentTime = 0;
                }
            }
        } else {
            if (breathAudio) {
                breathAudio.pause();
                breathAudio.currentTime = 0;
            }
        }
    }

    // Switch every 30 seconds for demonstration
    setInterval(switchCycle, 15000); // 15 seconds to see cycles faster in demo

    // Breathing Text Logic for Quiet Circle
    const breatheText = document.getElementById('breathe-text');
    setInterval(() => {
        if(breatheText.innerText === 'تنفس بعمق') {
            breatheText.innerText = 'احتفظ به';
            setTimeout(() => {
                breatheText.innerText = 'زفير ببطء';
            }, 2000);
        } else {
            breatheText.innerText = 'تنفس بعمق';
        }
    }, 8000); // syncs with css animation 8s


    // --- Firebase Real-time Listeners ---
    
    // Dummy Data for Shoutouts if Firebase is not connected
    const dummyShoutouts = [
        { sender: 'أ. خالد', receiver: 'أ. محمد', message: 'شكراً لمساعدتك في شرح درس اليوم!' },
        { sender: 'الإدارة', receiver: 'الجميع', message: 'جهودكم مقدرة، نتمنى لكم يوماً سعيداً.' }
    ];

    const shoutoutList = document.getElementById('shoutout-list');

    function renderShoutout(data) {
        const div = document.createElement('div');
        div.className = 'shoutout-item';
        div.innerHTML = `<strong>من ${data.sender} إلى ${data.receiver}:</strong> <br> "${data.message}"`;
        shoutoutList.appendChild(div);
    }

    // Initial render dummy
    dummyShoutouts.forEach(renderShoutout);

    let isFirstLoad = true;

    try {
        if(window.db) {
            // Listen for Interactions (Gratitude & Broadcasts)
            window.interactionsRef
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            
                            if (data.type === 'gratitude') {
                                renderShoutout(data);
                                // If it's a new interaction (not initial load), trigger big alert
                                if (!isFirstLoad) {
                                    triggerBigAlert({
                                        title: 'رسالة شكر جديدة! 🎉',
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
                        }
                    });
                    isFirstLoad = false;
                });

            // Listen for Daily Content Updates
            if(window.dailyContentRef) {
                window.dailyContentRef.doc('current').onSnapshot(doc => {
                    if(doc.exists) {
                        const data = doc.data();
                        if(data.welcomeMsg) document.getElementById('welcome-msg').innerText = data.welcomeMsg;
                        if(data.dailyQuote) document.getElementById('daily-quote').innerText = `"${data.dailyQuote}"`;
                        if(data.puzzleQuestion) document.getElementById('puzzle-question').innerText = data.puzzleQuestion;
                        if(data.momentImgUrl) {
                            document.getElementById('moment-img').style.backgroundImage = `url('${data.momentImgUrl}')`;
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.log("Firebase listener failed, possibly not configured.", e);
        // Expose function for manual testing
        window.simulateNewGratitude = function(messageText) {
            triggerBigAlert({
                sender: 'أ. سارة',
                receiver: 'أ. هدى',
                message: messageText || 'شكراً على فنجان القهوة الرائع!'
            });
        };
    }

    function triggerBigAlert(data) {
        // Flash screen
        const overlay = document.getElementById('flash-overlay');
        overlay.classList.add('flash-active');
        setTimeout(() => overlay.classList.remove('flash-active'), 2000);

        // Show Modal
        const alertBox = document.getElementById('big-alert');
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
});
