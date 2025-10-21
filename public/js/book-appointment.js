// Minimal JS to render slot grid for a single selected day and wire booking to window.api.bookAppointment()

(function () {
    'use strict';

    // CONFIG: show 5 days (today + 4) in the picker
    var DAYS_AHEAD = 4;
    var INTERVAL_MIN = 30;

    var slotGrid = document.getElementById('slot-grid');
    var selectedSlotEl = document.getElementById('selected-slot');
    var warningBanner = document.getElementById('warning-banner');
    var bookBtn = document.getElementById('book-btn');
    var clearBtn = document.getElementById('clear-selection');
    var msgEl = document.getElementById('form-msg');
    var dayPicker = document.getElementById('day-picker');
    var chooseDateBtn = document.getElementById('choose-date');
    var dateInput = document.getElementById('date-input');
    var backBtn = document.getElementById('back-btn');

    // Defensive check - fail early and log which elements are missing
    if (!slotGrid || !selectedSlotEl || !warningBanner || !bookBtn || !clearBtn || !msgEl || !dayPicker || !chooseDateBtn || !dateInput || !backBtn) {
        console.error('book-appointment.js: required DOM elements not found', {
            slotGrid: !!slotGrid,
            selectedSlotEl: !!selectedSlotEl,
            warningBanner: !!warningBanner,
            bookBtn: !!bookBtn,
            clearBtn: !!clearBtn,
            msgEl: !!msgEl,
            dayPicker: !!dayPicker,
            chooseDateBtn: !!chooseDateBtn,
            dateInput: !!dateInput,
            backBtn: !!backBtn
        });
        return;
    }

    var selectedSlotISO = null;
    var bookedSet = new Set();
    var selectedDate = startOfDay(new Date()); // default = today

    // Helpers
    function startOfDay(d) { var c = new Date(d); c.setHours(0,0,0,0); return c; }
    function addDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }

    // min for date input = today
    function setDateInputMin() {
        var t = startOfDay(new Date());
        var yyyy = t.getFullYear();
        var mm = (t.getMonth() + 1).toString().padStart(2, '0');
        var dd = t.getDate().toString().padStart(2, '0');
        dateInput.min = yyyy + '-' + mm + '-' + dd;
    }
    setDateInputMin();

    // Try to fetch booked slots from the preload API if available
    async function fetchBookedSlots() {
        try {
            if (window.api && typeof window.api.getBookedSlots === 'function') {
                var res = await window.api.getBookedSlots();
                var arr = Array.isArray(res) ? res : [];
                return arr.map(function (s) {
                    return (typeof s === 'string' ? s : (s && s.appointment_date));
                }).filter(Boolean);
            }
        } catch (e) {
            console.warn('fetchBookedSlots error', e);
        }
        return [];
    }

    // business hours helper (same rules as server)
    function isBusinessOpen(date) {
        var day = date.getDay(); // 0 Sun, 1 Mon
        var hour = date.getHours();
        if (day === 0 || day === 1) return false;
        if (day >= 2 && day <= 5) return hour >= 9 && hour < 19;
        if (day === 6) return hour >= 8 && hour < 17;
        return false;
    }

    // format helpers
    function fmtTime(d) { return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    function fmtDateShort(d) { return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }
    function fmtSlotDisplay(d) { return fmtTime(d) + ', ' + fmtDateShort(d); }
    function dayLabel(d, isToday) { return isToday ? 'Today' : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }

    // Render day picker (today .. today + DAYS_AHEAD)
    function renderDayPicker() {
        dayPicker.innerHTML = '';
        var today = startOfDay(new Date());
        for (var i = 0; i <= DAYS_AHEAD; i++) {
            (function (i) {
                var d = addDays(today, i);
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'day-btn';
                btn.dataset.date = d.toISOString();
                btn.setAttribute('aria-pressed', 'false');
                var isToday = i === 0;
                btn.textContent = dayLabel(d, isToday);
                // mark selected if matches selectedDate
                if (startOfDay(selectedDate).getTime() === startOfDay(d).getTime()) {
                    btn.classList.add('selected');
                    btn.setAttribute('aria-pressed', 'true');
                }
                // disable days that are fully in the past (shouldn't happen since we start at today)
                if (d.getTime() < today.getTime()) {
                    btn.setAttribute('aria-disabled', 'true');
                    btn.disabled = true;
                }
                btn.addEventListener('click', function () {
                    var iso = this.dataset.date;
                    selectedDate = startOfDay(new Date(iso));
                    Array.prototype.forEach.call(dayPicker.querySelectorAll('.day-btn'), function (el) {
                        el.classList.remove('selected');
                        el.setAttribute('aria-pressed', 'false');
                    });
                    this.classList.add('selected');
                    this.setAttribute('aria-pressed', 'true');
                    selectedSlotISO = null;
                    selectedSlotEl.textContent = 'None';
                    bookBtn.disabled = true;
                    warningBanner.style.display = 'none';
                    generateSlotsForDate(selectedDate);
                });
                dayPicker.appendChild(btn);
            })(i);
        }
    }

    // date chooser button opens hidden date input
    chooseDateBtn.addEventListener('click', function () {
        dateInput.focus();
        dateInput.click();
    });

    dateInput.addEventListener('change', function () {
        if (!this.value) return;
        var picked = new Date(this.value + 'T00:00:00');
        var today = startOfDay(new Date());
        if (picked.getTime() < today.getTime()) {
            msgEl.textContent = 'Please choose today or a future date.';
            return;
        }
        selectedDate = startOfDay(picked);
        // reflect selection in picker (if inside displayed range); otherwise clear picker highlight
        var matched = false;
        Array.prototype.forEach.call(dayPicker.querySelectorAll('.day-btn'), function (el) {
            if (startOfDay(new Date(el.dataset.date)).getTime() === selectedDate.getTime()) {
                el.classList.add('selected');
                el.setAttribute('aria-pressed', 'true');
                matched = true;
            } else {
                el.classList.remove('selected');
                el.setAttribute('aria-pressed', 'false');
            }
        });
        selectedSlotISO = null;
        selectedSlotEl.textContent = 'None';
        bookBtn.disabled = true;
        warningBanner.style.display = 'none';
        msgEl.textContent = '';
        generateSlotsForDate(selectedDate);
    });

    // Back button
    backBtn.addEventListener('click', function () {
        // go back to dashboard
        window.location.href = '/dashboard.html';
    });

    // create slots for a single date
    async function generateSlotsForDate(date) {
        slotGrid.innerHTML = '<div class="loading">Loading...</div>';
        var booked = await fetchBookedSlots();
        bookedSet = new Set(booked.map(function (b) {
            try { return (new Date(b)).toISOString(); } catch (e) { return String(b); }
        }));

        slotGrid.innerHTML = '';
        var now = new Date();
        var isToday = startOfDay(now).getTime() === startOfDay(date).getTime();

        // skip closed days but still show message/empty grid
        var dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 1) {
            var note = document.createElement('div');
            note.className = 'note';
            note.textContent = 'Closed on this day.';
            slotGrid.appendChild(note);
            return;
        }

        var start = 9, end = 19;
        if (dayOfWeek === 6) { start = 8; end = 17; } // Saturday

        for (var h = start; h < end; h++) {
            for (var m = 0; m < 60; m += INTERVAL_MIN) {
                var slot = new Date(date);
                slot.setHours(h, m, 0, 0);
                // skip slots in the past for today
                if (isToday && slot.getTime() <= now.getTime()) continue;

                var iso = slot.toISOString();
                var isOpen = isBusinessOpen(slot);
                var isBooked = bookedSet.has(iso);

                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'slot ' + (isBooked ? 'unavailable' : (isOpen ? 'available' : 'unavailable'));
                btn.dataset.iso = iso;
                btn.title = fmtSlotDisplay(slot);
                btn.textContent = fmtTime(slot);
                if (isBooked) btn.dataset.state = 'booked';
                slotGrid.appendChild(btn);
            }
        }

        // attach handlers
        var slotEls = slotGrid.querySelectorAll('.slot');
        Array.prototype.forEach.call(slotEls, function (el) {
            el.addEventListener('click', onSlotClick);
        });

        // if no slots were created (e.g. all in past), show message
        if (slotGrid.children.length === 0) {
            var none = document.createElement('div');
            none.className = 'note';
            none.textContent = 'No available slots for this day.';
            slotGrid.appendChild(none);
        }
    }

    function onSlotClick(ev) {
        var b = ev.currentTarget;
        if (b.classList.contains('unavailable')) return;
        // clear previous selection UI
        var prev = slotGrid.querySelectorAll('.slot.selected');
        Array.prototype.forEach.call(prev, function (x) { x.classList.remove('selected'); });
        b.classList.add('selected');
        selectedSlotISO = b.dataset.iso;
        var d = new Date(selectedSlotISO);
        selectedSlotEl.textContent = fmtSlotDisplay(d);
        bookBtn.disabled = false;
        if (isBusinessOpen(d)) {
            warningBanner.style.display = 'none';
            warningBanner.setAttribute('aria-hidden', 'true');
        } else {
            warningBanner.style.display = 'block';
            warningBanner.setAttribute('aria-hidden', 'false');
        }
        msgEl.textContent = '';
    }

    clearBtn.addEventListener('click', function () {
        selectedSlotISO = null;
        selectedSlotEl.textContent = 'None';
        var prev = slotGrid.querySelectorAll('.slot.selected');
        Array.prototype.forEach.call(prev, function (x) { x.classList.remove('selected'); });
        bookBtn.disabled = true;
        warningBanner.style.display = 'none';
        warningBanner.setAttribute('aria-hidden', 'true');
        msgEl.textContent = '';
    });

    // booking handler: gather inputs and call window.api.bookAppointment if present
    bookBtn.addEventListener('click', async function () {
        if (!selectedSlotISO) return;

        var gender = (document.querySelector('input[name="gender"]:checked') || {}).value || 'male';
        var washing = !!(document.querySelector('input[name="washing"]') || {}).checked;
        var coloring = !!(document.querySelector('input[name="coloring"]') || {}).checked;
        var cut = !!(document.querySelector('input[name="cut"]') || {}).checked;
        var employee_name = (document.getElementById('employee_name') || { value: '' }).value.trim();
        var notes = (document.getElementById('notes') || { value: '' }).value.trim();

        var payload = {
            appointment_date: selectedSlotISO,
            gender: gender,
            washing: washing,
            coloring: coloring,
            cut: cut,
            employee_name: employee_name,
            notes: notes
        };

        bookBtn.disabled = true;
        bookBtn.textContent = 'Booking...';
        msgEl.textContent = '';

        try {
            if (!window.api || typeof window.api.bookAppointment !== 'function') {
                throw new Error('Booking API not available in this environment.');
            }
            await window.api.bookAppointment(payload);
            msgEl.textContent = 'Booked! Redirecting...';
            setTimeout(function () { window.location.href = '/dashboard.html'; }, 900);
        } catch (err) {
            msgEl.textContent = err && err.message ? err.message : 'Failed to book appointment.';
            bookBtn.disabled = false;
            bookBtn.textContent = 'Book';
        }
    });

    // init
    renderDayPicker();
    generateSlotsForDate(selectedDate);

})();