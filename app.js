/* ================================================================
 *  📊 Kankor Dashboard v1.2.2 — Application Logic
 *  ================================================================
 *  Engine: Hybrid Constrained Regression Model
 *  Formula: Traz = β₀ + k × S_weighted
 *  
 *  NEW in v1.2.2:
 *    - Toggle subject ON/OFF (exclude from calculation)
 *    - Toggle individual grade ON/OFF
 *    - Persistent toggle state in localStorage
 *    - Fixed PNG export (white image bug resolved)
 *
 *  Author: Kankor Dashboard Team
 *  Last Updated: 2026-02-26
 * ================================================================ */


/* ────────────────────────────────────────────────────────────────
 *  📦 SECTION 1: Model Configuration (پارامترهای مدل)
 * ──────────────────────────────────────────────────────────────── */

const MODEL_CONFIG = {
    version: "6.1",
    beta0: 4350,
    k: 40.2,
    gradeWeights: {
        10: 1.0,
        11: 1.5,
        12: 2.5,
    },
};


/* ────────────────────────────────────────────────────────────────
 *  📚 SECTION 2: Major Definitions (تعریف رشته‌ها و دروس)
 * ──────────────────────────────────────────────────────────────── */

const MAJORS = {
    tajrobi: {
        name: "تجربی",
        emoji: "🧬",
        subjects: {
            biology: {
                name: "زیست‌شناسی",
                emoji: "🧬",
                konkur_weight: 12,
                grades: [10, 11, 12],
                color: "mint",
                labels: {
                    10: "زیست ۱ (دهم)",
                    11: "زیست ۲ (یازدهم)",
                    12: "زیست ۳ (دوازدهم)"
                }
            },
            physics: {
                name: "فیزیک",
                emoji: "⚡",
                konkur_weight: 6,
                grades: [10, 11, 12],
                color: "sky",
                labels: {
                    10: "فیزیک ۱ (دهم)",
                    11: "فیزیک ۲ (یازدهم)",
                    12: "فیزیک ۳ (دوازدهم)"
                }
            },
            chemistry: {
                name: "شیمی",
                emoji: "🧪",
                konkur_weight: 9,
                grades: [10, 11, 12],
                color: "lavender",
                labels: {
                    10: "شیمی ۱ (دهم)",
                    11: "شیمی ۲ (یازدهم)",
                    12: "شیمی ۳ (دوازدهم)"
                }
            },
            math: {
                name: "ریاضی",
                emoji: "📐",
                konkur_weight: 6,
                grades: [10, 11, 12],
                color: "purple",
                labels: {
                    10: "ریاضی ۱ (دهم)",
                    11: "ریاضی ۲ (یازدهم)",
                    12: "ریاضی ۳ (دوازدهم)"
                }
            },
            geology: {
                name: "زمین‌شناسی",
                emoji: "🌍",
                konkur_weight: 1,
                grades: [11],
                color: "orange",
                labels: {
                    11: "زمین‌شناسی (یازدهم)"
                }
            },
        },
    },

    riazi: {
        name: "ریاضی فیزیک",
        emoji: "📐",
        subjects: {
            math: {
                name: "ریاضیات",
                emoji: "📐",
                konkur_weight: 3,
                grades: [10, 11, 12],
                color: "purple",
                labels: {
                    10: "ریاضی ۱ (دهم)",
                    11: "ریاضی ۲ (یازدهم)",
                    12: "ریاضی ۳ + گسسته + هندسه ۳ (دوازدهم)"
                }
            },
            physics: {
                name: "فیزیک",
                emoji: "⚡",
                konkur_weight: 3,
                grades: [10, 11, 12],
                color: "sky",
                labels: {
                    10: "فیزیک ۱ (دهم)",
                    11: "فیزیک ۲ (یازدهم)",
                    12: "فیزیک ۳ (دوازدهم)"
                }
            },
            chemistry: {
                name: "شیمی",
                emoji: "🧪",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "lavender",
                labels: {
                    10: "شیمی ۱ (دهم)",
                    11: "شیمی ۲ (یازدهم)",
                    12: "شیمی ۳ (دوازدهم)"
                }
            },
        },
    },

    ensani: {
        name: "علوم انسانی",
        emoji: "📖",
        subjects: {
            literature: {
                name: "ادبیات اختصاصی",
                emoji: "📝",
                konkur_weight: 3,
                grades: [10, 11, 12],
                color: "pink",
                labels: {
                    10: "ادبیات ۱ (دهم)",
                    11: "ادبیات ۲ (یازدهم)",
                    12: "ادبیات ۳ (دوازدهم)"
                }
            },
            arabic: {
                name: "عربی اختصاصی",
                emoji: "🕌",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "yellow",
                labels: {
                    10: "عربی ۱ (دهم)",
                    11: "عربی ۲ (یازدهم)",
                    12: "عربی ۳ (دوازدهم)"
                }
            },
            sociology: {
                name: "علوم اجتماعی",
                emoji: "👥",
                konkur_weight: 3,
                grades: [10, 11, 12],
                color: "blue",
                labels: {
                    10: "جامعه‌شناسی ۱ (دهم)",
                    11: "جامعه‌شناسی ۲ (یازدهم)",
                    12: "جامعه‌شناسی ۳ (دوازدهم)"
                }
            },
            history_geography: {
                name: "تاریخ و جغرافیا",
                emoji: "🗺️",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "orange",
                labels: {
                    10: "تاریخ/جغرافیا ۱ (دهم)",
                    11: "تاریخ/جغرافیا ۲ (یازدهم)",
                    12: "تاریخ/جغرافیا ۳ (دوازدهم)"
                }
            },
            math_stats: {
                name: "ریاضی و آمار",
                emoji: "📊",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "purple",
                labels: {
                    10: "ریاضی و آمار ۱ (دهم)",
                    11: "ریاضی و آمار ۲ (یازدهم)",
                    12: "ریاضی و آمار ۳ (دوازدهم)"
                }
            },
            philosophy: {
                name: "فلسفه و منطق",
                emoji: "🤔",
                konkur_weight: 1,
                grades: [11, 12],
                color: "lavender",
                labels: {
                    11: "فلسفه (یازدهم)",
                    12: "فلسفه (دوازدهم)"
                }
            },
            psychology: {
                name: "روان‌شناسی",
                emoji: "🧠",
                konkur_weight: 1,
                grades: [11],
                color: "mint",
                labels: {
                    11: "روان‌شناسی (یازدهم)"
                }
            },
            economics: {
                name: "اقتصاد",
                emoji: "💰",
                konkur_weight: 1,
                grades: [11],
                color: "peach",
                labels: {
                    11: "اقتصاد (یازدهم)"
                }
            },
        },
    },
};


