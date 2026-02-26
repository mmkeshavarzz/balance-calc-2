/* ================================================================
 *  📊 Kankor Dashboard v8.0 — Application Logic
 *  ================================================================
 *  Engine : Quadratic Constrained Regression + Weighted σ + Coverage φ
 *  Formula: T = β₀ + k₁·Sw + k₂·Sw² + k₃·σ + k₄·(1−φ)·Sw
 *
 *  v8.0 Changes:
 *    - New model params: k3 (σ), k4 (φ coverage)
 *    - Negative percentages supported (down to -33%)
 *    - calculateWeightedSigma() — انحراف معیار وزن‌دار
 *    - calculateCoverage() — فاکتور پوشش پایه
 *    - Toggle subject ON/OFF (exclude from calculation)
 *    - Toggle individual grade ON/OFF
 *    - Persistent toggle state in localStorage
 *    - Fixed PNG export with σ & φ display
 *
 *  Author : Kankor Dashboard Team
 *  Last   : 1404/12/07 — 2026-02-26
 * ================================================================ */

/* ────────────────────────────────────────────────────────────────
 *  📦 SECTION 1: Model Configuration (پارامترهای مدل)
 * ──────────────────────────────────────────────────────────────── */

const MODEL_CONFIG = {
    /* نسخه مدل */
    version: "8.0",

    /* ───── ضرایب رگرسیون — v8.0 ───── */
    beta0:   6573.5,     // عرض از مبدأ
    k1:      -42.74,     // ضریب خطی  (Sw)
    k2:        0.7042,   // ضریب درجه ۲ (Sw²)
    k3:      -23.90,     // ضریب انحراف معیار وزن‌دار (σ)
    k4:      -30.08,     // ضریب coverage factor  ((1−φ)·Sw)

    /* وزن هر پایه تحصیلی (α) — مطابق کنکور */
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
                name: "ادبیات فارسی",
                emoji: "📝",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "mint",
                labels: {
                    10: "ادبیات ۱ (دهم)",
                    11: "ادبیات ۲ (یازدهم)",
                    12: "ادبیات ۳ (دوازدهم)"
                }
            },
            arabic: {
                name: "عربی",
                emoji: "🕌",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "sky",
                labels: {
                    10: "عربی ۱ (دهم)",
                    11: "عربی ۲ (یازدهم)",
                    12: "عربی ۳ (دوازدهم)"
                }
            },
            sociology: {
                name: "علوم اجتماعی",
                emoji: "👥",
                konkur_weight: 2,
                grades: [10, 11, 12],
                color: "lavender",
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
                    10: "تاریخ و جغرافیا ۱ (دهم)",
                    11: "تاریخ و جغرافیا ۲ (یازدهم)",
                    12: "تاریخ و جغرافیا ۳ (دوازدهم)"
                }
            },
            math_stats: {
                name: "ریاضی و آمار",
                emoji: "📊",
                konkur_weight: 1,
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
                emoji: "🧠",
                konkur_weight: 2,
                grades: [11, 12],
                color: "mint",
                labels: {
                    11: "فلسفه و منطق (یازدهم)",
                    12: "فلسفه و منطق (دوازدهم)"
                }
            },
            psychology: {
                name: "روان‌شناسی",
                emoji: "🧩",
                konkur_weight: 2,
                grades: [11],
                color: "sky",
                labels: {
                    11: "روان‌شناسی (یازدهم)"
                }
            },
            economics: {
                name: "اقتصاد",
                emoji: "💰",
                konkur_weight: 1,
                grades: [10],
                color: "lavender",
                labels: {
                    10: "اقتصاد (دهم)"
                }
            },
        },
    },
};

/* ────────────────────────────────────────────────────────────────
 *  🗄️ SECTION 3: Application State (وضعیت اپلیکیشن)
 * ──────────────────────────────────────────────────────────────── */

let currentField = localStorage.getItem('kd_currentField') || null;

/* ────────────────────────────────────────────────────────────────
 *  📅 SECTION 4: Date Display (نمایش تاریخ شمسی)
 * ──────────────────────────────────────────────────────────────── */

