/* ============================================
   Store - Lightweight State Manager
   Uses localStorage + pub/sub pattern
   ============================================ */

const Store = (() => {
  const listeners = {};
  const STORAGE_KEY = 'solartech_';

  function get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEY + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(STORAGE_KEY + key, JSON.stringify(value));
      emit(key, value);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  function remove(key) {
    localStorage.removeItem(STORAGE_KEY + key);
    emit(key, null);
  }

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(data));
    }
  }

  return { get, set, remove, on, emit };
})();
