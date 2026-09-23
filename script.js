let chartsInitialized = false;
const ADMIN_SECRET_PASSWORD = "admin123";

// قائمة المتطوعين المسجلين مسبقاً
let registeredVolunteers = [
    {
        email: "yassmina@example.com",
        password: "123",
        firstName: "ياسمينة",
        lastName: "بلفخار",
        phone: "0600000000",
        skill: "medical",
        skillName: "تمريض / طب / صحة ووقاية"
    }
];

let currentVolunteer = {
    firstName: "متطوع",
    lastName: "معتمد",
    email: "",
    phone: "0600000000",
    skill: "general",
    skillName: "تطوع عام"
};

let initiativesDB = [
    {
        id: 1,
        title: "حملة التوعية الصحية والتحاليل الطبية",
        org: "المستشفى المركزي",
        category: "medical",
        categoryName: "تمريض / طب / صحة",
        desc: "تنظيم فحوصات طبية للمسنين وتوزيع أدلة التثقيف الصحي عبر مختلف الوحدات الطبية.",
        location: "القطاع الصحي المركزي",
        date: "28 سبتمبر 2026",
        top: "40%",
        left: "50%",
        status: "approved",
        joined: false
    },
    {
        id: 2,
        title: "الحملة الوطنية لتشجير المساحات الخضراء",
        org: "جمعية البيئة والتنمية",
        category: "environment",
        categoryName: "بيئة وزراعة",
        desc: "مبادرة واسعة النطاق لغرس أشجار ومقاومة التصحر وتنظيف المساحات العامة.",
        location: "القطاع الشمالي",
        date: "02 أكتوبر 2026",
        top: "65%",
        left: "30%",
        status: "approved",
        joined: false
    }
];