/* ────────────────────────────────────────────────────────────────
 *  🔧 SECTION 3: Application State (وضعیت اپلیکیشن)
 * ──────────────────────────────────────────────────────────────── */

let currentField = localStorage.getItem('kd_selectedField') || null;


/* ────────────────────────────────────────────────────────────────
 *  📅 SECTION 4: Date Display (نمایش تاریخ شمسی)
 * ──────────────────────────────────────────────────────────────── */

function displayDate() {
    const el = document.getElementById('todayDate');
    if (!el) return;

    const now = new Date();
    el.textContent = '📅 ' + now.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}


/* ────────────────────────────────────────────────────────────────
 *  🔘 SECTION 5: Field Selection (مدیریت انتخاب رشته)
 * ──────────────────────────────────────────────────────────────── */

function selectField(field) {
    currentField = field;
    localStorage.setItem('kd_selectedField', field);

    /* آپدیت دکمه‌های رشته */
    document.querySelectorAll('.field-btn').forEach(btn => {
        const isActive = btn.dataset.field === field;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });

    /* ساخت پنل‌ها */
    renderSubjects(field);

    /* نمایش سکشن‌ها */
    document.getElementById('subjectsSection').classList.add('visible');

    const actionsEl = document.getElementById('actionsSection');
    if (actionsEl) {
        actionsEl.style.opacity = '1';
        actionsEl.style.pointerEvents = 'all';
    }

    document.getElementById('resultSection').classList.add('visible');

    /* ریست و بازیابی */
    resetResultPanel();
    restoreSavedValues();
    restoreToggleStates();
}


/* ────────────────────────────────────────────────────────────────
 *  🃏 SECTION 6: Subject Panel Rendering (ساخت پنل‌های دروس)
 * ──────────────────────────────────────────────────────────────── */

/**
 * ساخت HTML تاگل سوئیچ
 * @param {string} id - آی‌دی یونیک
 * @param {boolean} checked - وضعیت پیش‌فرض
 * @param {string} extraClass - کلاس اضافی
 * @param {string} onChange - رویداد onchange
 * @param {string} labelText - متن لیبل (اختیاری)
 * @returns {string} HTML string
 */
function buildToggleHTML(id, checked, extraClass, onChange, labelText = '') {
    return `
        <label class="toggle-switch ${extraClass}" title="${labelText || 'فعال/غیرفعال'}">
            <input
                type="checkbox"
                class="toggle-switch__input"
                id="${id}"
                ${checked ? 'checked' : ''}
                onchange="${onChange}"
            />
            <span class="toggle-switch__slider"></span>
            ${labelText ? `<span class="toggle-switch__label-text">${labelText}</span>` : ''}
        </label>
    `;
}

/**
 * ساخت HTML پنل یک درس با تاگل‌های خاموش/روشن
 */
function buildSubjectPanelHTML(subjectKey, subjectDef) {
    const gradeCount = subjectDef.grades.length;
    const gridClass  = `grades-grid--${gradeCount}`;

    /* تاگل کل درس */
    const subjectToggleId   = `toggle_subject_${subjectKey}`;
    const subjectToggleHTML = buildToggleHTML(
        subjectToggleId,
        true,
        'toggle-subject',
        `toggleSubject('${subjectKey}')`,
        ''
    );

    /* ساخت اینپوت هر پایه + تاگل پایه */
    const gradeInputsHTML = subjectDef.grades.map(grade => {
        const inputId  = `input_${subjectKey}_${grade}`;
        const toggleId = `toggle_grade_${subjectKey}_${grade}`;
        const label    = subjectDef.labels[grade] || `پایه ${grade}`;

        const gradeToggleHTML = buildToggleHTML(
            toggleId,
            true,
            'toggle-grade',
            `toggleGrade('${subjectKey}', ${grade})`,
            ''
        );

        return `
            <div class="grade-input-group" id="gradeGroup_${subjectKey}_${grade}">
                <label class="grade-label" for="${inputId}">
                    <span class="grade-label__badge grade-label__badge--${grade}">${grade}</span>
                    ${label}
                </label>
                <div class="percent-input-wrapper">
                    <input
                        type="number"
                        class="percent-input"
                        id="${inputId}"
                        data-subject="${subjectKey}"
                        data-grade="${grade}"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="٪"
                        oninput="handleInput(this, '${subjectKey}')"
                        aria-label="درصد ${label}"
                    />
                    <span class="percent-symbol">%</span>
                </div>
                ${gradeToggleHTML}
            </div>
        `;
    }).join('');

    return `
        <div class="subject-panel" data-color="${subjectDef.color}" data-subject="${subjectKey}" id="panel_${subjectKey}">
            <div class="subject-panel__header">
                <div class="subject-panel__emoji">${subjectDef.emoji}</div>
                <div class="subject-panel__info">
                    <div class="subject-panel__name">${subjectDef.name}</div>
                    <div class="subject-panel__meta">ضریب: ${subjectDef.konkur_weight} &nbsp;|&nbsp; وزن: ۱۰→۱ / ۱۱→۱.۵ / ۱۲→۲.۵</div>
                </div>
                <div class="subject-panel__avg" id="avg_${subjectKey}">—</div>
                ${subjectToggleHTML}
            </div>
            <div class="grades-grid ${gridClass}">
                ${gradeInputsHTML}
            </div>
            <div class="subject-panel__progress">
                <div class="subject-panel__progress-bar" id="progress_${subjectKey}"></div>
            </div>
        </div>
    `;
}

