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
        document.getElementById(cycles[currentCycleIndex]).classList.add('active');
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
            window.interactionsRef
                .where('type', '==', 'gratitude')
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            renderShoutout(data);
                            
                            // If it's a new interaction (not initial load), trigger big alert
                            if (!isFirstLoad) {
                                triggerBigAlert(data);
                            }
                        }
                    });
                    isFirstLoad = false;
                });
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
        document.getElementById('alert-sender').innerText = data.sender;
        document.getElementById('alert-receiver').innerText = data.receiver;
        document.getElementById('alert-message').innerText = data.message;
        
        alertBox.classList.remove('hidden');
        
        // Hide after 10 seconds
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 10000);
    }
});
