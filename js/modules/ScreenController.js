// 🎯 Controlador de Navegación entre Pantallas
export class ScreenController {
  constructor() {
    this.screens = [
      { id: 1, name: 'Origin', path: 'screen1.html', completed: false, locked: false },
      { id: 2, name: 'Time Travel', path: 'screen2.html', completed: false, locked: true },
      { id: 3, name: 'Dystopia', path: 'screen3.html', completed: false, locked: true },
      { id: 4, name: 'Wild West', path: 'screen4.html', completed: false, locked: true },
      { id: 5, name: 'Demo BTTF', path: 'demo.html', completed: false, locked: true },
    ];

    this.currentScreen = null;
    this.loadProgress();
  }

  // Cargar progreso desde localStorage
  loadProgress() {
    const savedProgress = localStorage.getItem('git-bttf-progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.screens = this.screens.map(screen => {
        const saved = progress.find(s => s.id === screen.id);
        return saved ? { ...screen, completed: saved.completed, locked: saved.locked } : screen;
      });
    }
  }

  // Guardar progreso en localStorage
  saveProgress() {
    const progress = this.screens.map(({ id, completed, locked }) => ({
      id,
      completed,
      locked,
    }));
    localStorage.setItem('git-bttf-progress', JSON.stringify(progress));
  }

  // Obtener pantalla actual
  getCurrentScreen() {
    const currentPath = window.location.pathname.split('/').pop();
    return this.screens.find(s => s.path === currentPath) || null;
  }

  // Marcar pantalla como completada
  completeScreen(screenId) {
    const screen = this.screens.find(s => s.id === screenId);
    if (screen) {
      screen.completed = true;
      
      // Desbloquear siguiente pantalla
      const nextScreen = this.screens.find(s => s.id === screenId + 1);
      if (nextScreen) {
        nextScreen.locked = false;
      }
      
      this.saveProgress();
      this.updateNavigationUI();
    }
  }

  // Verificar si una pantalla está desbloqueada
  isUnlocked(screenId) {
    const screen = this.screens.find(s => s.id === screenId);
    return screen ? !screen.locked : false;
  }

  // Navegar a una pantalla
  navigateTo(screenId) {
    const screen = this.screens.find(s => s.id === screenId);
    
    if (!screen) {
      console.error(`Screen ${screenId} not found`);
      return;
    }

    if (screen.locked) {
      alert('🔒 Esta pantalla está bloqueada. Completa la pantalla anterior primero.');
      return;
    }

    window.location.href = screen.path;
  }

  // Obtener porcentaje de progreso
  getProgressPercentage() {
    const completed = this.screens.filter(s => s.completed).length;
    return Math.round((completed / this.screens.length) * 100);
  }

  // Reiniciar todo el progreso
  resetProgress() {
    this.screens = this.screens.map((screen, index) => ({
      ...screen,
      completed: false,
      locked: index > 0, // Solo la primera pantalla desbloqueada
    }));
    this.saveProgress();
    this.updateNavigationUI();
  }

  // Actualizar UI de navegación
  updateNavigationUI() {
    // Actualizar botones de pantalla
    this.screens.forEach(screen => {
      const btn = document.querySelector(`[data-screen-id="${screen.id}"]`);
      if (btn) {
        btn.classList.remove('navigation__screen--active', 'navigation__screen--completed', 'navigation__screen--locked');
        
        if (screen.completed) {
          btn.classList.add('navigation__screen--completed');
        }
        
        if (screen.locked) {
          btn.classList.add('navigation__screen--locked');
        }
        
        const current = this.getCurrentScreen();
        if (current && current.id === screen.id) {
          btn.classList.add('navigation__screen--active');
        }
      }
    });

    // Actualizar barra de progreso
    const progressBar = document.querySelector('.navigation__progress-bar');
    if (progressBar) {
      progressBar.style.width = `${this.getProgressPercentage()}%`;
    }
  }

  // Generar HTML de navegación
  renderNavigation(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const current = this.getCurrentScreen();
    const progress = this.getProgressPercentage();

    const html = `
      <div class="navigation">
        <div class="navigation__container">
          <div class="navigation__screens">
            ${this.screens.map(screen => `
              <a 
                href="${screen.locked ? '#' : screen.path}" 
                class="navigation__screen ${screen.completed ? 'navigation__screen--completed' : ''} ${screen.locked ? 'navigation__screen--locked' : ''} ${current && current.id === screen.id ? 'navigation__screen--active' : ''}"
                data-screen-id="${screen.id}"
              >
                <div class="navigation__screen-number">${screen.id}</div>
                <span class="navigation__screen-title">${screen.name}</span>
              </a>
            `).join('')}
          </div>
          <div class="navigation__progress">
            <div class="navigation__progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Crear breadcrumb
  renderBreadcrumb(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const current = this.getCurrentScreen();
    if (!current) return;

    const html = `
      <div class="navigation__breadcrumb">
        <a href="../index.html" class="navigation__breadcrumb-item">Inicio</a>
        <span class="navigation__breadcrumb-separator">›</span>
        <span class="navigation__breadcrumb-item navigation__breadcrumb-item--current">${current.name}</span>
      </div>
    `;

    container.innerHTML = html;
  }
}

// Inicializar controlador global
window.screenController = new ScreenController();
