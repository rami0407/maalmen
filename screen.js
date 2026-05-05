// js/screen.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Clock & Date ---
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const gregorianFormatter = new Intl.DateTimeFormat('ar-SA', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'م' : 'ص';

        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        document.getElementById('current-time').innerText = `${hours}:${minutes} ${ampm}`;
    }

    function updateDate() {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        if (!dateEl) return;
        try {
            const gregorian = gregorianFormatter.format(now);
            const hijri = hijriFormatter.format(now);
            dateEl.innerHTML = `${gregorian}<br><span style="font-size:0.8em;opacity:0.8;">${hijri}</span>`;
        } catch(e) {
            dateEl.innerText = now.toLocaleDateString('ar-SA');
        }
    }

    setInterval(updateClock, 1000);
    updateClock();
    updateDate();
    setInterval(updateDate, 60000);

    // --- 30 Dynamic Activities ---
    const ACTIVITIES = [
        // تمارين التنفس (3)
        { type:'breathing', icon:'🌬️', title:'تنفس 4-7-8',        desc:'استنشق 4 ثوانٍ ← احتفظ بالهواء 7 ثوانٍ ← أزفر ببطء 8 ثوانٍ', bg:'#b2dfdb' },
        { type:'breathing', icon:'🟦',  title:'التنفس المربع',      desc:'استنشق 4 ← احتفظ 4 ← أزفر 4 ← انتظر 4 ← كرر 4 مرات',         bg:'#b3e5fc' },
        { type:'breathing', icon:'🌊',  title:'تنفس البطن',         desc:'ضع يدك على بطنك، استنشق حتى ترتفع يدك... ثم أزفر ببطء.',       bg:'#c8e6c9' },
        // حركة وتمدد (6)
        { type:'stretch',   icon:'🧘‍♀️', title:'تمدد الكتفين',      desc:'حرّك كتفيك دائرياً للخلف 5 مرات، ثم للأمام 5 مرات.',          bg:'#fff9c4' },
        { type:'stretch',   icon:'🙆',  title:'تمدد الرقبة',        desc:'أمِل رأسك بلطف نحو الكتف الأيمن 15 ثانية، ثم الأيسر 15 ثانية.', bg:'#ffe0b2' },
        { type:'stretch',   icon:'🙌',  title:'رفع الذراعين',       desc:'ارفع ذراعيك فوق رأسك وتمدد للأعلى بعمق... ثم للجانبين.',      bg:'#f3e5f5' },
        { type:'stretch',   icon:'✋',  title:'تحريك المعصمين',     desc:'دوّر معصميك 10 مرات في كل اتجاه لتخفيف الإجهاد.',              bg:'#e0f7fa' },
        { type:'stretch',   icon:'🚶',  title:'قف وتحرك!',          desc:'قم من كرسيك 30 ثانية — خطوات قليلة تُحسّن تركيزك بشكل واضح.',  bg:'#e8f5e9' },
        { type:'stretch',   icon:'👁️', title:'استرخاء العينين',    desc:'انظر لشيء بعيد 20 ثانية. (قاعدة 20-20-20 لراحة العين)',         bg:'#fce4ec' },
        // أسئلة كسر الجليد (7)
        { type:'icebreaker', icon:'☕', title:'سؤال للقهوة',        desc:'لو كان بإمكانك تعليم مادة مختلفة ليوم واحد، ماذا ستختار؟',    bg:'#fff8e1' },
        { type:'icebreaker', icon:'🤔', title:'سؤال للتأمل',        desc:'ما أغرب سؤال سألك إياه طالب وأربكك تماماً؟',                   bg:'#e8eaf6' },
        { type:'icebreaker', icon:'🏆', title:'لحظة فخر',           desc:'ما هي اللحظة التي جعلتك أكثر فخراً بمهنتك هذا الأسبوع؟',      bg:'#fff3e0' },
        { type:'icebreaker', icon:'⏪', title:'لو عدت بالزمن',      desc:'لو عدت لسنتك الأولى في التعليم، ما النصيحة التي ستعطيها لنفسك؟', bg:'#e0f2f1' },
        { type:'icebreaker', icon:'📚', title:'كتاب غيّرك',          desc:'ما هو كتاب أو مقال غيّر طريقة تفكيرك في التعليم؟',             bg:'#f9fbe7' },
        { type:'icebreaker', icon:'🎯', title:'هدف هذا العام',       desc:'ما الشيء الواحد الذي تتمنى أن يتذكره طلابك منك بعد 10 سنوات؟', bg:'#fbe9e7' },
        { type:'icebreaker', icon:'🌟', title:'معلم أثّر فيك',       desc:'من هو المعلم الذي أثّر فيك أكثر في حياتك ولماذا؟',             bg:'#e3f2fd' },
        // ومضات تربوية (7)
        { type:'tip', icon:'💡', title:'قاعدة الـ 3 ثوانٍ',        desc:'انتظر 3 ثوانٍ صامتاً بعد طرح السؤال — يرفع مشاركة الطلاب بشكل ملحوظ.',  bg:'#f1f8e9' },
        { type:'tip', icon:'🔄', title:'التعلم بالتعليم',           desc:'اطلب من طالب شرح مفهوم لزملائه — يتعلم المُعلِّم أكثر من المُتعلِّم.',   bg:'#e8f5e9' },
        { type:'tip', icon:'⏱️', title:'قاعدة 10-2',               desc:'بعد كل 10 دقائق تعليم، أعطِ دقيقتين للمراجعة الذاتية — يُرسّخ الحفظ.', bg:'#e3f2fd' },
        { type:'tip', icon:'❓', title:'الخطأ فرصة',               desc:'حين يخطئ طالب، اسأله: "لماذا اخترت هذه الإجابة؟" — يفتح تفكيراً عميقاً.', bg:'#fce4ec' },
        { type:'tip', icon:'🎙️', title:'انهِ بسؤال مفتوح',        desc:'أنهِ كل حصة بسؤال يحفّز الطلاب على التفكير خارج الفصل.',                bg:'#ede7f6' },
        { type:'tip', icon:'👤', title:'استخدم الأسماء',            desc:'ناد الطلاب بأسمائهم عند طرح الأسئلة — يرفع الانتباه ويُشعرهم بالتقدير.',  bg:'#fff8e1' },
        { type:'tip', icon:'🎨', title:'التعلم البصري',             desc:'ارسم مخططاً أو خريطة ذهنية — يُساعد 65٪ من المتعلمين الذين يتعلمون بصرياً.', bg:'#e0f7fa' },
        // ألغاز سريعة (4)
        { type:'puzzle', icon:'🧩', title:'لغز سريع',              desc:'ما الشيء الذي كلما أخذت منه كَبُر؟ 🤔\n(الجواب: الحفرة)',            bg:'#fff9c4' },
        { type:'puzzle', icon:'🔍', title:'لغز سريع',              desc:'عندي رأس بلا عينين وذيل بلا رجلين — ما أنا؟\n(الجواب: العملة المعدنية)', bg:'#e8eaf6' },
        { type:'puzzle', icon:'🎭', title:'لغز سريع',              desc:'ما الذي يتكلم بلا فم ويسمع بلا أذن؟\n(الجواب: الصدى)',              bg:'#fce4ec' },
        { type:'puzzle', icon:'🌀', title:'لغز سريع',              desc:'يُرى ولا يُمسك، ويتبعك أينما ذهبت — ما هو؟\n(الجواب: ظلّك)',        bg:'#e0f2f1' },
        // لحظات إيجابية (3)
        { type:'positive', icon:'💚', title:'لحظة امتنان',          desc:'فكّر في شخص أضاف قيمة لحياتك اليوم... وابتسم له في قلبك.',        bg:'#e8f5e9' },
        { type:'positive', icon:'✨', title:'أنت تصنع فارقاً',      desc:'كل معلومة تقدّمها اليوم هي بذرة لنجاح طالب ربما لم يُولد بعد.',   bg:'#fff3e0' },
        { type:'positive', icon:'🌅', title:'شكر الصباح',           desc:'فكّر في شيء واحد تشكر عليه هذا الصباح... دعه يملأ قلبك بالطاقة.', bg:'#e3f2fd' },
    ];

    // Shuffle once at load so order is different each session
    for (let i = ACTIVITIES.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ACTIVITIES[i], ACTIVITIES[j]] = [ACTIVITIES[j], ACTIVITIES[i]];
    }

    let breathingPhaseInterval = null;
    let currentActivityIdx = 0;

    const ACTIVITY_TYPE_LABELS = {
        breathing: 'تمرين التنفس 🌬️',
        stretch:   'حركة ونشاط 🤸',
        icebreaker:'سؤال اليوم ☕',
        tip:       'ومضة تربوية 💡',
        puzzle:    'لغز سريع 🧩',
        positive:  'لحظة إيجابية 💚',
    };

    function renderActivity(activity) {
        const container = document.getElementById('dynamic-activity-container');
        const titleEl = document.getElementById('activity-widget-title');
        if (!container) return;

        if (titleEl) titleEl.innerText = ACTIVITY_TYPE_LABELS[activity.type] || 'تجديد النشاط 🔄';

        if (breathingPhaseInterval) { clearInterval(breathingPhaseInterval); breathingPhaseInterval = null; }

        if (activity.type === 'breathing') {
            container.innerHTML = `
                <div style="width:100%;height:100%;border-radius:1.5vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh;
                     background:url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600') center/cover no-repeat;">
                    <div style="width:15vh;height:15vh;border-radius:50%;background:rgba(255,255,255,0.3);backdrop-filter:blur(5px);
                                display:flex;align-items:center;justify-content:center;animation:breathe 8s infinite ease-in-out;">
                        <span id="breathe-text" style="font-size:1.5rem;color:white;font-weight:bold;text-align:center;padding:0 1vw;">تنفس...</span>
                    </div>
                    <div style="background:rgba(0,0,0,0.45);color:white;padding:1vh 2vw;border-radius:2vh;font-size:1.15rem;text-align:center;max-width:85%;line-height:1.6;">
                        ${activity.desc}
                    </div>
                </div>`;
            // Cycle breathing text phases
            const phases = ['تنفس...', 'احتفظ به', 'زفير ببطء'];
            let phase = 0;
            breathingPhaseInterval = setInterval(() => {
                phase = (phase + 1) % phases.length;
                const el = document.getElementById('breathe-text');
                if (el) el.innerText = phases[phase]; else clearInterval(breathingPhaseInterval);
            }, 8000 / phases.length);
        } else {
            const descHtml = activity.desc.replace(/\n/g, '<br>');
            container.innerHTML = `
                <div style="width:100%;height:100%;border-radius:1.5vh;background:${activity.bg};
                            display:flex;flex-direction:column;align-items:center;justify-content:center;
                            gap:1.5vh;padding:2vh 2vw;box-sizing:border-box;text-align:center;">
                    <span style="font-size:4rem;line-height:1;">${activity.icon}</span>
                    <h3 style="font-size:1.8rem;color:var(--color-emerald-dark);margin:0;font-weight:800;">${activity.title}</h3>
                    <p style="font-size:1.35rem;line-height:1.7;margin:0;color:var(--color-text-dark);">${descHtml}</p>
                </div>`;
        }
    }

    function nextActivity() {
        currentActivityIdx = (currentActivityIdx + 1) % ACTIVITIES.length;
        renderActivity(ACTIVITIES[currentActivityIdx]);
    }

    // Render first activity immediately, then rotate every 5 minutes
    renderActivity(ACTIVITIES[0]);
    setInterval(nextActivity, 5 * 60 * 1000);

    // --- Seamless infinite scroll for announcements ---
    // Clones all items so there's always content to scroll,
    // even if only 1-2 announcements exist.
    const shoutoutList = document.getElementById('shoutout-list');

    let isCloning = false;
    let cloneTimer = null;
    let scrollPos = 0;

    function refreshClones() {
        if (isCloning) return;
        isCloning = true;
        shoutoutList.querySelectorAll('.scroll-clone').forEach(c => c.remove());
        const originals = Array.from(shoutoutList.querySelectorAll('.shoutout-item:not(.scroll-clone)'));
        originals.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('scroll-clone');
            shoutoutList.appendChild(clone);
        });
        scrollPos = 0;
        shoutoutList.scrollTop = 0;
        isCloning = false;
    }

    // Re-clone whenever Firebase adds/removes real items
    const listObserver = new MutationObserver(mutations => {
        if (isCloning) return;
        const realChange = mutations.some(m =>
            [...m.addedNodes, ...m.removedNodes].some(n =>
                n.nodeType === 1 && !n.classList.contains('scroll-clone')
            )
        );
        if (realChange) {
            clearTimeout(cloneTimer);
            cloneTimer = setTimeout(refreshClones, 300);
        }
    });
    if (shoutoutList) listObserver.observe(shoutoutList, { childList: true });

    (function scrollLoop() {
        requestAnimationFrame(scrollLoop);
        if (!shoutoutList) return;

        // Ensure clones exist before scrolling
        if (shoutoutList.children.length > 0 && !shoutoutList.querySelector('.scroll-clone')) {
            refreshClones();
            return;
        }

        // Half of total scrollHeight = height of original items
        const half = shoutoutList.scrollHeight / 2;
        if (half <= 0) return;

        scrollPos += 0.5;
        if (scrollPos >= half) scrollPos -= half; // seamless loop
        shoutoutList.scrollTop = scrollPos;
    })();

    // --- Simple scroller for quote (pause at top then restart) ---
    const quoteEl = document.getElementById('daily-quote');
    (function quoteLoop() {
        requestAnimationFrame(quoteLoop);
        if (!quoteEl) return;
        const max = quoteEl.scrollHeight - quoteEl.clientHeight;
        if (max <= 0) return;
        quoteEl.scrollTop += 0.3;
        if (quoteEl.scrollTop >= max) quoteEl.scrollTop = 0;
    })();

    // --- Firebase Real-time Listeners ---

    function renderShoutout(docId, data) {
        const div = document.createElement('div');
        div.className = 'shoutout-item';
        div.setAttribute('data-id', docId);
        const sender = data.sender ? `<span style="font-size:0.85em;color:#888;display:block;margin-bottom:0.3em;">من: ${data.sender}</span>` : '';
        div.innerHTML = `${sender}<strong style="display:block;margin-bottom:0.4em;">إلى: ${data.receiver}</strong><span style="display:block;color:var(--color-text-dark);">${data.message}</span>`;
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
