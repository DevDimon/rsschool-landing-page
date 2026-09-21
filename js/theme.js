(function () {
    'use strict';

    var STORAGE_KEY = 'theme';
    var root = document.documentElement;
    var toggles = document.querySelectorAll('[data-theme-toggle]');

    function readTheme() {
        var t = root.getAttribute('data-theme');
        if (t !== 'light' && t !== 'dark') {
            try { t = localStorage.getItem(STORAGE_KEY); } catch (e) { t = null; }
        }
        return t === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme, persist) {
        root.setAttribute('data-theme', theme);
        if (persist !== false) {
            try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { }
        }
        toggles.forEach(function (btn) {
            var isDark = theme === 'dark';
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            btn.setAttribute('aria-label',
                isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
        });
    }

    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            applyTheme(readTheme() === 'dark' ? 'light' : 'dark', true);
        });
    });

    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY &&
            (e.newValue === 'light' || e.newValue === 'dark')) {
            applyTheme(e.newValue, false);
        }
    });

    applyTheme(readTheme(), false);
})();