function renderSubjects(field) {
    const container = document.getElementById('subjectsContainer');
    const major     = MAJORS[field];
    if (!major || !container) return;

    let html = '';
    for (const [key, def] of Object.entries(major.subjects)) {
        html += buildSubjectPanelHTML(key, def);
    }
    container.innerHTML = html;
}


/* ────────────────────────────────────────────────────────────────
 *  🔘 SECTION 7: Toggle Logic (منطق خاموش/روشن)
 * ──────────────────────────────────────────────────────────────── */

/**
 * خاموش/روشن کردن کل یک درس
 */
function toggleSubject(subjectKey) {
    const checkbox = document.getElementById(`toggle_subject_${subjectKey}`);
    const panel    = document.getElementById(`panel_${subjectKey}`);
    if (!checkbox || !panel) return;

    const isEnabled = checkbox.checked;
    panel.classList.toggle('panel--disabled', !isEnabled);
    localStorage.setItem(`kd_toggle_subject_${subjectKey}`, isEnabled ? '1' : '0');
    updateSubjectAvg(subjectKey);
}

/**
 * خاموش/روشن کردن یک پایه خاص
 */
function toggleGrade(subjectKey, grade) {
    const checkbox   = document.getElementById(`toggle_grade_${subjectKey}_${grade}`);
    const gradeGroup = document.getElementById(`gradeGroup_${subjectKey}_${grade}`);
    if (!checkbox || !gradeGroup) return;

    const isEnabled = checkbox.checked;
    gradeGroup.classList.toggle('grade--disabled', !isEnabled);
    localStorage.setItem(`kd_toggle_grade_${subjectKey}_${grade}`, isEnabled ? '1' : '0');
    updateSubjectAvg(subjectKey);
}

/**
 * چک فعال بودن کل درس
 */
function isSubjectEnabled(subjectKey) {
    const checkbox = document.getElementById(`toggle_subject_${subjectKey}`);
    return checkbox ? checkbox.checked : true;
}

/**
 * چک فعال بودن یک پایه خاص
 */
function isGradeEnabled(subjectKey, grade) {
    const checkbox = document.getElementById(`toggle_grade_${subjectKey}_${grade}`);
    return checkbox ? checkbox.checked : true;
}

/**
 * بازیابی وضعیت تاگل‌ها از localStorage
 */
function restoreToggleStates() {
    if (!currentField) return;
    const major = MAJORS[currentField];

    for (const [key, def] of Object.entries(major.subjects)) {
        /* بازیابی تاگل کل درس */
        const subjectState = localStorage.getItem(`kd_toggle_subject_${key}`);
        if (subjectState === '0') {
            const checkbox = document.getElementById(`toggle_subject_${key}`);
            if (checkbox) {
                checkbox.checked = false;
                toggleSubject(key);
            }
        }

        /* بازیابی تاگل هر پایه */
        def.grades.forEach(grade => {
            const gradeState = localStorage.getItem(`kd_toggle_grade_${key}_${grade}`);
            if (gradeState === '0') {
                const checkbox = document.getElementById(`toggle_grade_${key}_${grade}`);
                if (checkbox) {
                    checkbox.checked = false;
                    toggleGrade(key, grade);
                }
            }
        });
    }
}


/* ────────────────────────────────────────────────────────────────
 *  ⌨️ SECTION 8: Input Handling (مدیریت ورودی کاربر)
 * ──────────────────────────────────────────────────────────────── */

function handleInput(inputEl, subjectKey) {
    let val = parseFloat(inputEl.value);

    if (val > 100) { inputEl.value = 100; val = 100; }
    if (val < 0)   { inputEl.value = 0;   val = 0;   }

    inputEl.classList.remove('input--invalid', 'input--valid');
    if (inputEl.value !== '' && !isNaN(val)) {
        inputEl.classList.add('input--valid');
    }

    const grade      = inputEl.dataset.grade;
    const storageKey = `kd_${subjectKey}_${grade}`;
    localStorage.setItem(storageKey, inputEl.value);

    updateSubjectAvg(subjectKey);
}

/**
 * محاسبه و نمایش میانگین وزن‌دار یک درس
 * فقط پایه‌های فعال در نظر گرفته میشن
 */
function updateSubjectAvg(subjectKey) {
    if (!currentField) return;
    const def = MAJORS[currentField].subjects[subjectKey];
    if (!def) return;

    const avgEl = document.getElementById(`avg_${subjectKey}`);
    const barEl = document.getElementById(`progress_${subjectKey}`);

    /* اگه کل درس خاموشه */
    if (!isSubjectEnabled(subjectKey)) {
        if (avgEl) avgEl.textContent = '🔇';
        if (barEl) barEl.style.width = '0%';
        return;
    }

    const scores       = {};
    const activeGrades = [];
    let hasAny = false;

    def.grades.forEach(grade => {
        if (!isGradeEnabled(subjectKey, grade)) return;

        const input = document.getElementById(`input_${subjectKey}_${grade}`);
        if (input && input.value !== '') {
            scores[grade] = parseFloat(input.value);
            hasAny = true;
        }
        activeGrades.push(grade);
    });

    if (!hasAny || activeGrades.length === 0) {
        if (avgEl) avgEl.textContent = '—';
        if (barEl) barEl.style.width = '0%';
        return;
    }

    const avg = calcSubjectAverage(scores, activeGrades);
    if (avgEl) avgEl.textContent = Math.round(avg) + '٪';
    if (barEl) barEl.style.width = Math.max(0, Math.min(100, avg)) + '%';
}


