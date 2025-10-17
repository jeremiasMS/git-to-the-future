// 📦 Índice de módulos - Exportaciones centralizadas para fácil importación
export { GitGraphController } from './GitGraphController.js';
export { ConsoleController } from './ConsoleController.js';
export { ScreenController } from './ScreenController.js';
export { ExerciseValidator, SCREEN_EXERCISES } from './ExerciseValidator.js';
export { UIController } from './UIController.js';

// Versión del sistema modular
export const VERSION = '2.0.0';

// Utilidades compartidas
export const Utils = {
  // Generar ID aleatorio
  generateId: () => Math.random().toString(36).slice(2, 11),
  
  // Formatear fecha
  formatDate: (date = new Date()) => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  // Debounce para eventos
  debounce: (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Guardar en localStorage
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  
  // Cargar desde localStorage
  loadFromStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return defaultValue;
    }
  },
  
  // Copiar al portapapeles
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.error('Error copying to clipboard:', e);
      return false;
    }
  },
};

// Configuración global
export const Config = {
  colors: {
    primary: '#2196f3',
    secondary: '#ff9100',
    accent: '#ff4081',
    success: '#4caf50',
    warning: '#ffb74d',
    error: '#f44336',
    background: '#0f0f1e',
    surface: '#1a1a2e',
    text: '#e0e0e0',
    muted: '#717171',
  },
  
  gitGraphOptions: {
    orientation: 'vertical-reverse',
    template: 'metro',
    commitMessageDisplayAuthor: false,
    commitMessageDisplayHash: false,
  },
  
  storage: {
    progressKey: 'git-bttf-progress',
    settingsKey: 'git-bttf-settings',
  },
};

// Sistema de eventos personalizado
export class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

// Logger para debugging
export class Logger {
  static log(message, data = null) {
    console.log(`[Git-BTTF] ${message}`, data || '');
  }

  static warn(message, data = null) {
    console.warn(`[Git-BTTF WARNING] ${message}`, data || '');
  }

  static error(message, error = null) {
    console.error(`[Git-BTTF ERROR] ${message}`, error || '');
  }

  static debug(message, data = null) {
    if (Utils.loadFromStorage('git-bttf-debug', false)) {
      console.debug(`[Git-BTTF DEBUG] ${message}`, data || '');
    }
  }
}

// Información del proyecto
export const AppInfo = {
  name: 'Git to the Future',
  version: VERSION,
  description: 'Aprende Git usando las líneas temporales de Volver al Futuro',
  author: 'MS Projects',
  repository: 'https://github.com/jeremiasMS/git-to-the-future',
};

console.log(`
╔════════════════════════════════════════════╗
║   🚗⚡ Git to the Future v${VERSION}      ║
║   Sistema Modular Cargado                  ║
║   Back to the Future + Git = 🎓           ║
╚════════════════════════════════════════════╝
`);
