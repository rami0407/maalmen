// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Logic ---
    const loginOverlay = document.getElementById('login-overlay');
    const dashboardContent = document.getElementById('dashboard-content');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Check if already logged in
    if(sessionStorage.getItem('maalmen_admin_auth') === 'true') {
        loginOverlay.style.display = 'none';
        dashboardContent.style.display = 'block';
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;

        if(user === 'musherfe' && pass === '318212') {
            sessionStorage.setItem('maalmen_admin_auth', 'true');
            loginOverlay.style.display = 'none';
            dashboardContent.style.display = 'block';
        } else {
            loginError.style.display = 'block';
        }
    });

    // --- Dashboard Logic ---
    const syncStatus = document.getElementById('sync-status');
    const contentForm = document.getElementById('daily-content-form');
    const broadcastForm = document.getElementById('broadcast-form');

    // DOM Elements for content form
    const inputWelcome = document.getElementById('db-welcome-msg');
    const inputQuote = document.getElementById('db-daily-quote');
    const inputPuzzle = document.getElementById('db-puzzle-question');
    const inputMomentImg = document.getElementById('db-moment-img');

    let isDbConnected = false;

    // Check Firebase connection and load current data
    try {
        if(window.db && window.dailyContentRef) {
            isDbConnected = true;
            syncStatus.innerText = 'متصل بقاعدة البيانات ✅';
            syncStatus.style.background = 'rgba(46, 139, 87, 0.2)';
            syncStatus.style.color = 'seagreen';

            // Load current content
            window.dailyContentRef.doc('current').get().then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    inputWelcome.value = data.welcomeMsg || '';
                    inputQuote.value = data.dailyQuote || '';
                    inputPuzzle.value = data.puzzleQuestion || '';
                    inputMomentImg.value = data.momentImgUrl || '';
                }
            }).catch(err => {
                console.error("Error loading data:", err);
            });
        }
    } catch(e) {
        syncStatus.innerText = 'غير متصل (محلي فقط) ❌';
        syncStatus.style.background = 'rgba(255, 65, 108, 0.2)';
        syncStatus.style.color = '#ff416c';
    }

    // Handle Daily Content Update
    contentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newData = {
            welcomeMsg: inputWelcome.value,
            dailyQuote: inputQuote.value,
            puzzleQuestion: inputPuzzle.value,
            momentImgUrl: inputMomentImg.value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if(isDbConnected) {
            const btn = contentForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'جاري التحديث...';
            
            window.dailyContentRef.doc('current').set(newData, { merge: true })
                .then(() => {
                    btn.innerText = 'تم التحديث بنجاح! ✅';
                    setTimeout(() => btn.innerText = originalText, 3000);
                })
                .catch(err => {
                    console.error(err);
                    alert('حدث خطأ أثناء التحديث.');
                    btn.innerText = originalText;
                });
        } else {
            alert('قاعدة البيانات غير متصلة. هذه التعديلات لن تظهر في الشاشة.');
        }
    });

    // Handle Broadcast Message
    broadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('bc-title').value;
        const message = document.getElementById('bc-message').value;
        const type = document.getElementById('bc-type').value;

        const broadcastData = {
            type: 'broadcast',
            msgType: type, // info, alert, congrats
            title: title,
            message: message,
            timestamp: new Date().getTime(),
        };

        if(isDbConnected && window.interactionsRef) {
            const btn = broadcastForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'جاري الإرسال...';

            window.interactionsRef.add(broadcastData)
                .then(() => {
                    btn.innerText = 'تم الإرسال بنجاح! 🚀';
                    broadcastForm.reset();
                    setTimeout(() => btn.innerText = originalText, 3000);
                })
                .catch(err => {
                    console.error(err);
                    alert('حدث خطأ أثناء إرسال البث.');
                    btn.innerText = originalText;
                });
        } else {
            alert('قاعدة البيانات غير متصلة.');
        }
    });

    // Handle Gratitude Board (From Admin)
    const gratitudeForm = document.getElementById('dashboard-gratitude-form');
    if (gratitudeForm) {
        gratitudeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const receiver = document.getElementById('db-gratitude-receiver').value;
            const message = document.getElementById('db-gratitude-message').value;

            const gratitudeData = {
                type: 'gratitude',
                sender: 'إدارة المدرسة',
                receiver: receiver,
                message: message,
                timestamp: new Date().getTime(),
            };

            if(isDbConnected && window.interactionsRef) {
                const btn = gratitudeForm.querySelector('button');
                const originalText = btn.innerText;
                btn.innerText = 'جاري الإرسال...';

                window.interactionsRef.add(gratitudeData)
                    .then(() => {
                        btn.innerText = 'تم الإرسال بنجاح! 🌟';
                        gratitudeForm.reset();
                        setTimeout(() => btn.innerText = originalText, 3000);
                    })
                    .catch(err => {
                        console.error(err);
                        alert('حدث خطأ أثناء إرسال بطاقة الشكر.');
                        btn.innerText = originalText;
                    });
            } else {
                alert('قاعدة البيانات غير متصلة.');
            }
        });
    }
});
