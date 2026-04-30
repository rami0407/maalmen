// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // Current user info (mocked)
    const currentUser = {
        name: 'أ. أحمد',
        specialization: 'رياضيات'
    };

    // --- Mood Input Logic ---
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            moodBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const selectedMood = btn.getAttribute('data-mood');
            
            // Save mood to Firebase
            // Using a dummy save for now if DB isn't fully configured
            try {
                if(window.db) {
                    window.usersRef.doc('user_ahmed').set({
                        mood: selectedMood,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            } catch (e) {
                console.log("Database not connected yet.");
            }
            
            // Provide visual feedback
            const emoji = btn.querySelector('.emoji').innerText;
            showToast(`تم تسجيل حالتك المزاجية ${emoji}`);
        });
    });


    // --- Creativity Forum Logic ---
    const creativityForm = document.getElementById('creativity-form');
    creativityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const story = document.getElementById('creativity-story').value;
        // Handle file upload here (mocking for now)
        
        const interactionData = {
            type: 'creativity',
            sender: currentUser.name,
            story: story,
            timestamp: new Date().getTime(),
        };

        try {
            if(window.db) {
                window.interactionsRef.add(interactionData);
            }
        } catch (e) {}

        creativityForm.reset();
        showToast('تمت المشاركة في منتدى الإبداع! 🎨');
    });

    // --- Smart Notifications (Real Schedule System) ---
    const schedule = [
        { name: "افتتاحية اليوم", start: "08:00", end: "08:10", type: "opening" },
        { name: "الحصة الأولى", start: "08:10", end: "08:55", type: "period" },
        { name: "الحصة الثانية", start: "09:00", end: "09:45", type: "period" },
        { name: "الحصة الثالثة", start: "09:50", end: "10:35", type: "period" },
        { name: "الفرصة", start: "10:35", end: "11:00", type: "break" },
        { name: "الحصة الرابعة", start: "11:05", end: "11:50", type: "period" },
        { name: "الحصة الخامسة", start: "11:55", end: "12:40", type: "period" },
        { name: "الحصة السادسة", start: "12:45", end: "13:30", type: "period" },
        { name: "الحصة السابعة", start: "13:30", end: "14:15", type: "period" }
    ];

    function showNotification(message, duration = 10000) {
        const notifArea = document.getElementById('notification-area');
        const notifText = document.getElementById('notification-text');
        
        notifText.innerText = message;
        notifArea.classList.remove('hidden');
        
        setTimeout(() => {
            notifArea.classList.add('hidden');
        }, duration);
    }

    // Helper: Convert "HH:MM" to minutes since midnight
    function timeToMins(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    // Motivation Bank (بنك التحفيز)
    const motivationBank = [
        "استعد لتلهم طلابك! 🚀",
        "طاقتك ستغير حياة طلابك اليوم! 🌟",
        "ابتسامتك هي مفتاح نجاح هذه الحصة! 😊",
        "أنت تصنع المستقبل الآن! 💡",
        "دقائق وتبدأ رحلة إبداع جديدة في صفك! 🎨",
        "كل معلومة تقدمها هي بذرة لنجاح طالب! 🌱"
    ];

    function getRandomMotivation() {
        const randomIndex = Math.floor(Math.random() * motivationBank.length);
        return motivationBank[randomIndex];
    }

    let lastNotifiedTime = null;

    function checkSchedule() {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        
        if (lastNotifiedTime === currentMins) return;

        schedule.forEach(item => {
            const startMins = timeToMins(item.start);
            const endMins = timeToMins(item.end);

            // 1. T-1 Notification (1 min before period)
            if (item.type === 'period' && currentMins === startMins - 1) {
                const motivation = getRandomMotivation();
                showNotification(`تذكير: باقي دقيقة واحدة على ${item.name}.. ${motivation}`, 15000);
                lastNotifiedTime = currentMins;
            }

            // 2. Morning Opening
            if (item.type === 'opening' && currentMins === startMins) {
                showNotification("صباح الخير! حكمة ملهمة: 'المعلم الناجح هو أهم أعمدة بناء التعليم الناجح.' أهلاً بك في بيتك الثاني ☀️", 20000);
                lastNotifiedTime = currentMins;
            }
            
            // 3. End of the day
            if (item.name === 'الحصة السابعة' && currentMins === endMins) {
                showNotification("أنجزت المهمة ببراعة اليوم.. حان وقت راحتك! شكراً لجهودك 🙏", 20000);
                lastNotifiedTime = currentMins;
            }
        });
    }

    // Check immediately, then every 30 seconds
    checkSchedule();
    setInterval(checkSchedule, 30000);

    // --- Toast Utility ---
    function showToast(msg) {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'var(--color-text-dark)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '30px';
        toast.style.boxShadow = 'var(--box-shadow)';
        toast.style.zIndex = '1000';
        toast.innerText = msg;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // --- Listen for Broadcast Messages ---
    let isAppFirstLoad = true;
    try {
        if(window.db && window.interactionsRef) {
            window.interactionsRef
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            if (data.type === 'broadcast' && !isAppFirstLoad) {
                                let emoji = '📢';
                                if(data.msgType === 'alert') emoji = '🚨';
                                if(data.msgType === 'congrats') emoji = '🎉';
                                
                                showNotification(`${emoji} ${data.title}: ${data.message}`, 15000);
                            }
                        }
                    });
                    isAppFirstLoad = false;
                });
        }
    } catch(e) {
        console.log("Could not listen to broadcasts.");
    }
});
