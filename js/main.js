// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    renderCVs();
    updateCounts();
});

// Render CV cards
function renderCVs() {
    const grid = document.getElementById('cv-grid');
    const noResults = document.getElementById('no-results');
    
    if (currentCVs.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        document.getElementById('no-results-message').textContent = 
            currentSearchQuery 
                ? "لا توجد نتائج تطابق البحث الحالي"
                : "لا توجد سير ذاتية متاحة لهذه الجنسية حاليًا";
        return;
    }
    
    noResults.classList.add('hidden');
    
    grid.innerHTML = currentCVs.map(cv => `
        <div class="cv-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer fade-in" onclick="openCvModal(${cv.id})">
            <div class="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                <img src="${cv.image}" alt="${cv.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'text-blue-600 text-4xl font-bold\\'>${cv.name.charAt(0)}</div>'">
            </div>
            <div class="p-4 space-y-3">
                <div class="text-right">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">${cv.name}</h3>
                    <div class="text-sm text-gray-600 space-y-1">
                        <div class="flex justify-between items-center">
                            <span class="text-blue-600 font-medium">${cv.age} سنة</span>
                            <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">${getNationalityLabel(cv.nationality)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span>${cv.experience} خبرة</span>
                            <span class="text-green-600 text-xs">✓ متاح</span>
                        </div>
                    </div>
                </div>
                <div class="border-t pt-3">
                    <div class="text-xs text-gray-500 mb-2">المهارات الأساسية:</div>
                    <div class="flex flex-wrap gap-1">
                        ${cv.skills.slice(0, 3).map(skill => 
                            `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">${skill}</span>`
                        ).join('')}
                        ${cv.skills.length > 3 ? `<span class="text-gray-400 text-xs">+${cv.skills.length - 3}</span>` : ''}
                    </div>
                </div>
                <div class="flex gap-2 pt-2">
                    <button onclick="event.stopPropagation(); openCvModal(${cv.id})" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg transition-colors">
                        عرض التفاصيل
                    </button>
                    <button onclick="event.stopPropagation(); contactUs(${cv.id})" class="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors">
                        <i data-lucide="phone" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-initialize Lucide icons for new content
    lucide.createIcons();
}

// Filter by nationality
function filterByNationality(nationality) {
    currentNationality = nationality;
    
    // Update tab appearance
    document.querySelectorAll('.nationality-tab').forEach(tab => {
        if (tab.dataset.nationality === nationality) {
            tab.classList.add('tab-active');
            tab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        } else {
            tab.classList.remove('tab-active');
            tab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        }
    });
    
    applyFilters();
}

// Search CVs
function searchCVs() {
    currentSearchQuery = document.getElementById('search-input').value.toLowerCase();
    applyFilters();
}

// Sort CVs
function sortCVs(sortBy) {
    currentSortBy = sortBy;
    applyFilters();
}

// Apply all filters and sorting
function applyFilters() {
    let filteredCVs = [...cvData];
    
    // Filter by nationality
    if (currentNationality !== 'all') {
        filteredCVs = filteredCVs.filter(cv => cv.nationality === currentNationality);
    }
    
    // Filter by search query
    if (currentSearchQuery) {
        filteredCVs = filteredCVs.filter(cv => 
            cv.name.toLowerCase().includes(currentSearchQuery) ||
            cv.skills.some(skill => skill.toLowerCase().includes(currentSearchQuery)) ||
            cv.description.toLowerCase().includes(currentSearchQuery)
        );
    }
    
    // Sort CVs
    filteredCVs.sort((a, b) => {
        switch (currentSortBy) {
            case 'name':
                return a.name.localeCompare(b.name, 'ar');
            case 'age':
                return a.age - b.age;
            case 'date':
            default:
                return new Date(b.dateAdded) - new Date(a.dateAdded);
        }
    });
    
    currentCVs = filteredCVs;
    renderCVs();
}

// Update counts
function updateCounts() {
    const counts = {
        all: cvData.length,
        philippines: cvData.filter(cv => cv.nationality === 'philippines').length,
        ethiopia: cvData.filter(cv => cv.nationality === 'ethiopia').length,
        kenya: cvData.filter(cv => cv.nationality === 'kenya').length
    };
    
    document.getElementById('total-cvs').textContent = counts.all;
    
    document.querySelectorAll('.nationality-count').forEach((element, index) => {
        const nationalities = ['all', 'philippines', 'ethiopia', 'kenya'];
        element.textContent = counts[nationalities[index]];
    });
}

// Get nationality label in Arabic
function getNationalityLabel(nationality) {
    const labels = {
        'philippines': 'الفلبين',
        'ethiopia': 'إثيوبيا',
        'kenya': 'كينيا'
    };
    return labels[nationality] || nationality;
}