function displayDate() {
    const el = document.getElementById('currentDate');
    if (!el) return;

    try {
        const now     = new Date();
        const options = {
            year:    'numeric',
            month:   'long',
            day:     'numeric',
            weekday: 'long'
        };
        const shamsi = new Intl.DateTimeFormat('fa-IR', options).format(now);
        el.textContent = shamsi;
    } catch (err) {
        el.textContent = new Date().toLocaleDateString('fa-IR');
    }
}

/* ────────────────────────────────────────────────────────────────
 *  🎨 SECTION 5: Field Selection (انتخاب رشته)
 * ──────────────────────────────────────────────────────────────── */

function selectField(field) {
    if (!MAJORS[field]) return;

    currentField = field;
    localStorage.setItem('kd_currentField', field);

    /* استایل کارت‌ها */
    document.querySelectorAll('.field-card').forEach(card => {
        card.classList.toggle('active', card.dataset.field === field);
    });

    /* رندر + بازیابی */
    renderSubjects(field);
    restoreSavedValues();
    restoreToggleStates();

    /* ریست نتایج قبلی */
    resetResultPanel();

    /* اسکرول به بخش دروس */
    setTimeout(() => {
        const sec = document.getElementById('subjectsSection');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

/**
 * ریست پنل نتایج
 */
function resetResultPanel() {
    const resultSection = document.getElementById('resultSection');
    if (resultSection) resultSection.classList.remove('visible');

    const bento = document.getElementById('resultBento');
    if (bento) bento.innerHTML = '';
}

/* ────────────────────────────────────────────────────────────────
 *  🧱 SECTION 6: Subject Panel Builder (ساخت پنل دروس)
 * ──────────────────────────────────────────────────────────────── */

/**
 * ساخت HTML تاگل — ساختار ۵ پارامتری اصلی
 */
function buildToggleHTML(id, checked, extraClass, onchangeFunc, labelText) {
    return `
        <label class="toggle-switch ${extraClass}" for="${id}">
            <input
                type="checkbox"
                id="${id}"
                ${checked ? 'checked' : ''}
                onchange="${onchangeFunc}"
            />
            <span class="toggle-track">
                <span class="toggle-thumb"></span>
            </span>
            ${labelText ? `<span class="toggle-text">${labelText}</span>` : ''}
        </label>
    `;
}

/**
 * ساخت HTML پنل یک درس با تاگل‌های خاموش/روشن
 * ⚠️ v8.0: min="0" → min="-33" برای پشتیبانی درصد منفی
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
                        min="-33"
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

/**
 * اعتبارسنجی و ذخیره ورودی
 * ⚠️ v8.0: محدوده -33 تا 100 (بجای 0 تا 100)
 */
function handleInput(inputEl, subjectKey) {
    let val = parseFloat(inputEl.value);

    /* محدوده مجاز: -33 تا 100 */
    if (val > 100)  { inputEl.value = 100;  val = 100;  }
    if (val < -33)  { inputEl.value = -33;  val = -33;  }

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
 * ⚠️ v8.0: clamp به -33 بجای 0
 */
function calcSubjectAverage(scores, activeGrades) {
    let numerator   = 0;
    let denominator = 0;

    for (const grade of activeGrades) {
        const p = (scores[grade] != null && !isNaN(scores[grade]))
            ? Math.max(-33, Math.min(100, scores[grade]))
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

/**
 * 📐 محاسبه انحراف معیار وزن‌دار (σ) — NEW in v8.0
 * ─────────────────────────────────────────────────────
 * فرمول:
 *   σ = √( Σ(wⱼ · (x̄ⱼ − Sw)²) / Σwⱼ )
 *
 * wⱼ  = ضریب کنکور درس j
 * x̄ⱼ  = میانگین وزن‌دار درس j
 * Sw  = میانگین کل وزن‌دار
 */
function calculateWeightedSigma(subjectAverages, subjectDefs, Sw) {
    let numerator   = 0;
    let denominator = 0;

    for (const [key, def] of Object.entries(subjectDefs)) {
        if (!isSubjectEnabled(key)) continue;

        const w   = def.konkur_weight;
        const avg = subjectAverages[key] || 0;
        numerator   += w * Math.pow(avg - Sw, 2);
        denominator += w;
    }

    return denominator === 0 ? 0 : Math.sqrt(numerator / denominator);
}

/**
 * 📏 محاسبه coverage factor (φ) — NEW in v8.0
 * ─────────────────────────────────────────────────
 * نشون‌دهنده نسبت پایه‌های پرشده (وزن‌دار) هر درس
 *
 * فرمول:
 *   φⱼ = Σα(پایه‌های دارای ورودی درس j) / Σα(همه پایه‌های درس j)
 *   φ  = Σ(wⱼ · φⱼ) / Σwⱼ
 *
 * مقدار: 0 (هیچ پایه‌ای پر نشده) تا 1 (همه پایه‌ها پر شدن)
 */
function calculateCoverage(subjectDefs) {
    let weightedPhiSum = 0;
    let totalWeight    = 0;

    for (const [key, def] of Object.entries(subjectDefs)) {
        if (!isSubjectEnabled(key)) continue;

        const w = def.konkur_weight;

        let activeAlphaSum = 0;   // مجموع α پایه‌های دارای ورودی
        let totalAlphaSum  = 0;   // مجموع α همه پایه‌ها

        def.grades.forEach(grade => {
            const alpha = getGradeWeight(grade);
            totalAlphaSum += alpha;

            if (isGradeEnabled(key, grade)) {
                const input = document.getElementById(`input_${key}_${grade}`);
                if (input && input.value !== '' && !isNaN(parseFloat(input.value))) {
                    activeAlphaSum += alpha;
                }
            }
        });

        const phiSubject = totalAlphaSum === 0 ? 0 : activeAlphaSum / totalAlphaSum;
        weightedPhiSum += w * phiSubject;
        totalWeight    += w;
    }

    return totalWeight === 0 ? 0 : weightedPhiSum / totalWeight;
}

/**
 * 🏷️ تعیین سطح بر اساس تراز
 */
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
 * 🎯 تابع اصلی محاسبه تراز — مدل v8.0
 * ───────────────────────────────────────
 * فرمول:
 *   T = β₀ + k₁·Sw + k₂·Sw² + k₃·σ + k₄·(1−φ)·Sw
 */
function calculateTraz(majorKey) {
    const major = MAJORS[majorKey];
    if (!major) return null;

    const subjectDefs     = major.subjects;
    const subjectAverages = {};
    const details         = {};

    let activeSubjectCount   = 0;
    let disabledSubjectNames = [];

    /* ───── جمع‌آوری داده‌های هر درس ───── */
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

        const scores       = {};
        const activeGrades = [];
        let disabledGrades = [];

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

    /* ───── محاسبه Sw ───── */
    const Sw = calcWeightedScore(subjectAverages, subjectDefs);

    /* ───── محاسبه σ (انحراف معیار وزن‌دار) — NEW v8.0 ───── */
    const sigma = calculateWeightedSigma(subjectAverages, subjectDefs, Sw);

    /* ───── محاسبه φ (coverage factor) — NEW v8.0 ───── */
    const phi = calculateCoverage(subjectDefs);

    /* ───── فرمول اصلی تراز — v8.0 ───── */
    const trazRaw = MODEL_CONFIG.beta0
                  + MODEL_CONFIG.k1 * Sw
                  + MODEL_CONFIG.k2 * Math.pow(Sw, 2)
                  + MODEL_CONFIG.k3 * sigma
                  + MODEL_CONFIG.k4 * (1 - phi) * Sw;

    const trazRounded = Math.round(trazRaw);
    const level       = getLevel(trazRounded);

    return {
        major:                major.name,
        majorEmoji:           major.emoji,
        traz:                 trazRounded,
        weightedScore:        Math.round(Sw * 100) / 100,
        sigmaVal:             Math.round(sigma * 100) / 100,
        phiVal:               Math.round(phi * 1000) / 1000,
        level,
        subjectAverages,
        details,
        activeSubjectCount,
        disabledSubjectNames,
        formula: `T = ${MODEL_CONFIG.beta0} + (${MODEL_CONFIG.k1})×${Math.round(Sw*100)/100} + (${MODEL_CONFIG.k2})×${Math.round(Sw*100)/100}² + (${MODEL_CONFIG.k3})×${Math.round(sigma*100)/100} + (${MODEL_CONFIG.k4})×(1−${Math.round(phi*1000)/1000})×${Math.round(Sw*100)/100}`,
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
        const sec = document.getElementById('resultSection');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

function renderResult(result) {
    const bento = document.getElementById('resultBento');
    if (!bento) return;

    const level = result.level;

    /* ─── نمایش بخش نتایج ─── */
    const resultSection = document.getElementById('resultSection');
    if (resultSection) resultSection.classList.add('visible');

    /* ───── پیام هشدار دروس خاموش ───── */
    let disabledWarningHTML = '';
    if (result.disabledSubjectNames.length > 0) {
        disabledWarningHTML = `
            <div class="result-card result-card--warning">
                <div class="result-card__title">⚠️ دروس غیرفعال‌شده</div>
                ${result.disabledSubjectNames.map(name => `
                    <div class="result-detail-row">
                        <span class="result-detail-row__name">🔇 ${name}</span>
                        <span class="result-detail-row__value" style="color:var(--pastel-orange)">غیرفعال</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /* ───── پیام coverage — NEW v8.0 ───── */
    let coverageWarningHTML = '';
    if (result.phiVal < 1.0) {
        const coveragePercent = Math.round(result.phiVal * 100);
        coverageWarningHTML = `
            <div class="result-card result-card--coverage">
                <div class="result-card__title">📏 پوشش پایه‌ها: ${coveragePercent}%</div>
                <div class="result-detail-row">
                    <span class="result-detail-row__name">φ = ${result.phiVal}</span>
                    <span class="result-detail-row__value" style="color:var(--pastel-sky)">
                        ${coveragePercent >= 75 ? '⚠️ تخمین تقریبی' : '⚠️ تخمین با خطای بیشتر'}
                    </span>
                </div>
                <div class="result-detail-row" style="opacity:0.7;font-size:0.82rem;">
                    <span class="result-detail-row__name">💡 هرچه پایه‌های بیشتری پر شوند، دقت بالاتر می‌رود</span>
                </div>
            </div>
        `;
    }

    /* ───── تارگت‌ها ───── */
    const targets = [
        { name: "L1 — پزشکی آزاد،پردیس،مازاد",                                          traz: 5700 },
        { name: "L2 — پزشکی یاسوج،بوشهر،ایلام،ساری،یزد،ارومیه،کاشان،زنجان",              traz: 5900 },
        { name: "L3 — پزشکی کرمان،گیلان،تبریز،اهواز،کرمانشاه،همدان،بابل",                traz: 6300 },
        { name: "L4 — پزشکی شیراز،اصفهان،مشهد",                                          traz: 6700 },
        { name: "L4+ — پزشکی قطعی شیراز،اصفهان،مشهد",                                    traz: 7000 },
        { name: "L5 — پزشکی تهران،بهشتی،ایران",                                          traz: 7200 },
    ];

    const targetsHTML = targets.map(t => {
        const diff = t.traz - result.traz;
        let statusClass, statusText;
        if (diff <= 0) {
            statusClass = 'status--reached';
            statusText  = '✅ رسیدی!';
        } else if (diff <= 300) {
            statusClass = 'status--close';
            statusText  = `⬆️ +${diff} تراز`;
        } else {
            statusClass = 'status--far';
            statusText  = `⬆️ +${diff} تراز`;
        }
        return `
            <div class="result-detail-row">
                <span class="result-detail-row__name">${t.name}</span>
                <span class="result-detail-row__value ${statusClass}">${statusText}</span>
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
            <div class="result-detail-row ${isDisabled ? 'result-detail-row--disabled' : ''}">
                <span class="result-detail-row__name">
                    ${d.emoji} ${d.name}
                    ${gradeInfo}
                </span>
                <span class="result-detail-row__weight">×${d.konkur_weight}</span>
                <span class="result-detail-row__value">
                    ${isDisabled ? '🔇 غیرفعال' : d.weightedAverage + '٪'}
                </span>
            </div>
        `;
    }).join('');

    /* ───── ساختار HTML نتیجه ───── */
    bento.innerHTML = `
        <div class="result-card result-card--main">
            <div class="result-traz-label">تراز تخمینی رشته ${result.majorEmoji} ${result.major}</div>
            <div class="result-traz-value">${result.traz.toLocaleString('fa-IR')}</div>
            <div class="result-score-line">
                Sw = ${result.weightedScore} &nbsp;|&nbsp; σ = ${result.sigmaVal} &nbsp;|&nbsp; φ = ${result.phiVal}
            </div>
            <div class="result-level">
                <span class="result-level__emoji">${level.emoji}</span>
                <span class="result-level__name">${level.name}</span>
                <span class="result-level__league">${level.league}</span>
            </div>
            <div class="result-university">${level.university}</div>
        </div>

        ${disabledWarningHTML}
        ${coverageWarningHTML}

        <div class="result-card result-card--details">
            <div class="result-card__title">📋 جزئیات دروس</div>
            ${detailsHTML}
        </div>

        <div class="result-card result-card--targets">
            <div class="result-card__title">🎯 فاصله تا اهداف</div>
            ${targetsHTML}
        </div>

        <div class="result-card result-card--formula">
            <div class="result-card__title">🔬 فرمول محاسبه (v${MODEL_CONFIG.version})</div>
            <div class="result-formula-text" dir="ltr">${result.formula}</div>
        </div>
    `;
}

/* ────────────────────────────────────────────────────────────────
 *  📸 SECTION 12: PNG Export — Canvas API
 * ──────────────────────────────────────────────────────────────── */

/**
 * خروجی PNG از نتایج — v8.0 شامل σ و φ
 */
function exportPNG() {
    if (!currentField) {
        showToast('🎓 اول رشته‌ات رو انتخاب کن!');
        return;
    }

    const result = calculateTraz(currentField);
    if (!result) {
        showToast('📊 اول محاسبه کن، بعد خروجی بگیر!');
        return;
    }

    showToast('📸 در حال ساخت تصویر...');

    try {
        const CANVAS_WIDTH = 1080;
        const PADDING      = 48;
        const LINE_HEIGHT  = 38;
        const dpr          = Math.min(window.devicePixelRatio || 1, 2);

        /* ── اندازه‌گیری ارتفاع ── */
        const tempCanvas  = document.createElement('canvas');
        tempCanvas.width  = CANVAS_WIDTH * dpr;
        tempCanvas.height = 200;
        const tempCtx     = tempCanvas.getContext('2d');
        tempCtx.scale(dpr, dpr);
        const contentH = _drawReport(tempCtx, result, CANVAS_WIDTH, PADDING, LINE_HEIGHT, true);

        /* ── Canvas نهایی ── */
        const canvas  = document.createElement('canvas');
        canvas.width  = CANVAS_WIDTH * dpr;
        canvas.height = contentH * dpr;
        const ctx     = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        _drawReport(ctx, result, CANVAS_WIDTH, PADDING, LINE_HEIGHT, false);

        /* ── دانلود ── */
        const link    = document.createElement('a');
        link.download = `kankor-${currentField}-${Date.now()}.png`;
        link.href     = canvas.toDataURL('image/png');
        link.click();

        showToast('✅ تصویر ذخیره شد!');
    } catch (err) {
        console.error('Export error:', err);
        showToast('❌ خطا در ساخت تصویر');
    }
}

/**
 * رسم گزارش روی Canvas — v8.0 با نمایش σ و φ
 */
function _drawReport(ctx, result, W, PAD, LH, measureOnly) {
    const CW = W - PAD * 2;
    let y = PAD;

    /* ── پس‌زمینه سفید صدفی ── */
    if (!measureOnly) {
        const grad = ctx.createLinearGradient(0, 0, 0, 3000);
        grad.addColorStop(0, '#faf9f7');
        grad.addColorStop(1, '#f0eeeb');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, 3000);
    }

    /* ── هلپرها ── */
    const setFont = (sz, wt = '400') => {
        ctx.font = `${wt} ${sz}px "Vazirmatn", "Segoe UI", Tahoma, sans-serif`;
    };
    const drawText = (text, x, yy, align = 'right') => {
        if (measureOnly) return;
        ctx.textAlign = align;
        ctx.fillText(text, x, yy);
    };
    const drawLine = (x1, yy, x2) => {
        if (measureOnly) return;
        ctx.beginPath();
        ctx.moveTo(x1, yy);
        ctx.lineTo(x2, yy);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth   = 1;
        ctx.stroke();
    };
    const drawRRect = (x, yy, w, h, r, fill) => {
        if (measureOnly) return;
        ctx.beginPath();
        ctx.moveTo(x + r, yy);
        ctx.lineTo(x + w - r, yy);
        ctx.quadraticCurveTo(x + w, yy, x + w, yy + r);
        ctx.lineTo(x + w, yy + h - r);
        ctx.quadraticCurveTo(x + w, yy + h, x + w - r, yy + h);
        ctx.lineTo(x + r, yy + h);
        ctx.quadraticCurveTo(x, yy + h, x, yy + h - r);
        ctx.lineTo(x, yy + r);
        ctx.quadraticCurveTo(x, yy, x + r, yy);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
    };

    /* ── عنوان ── */
    setFont(28, '700');
    ctx.fillStyle = '#2d2d2d';
    drawText(`📊 گزارش تراز ${result.majorEmoji} ${result.major}`, W - PAD, y += 36);

    /* تاریخ */
    setFont(16, '400');
    ctx.fillStyle = '#888';
    try {
        const dateStr = new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(new Date());
        drawText(dateStr, W - PAD, y += 28);
    } catch (_) {
        drawText(new Date().toLocaleDateString('fa-IR'), W - PAD, y += 28);
    }

    y += 16;
    drawLine(PAD, y, W - PAD);
    y += 24;

    /* ── باکس تراز ── */
    drawRRect(PAD, y, CW, 140, 18, '#eef6f0');

    setFont(18, '600');
    ctx.fillStyle = '#555';
    drawText('تراز تخمینی:', W - PAD - 20, y + 32);

    setFont(52, '900');
    ctx.fillStyle = '#1a7f4b';
    drawText(result.traz.toLocaleString('fa-IR'), W - PAD - 20, y + 85);

    /* سطح */
    setFont(18, '600');
    ctx.fillStyle = '#666';
    drawText(`${result.level.emoji} ${result.level.name} — ${result.level.league}`, PAD + CW / 2, y + 32, 'center');

    /* Sw + σ + φ — NEW v8.0 */
    setFont(14, '400');
    ctx.fillStyle = '#888';
    drawText(`Sw = ${result.weightedScore}  |  σ = ${result.sigmaVal}  |  φ = ${result.phiVal}`, PAD + CW / 2, y + 125, 'center');

    y += 158;

    /* ── coverage warning — NEW v8.0 ── */
    if (result.phiVal < 1.0) {
        const cp = Math.round(result.phiVal * 100);
        drawRRect(PAD, y, CW, 48, 12, '#e8f4fd');
        setFont(14, '600');
        ctx.fillStyle = '#4a90d9';
        drawText(`📏 پوشش پایه‌ها: ${cp}% — ${cp >= 75 ? 'تخمین تقریبی' : 'تخمین با خطای بیشتر'}`, W - PAD - 16, y + 30);
        y += 64;
    }

    /* ── جزئیات دروس ── */
    setFont(20, '700');
    ctx.fillStyle = '#333';
    drawText('📋 جزئیات دروس:', W - PAD, y += LH);
    y += 12;

    for (const [key, d] of Object.entries(result.details)) {
        const isOff = d.disabled;
        drawRRect(PAD, y, CW, 42, 10, isOff ? '#f5f5f5' : '#f9f9f7');

        setFont(15, '600');
        ctx.fillStyle = isOff ? '#bbb' : '#333';
        drawText(`${d.emoji} ${d.name}`, W - PAD - 12, y + 28);

        setFont(14, '400');
        ctx.fillStyle = isOff ? '#ccc' : '#666';
        drawText(`×${d.konkur_weight}`, W / 2, y + 28, 'center');

        ctx.fillStyle = isOff ? '#ccc' : '#1a7f4b';
        drawText(isOff ? '🔇 غیرفعال' : `${d.weightedAverage}٪`, PAD + 16, y + 28, 'left');

        y += 50;
    }

    y += 12;
    drawLine(PAD, y, W - PAD);
    y += 20;

    /* ── تارگت‌ها ── */
    setFont(20, '700');
    ctx.fillStyle = '#333';
    drawText('🎯 فاصله تا اهداف:', W - PAD, y += LH);
    y += 12;

    const targets = [
        { name: "L1 — پزشکی آزاد",       traz: 5700 },
        { name: "L2 — پزشکی سایر شهرها",  traz: 5900 },
        { name: "L3 — پزشکی بزرگ‌شهرها",  traz: 6300 },
        { name: "L4 — پزشکی برتر",        traz: 6700 },
        { name: "L4+ — پزشکی قطعی برتر",  traz: 7000 },
        { name: "L5 — پزشکی تهران",       traz: 7200 },
    ];

    for (const t of targets) {
        const diff = t.traz - result.traz;
        let bg, statusTxt, statusColor;
        if (diff <= 0) {
            bg          = '#e6f9ed';
            statusTxt   = '✅ رسیدی!';
            statusColor = '#1a7f4b';
        } else if (diff <= 300) {
            bg          = '#fff8e6';
            statusTxt   = `⬆️ +${diff}`;
            statusColor = '#b88b00';
        } else {
            bg          = '#fef0f0';
            statusTxt   = `⬆️ +${diff}`;
            statusColor = '#c44';
        }

        drawRRect(PAD, y, CW, 40, 8, bg);

        setFont(14, '600');
        ctx.fillStyle = '#444';
        drawText(t.name, W - PAD - 12, y + 26);

        setFont(14, '700');
        ctx.fillStyle = statusColor;
        drawText(statusTxt, PAD + 16, y + 26, 'left');

        y += 48;
    }

    /* ── disabled subjects warning ── */
    if (result.disabledSubjectNames.length > 0) {
        y += 12;
        drawRRect(PAD, y, CW, 36 + result.disabledSubjectNames.length * 30, 10, '#fef5f5');
        setFont(14, '600');
        ctx.fillStyle = '#c44';
        drawText('⚠️ دروس حذف‌شده از محاسبه:', W - PAD - 12, y + 24);
        y += 36;
        for (const name of result.disabledSubjectNames) {
            setFont(13, '400');
            ctx.fillStyle = '#999';
            drawText(`🔇 ${name}`, W - PAD - 20, y + 18);
            y += 30;
        }
        y += 12;
    }

    y += 12;
    drawLine(PAD, y, W - PAD);
    y += 20;

    /* ── فرمول ── */
    setFont(14, '400');
    ctx.fillStyle = '#999';
    drawText(`🔬 مدل v${MODEL_CONFIG.version}`, W - PAD, y += 24);

    setFont(11, '400');
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    if (!measureOnly) ctx.fillText(result.formula, W / 2, y += 22);
    else y += 22;

    y += 24;

    /* ── فوتر ── */
    setFont(13, '400');
    ctx.fillStyle = '#bbb';
    drawText('Kankor Dashboard — ساخته‌شده با ❤️ | ⚠️ تخمین غیررسمی', PAD + CW / 2, y += 20, 'center');
    y += PAD;

    return y;
}

/* ────────────────────────────────────────────────────────────────
 *  🗑️ SECTION 13: Reset (ریست کامل)
 * ──────────────────────────────────────────────────────────────── */

function resetAll() {
    if (!confirm('🗑️ همه داده‌ها پاک بشن؟')) return;

    /* پاک کردن localStorage */
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('kd_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    /* ریست UI */
    currentField = null;
    document.querySelectorAll('.field-card').forEach(card => card.classList.remove('active'));

    const container = document.getElementById('subjectsContainer');
    if (container) container.innerHTML = '';

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
