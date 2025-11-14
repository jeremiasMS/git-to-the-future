/**
 * Logger utility for debugging
 */
const Logger = {
  log: (...args) => console.log('[LevelMenu]', ...args),
  error: (...args) => console.error('[LevelMenu]', ...args),
};

/**
 * LevelController
 * Manages the state of 5 levels with localStorage persistence
 * Compatible with git-bttf-standalone.js format
 */
class LevelController {
  constructor() {
    this.levels = [
      { id: 1, name: 'Origin', path: 'screen1.html', completed: false, locked: false },
      { id: 2, name: 'Time Travel', path: 'screen2.html', completed: false, locked: true },
      { id: 3, name: 'Dystopia', path: 'screen3.html', completed: false, locked: true },
      { id: 4, name: 'Wild West', path: 'screen4.html', completed: false, locked: true },
      { id: 5, name: 'Demo BTTF', path: 'demo.html', completed: false, locked: false }, // Demo siempre desbloqueado
    ];
    this.loadProgress();
    Logger.log('Initialized with levels:', this.levels);
  }

  loadProgress() {
    const savedProgress = localStorage.getItem('git-bttf-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        this.levels = this.levels.map((level) => {
          const saved = progress.find((s) => s.id === level.id);
          return saved ? { ...level, completed: saved.completed, locked: saved.locked } : level;
        });
        Logger.log('Progress loaded:', this.levels);
      } catch (e) {
        Logger.error('Error loading progress', e);
      }
    } else {
      Logger.log('No saved progress found, starting fresh');
    }
  }

  saveProgress() {
    const progress = this.levels.map(({ id, completed, locked }) => ({ id, completed, locked }));
    localStorage.setItem('git-bttf-progress', JSON.stringify(progress));
    Logger.log('Progress saved:', progress);
  }

  isLevelUnlocked(levelId) {
    const level = this.levels.find((l) => l.id === levelId);
    return level ? !level.locked : false;
  }

  isLevelCompleted(levelId) {
    const level = this.levels.find((l) => l.id === levelId);
    return level ? level.completed : false;
  }

  isCurrentLevel(levelId) {
    // El nivel actual es el primero que no está completado y no está bloqueado
    const level = this.levels.find((l) => l.id === levelId);
    if (!level) return false;

    // Si está completado, no es el actual
    if (level.completed) return false;

    // Si está bloqueado, no es el actual
    if (level.locked) return false;

    // Demo nunca es "el nivel actual" en términos de progreso
    if (levelId === 5) return false;

    // Verificar que no hay ningún nivel anterior sin completar
    const previousLevels = this.levels.filter((l) => l.id < levelId && l.id <= 4);
    const allPreviousCompleted = previousLevels.every((l) => l.completed);

    return allPreviousCompleted;
  }

  goToLevel(levelId) {
    const level = this.levels.find((l) => l.id === levelId);
    
    if (!level) {
      Logger.error('Level not found:', levelId);
      return false;
    }

    if (level.locked) {
      Logger.log('Level locked:', levelId);
      return false;
    }

    Logger.log('Navigating to level:', levelId);
    window.location.href = `./screens/${level.path}`;
    return true;
  }

  getProgress() {
    // Contar solo los niveles principales (1-4), excluir demo (id=5)
    const mainLevels = this.levels.filter((l) => l.id <= 4);
    const completedLevels = mainLevels.filter((l) => l.completed).length;
    const progress = (completedLevels / mainLevels.length) * 100;
    
    Logger.log(`Progress: ${completedLevels}/${mainLevels.length} = ${progress}%`);
    return Math.round(progress);
  }

  getCompletedCount() {
    return this.levels.filter((l) => l.id <= 4 && l.completed).length;
  }

  getProgressDescription() {
    const completed = this.getCompletedCount();
    
    if (completed === 0) {
      return 'Comienza tu viaje temporal aprendiendo Git';
    } else if (completed < 4) {
      return `${completed} de 4 pantallas completadas - ¡Sigue así!`;
    } else {
      return '🎉 ¡Todas las pantallas completadas! Ahora puedes ver el demo final';
    }
  }
}

/**
 * UIController
 * Manages the UI state of level cards
 */
class UIController {
  constructor(levelController) {
    this.levelController = levelController;
    this.cards = [];
  }

