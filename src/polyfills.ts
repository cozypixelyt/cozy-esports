// Lightweight polyfills and hardware detection for Vivo Y16 & older Android/iOS smartphones

(function initLegacyCompat() {
  if (typeof window === 'undefined') return;

  // 1. globalThis polyfill (Chrome < 71, Safari < 12.1)
  if (typeof globalThis === 'undefined') {
    (window as any).globalThis = window;
  }

  // 2. queueMicrotask polyfill (Chrome < 71, Safari < 12.1)
  if (typeof window.queueMicrotask !== 'function') {
    window.queueMicrotask = function (cb: VoidFunction) {
      Promise.resolve().then(cb);
    };
  }

  // 3. Object.hasOwn polyfill (Chrome < 93, Safari < 15.4)
  if (typeof (Object as any).hasOwn !== 'function') {
    (Object as any).hasOwn = function (obj: object, prop: PropertyKey) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }

  // 4. Array.prototype.at & String.prototype.at (Chrome < 92, Safari < 15.4)
  if (typeof (Array.prototype as any).at !== 'function') {
    (Array.prototype as any).at = function (index: number) {
      const len = this.length;
      const k = index >= 0 ? index : len + index;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    };
  }
  if (typeof (String.prototype as any).at !== 'function') {
    (String.prototype as any).at = function (index: number) {
      const len = this.length;
      const k = index >= 0 ? index : len + index;
      if (k < 0 || k >= len) return undefined;
      return this.charAt(k);
    };
  }

  // 5. String.prototype.replaceAll (Chrome < 85, Safari < 13.1)
  if (typeof (String.prototype as any).replaceAll !== 'function') {
    (String.prototype as any).replaceAll = function (search: string | RegExp, replace: string) {
      if (search instanceof RegExp) {
        if (!search.global) {
          throw new TypeError('replaceAll must be called with a global RegExp');
        }
        return this.replace(search, replace);
      }
      return this.split(search).join(replace);
    };
  }

  // 6. crypto.randomUUID fallback (Chrome < 92 or insecure HTTP WebView)
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID !== 'function') {
      (crypto as any).randomUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };
    }
  } catch {
    // ignore read-only crypto
  }

  // 7. Element.prototype.closest fallback (ancient Android WebViews)
  if (typeof Element !== 'undefined' && !Element.prototype.closest) {
    Element.prototype.closest = function (s: string) {
      let el: Element | null = this;
      while (el && el.nodeType === 1) {
        if (el.matches(s)) return el;
        el = el.parentElement;
      }
      return null;
    };
  }

  // 8. Safe scrollTo wrapper for older browsers that choke on ScrollToOptions object
  const origScrollTo = window.scrollTo.bind(window);
  window.scrollTo = function (...args: any[]) {
    try {
      return (origScrollTo as any)(...args);
    } catch {
      if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        return origScrollTo(args[0].left || 0, args[0].top || 0);
      }
    }
  } as any;

  // 9. Detect Vivo Y16 & budget / older Android hardware so GPU-heavy blurs disable automatically
  try {
    const nav = navigator as any;
    const ua = nav.userAgent || '';
    const mem = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8;
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;
    const isOldOrBudgetPhone =
      mem <= 4 ||
      cores <= 4 ||
      /vivo|V2204|V2218|Android\s*[5-9]\.|Android\s*1[0-2]\.|Mobile/i.test(ua);

    if (isOldOrBudgetPhone && typeof document !== 'undefined') {
      document.documentElement.classList.add('lite-gpu');
    }
  } catch {
    // ignore
  }
})();