/* ────────────────────────────────────────────────────────────────
 *  💾 SECTION 9: Data Persistence (ذخیره و بازیابی)
 * ──────────────────────────────────────────────────────────────── */

function restoreSavedValues() {
    if (!currentField) return;
    const major = MAJORS[currentField];

    for (const [key, def] of Object.entries(major.subjects)) {
        def.grades.forEach(grade => {
            const storageKey = `kd_${key}_${grade}`;
            const saved      = localStorage.getItem(storageKey);
            if (saved !== null && saved !== '') {
                const input = document.getElementById(`input_${key}_${grade}`);
                if (input) {
                    input.value = saved;
                    input.classList.add('input--valid');
                }
            }
        });
        updateSubjectAvg(key);
    }
}


/* ────────────────────────────────────────────────────────────────
 *  🧮 SECTION 10: Calculation Engine (هسته محاسباتی)
 * ──────────────────────────────────────────────────────────────── */

function getGradeWeight(grade) {
    return MODEL_CONFIG.gradeWeights[grade] || 1.0;
}

/**
 * میانگین وزن‌دار — فقط پایه‌های فعال
 */
function calcSubjectAverage(scores, activeGrades) {
    let numerator   = 0;
    let denominator = 0;

    for (const grade of activeGrades) {
        const p = (scores[grade] != null && !isNaN(scores[grade]))
            ? Math.max(0, Math.min(100, scores[grade]))
            : 0;
        const alpha  = getGradeWeight(grade);
        numerator   += alpha * p;
        denominator += alpha;
    }

    return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * نمره وزن‌دار نهایی — فقط دروس فعال
 */
function calcWeightedScore(subjectAverages, subjectDefs) {
    let numerator   = 0;
    let denominator = 0;

    for (const [key, def] of Object.entries(subjectDefs)) {
        if (!isSubjectEnabled(key)) continue;

        const w   = def.konkur_weight;
        const avg = subjectAverages[key] || 0;
        numerator   += w * avg;
        denominator += w;
    }

    return denominator === 0 ? 0 : numerator / denominator;
}

function getLevel(traz) {
    const levels = [
        { min: 7500, name: "L5+", emoji: "👑", university: "پزشکی تهران / شهید بهشتی",  league: "لیگ خدایان ⚡"   },
        { min: 7200, name: "L5",  emoji: "🏆", university: "پزشکی شهید بهشتی / تهران",  league: "لیگ خدایان ⚡"   },
        { min: 7000, name: "L4+", emoji: "🥇", university: "پزشکی شیراز / اصفهان",      league: "لیگ قهرمانان 🌟" },
        { min: 6700, name: "L4",  emoji: "🎯", university: "پزشکی مشهد / تبریز",        league: "لیگ قهرمانان 🌟" },
        { min: 6300, name: "L3",  emoji: "🔥", university: "پزشکی کرمان / گیلان",       league: "لیگ حرفه‌ای 💪"  },
        { min: 5900, name: "L2",  emoji: "📈", university: "پزشکی اهواز / همدان",       league: "لیگ صعود 🚀"    },
        { min: 5250, name: "L1",  emoji: "🌱", university: "پزشکی آزاد / سایر",         league: "لیگ شروع 🌱"    },
        { min: 0,    name: "L0",  emoji: "⚪", university: "نیاز به تلاش بیشتر",         league: "پیش‌فصل ⚪"     },
    ];

    for (const level of levels) {
        if (traz >= level.min) return level;
    }
    return levels[levels.length - 1];
}

/**
 * 🎯 تابع اصلی محاسبه تراز
 */
function calculateTraz(majorKey) {
    const major = MAJORS[majorKey];
    if (!major) return null;

    const subjectDefs     = major.subjects;
    const subjectAverages = {};
    const details         = {};

    let activeSubjectCount   = 0;
    let disabledSubjectNames = [];

    for (const [key, def] of Object.entries(subjectDefs)) {
        const subjectEnabled = isSubjectEnabled(key);

        if (!subjectEnabled) {
            disabledSubjectNames.push(def.name);
            details[key] = {
                name:            def.name,
                emoji:           def.emoji,
                konkur_weight:   def.konkur_weight,
                weightedAverage: 0,
                contribution:    0,
                disabled:        true,
            };
            continue;
        }

        activeSubjectCount++;

        const scores         = {};
        const activeGrades   = [];
        let disabledGrades   = [];

        def.grades.forEach(grade => {
            if (!isGradeEnabled(key, grade)) {
                disabledGrades.push(grade);
                return;
            }
            activeGrades.push(grade);
            const input = document.getElementById(`input_${key}_${grade}`);
            if (input && input.value !== '') {
                scores[grade] = parseFloat(input.value);
            }
        });

        const avg = activeGrades.length > 0
            ? calcSubjectAverage(scores, activeGrades)
            : 0;

        subjectAverages[key] = avg;

        details[key] = {
            name:             def.name,
            emoji:            def.emoji,
            konkur_weight:    def.konkur_weight,
            weightedAverage:  Math.round(avg * 100) / 100,
            contribution:     Math.round(def.konkur_weight * avg * 100) / 100,
            disabled:         false,
            disabledGrades:   disabledGrades,
            activeGradeCount: activeGrades.length,
            totalGradeCount:  def.grades.length,
        };
    }

    const weightedScore = calcWeightedScore(subjectAverages, subjectDefs);
    const traz          = MODEL_CONFIG.beta0 + MODEL_CONFIG.k * weightedScore;
    const trazRounded   = Math.round(traz);
    const level         = getLevel(trazRounded);

    return {
        major:                major.name,
        majorEmoji:           major.emoji,
        traz:                 trazRounded,
        weightedScore:        Math.round(weightedScore * 100) / 100,
        level,
        subjectAverages,
        details,
        activeSubjectCount,
        disabledSubjectNames,
        formula: `${MODEL_CONFIG.beta0} + ${MODEL_CONFIG.k} × ${Math.round(weightedScore * 100) / 100}`,
    };
}


/* ────────────────────────────────────────────────────────────────
 *  📊 SECTION 11: Result Rendering (رندر نتایج)
 * ──────────────────────────────────────────────────────────────── */

function runCalculation() {
    if (!currentField) {
        showToast('🎓 اول رشته‌ات رو انتخاب کن!');
        return;
    }

    const result = calculateTraz(currentField);
    if (!result) return;

    renderResult(result);

    setTimeout(() => {
        document.getElementById('resultSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 200);
}

function renderResult(result) {
    const bento = document.getElementById('resultBento');
    if (!bento) return;

    const level = result.level;

    /* ───── پیام هشدار دروس خاموش ───── */
    let disabledWarningHTML = '';
    if (result.disabledSubjectNames.length > 0) {
        disabledWarningHTML = `
            <div class="result-card--targets" style="border: 2px solid var(--pastel-orange);">
                <div class="targets-title">⚠️ دروس غیرفعال‌شده (از محاسبه حذف شدن)</div>
                ${result.disabledSubjectNames.map(name => `
                    <div class="target-row">
                        <span class="target-name">🔇 ${name}</span>
                        <span class="target-status target-status--far">غیرفعال</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /* ───── تارگت‌ها ───── */
    const targets = [
        { name: "L1 — پزشکی آزاد،پردیس،مازاد",            traz: 5700 },
        { name: "L2 — پزشکی یاسوج،بوشهر،ایلام،ساری،یزد،ارومیه،کاشان،زنجان",     traz: 5900 },
        { name: "L3 — پزشکی کرمانگیلان،تبریز،اهواز،کرمانشاه،همدان،بابل",     traz: 6300 },
        { name: "L4 — پزشکی شیراز،اصفهان،مشهد",      traz: 6700 },
        { name: "L4+ — پزشکی قطعی شیراز،اصفهان،مشهد",   traz: 7000 },
        { name: "L5 — پزشکی تهران،بهشتی،ایران",     traz: 7200 },
    ];

    const targetsHTML = targets.map(t => {
        const diff = t.traz - result.traz;
        let statusClass, statusText;
        if (diff <= 0) {
            statusClass = 'target-status--reached';
            statusText  = '✅ رسیدی!';
        } else if (diff <= 300) {
            statusClass = 'target-status--close';
            statusText  = `⬆️ +${diff} تراز`;
        } else {
            statusClass = 'target-status--far';
            statusText  = `⬆️ +${diff} تراز`;
        }
        return `
            <div class="target-row">
                <span class="target-name">${t.name}</span>
                <span class="target-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');

    /* ───── جزئیات هر درس ───── */
    const detailsHTML = Object.entries(result.details).map(([key, d]) => {
        const isDisabled = d.disabled;

        let gradeInfo = '';
        if (!isDisabled && d.disabledGrades && d.disabledGrades.length > 0) {
            gradeInfo = `<small style="color:var(--pastel-orange);margin-right:4px">
                (${d.activeGradeCount}/${d.totalGradeCount} پایه فعال)
            </small>`;
        }

        return `
            <div class="detail-row" style="${isDisabled ? 'opacity:0.35;text-decoration:line-through;' : ''}">
                <span class="detail-subject">
                    ${d.emoji} ${d.name}
                    <small style="color:var(--text-muted)">(×${d.konkur_weight})</small>
                    ${isDisabled ? '<span class="disabled-badge">OFF</span>' : ''}
                    ${gradeInfo}
                </span>
                <span class="detail-avg">${isDisabled ? '🔇' : d.weightedAverage + '٪'}</span>
            </div>
        `;
    }).join('');

    /* ───── HTML نهایی ───── */
    bento.innerHTML = `
        <div class="result-card--main">
            <div class="result-label">${result.majorEmoji} تراز تخمینی رشته ${result.major}</div>
            <div class="result-traz-big">${result.traz}</div>
            <div class="result-formula">${result.formula} = ${result.traz}</div>
            <div style="margin-top:8px;font-size:0.72rem;color:var(--text-muted)">
                ${result.activeSubjectCount} درس فعال از ${Object.keys(result.details).length}
            </div>
        </div>

        <div class="result-card--small">
            <div class="result-small-label">📏 نمره وزن‌دار</div>
            <div class="result-small-value">${result.weightedScore}</div>
            <div class="result-small-sub">از ۱۰۰</div>
        </div>

        <div class="result-card--small">
            <div class="result-small-label">🎖️ سطح</div>
            <div class="result-small-value">${level.emoji} ${level.name}</div>
            <div class="result-small-sub">${level.league}</div>
        </div>

        <div class="result-card--league">
            <div class="league-info">
                <span class="league-emoji">${level.emoji}</span>
                <div class="league-details">
                    <span class="league-name">${level.league}</span>
                    <span class="league-university">🏛️ ${level.university}</span>
                </div>
            </div>
            <span class="league-badge">${level.name}</span>
        </div>

        ${disabledWarningHTML}

        <div class="result-card--details">
            <div class="details-title">📋 میانگین وزن‌دار هر درس</div>
            ${detailsHTML}
        </div>

        <div class="result-card--targets">
            <div class="targets-title">🎯 فاصله تا اهداف</div>
            ${targetsHTML}
        </div>
    `;
}

function resetResultPanel() {
    const bento = document.getElementById('resultBento');
    if (!bento) return;
    bento.innerHTML = `
        <div class="result-placeholder">
            <div class="result-placeholder__icon">🎯</div>
            <div class="result-placeholder__text">درصدها رو وارد کن و دکمه «محاسبه تراز» رو بزن!</div>
        </div>
    `;
}


/* ────────────────────────────────────────────────────────────────
 *  📸 SECTION 12: PNG Export — Canvas API (بدون html2canvas!)
 * ──────────────────────────────────────────────────────────────── 
 *  🔥 بازنویسی کامل: به جای html2canvas از Canvas 2D API
 *  مستقیم استفاده میکنیم. اینجوری:
 *    ✅ مشکل صفحه سفید حل میشه
 *    ✅ فونت وزیرمتن درست رندر میشه
 *    ✅ backdrop-filter مشکل نمیسازه
 *    ✅ خروجی همیشه تمیز و A4 عمودی
 *    ✅ فقط اطلاعات ضروری (بدون دکمه/اینپوت/تاگل)
 * ──────────────────────────────────────────────────────────────── */

function exportPNG() {
    if (!currentField) {
        showToast('🎓 اول رشته‌ات رو انتخاب کن!');
        return;
    }

    /* ───── محاسبه تراز ───── */
    const result = calculateTraz(currentField);
    if (!result) {
        showToast('❌ خطا در محاسبه!');
        return;
    }

    showToast('📸 در حال ساخت گزارش...');

    /* ───── ابعاد (2x برای کیفیت بالا) ───── */
    const SCALE  = 2;
    const W      = 794;                   /* عرض A4 در 96 DPI */
    const MARGIN = 40;                    /* حاشیه */
    const CW     = W - MARGIN * 2;       /* عرض محتوا */

    /* ───── فاز ۱: اندازه‌گیری ارتفاع (off-screen) ───── */
    const measureCanvas = document.createElement('canvas');
    measureCanvas.width  = W * SCALE;
    measureCanvas.height = 4000 * SCALE;  /* بزرگ موقت */
    const mCtx = measureCanvas.getContext('2d');
    mCtx.scale(SCALE, SCALE);

    /* اندازه‌گیری واقعی ارتفاع */
    const contentHeight = _drawReport(mCtx, result, W, MARGIN, CW, true);
    const H = contentHeight + 20;  /* یه کم padding پایین */

    /* ───── فاز ۲: رسم واقعی ───── */
    const canvas  = document.createElement('canvas');
    canvas.width  = W * SCALE;
    canvas.height = H * SCALE;
    const ctx     = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);

    _drawReport(ctx, result, W, MARGIN, CW, false);

    /* ───── دانلود ───── */
    try {
        const link       = document.createElement('a');
        const fieldName  = MAJORS[currentField]?.name || 'taraz';
        link.download    = `گزارش-تراز-${fieldName}-${Date.now()}.png`;
        link.href        = canvas.toDataURL('image/png', 1.0);
        link.click();
        showToast('✅ گزارش دانلود شد!');
    } catch (err) {
        console.error('[ExportPNG]', err);
        showToast('❌ خطا در ساخت تصویر!');
    }
}

/**
 * 🎨 رسم کامل گزارش روی Canvas
 * @param {CanvasRenderingContext2D} ctx - کانتکست کانوس
 * @param {Object} result - نتیجه محاسبه
 * @param {number} W - عرض کل
 * @param {number} M - حاشیه
 * @param {number} CW - عرض محتوا
 * @param {boolean} measureOnly - فقط اندازه‌گیری (برای فاز ۱)
 * @returns {number} ارتفاع نهایی محتوا
 */
function _drawReport(ctx, result, W, M, CW, measureOnly) {
    const level = result.level;
    const now   = new Date().toLocaleDateString('fa-IR', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    let y = M;  /* مکان‌نمای عمودی */

    /* ═══════ Helper Functions ═══════ */

    /** رسم متن RTL */
    function drawText(text, x, _y, font, color, align = 'right') {
        if (measureOnly) return;
        ctx.save();
        ctx.font      = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.direction = 'rtl';
        ctx.fillText(text, x, _y);
        ctx.restore();
    }

    /** رسم مستطیل گرد */
    function roundRect(x, _y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, _y);
        ctx.lineTo(x + w - r, _y);
        ctx.quadraticCurveTo(x + w, _y, x + w, _y + r);
        ctx.lineTo(x + w, _y + h - r);
        ctx.quadraticCurveTo(x + w, _y + h, x + w - r, _y + h);
        ctx.lineTo(x + r, _y + h);
        ctx.quadraticCurveTo(x, _y + h, x, _y + h - r);
        ctx.lineTo(x, _y + r);
        ctx.quadraticCurveTo(x, _y, x + r, _y);
        ctx.closePath();
    }

    /** رسم کارت با پس‌زمینه */
    function drawCard(x, _y, w, h, bgColor, borderColor) {
        if (measureOnly) return;
        ctx.save();

        /* سایه */
        ctx.shadowColor   = 'rgba(0, 0, 0, 0.06)';
        ctx.shadowBlur    = 16;
        ctx.shadowOffsetY = 4;

        /* بدنه */
        roundRect(x, _y, w, h, 16);
        ctx.fillStyle = bgColor || 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        /* بوردر */
        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    /** رسم بج گرد */
    function drawBadge(text, centerX, _y, bgColor, textColor, fontSize) {
        if (measureOnly) return;
        ctx.save();
        ctx.font = `bold ${fontSize || 11}px Vazirmatn, sans-serif`;
        const tw = ctx.measureText(text).width;
        const pw = 14;  /* padding افقی */
        const bw = tw + pw * 2;
        const bh = fontSize ? fontSize + 12 : 24;

        roundRect(centerX - bw / 2, _y, bw, bh, bh / 2);
        ctx.fillStyle = bgColor;
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        ctx.fillText(text, centerX, _y + bh / 2 + fontSize / 3);
        ctx.restore();
    }

    /** اندازه‌گیری عرض متن */
    function measureText(text, font) {
        ctx.save();
        ctx.font = font;
        const w = ctx.measureText(text).width;
        ctx.restore();
        return w;
    }

    /* ═══════════════════════════════════════════════
     *  🎨 بک‌گراند گرادیان
     * ═══════════════════════════════════════════════ */
    if (!measureOnly) {
        const grad = ctx.createLinearGradient(0, 0, W, 4000);
        grad.addColorStop(0,   '#F8F6F2');
        grad.addColorStop(0.5, '#F0ECE4');
        grad.addColorStop(1,   '#F8F6F2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, 4000);
    }

    /* ═══════════════════════════════════════════════
     *  📋 هدر گزارش
     * ═══════════════════════════════════════════════ */
    drawText('📊 گزارش تخمین تراز قلم‌چی', W / 2, y + 4, 'bold 20px Vazirmatn, sans-serif', '#2D2D3A', 'center');
    y += 30;

    drawText(
        `${result.majorEmoji} رشته: ${result.major}  |  📅 ${now}`,
        W / 2, y, '500 12px Vazirmatn, sans-serif', '#888', 'center'
    );
    y += 20;

    /* خط جداکننده */
    if (!measureOnly) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(M, y);
        ctx.lineTo(W - M, y);
        ctx.stroke();
        ctx.restore();
    }
    y += 20;

    /* ═══════════════════════════════════════════════
     *  🏆 کارت اصلی تراز
     * ═══════════════════════════════════════════════ */
    const mainCardH = 170;
    drawCard(M, y, CW, mainCardH, 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.5)');

    drawText('تراز تخمینی', W / 2, y + 30, '500 14px Vazirmatn, sans-serif', '#888', 'center');

    drawText(
        String(result.traz),
        W / 2, y + 85,
        'bold 52px Vazirmatn, sans-serif', '#2D2D3A', 'center'
    );

    /* بج‌های سطح و لیگ */
    const badgeY = y + 105;
    drawBadge(`${level.emoji} ${level.name}`, W / 2 - 120, badgeY, 'rgba(67,233,123,0.15)', '#2D8F5E', 11);
    drawBadge(level.league, W / 2, badgeY, 'rgba(56,178,227,0.1)', '#2878A8', 11);
    drawBadge(`📏 نمره وزن‌دار: ${result.weightedScore}`, W / 2 + 140, badgeY, 'rgba(176,130,255,0.1)', '#7B52CC', 11);

    drawText(
        `${result.activeSubjectCount} درس فعال از ${Object.keys(result.details).length}`,
        W / 2, y + mainCardH - 16, '400 10px Vazirmatn, sans-serif', '#999', 'center'
    );

    y += mainCardH + 20;

    /* ═══════════════════════════════════════════════
     *  📋 جدول دروس
     * ═══════════════════════════════════════════════ */
    const subjects  = Object.entries(result.details);
    const tableH    = 44 + subjects.length * 36 + 10;

    drawCard(M, y, CW, tableH, 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.4)');

    /* عنوان جدول */
    drawText('📋 میانگین وزن‌دار هر درس', W / 2, y + 24, 'bold 13px Vazirmatn, sans-serif', '#2D2D3A', 'center');
    y += 42;

    /* هدر جدول */
    if (!measureOnly) {
        ctx.save();
        roundRect(M + 6, y - 4, CW - 12, 28, 6);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.fill();
        ctx.restore();
    }

    drawText('درس', W - M - 16, y + 14, '600 11px Vazirmatn, sans-serif', '#888', 'right');
    drawText('میانگین', W / 2 + 20, y + 14, '600 11px Vazirmatn, sans-serif', '#888', 'center');
    drawText('ضریب', M + 50, y + 14, '600 11px Vazirmatn, sans-serif', '#888', 'center');
    y += 32;

    /* ردیف‌های دروس */
    subjects.forEach(([key, d], idx) => {
        const isDisabled = d.disabled;

        /* پس‌زمینه ردیف‌های زوج */
        if (!measureOnly && idx % 2 === 0) {
            ctx.save();
            roundRect(M + 6, y - 6, CW - 12, 32, 4);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
            ctx.fill();
            ctx.restore();
        }

        const textColor = isDisabled ? '#CCC' : '#2D2D3A';
        const subFont   = isDisabled ? '500 12px Vazirmatn, sans-serif' : '600 12px Vazirmatn, sans-serif';

        let subjectLabel = `${d.emoji} ${d.name}`;
        if (isDisabled) subjectLabel += ' (OFF)';
        if (!isDisabled && d.disabledGrades && d.disabledGrades.length > 0) {
            subjectLabel += ` (${d.activeGradeCount}/${d.totalGradeCount})`;
        }

        drawText(subjectLabel, W - M - 16, y + 14, subFont, textColor, 'right');
        drawText(
            isDisabled ? '—' : d.weightedAverage + '٪',
            W / 2 + 20, y + 14,
            'bold 12px Vazirmatn, sans-serif',
            isDisabled ? '#CCC' : '#2D2D3A', 'center'
        );
        drawText(
            '×' + d.konkur_weight,
            M + 50, y + 14,
            '500 12px Vazirmatn, sans-serif',
            isDisabled ? '#CCC' : '#666', 'center'
        );

        /* خط‌خوردگی برای درس غیرفعال */
        if (!measureOnly && isDisabled) {
            ctx.save();
            const tw = measureText(subjectLabel, subFont);
            ctx.strokeStyle = '#FFB5C2';
            ctx.lineWidth   = 1.5;
            ctx.beginPath();
            ctx.moveTo(W - M - 16, y + 10);
            ctx.lineTo(W - M - 16 - tw, y + 10);
            ctx.stroke();
            ctx.restore();
        }

        y += 36;
    });

    y += 16;

    /* ═══════════════════════════════════════════════
     *  🎯 فاصله تا اهداف
     * ═══════════════════════════════════════════════ */
    const targets = [
        { name: "پزشکی آزاد / سایر",       traz: 5700 },
        { name: "پزشکی اهواز / همدان",      traz: 6000 },
        { name: "پزشکی کرمان / گیلان",      traz: 6200 },
        { name: "پزشکی مشهد / تبریز",       traz: 6400 },
        { name: "پزشکی شیراز / اصفهان",     traz: 6700 },
        { name: "پزشکی تهران / بهشتی",      traz: 7000 },
    ];

    const targetCardH = 40 + targets.length * 32 + 10;
    drawCard(M, y, CW, targetCardH, 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.4)');

    drawText('🎯 فاصله تا اهداف', W / 2, y + 24, 'bold 13px Vazirmatn, sans-serif', '#2D2D3A', 'center');
    y += 42;

    targets.forEach(t => {
        const diff = t.traz - result.traz;
        let statusText, statusColor;

        if (diff <= 0) {
            statusText  = '✅ رسیدی!';
            statusColor = '#2D8F5E';
        } else if (diff <= 300) {
            statusText  = `⬆️ +${diff}`;
            statusColor = '#C07800';
        } else {
            statusText  = `⬆️ +${diff}`;
            statusColor = '#CC3344';
        }

        drawText(`🏛️ ${t.name}`, W - M - 16, y + 12, '500 11px Vazirmatn, sans-serif', '#555', 'right');
        drawText(statusText, M + 60, y + 12, 'bold 11px Vazirmatn, sans-serif', statusColor, 'center');

        /* خط‌چین جداکننده */
        if (!measureOnly) {
            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
            ctx.lineWidth   = 0.5;
            ctx.beginPath();
            ctx.moveTo(M + 10, y + 26);
            ctx.lineTo(W - M - 10, y + 26);
            ctx.stroke();
            ctx.restore();
        }

        y += 32;
    });

    y += 14;

    /* ═══════════════════════════════════════════════
     *  ⚠️ هشدار دروس غیرفعال (اختیاری)
     * ═══════════════════════════════════════════════ */
    if (result.disabledSubjectNames.length > 0) {
        const warnH = 50;
        drawCard(M, y, CW, warnH, 'rgba(255,107,107,0.06)', 'rgba(255,107,107,0.2)');

        drawText(
            '⚠️ دروس حذف‌شده: ' + result.disabledSubjectNames.map(n => `🔇${n}`).join(' • '),
            W / 2, y + 30, '600 11px Vazirmatn, sans-serif', '#CC4444', 'center'
        );

        y += warnH + 14;
    }

    /* ═══════════════════════════════════════════════
     *  🔖 فوتر
     * ═══════════════════════════════════════════════ */
    /* خط جداکننده */
    if (!measureOnly) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(M, y);
        ctx.lineTo(W - M, y);
        ctx.stroke();
        ctx.restore();
    }
    y += 18;

    drawText(
        `🛠️ ابزار تخمین تراز قلم‌چی v${MODEL_CONFIG.version}  |  این تخمین جایگزین نتایج رسمی نیست`,
        W / 2, y, '400 9px Vazirmatn, sans-serif', '#AAA', 'center'
    );

    y += 20;

    return y;  /* ارتفاع نهایی */
}


/* ────────────────────────────────────────────────────────────────
 *  🗑️ SECTION 13: Reset (پاک‌سازی کامل)
 * ──────────────────────────────────────────────────────────────── */

function resetAll() {
    if (!confirm('🗑️ همه درصدها و تنظیمات پاک بشن؟')) return;

    for (const [majorKey, major] of Object.entries(MAJORS)) {
        for (const [subKey, def] of Object.entries(major.subjects)) {
            def.grades.forEach(grade => {
                localStorage.removeItem(`kd_${subKey}_${grade}`);
                localStorage.removeItem(`kd_toggle_grade_${subKey}_${grade}`);
            });
            localStorage.removeItem(`kd_toggle_subject_${subKey}`);
        }
    }

    /* ریست اینپوت‌ها */
    document.querySelectorAll('.percent-input').forEach(input => {
        input.value = '';
        input.classList.remove('input--valid', 'input--invalid');
    });

    /* ریست تاگل‌های درس */
    document.querySelectorAll('[id^="toggle_subject_"]').forEach(cb => {
        cb.checked = true;
    });
    document.querySelectorAll('.subject-panel').forEach(panel => {
        panel.classList.remove('panel--disabled');
    });

    /* ریست تاگل‌های پایه */
    document.querySelectorAll('[id^="toggle_grade_"]').forEach(cb => {
        cb.checked = true;
    });
    document.querySelectorAll('.grade-input-group').forEach(group => {
        group.classList.remove('grade--disabled');
    });

    /* ریست میانگین‌ها و پروگرس‌بارها */
    document.querySelectorAll('[id^="avg_"]').forEach(el => {
        el.textContent = '—';
    });
    document.querySelectorAll('[id^="progress_"]').forEach(el => {
        el.style.width = '0%';
    });

    resetResultPanel();
    showToast('🗑️ همه چیز پاک شد!');
}


/* ────────────────────────────────────────────────────────────────
 *  🍞 SECTION 14: Toast Notification
 * ──────────────────────────────────────────────────────────────── */

function showToast(message) {
    const existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;

    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        padding: 12px 24px;
        border-radius: 16px;
        background: rgba(45, 45, 58, 0.9);
        backdrop-filter: blur(12px);
        color: #fff;
        font-family: 'Vazirmatn', sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 9999;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        pointer-events: none;
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}


/* ────────────────────────────────────────────────────────────────
 *  🚀 SECTION 15: Initialization
 * ──────────────────────────────────────────────────────────────── */

(function init() {
    displayDate();

    if (currentField && MAJORS[currentField]) {
        selectField(currentField);
    }
})();