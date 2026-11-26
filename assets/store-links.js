/*
 * Store links — every "Get the app / Download" button is written as an App
 * Store campaign link (data-appstore). On Android we swap it for the Google
 * Play link, carrying the same campaign name (ct=…) as a Play referrer so
 * Play Console → Acquisition shows where installs came from.
 * Explicit Play badges (data-playstore) are left alone.
 */
(function () {
  var PLAY = 'https://play.google.com/store/apps/details?id=com.patrikklimko.lumen';
  var ua = navigator.userAgent || '';
  if (!/android/i.test(ua)) return;

  function playUrl(appStoreHref) {
    var ct = 'website';
    try {
      ct = new URL(appStoreHref).searchParams.get('ct') || ct;
    } catch (e) {}
    return PLAY + '&referrer=' + encodeURIComponent('utm_source=aperiaskin.com&utm_medium=website&utm_campaign=' + ct);
  }

  function swap() {
    var links = document.querySelectorAll('a[data-appstore]:not([data-store-swapped])');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      a.setAttribute('data-store-swapped', '1');
      // An App Store badge with a Play badge right next to it: just hide it.
      if (a.parentNode && a.parentNode.querySelector('a[data-playstore]')) {
        a.style.display = 'none';
        continue;
      }
      a.setAttribute('href', playUrl(a.getAttribute('href')));
      var store = a.querySelector('.store');
      if (store) {
        store.textContent = 'Google Play';
        var small = a.querySelector('small');
        if (small) small.textContent = 'Get it on';
        var svg = a.querySelector('svg');
        if (svg) svg.style.display = 'none';
      } else if (/App Store/.test(a.textContent) && !a.querySelector('*')) {
        a.textContent = a.textContent.replace(/on the App Store/i, 'on Google Play').replace(/App Store/g, 'Google Play');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { swap(); });
  } else {
    swap();
  }
  // Buttons rendered later (e.g. the cycle calculator result) — swap those too.
  new MutationObserver(function () { swap(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