// Open CV modal
function openCvModal(cvId) {
    const cv = cvData.find(c => c.id === cvId);
    if (!cv) return;
    
    document.getElementById('modal-cv-name').textContent = cv.name;
    document.getElementById('modal-cv-content').innerHTML = `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row gap-6">
                <div class="flex-shrink-0">
                    <img src="${cv.image}" alt="${cv.name}" class="w-32 h-32 rounded-lg object-cover mx-auto" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto\\'>${cv.name.charAt(0)}</div>'">
                </div>
                <div class="flex-1 text-right space-y-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">${cv.name}</h3>
                        <p class="text-gray-600">${getNationalityLabel(cv.nationality)} • ${cv.age} سنة • ${cv.experience} خبرة</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-900 mb-2">نبذة عن العاملة:</h4>
                        <p class="text-gray-700 leading-relaxed">${cv.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <i data-lucide="star" class="w-4 h-4"></i>
                        المهارات
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        ${cv.skills.map(skill => 
                            `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <i data-lucide="globe" class="w-4 h-4"></i>
                        اللغات
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        ${cv.languages.map(language => 
                            `<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">${language}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="bg-yellow-50 border-r-4 border-yellow-400 p-4">
                <div class="flex">
                    <div class="ml-3">
                        <i data-lucide="info" class="w-5 h-5 text-yellow-400"></i>
                    </div>
                    <div class="text-right">
                        <p class="text-yellow-800">
                            للحصول على معلومات أكثر تفصيلاً أو لترتيب مقابلة، يرجى التواصل معنا.
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 pt-4">
                <button onclick="contactUs(${cv.id})" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <i data-lucide="phone" class="w-4 h-4"></i>
                    تواصل معنا
                </button>
                <button onclick="shareCV(${cv.id})" class="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <i data-lucide="share-2" class="w-4 h-4"></i>
                    مشاركة
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('cv-modal').classList.add('active');
    lucide.createIcons();
}

// Close CV modal
function closeCvModal() {
    document.getElementById('cv-modal').classList.remove('active');
}

// Open admin modal
function openAdminModal() {
    document.getElementById('admin-modal').classList.add('active');
    document.getElementById('admin-password').focus();
}

// Close admin modal
function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
    document.getElementById('admin-password').value = '';
}

// Admin login
function adminLogin(event) {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    // Simple demo authentication (in real app, this would be server-side)
    if (password === 'admin123') {
        alert('تم تسجيل الدخول بنجاح!\n\nفي التطبيق الحقيقي، ستنتقل إلى لوحة التحكم هنا.');
        closeAdminModal();
    } else {
        alert('كلمة المرور غير صحيحة، حاول مرة أخرى.');
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

// Contact us function
function contactUs(cvId) {
    const cv = cvData.find(c => c.id === cvId);
    if (!cv) return;
    
    const message = `مرحباً، أود الاستفسار عن السيرة الذاتية للعاملة: ${cv.name} (${getNationalityLabel(cv.nationality)})`;
    const phoneNumber = "+966501234567"; // Replace with actual phone number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

// Share CV function
function shareCV(cvId) {
    const cv = cvData.find(c => c.id === cvId);
    if (!cv) return;
    
    if (navigator.share) {
        navigator.share({
            title: `سيرة ذاتية - ${cv.name}`,
            text: `تعرف على السيرة الذاتية للعاملة ${cv.name} من ${getNationalityLabel(cv.nationality)}`,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareText = `تعرف على السيرة الذاتية للعاملة ${cv.name} من ${getNationalityLabel(cv.nationality)}\n${window.location.href}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('تم نسخ رابط المشاركة إلى الحافظة!');
            });
        } else {
            // Final fallback
            prompt('انسخ الرابط التالي للمشاركة:', shareText);
        }
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const cvModal = document.getElementById('cv-modal');
    const adminModal = document.getElementById('admin-modal');
    
    if (event.target === cvModal) {
        closeCvModal();
    }
    
    if (event.target === adminModal) {
        closeAdminModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Close modals with Escape key
    if (event.key === 'Escape') {
        closeCvModal();
        closeAdminModal();
    }
    
    // Quick search with Ctrl/Cmd + F
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        document.getElementById('search-input').focus();
    }
});

// Add loading animation
function showLoading() {
    document.getElementById('cv-grid').innerHTML = Array.from({ length: 8 }).map(() => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="w-full h-48 bg-gray-200"></div>
            <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="space-y-2">
                    <div class="h-3 bg-gray-200 rounded"></div>
                    <div class="h-3 bg-gray-200 rounded"></div>
                    <div class="h-3 bg-gray-200 rounded"></div>
                </div>
                <div class="flex gap-2">
                    <div class="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div class="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe CV cards for animation
function observeCards() {
    document.querySelectorAll('.cv-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Update the renderCVs function to include animations
const originalRenderCVs = renderCVs;
renderCVs = function() {
    originalRenderCVs();
    setTimeout(observeCards, 100);
};