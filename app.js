// JavaScript for DMV Construction Kerala Tour 2026

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Theme Switch Logic
    // ----------------------------------------------------
    const themeToggle = document.getElementById('checkbox');
    const body = document.body;

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        }
    });

    // ----------------------------------------------------
    // Mobile Sidebar Toggle
    // ----------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');

    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-active');
        const icon = mobileToggle.querySelector('i');
        if (sidebar.classList.contains('mobile-active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // ----------------------------------------------------
    // Navigation & Section Switching
    // ----------------------------------------------------
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    function switchSection(targetSectionId) {
        sections.forEach(sec => sec.classList.remove('active-section'));
        const targetSec = document.getElementById(targetSectionId);
        if (targetSec) {
            targetSec.classList.add('active-section');
        }

        menuItems.forEach(item => {
            if (item.getAttribute('data-section') === targetSectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (sidebar.classList.contains('mobile-active')) {
            sidebar.classList.remove('mobile-active');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
            history.pushState(null, null, `#${sectionId}`);
        });
    });

    // Handle internal link navigation triggers
    const scrollLinks = document.querySelectorAll('.scroll-link');
    scrollLinks.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-section-target');
            switchSection(target);
            history.pushState(null, null, `#${target}`);
        });
    });

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            switchSection(hash);
        } else {
            switchSection('summary');
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    // ----------------------------------------------------
    // Itinerary Tabs Logic
    // ----------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetDay = btn.getAttribute('data-day');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === targetDay) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // ----------------------------------------------------
    // Accordion Logic
    // ----------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // ----------------------------------------------------
    // Resort Option Selection
    // ----------------------------------------------------
    let selectedVagamonResortPrice = 12000;
    let selectedVagamonResortName = "Pine Breeze Cottages";
    let selectedVarkalaResortPrice = 16500;
    let selectedVarkalaResortName = "Krishnatheeram Ayur Holy Beach";

    const resortCards = document.querySelectorAll('.resort-card');
    const selectedResortNamesEl = document.getElementById('selected-resort-names');

    resortCards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-resort-type');
            const price = parseInt(card.getAttribute('data-price'));
            const name = card.querySelector('h4').textContent;

            // Remove active class from sibling cards in the same selector group
            document.querySelectorAll(`.resort-card[data-resort-type="${type}"]`).forEach(c => {
                c.classList.remove('active');
            });

            // Set active class on clicked card
            card.classList.add('active');

            if (type === 'vagamon') {
                selectedVagamonResortPrice = price;
                selectedVagamonResortName = name;
            } else if (type === 'varkala') {
                selectedVarkalaResortPrice = price;
                selectedVarkalaResortName = name;
            }

            // Update budget breakdown names label
            selectedResortNamesEl.textContent = `(${selectedVagamonResortName} & ${selectedVarkalaResortName})`;

            // Recalculate budget
            calculateBudget();
        });
    });

    // ----------------------------------------------------
    // Distance & Travel Time Checker
    // ----------------------------------------------------
    const startSelect = document.getElementById('route-start');
    const endSelect = document.getElementById('route-end');
    const btnCalcDist = document.getElementById('btn-calc-dist');
    const distResultKm = document.getElementById('dist-result-km');
    const timeResultHrs = document.getElementById('time-result-hrs');
    const routeGuideDesc = document.getElementById('route-guide-desc');

    const distanceMatrix = {
        'dharmapuri-grapes': { dist: 326, time: 6.5, desc: "Highway NH44 route via Salem, Dindigul, and Theni. Winding, steep climb begins near Cumbum." },
        'grapes-thekkady': { dist: 28, time: 1.0, desc: "Ascending ghat mountain route via Kumily border post. Keep speeds low due to heavy tourist TT traffic." },
        'thekkady-vagamon': { dist: 45, time: 1.5, desc: "Scenic mountain route climbing past Peermade and Parunthumpara viewpoints. Watch for heavy mist in late afternoon." },
        'vagamon-varkala': { dist: 172, time: 4.0, desc: "Descending ghat roads via Kanjar, routing through main town highways at Kottarakkara, down to Varkala North Cliff coast." },
        'varkala-dharmapuri': { dist: 485, time: 10.0, desc: "Return transit via NH44 highways passing Madurai and Salem. High-speed lanes allow steady 60km/h average speeds." },
        
        // Symmetrical pairs
        'grapes-dharmapuri': { dist: 326, time: 6.5, desc: "Highway NH44 route via Salem, Dindigul, and Theni. Winding, steep climb begins near Cumbum." },
        'thekkady-grapes': { dist: 28, time: 1.0, desc: "Ascending ghat mountain route via Kumily border post. Keep speeds low due to heavy tourist TT traffic." },
        'vagamon-thekkady': { dist: 45, time: 1.5, desc: "Scenic mountain route climbing past Peermade and Parunthumpara viewpoints. Watch for heavy mist in late afternoon." },
        'varkala-vagamon': { dist: 172, time: 4.0, desc: "Descending ghat roads via Kanjar, routing through main town highways at Kottarakkara, down to Varkala North Cliff coast." },
        'dharmapuri-varkala': { dist: 485, time: 10.0, desc: "Return transit via NH44 highways passing Madurai and Salem. High-speed lanes allow steady 60km/h average speeds." }
    };

    btnCalcDist.addEventListener('click', () => {
        const start = startSelect.value;
        const end = endSelect.value;
        const key = `${start}-${end}`;

        if (start === end) {
            distResultKm.textContent = "0 km";
            timeResultHrs.textContent = "0 hrs";
            routeGuideDesc.textContent = "Start and destination points are identical.";
            return;
        }

        const info = distanceMatrix[key];
        if (info) {
            distResultKm.textContent = `${info.dist} km`;
            timeResultHrs.textContent = `${info.time} hrs`;
            routeGuideDesc.textContent = info.desc;
        } else {
            // Compute simple fallback estimates
            const fallbackDist = Math.abs(start.charCodeAt(0) - end.charCodeAt(0)) * 42 + 50;
            const fallbackTime = (fallbackDist / 50).toFixed(1);
            distResultKm.textContent = `${fallbackDist} km`;
            timeResultHrs.textContent = `${fallbackTime} hrs`;
            routeGuideDesc.textContent = `Calculated average driving route from ${startSelect.options[startSelect.selectedIndex].text} to ${endSelect.options[endSelect.selectedIndex].text}. Fits standard 17-Seater TT highway speeds.`;
        }
    });

    // ----------------------------------------------------
    // Interactive Budget Calculator
    // ----------------------------------------------------
    const budgetPax = document.getElementById('budget-pax');
    const budgetKayak = document.getElementById('budget-kayak');
    const budgetSpeedboat = document.getElementById('budget-speedboat');
    const budgetEmergency = document.getElementById('budget-emergency');

    const budgetTotalPriceEl = document.getElementById('budget-total-price');
    const budgetPerHeadPriceEl = document.getElementById('budget-per-head-price');
    const breakdownTransportEl = document.getElementById('breakdown-transport');
    const breakdownStaysEl = document.getElementById('breakdown-stays');
    const breakdownEntryEl = document.getElementById('breakdown-entry');
    const breakdownMealsEl = document.getElementById('breakdown-meals');
    const breakdownContingencyRow = document.getElementById('breakdown-contingency-row');
    const breakdownTaxEl = document.getElementById('breakdown-tax');
    const breakdownTotalEl = document.getElementById('breakdown-total');

    // Rates constants
    const BASE_TRANSPORT = 42000;
    const MEALS_RATE = 800;
    const SIGHTSEEING_DAYS = 4;
    const BASE_ENTRY = 935;
    const KAYAK_RATE = 400;
    const SPEEDBOAT_RATE = 2500;
    const EMERGENCY_BUFFER = 10000;

    function calculateBudget() {
        const pax = parseInt(budgetPax.value);
        const kayakIncluded = budgetKayak.checked;
        const speedboatIncluded = budgetSpeedboat.checked;
        const emergencyIncluded = budgetEmergency.checked;

        // 1. Stays cost based on selected resorts (1 night Vagamon, 2 nights Varkala)
        const staysCost = selectedVagamonResortPrice + (selectedVarkalaResortPrice * 2);

        // 2. Meals & Dining
        const mealsCost = pax * MEALS_RATE * SIGHTSEEING_DAYS;

        // 3. Entry fees & activities
        let entryCost = pax * BASE_ENTRY;
        if (kayakIncluded) {
            entryCost += (pax * KAYAK_RATE);
        }
        if (speedboatIncluded) {
            entryCost += SPEEDBOAT_RATE;
        }

        // 4. Contingency
        const contingencyCost = emergencyIncluded ? EMERGENCY_BUFFER : 0;

        // 5. Base package subtotal
        const baseSubtotal = BASE_TRANSPORT + staysCost + mealsCost + entryCost;

        // 6. Tax / Administrative overhead (10% of base transport, stays, and meals)
        const taxBasis = BASE_TRANSPORT + staysCost + mealsCost;
        const taxCost = Math.round(taxBasis * 0.1);

        // 7. Grand total
        const grandTotal = baseSubtotal + taxCost + contingencyCost;
        const perHeadCost = Math.round(grandTotal / pax);

        // 8. Update UI displays
        budgetTotalPriceEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
        budgetPerHeadPriceEl.textContent = `₹${perHeadCost.toLocaleString('en-IN')}`;
        breakdownTransportEl.textContent = `₹${BASE_TRANSPORT.toLocaleString('en-IN')}`;
        breakdownStaysEl.textContent = `₹${staysCost.toLocaleString('en-IN')}`;
        breakdownEntryEl.textContent = `₹${entryCost.toLocaleString('en-IN')}`;
        breakdownMealsEl.textContent = `₹${mealsCost.toLocaleString('en-IN')}`;
        breakdownTaxEl.textContent = `₹${taxCost.toLocaleString('en-IN')}`;
        breakdownTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        if (emergencyIncluded) {
            breakdownContingencyRow.style.display = 'table-row';
        } else {
            breakdownContingencyRow.style.display = 'none';
        }
    }

    // Calculator event listeners
    budgetPax.addEventListener('change', calculateBudget);
    budgetKayak.addEventListener('change', calculateBudget);
    budgetSpeedboat.addEventListener('change', calculateBudget);
    budgetEmergency.addEventListener('change', calculateBudget);

    // Initial run
    calculateBudget();
});
