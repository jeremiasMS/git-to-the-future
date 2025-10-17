// 🔔 Sistema de Notificaciones y Feedback Visual
export class UIController {
  constructor() {
    this.notificationContainer = null;
    this.initializeNotificationContainer();
  }

  // Crear contenedor de notificaciones
  initializeNotificationContainer() {
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
      this.notificationContainer = container;
    } else {
      this.notificationContainer = document.getElementById('notification-container');
    }
  }

  // Mostrar notificación toast
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    notification.innerHTML = `
      <span class="notification__icon">${icons[type] || icons.info}</span>
      <span class="notification__message">${message}</span>
    `;

    notification.style.cssText = `
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
      font-size: 14px;
      font-weight: 500;
    `;

    this.notificationContainer.appendChild(notification);

    // Auto-remover después del duration
    if (duration > 0) {
      setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    return notification;
  }

  // Obtener color según tipo
  getNotificationColor(type) {
    const colors = {
      success: 'linear-gradient(135deg, #4caf50, #66bb6a)',
      error: 'linear-gradient(135deg, #f44336, #e57373)',
      warning: 'linear-gradient(135deg, #ff9800, #ffb74d)',
      info: 'linear-gradient(135deg, #2196f3, #64b5f6)',
    };
    return colors[type] || colors.info;
  }

  // Actualizar indicador de rama
  updateBranchIndicator(branchName, containerId = 'currentBranchIndicator') {
    const indicator = document.getElementById(containerId);
    if (indicator) {
      indicator.textContent = branchName;
      indicator.style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => {
        indicator.style.animation = '';
      }, 500);
    }
  }

  // Actualizar progreso de ejercicios
  updateExerciseProgress(current, total, containerId = 'exerciseProgress') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const percentage = Math.round((current / total) * 100);
    
    container.innerHTML = `
      <div class="exercise-progress">
        <div class="exercise-progress__text">
          Ejercicio ${current}/${total} (${percentage}%)
        </div>
        <div class="exercise-progress__bar">
          <div class="exercise-progress__fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  // Mostrar instrucciones del ejercicio actual
  showExerciseInstructions(exercise, containerId = 'exerciseInstructions') {
    const container = document.getElementById(containerId);
    if (!container || !exercise) return;

    container.innerHTML = `
      <div class="card card--primary exercise-card">
        <div class="exercise-card__header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="exercise-card__title">📝 ${exercise.title}</h3>
          <button class="btn btn--sm" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
            💡 Ver pista
          </button>
          <div style="display: none; position: absolute; right: 20px; top: 70px; background: rgba(255,152,0,0.95); padding: 12px 16px; border-radius: 8px; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 100;">
            ${exercise.hint}
          </div>
        </div>
        <div class="exercise-card__body">
          <p class="exercise-card__description">${exercise.description}</p>
        </div>
      </div>
    `;
  }

  // Mostrar modal de completación
  showCompletionModal(screenName, onContinue) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__overlay"></div>
      <div class="modal__content">
        <div class="modal__header">
          <h2>🎉 ¡Pantalla Completada!</h2>
        </div>
        <div class="modal__body">
          <p>Has completado exitosamente la pantalla <strong>${screenName}</strong></p>
          <p>¡Excelente trabajo aprendiendo Git con Back to the Future! 🚗⚡</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn--primary" id="continueBtn">
            Continuar a la siguiente pantalla →
          </button>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(modal);

    // Evento del botón
    const continueBtn = modal.querySelector('#continueBtn');
    continueBtn.addEventListener('click', () => {
      modal.remove();
      if (onContinue) onContinue();
    });

    // Cerrar con overlay
    const overlay = modal.querySelector('.modal__overlay');
    overlay.addEventListener('click', () => modal.remove());
  }

  // Mostrar loading spinner
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <p class="loading__text">Cargando...</p>
      </div>
    `;
  }

  // Crear confetti de celebración
  createConfetti() {
    const colors = ['#2196f3', '#ff9100', '#ff4081', '#8bc34a', '#7c4dff'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);

      // Remover después de la animación
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  // Highlight de elemento (para tutorial)
  highlightElement(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const highlight = document.createElement('div');
    highlight.className = 'highlight-overlay';
    highlight.innerHTML = `
      <div class="highlight-message">${message}</div>
    `;

    highlight.style.cssText = `
      position: absolute;
      top: ${element.offsetTop - 10}px;
      left: ${element.offsetLeft - 10}px;
      width: ${element.offsetWidth + 20}px;
      height: ${element.offsetHeight + 20}px;
      border: 3px solid #ff9100;
      border-radius: 8px;
      pointer-events: none;
      z-index: 9998;
      animation: pulse 2s infinite;
      box-shadow: 0 0 20px rgba(255, 145, 0, 0.5);
    `;

    document.body.appendChild(highlight);

    // Remover después de 5 segundos
    setTimeout(() => highlight.remove(), 5000);
  }
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
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

  @keyframes confettiFall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  .modal__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .modal__content {
    position: relative;
    background: #1a1a2e;
    border: 2px solid #2196f3;
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: slideInRight 0.3s ease-out;
  }

  .modal__header h2 {
    color: #ff9100;
    margin: 0 0 20px 0;
    font-size: 28px;
  }

  .modal__body {
    color: #e0e0e0;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .modal__footer {
    margin-top: 24px;
  }

  .exercise-progress {
    margin: 16px 0;
  }

  .exercise-progress__text {
    color: #ff9100;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .exercise-progress__bar {
    background: rgba(33, 150, 243, 0.2);
    border-radius: 8px;
    height: 24px;
    overflow: hidden;
    position: relative;
  }

  .exercise-progress__fill {
    background: linear-gradient(90deg, #2196f3, #ff9100);
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 8px;
  }

  .exercise-card {
    margin: 20px 0;
  }

  .exercise-card__header {
    border-bottom: 2px solid rgba(33, 150, 243, 0.3);
    padding-bottom: 12px;
    margin-bottom: 16px;
  }

  .exercise-card__title {
    margin: 0;
    color: #2196f3;
  }

  .exercise-card__description {
    color: #e0e0e0;
    font-size: 16px;
    margin-bottom: 12px;
  }

  .exercise-card__hint {
    color: #ffb74d;
    font-size: 14px;
    font-style: italic;
    background: rgba(255, 145, 0, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 3px solid #ff9100;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .loading__spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(33, 150, 243, 0.2);
    border-top-color: #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading__text {
    margin-top: 16px;
    color: #2196f3;
    font-weight: bold;
  }
`;
document.head.appendChild(style);