  init() {
    this.cards = document.querySelectorAll('.level-card');
    this.updateAllCards();
    this.updateProgress();
    this.attachEventListeners();
    this.showWelcomeNotification();
    this.scrollToCurrentLevel();
  }

  scrollToCurrentLevel() {
    // Encontrar el nivel actual
    const currentLevel = this.levelController.levels.find((level) => 
      this.levelController.isCurrentLevel(level.id)
    );

    if (currentLevel) {
      const currentCard = document.getElementById(`level${currentLevel.id}`);
      if (currentCard) {
        Logger.log('Scrolling to current level:', currentLevel.id);
        
        // Esperar un momento para que el DOM esté completamente renderizado
        setTimeout(() => {
          // Obtener el contenedor con scroll
          const container = document.querySelector('.levels-menu__content');
          const cardRect = currentCard.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Calcular el offset para centrar la tarjeta
          const offset = cardRect.top - containerRect.top - (containerRect.height / 2) + (cardRect.height / 2);
          
          // Scroll suave con duración personalizada
          container.scrollBy({
            top: offset,
            behavior: 'smooth'
          });
        }, 200);
      }
    } else {
      Logger.log('No current level found (all completed or all locked)');
    }
  }

  updateAllCards() {
    this.cards.forEach((card) => {
      const levelId = parseInt(card.dataset.levelId);
      this.updateCard(card, levelId);
    });
  }

  updateCard(card, levelId) {
    const isUnlocked = this.levelController.isLevelUnlocked(levelId);
    const isCompleted = this.levelController.isLevelCompleted(levelId);
    const isCurrent = this.levelController.isCurrentLevel(levelId);

    // Clear all state classes
    card.classList.remove(
      'level-card--locked',
      'level-card--completed',
      'level-card--active'
    );

    // Remove lock icon if exists
    const existingLock = card.querySelector('.level-card__lock');
    if (existingLock) {
      existingLock.remove();
    }

    // Remove shine element if exists
    const existingShine = card.querySelector('.level-card__shine');
    if (existingShine) {
      existingShine.remove();
    }

    if (!isUnlocked) {
      card.classList.add('level-card--locked');
      // Re-add lock icon if not present
      if (!card.querySelector('.level-card__lock')) {
        const lock = document.createElement('div');
        lock.className = 'level-card__lock';
        lock.textContent = '🔒';
        card.appendChild(lock);
      }
    } else if (isCompleted) {
      card.classList.add('level-card--completed');
      // The check mark is added via CSS ::after pseudo-element
    } else if (isCurrent) {
      card.classList.add('level-card--active');
      // Add shine element for animation
      const shine = document.createElement('div');
      shine.className = 'level-card__shine';
      card.appendChild(shine);
    }
  }

  updateProgress() {
    const progress = this.levelController.getProgress();
    const progressBar = document.querySelector('.progress-bar__fill');
    const progressDesc = document.querySelector('.progress-description');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${Math.round(progress)}%`;
    }

    if (progressDesc) {
      progressDesc.textContent = this.levelController.getProgressDescription();
    }
  }

  attachEventListeners() {
    this.cards.forEach((card) => {
      card.addEventListener('click', () => {
        const levelId = parseInt(card.dataset.levelId);
        const success = this.levelController.goToLevel(levelId);

        if (!success) {
          this.showNotification('🔒 Completa la pantalla anterior primero', 'error');
        }
      });
    });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    // Style
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background:
        type === 'error'
          ? 'rgba(244, 67, 54, 0.95)'
          : 'rgba(33, 150, 243, 0.95)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: '9999',
      fontWeight: '600',
      animation: 'slideInDown 0.3s ease-out',
      minWidth: '300px',
      textAlign: 'center',
    });

    document.body.appendChild(notification);

    if (type === 'error') {
      document.body.style.animation = 'screenShake 0.5s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    }

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showWelcomeNotification() {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome) {
      setTimeout(() => {
        this.showNotification('¡Bienvenido a Git to the Future! 🚀', 'info');
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 500);
    }
  }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translate(-50%, -100px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes screenShake {
    0%, 100% { transform: translate(0, 0); }
    10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 0); }
    20%, 40%, 60%, 80% { transform: translate(5px, 0); }
  }
`;
document.head.appendChild(style);

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  Logger.log('DOM loaded, initializing controllers...');

  const levelController = new LevelController();
  const uiController = new UIController(levelController);
  uiController.init();

  Logger.log('App initialized successfully');
});