function toggleSidebar() {
    const sidebar = document.getElementById('right-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// دالة التبديل بين خانة (حساب سابق) و (حساب جديد) في الواجهة الأولى
function switchAuthTab(tab) {
    const loginSection = document.getElementById('auth-login-section');
    const registerSection = document.getElementById('auth-register-section');
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');

    if (tab === 'login') {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

function toggleLoginPassword() {
    const role = document.getElementById('login-role').value;
    const adminGroup = document.getElementById('admin-secret-group');
    const adminInput = document.getElementById('admin-secret-input');
    
    if (role === 'admin') {
        adminGroup.style.display = 'block';
        adminInput.required = true;
    } else {
        adminGroup.style.display = 'none';
        adminInput.required = false;
    }
}

// تسجيل الدخول لحساب سابق مع التحقق من كلمة السر
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const role = document.getElementById('login-role').value;
    const adminPassword = document.getElementById('admin-secret-input').value;

    if (role === 'admin') {
        if (adminPassword !== ADMIN_SECRET_PASSWORD) {
            alert('خطأ: كلمة سر المشرف غير صحيحة!');
            return;
        }
        currentVolunteer.email = email;
        setupUserSession("مشرف المنصة الوطنية", "مشرف المنصة", email, "admin");
    } else {
        const found = registeredVolunteers.find(v => v.email === email && v.password === password);
        
        if (!found) {
            alert('خطأ: البريد الإلكتروني أو كلمة السر غير صحيحة! إذا نسيت كلمة السر انقر على (نسيت كلمة السر؟).');
            return;
        }

        currentVolunteer = { ...found };
        setupUserSession(`${currentVolunteer.firstName} ${currentVolunteer.lastName}`, "متطوع معتمد", email, "volunteer");
    }
}

// تسجيل حساب جديد مباشرة من الواجهة الأولى
function handleAuthRegister(e) {
    e.preventDefault();
    const firstName = document.getElementById('auth-reg-firstname').value.trim();
    const lastName = document.getElementById('auth-reg-lastname').value.trim();
    const email = document.getElementById('auth-reg-email').value.trim();
    const password = document.getElementById('auth-reg-password').value.trim();
    const phone = document.getElementById('auth-reg-phone').value.trim();
    const skillSelect = document.getElementById('auth-reg-skills');
    const skill = skillSelect.value;
    const skillName = skillSelect.options[skillSelect.selectedIndex].text;

    const existingIndex = registeredVolunteers.findIndex(v => v.email === email);
    const newVolunteerObj = { email, password, firstName, lastName, phone, skill, skillName };

    if (existingIndex >= 0) {
        registeredVolunteers[existingIndex] = newVolunteerObj;
        alert('هذا البريد مسجل مسبقاً، تم تحديث بياناتك وكلمة السر بنجاح!');
    } else {
        registeredVolunteers.push(newVolunteerObj);
        alert('تم إنشاء حسابك بنجاح! تم تسجيل دخولك للمنصة.');
    }

    currentVolunteer = { ...newVolunteerObj };
    setupUserSession(`${firstName} ${lastName}`, "متطوع معتمد", email, "volunteer");
}

function forgotPassword() {
    const email = prompt("أدخل بريدك الإلكتروني المسجل لاستعادة كلمة السر:");
    if (!email) return;

    const volunteer = registeredVolunteers.find(v => v.email === email.trim());
    if (volunteer) {
        const newPass = prompt(`تم العثور على حسابك.\nأدخل كلمة السر الجديدة التي تريد اعتمادها:`);
        if (newPass) {
            volunteer.password = newPass.trim();
            alert("تم تغيير كلمة السر بنجاح! يمكنك الآن تسجيل الدخول بها.");
        }
    } else {
        alert("عذراً، هذا البريد الإلكتروني غير مسجل في النظام.");
    }
}

function handleAddNewInitiative(e) {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const org = document.getElementById('new-org').value.trim();
    const categorySelect = document.getElementById('new-category');
    const category = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
    const location = document.getElementById('new-location').value.trim();
    const date = document.getElementById('new-date').value.trim();
    const desc = document.getElementById('new-desc').value.trim();

    const randomTop = Math.floor(Math.random() * 50) + 20 + "%";
    const randomLeft = Math.floor(Math.random() * 60) + 20 + "%";

    const newInitiative = {
        id: initiativesDB.length + 1,
        title,
        org,
        category,
        categoryName,
        desc,
        location,
        date,
        top: randomTop,
        left: randomLeft,
        status: "pending",
        joined: false
    };

    initiativesDB.push(newInitiative);
    alert('تم إرسال مبادرتك بنجاح! بانتظار مراجعة وقبول مشرف المنصة.');
    e.target.reset();
    switchTab('home-tab', document.querySelectorAll('.sidebar-menu a')[0]);
}

function setupUserSession(name, roleText, email, roleType) {
    document.getElementById('display-username').innerText = name;
    document.getElementById('display-role').innerText = roleText;
    document.getElementById('card-email').innerText = email;

    const vMatch = registeredVolunteers.find(v => v.email === email);
    if(vMatch) {
        currentVolunteer = { ...vMatch };
        const fullName = `${vMatch.firstName} ${vMatch.lastName}`;
        document.getElementById('display-username').innerText = fullName;
        document.getElementById('card-fullname').innerText = fullName;
        document.getElementById('card-phone').innerText = vMatch.phone;
        document.getElementById('card-skill-text').innerText = vMatch.skillName;
        const qrData = encodeURIComponent(`VOLUNTEER:${fullName}|PHONE:${vMatch.phone}|SKILL:${vMatch.skill}`);
        document.getElementById('card-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
    }

    if (roleType === 'admin') {
        document.getElementById('admin-nav-item').style.display = 'block';
        renderAdminInitiativesTable();
    } else {
        document.getElementById('admin-nav-item').style.display = 'none';
    }

    renderInitiatives();
    renderMapPins();

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

function renderAdminInitiativesTable() {
    const tableBody = document.getElementById('admin-initiatives-table-body');
    if(!tableBody) return;
    tableBody.innerHTML = '';

    initiativesDB.forEach(item => {
        let statusBadge = '';
        let actionButtons = '';

        if(item.status === 'pending') {
            statusBadge = '<span style="color: #f59e0b; font-weight: 700;">قيد المراجعة</span>';
            actionButtons = `
                <div class="action-btns">
                    <button class="btn-sm btn-success" onclick="updateInitiativeStatus(${item.id}, 'approved')">قبول ونشر</button>
                    <button class="btn-sm btn-danger" onclick="updateInitiativeStatus(${item.id}, 'rejected')">رفض</button>
                </div>
            `;
        } else if(item.status === 'approved') {
            statusBadge = '<span style="color: #10b981; font-weight: 700;">معتمدة ومنشورة ✅</span>';
            actionButtons = `<span style="color: #10b981; font-size: 13px;">تمت الموافقة</span>`;
        } else {
            statusBadge = '<span style="color: #ef4444; font-weight: 700;">مرفوضة ❌</span>';
            actionButtons = `<span style="color: #ef4444; font-size: 13px;">مرفوضة</span>`;
        }

        const row = `
            <tr>
                <td>${item.title}</td>
                <td>${item.org || 'مؤسسة وطنية'}</td>
                <td>${item.location}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function updateInitiativeStatus(id, newStatus) {
    const initiative = initiativesDB.find(item => item.id === id);
    if(initiative) {
        initiative.status = newStatus;
        alert(`تم تحديث حالة مبادرة "${initiative.title}" إلى: ${newStatus === 'approved' ? 'مقبولة ومعتمدة' : 'مرفوضة'}`);
        renderAdminInitiativesTable();
        renderInitiatives();
        renderMapPins();
    }
}

function joinInitiative(id) {
    const initiative = initiativesDB.find(item => item.id === id);
    if(initiative) {
        initiative.joined = true;
        alert(`تم الانضمام بنجاح إلى مبادرة: "${initiative.title}"!\nظهرت الآن على الخريطة.`);
        renderInitiatives();
        renderMapPins();
        switchTab('map-tab', document.querySelectorAll('.sidebar-menu a')[5]);
    }
}

function renderInitiatives() {
    const container = document.getElementById('initiatives-container');
    if(!container) return;
    container.innerHTML = '';

    const approvedInitiatives = initiativesDB.filter(item => item.status === 'approved');

    if(approvedInitiatives.length === 0) {
        container.innerHTML = `<p style="color: #64748b;">لا توجد مبادرات معتمدة حالياً بانتظار موافقة المشرف.</p>`;
        return;
    }

    approvedInitiatives.forEach(item => {
        let matchPercentage = 60;
        if (item.category === currentVolunteer.skill) {
            matchPercentage = 98;
        } else if (currentVolunteer.skill === 'general') {
            matchPercentage = 75;
        } else {
            matchPercentage = 65;
        }

        const cardHtml = `
            <div class="initiative-card ${matchPercentage > 90 ? 'matched' : ''}">
                <div>
                    <span class="badge-match"><i class="fa-solid fa-wand-magic-sparkles"></i> نسبة المطابقة الذكية (${matchPercentage}%)</span>
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
                <div class="initiative-meta">
                    <span><i class="fa-solid fa-tag"></i> التخصص المطلوب: ${item.categoryName}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
                    <span><i class="fa-solid fa-calendar-days"></i> الموعد: ${item.date}</span>
                </div>
                ${item.joined 
                    ? '<button class="btn" style="background: #10b981;" disabled><i class="fa-solid fa-check"></i> تم الانضمام (معروضة على الخريطة)</button>'
                    : `<button class="btn" onclick="joinInitiative(${item.id})">انضم للمبادرة</button>`
                }
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

function renderMapPins() {
    const mapContainer = document.getElementById('map-container-pins');
    if(!mapContainer) return;
    mapContainer.innerHTML = '';

    const approvedItems = initiativesDB.filter(item => item.status === 'approved');

    approvedItems.forEach(item => {
        const pinClass = item.joined ? 'map-pin joined' : 'map-pin';
        const iconSymbol = item.joined ? '<i class="fa-solid fa-circle-check"></i> ' : '<i class="fa-solid fa-location-pin"></i> ';
        
        const pin = document.createElement('div');
        pin.className = pinClass;
        pin.style.top = item.top;
        pin.style.left = item.left;
        pin.innerHTML = `${iconSymbol} ${item.title} (${item.location})`;
        pin.onclick = () => alert(`مبادرة: ${item.title}\nالموقع: ${item.location}\nالحالة: ${item.joined ? 'منضم إليها ✅' : 'متاحة للتسجيل'}`);
        
        mapContainer.appendChild(pin);
    });
}

function logout() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    toggleLoginPassword();
    switchAuthTab('login');
}

function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu a').forEach(link => link.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if(targetTab) {
        targetTab.classList.add('active');
    }
    if(element) {
        element.classList.add('active');
    }

    toggleSidebar();

    if(tabId === 'impact-tab' && !chartsInitialized) {
        initCharts();
        chartsInitialized = true;
    }
    if(tabId === 'admin-tab') {
        renderAdminInitiativesTable();
    }
}

function deleteVolunteer(btn) {
    if(confirm('هل أنت متأكد من حذف هذا المتطوع؟')) {
        btn.closest('tr').remove();
    }
}

function initCharts() {
    const ctxHoursElem = document.getElementById('hoursChart');
    const ctxDistElem = document.getElementById('distChart');
    if(!ctxHoursElem || !ctxDistElem) return;

    new Chart(ctxHoursElem.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['ماي', 'جوان', 'جويليا', 'أوت', 'سبتمبر'],
            datasets: [{ data: [1800, 2400, 3200, 2900, 3900], backgroundColor: '#0d9488', borderRadius: 6 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    new Chart(ctxDistElem.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['صحي وطبي', 'بيئي وزراعي', 'تعليمي وتدريبي', 'لوجستي وتنظيمي', 'تطوع عام'],
            datasets: [{ data: [35, 25, 20, 10, 10], backgroundColor: ['#0d9488', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'] }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Tajawal', size: 10 } } } } }
    });
}
