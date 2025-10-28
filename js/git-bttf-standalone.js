// ============================================================================
// Git to the Future - Clases JavaScript sin módulos ES6  
// Versión consolidada para funcionar sin servidor HTTP
// ============================================================================

// Logger simple
const Logger = {
  log: (message, data = null) => console.log(`[Git-BTTF] ${message}`, data || ''),
  warn: (message, data = null) => console.warn(`[Git-BTTF WARNING] ${message}`, data || ''),
  error: (message, error = null) => console.error(`[Git-BTTF ERROR] ${message}`, error || '')
};

// ============================================================================
// ScreenController simplificado
// ============================================================================
class ScreenController {
  constructor() {
    this.screens = [
      { id: 1, name: 'Origin', path: 'screen1.html', completed: false, locked: false },
      { id: 2, name: 'Time Travel', path: 'screen2.html', completed: false, locked: true },
      { id: 3, name: 'Dystopia', path: 'screen3.html', completed: false, locked: true },
      { id: 4, name: 'Wild West', path: 'screen4.html', completed: false, locked: true },
      { id: 5, name: 'Demo BTTF', path: 'demo.html', completed: false, locked: true },
    ];
    this.loadProgress();
  }

  loadProgress() {
    const savedProgress = localStorage.getItem('git-bttf-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        this.screens = this.screens.map((screen) => {
          const saved = progress.find((s) => s.id === screen.id);
          return saved ? { ...screen, completed: saved.completed, locked: saved.locked } : screen;
        });
      } catch (e) {
        Logger.error('Error loading progress', e);
      }
    }
  }

  saveProgress() {
    const progress = this.screens.map(({ id, completed, locked }) => ({ id, completed, locked }));
    localStorage.setItem('git-bttf-progress', JSON.stringify(progress));
  }

  completeScreen(screenId) {
    const screen = this.screens.find(s => s.id === screenId);
    if (screen) {
      screen.completed = true;
      const nextScreen = this.screens.find(s => s.id === screenId + 1);
      if (nextScreen) {
        nextScreen.locked = false;
      }
      this.saveProgress();
    }
  }

  navigateTo(screenId) {
    const screen = this.screens.find(s => s.id === screenId);
    if (!screen) {
      Logger.error(`Screen ${screenId} not found`);
      return;
    }
    if (screen.locked) {
      alert('🔒 Esta pantalla está bloqueada. Completa la pantalla anterior primero.');
      return;
    }
    window.location.href = screen.path;
  }

  renderNavigation(containerId) {
    // Implementación simplificada
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div style="text-align: center; padding: 10px; background: rgba(33,150,243,0.1); margin-bottom: 20px;">Navegación de pantallas (simplificada)</div>';
    }
  }

  renderBreadcrumb(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<nav><a href="../index-menu.html">← Volver al menú</a></nav>';
    }
  }
}

// ============================================================================
// UIController simplificado
// ============================================================================
class UIController {
  constructor() {
    this.initializeNotificationContainer();
  }

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
    }
  }

  showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const colors = {
      success: 'linear-gradient(135deg, #4caf50, #66bb6a)',
      error: 'linear-gradient(135deg, #f44336, #e57373)',
      warning: 'linear-gradient(135deg, #ff9800, #ffb74d)',
      info: 'linear-gradient(135deg, #2196f3, #64b5f6)',
    };

    notification.innerHTML = `
      <span style="font-size: 16px;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;

    notification.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      animation: slideInRight 0.3s ease-out;
    `;

    container.appendChild(notification);

    if (duration > 0) {
      setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }
  }

  updateBranchIndicator(branchName, containerId = 'currentBranchIndicator') {
    const indicator = document.getElementById(containerId);
    if (indicator) {
      indicator.textContent = branchName;
    }
  }

  updateExerciseProgress(current, total, containerId = 'exerciseProgress') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const percentage = Math.round((current / total) * 100);
    
    // Crear línea temporal horizontal
    let timelineHTML = '<div style="background: rgba(33,150,243,0.1); padding: 20px; border-radius: 12px; margin: 16px 0; overflow-x: auto;">';
    timelineHTML += '<div style="display: flex; align-items: center; min-width: max-content; gap: 12px; padding: 8px 0;">';
    
    for (let i = 1; i <= total; i++) {
      const isCompleted = i < current;
      const isCurrent = i === current;
      const isPending = i > current;
      
      let circleColor = '#666';
      let circleSize = '32px';
      let icon = i;
      
      if (isCompleted) {
        circleColor = '#4caf50';
        icon = '✓';
      } else if (isCurrent) {
        circleColor = '#ff9100';
        circleSize = '40px';
        icon = i;
      } else {
        circleColor = '#424242';
        icon = i;
      }
      
      // Círculo del ejercicio
      timelineHTML += `
        <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
          <div style="
            width: ${circleSize}; 
            height: ${circleSize}; 
            border-radius: 50%; 
            background: ${circleColor}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: ${isCurrent ? '18px' : '14px'};
            box-shadow: ${isCurrent ? '0 0 20px rgba(255,145,0,0.6)' : 'none'};
            transition: all 0.3s ease;
            ${isCurrent ? 'animation: pulse 2s infinite;' : ''}
          ">
            ${icon}
          </div>
          <div style="
            margin-top: 8px; 
            font-size: 11px; 
            color: ${isCurrent ? '#ff9100' : isCompleted ? '#4caf50' : '#888'}; 
            font-weight: ${isCurrent ? 'bold' : 'normal'};
            white-space: nowrap;
          ">
            ${isCompleted ? 'Completado' : isCurrent ? 'En progreso' : 'Pendiente'}
          </div>
        </div>
      `;
      
      // Línea conectora (excepto después del último)
      if (i < total) {
        const lineColor = i < current ? '#4caf50' : '#424242';
        timelineHTML += `
          <div style="
            flex: 1; 
            height: 3px; 
            background: ${lineColor}; 
            min-width: 40px;
            margin: 0 4px;
            align-self: center;
            margin-bottom: 28px;
          "></div>
        `;
      }
    }
    
    timelineHTML += '</div>';
    timelineHTML += `
      <div style="text-align: center; margin-top: 16px; color: #e0e0e0;">
        <strong style="color: #ff9100;">${current}/${total} ejercicios</strong> 
        <span style="color: #888;">• ${percentage}% completado</span>
      </div>
    `;
    timelineHTML += '</div>';
    
    // Agregar animación de pulso
    timelineHTML += `
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `;
    
    container.innerHTML = timelineHTML;
  }

  showExerciseInstructions(exercise, containerId = 'exerciseInstructions') {
    const container = document.getElementById(containerId);
    if (!container || !exercise) return;

    container.innerHTML = `
      <div style="background: rgba(33,150,243,0.1); border: 2px solid #2196f3; border-radius: 12px; padding: 24px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="color: #2196f3; margin: 0;">📝 ${exercise.title}</h3>
          <button onclick="alert('💡 ${exercise.hint}')" style="background: #ff9100; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
            💡 Ver pista
          </button>
        </div>
        <div>
          <p style="color: #e0e0e0; font-size: 16px; margin-bottom: 12px;">${exercise.description}</p>
        </div>
      </div>
    `;
  }

  showCompletionModal(screenName, onContinue) {
    if (confirm(`🎉 ¡Has completado la pantalla ${screenName}!\n\n¿Quieres continuar a la siguiente pantalla?`)) {
      if (onContinue) onContinue();
    }
  }

  createConfetti() {
    // Efecto simple de confetti
    const colors = ['#2196f3', '#ff9100', '#ff4081', '#8bc34a', '#7c4dff'];
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: 1;
        animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  }
}

// ============================================================================
// GitGraphController mejorado
// ============================================================================
class GitGraphController {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.gitgraph = null;
    this.branches = {};
    this.currentBranch = 'main';
    this.commitCount = 0;
    this.initialized = false;
    this.showEmptyState();
  }

  showEmptyState() {
    if (!this.container) return;
    
    this.initialized = false;
    this.container.innerHTML = `
      <div class="graph__empty">
        <div class="graph__empty-text">Visualizador de Líneas Temporales</div>
        <div class="graph__empty-hint">Aquí verás todas las ramas, commits y fusiones de tu repositorio Git en forma de árbol visual. Ejecuta "git init" para comenzar.</div>
      </div>
    `;
    Logger.log('Estado vacío mostrado');
  }

  init() {
    if (!this.container) {
      Logger.error('Contenedor del gráfico no encontrado');
      return false;
    }
    
    // Limpiar contenedor completamente
    this.container.innerHTML = '';
    
    // Verificar si GitGraph está disponible
    if (typeof GitgraphJS !== 'undefined') {
      try {
        Logger.log('Inicializando GitGraph...');
        
        // Crear el gitgraph en el contenedor
        this.gitgraph = GitgraphJS.createGitgraph(this.container, {
          orientation: 'vertical-reverse',
          mode: 'compact',
          template: GitgraphJS.templateExtend(GitgraphJS.TemplateName.Metro, {
            colors: ['#2196f3', '#ff9100', '#ff4081', '#4caf50', '#7c4dff', '#9c27b0'],
            branch: { 
              lineWidth: 4,
              spacing: 50,
              label: {
                display: true,
                bgColor: '#1a1a2e',
                color: '#e0e0e0',
                strokeColor: '#2196f3',
                borderRadius: 6,
                font: 'normal 12pt Arial'
              }
            },
            commit: { 
              spacing: 60, 
              dot: { 
                size: 12,
                strokeWidth: 3
              },
              message: {
                display: true,
                displayAuthor: false,
                displayHash: false,
                font: 'normal 12pt Arial',
                color: '#e0e0e0'
              }
            }
          })
        });
        
        // Crear rama principal
        this.branches.main = this.gitgraph.branch('main');
        this.currentBranch = 'main';
        this.commitCount = 0;
        this.initialized = true;
        
        // Crear un commit inicial para que se vea algo
        this.branches.main.commit({
          subject: 'Repositorio inicializado',
          hash: this.generateHash(),
          style: {
            dot: { color: '#2196f3' },
            message: { color: '#e0e0e0' }
          }
        });
        this.commitCount++;
        
        Logger.log('✅ GitGraph inicializado correctamente con commit inicial');
        return true;
      } catch (e) {
        Logger.error('Error inicializando GitGraph', e);
        this.container.innerHTML = `
          <div class="graph__empty">
            <div class="graph__empty-icon">⚠️</div>
            <div class="graph__empty-text">Error al inicializar el gráfico</div>
            <div class="graph__empty-hint">Error: ${e.message}</div>
          </div>
        `;
        return false;
      }
    } else {
      Logger.warn('GitgraphJS no está disponible aún');
      this.container.innerHTML = `
        <div class="graph__empty">
          <div class="graph__empty-icon">⏳</div>
          <div class="graph__empty-text">Cargando GitGraph...</div>
          <div class="graph__empty-hint">Esperando la librería...</div>
        </div>
      `;
      
      // Reintentar después de un momento
      setTimeout(() => this.init(), 1000);
      return false;
    }
  }

  commit(message, options = {}) {
    if (!this.initialized || !this.gitgraph || !this.branches[this.currentBranch]) {
      Logger.warn('GitGraph no inicializado para commit');
      return false;
    }
    
    try {
      // Colores según la rama
      const branchColors = {
        'main': '#2196f3',
        '1955': '#ff9100',
        '2015': '#4caf50',
        'distopia': '#f44336',
        '1885': '#9c27b0'
      };
      
      const color = branchColors[this.currentBranch] || '#64b5f6';
      
      this.branches[this.currentBranch].commit({
        subject: message,
        hash: `${this.generateHash()}`,
        style: {
          dot: { color: color, strokeWidth: 3 },
          message: { 
            color: '#e0e0e0',
            displayAuthor: false,
            displayHash: false,
            font: 'normal 11pt Arial'
          }
        },
        ...options
      });
      
      this.commitCount++;
      Logger.log(`✅ Commit #${this.commitCount} en rama '${this.currentBranch}': ${message}`);
      return true;
    } catch (e) {
      Logger.error('Error creating commit', e);
      return false;
    }
  }

  branch(branchName) {
    if (!this.initialized || !this.gitgraph) {
      Logger.warn('GitGraph no inicializado para crear rama');
      return false;
    }
    
    if (this.branches[branchName]) {
      Logger.warn(`La rama ${branchName} ya existe`);
      return false;
    }
    
    try {
      // Crear la rama visualmente desde la rama actual
      this.branches[branchName] = this.branches[this.currentBranch].branch({
        name: branchName,
        style: {
          label: {
            display: true,
            bgColor: '#1a1a2e',
            color: '#ff9100',
            strokeColor: '#ff9100',
            borderRadius: 6,
            font: 'bold 12pt Arial'
          }
        }
      });
      
      Logger.log(`✅ Rama '${branchName}' creada desde '${this.currentBranch}'`);
      return true;
    } catch (e) {
      Logger.error('Error creating branch', e);
      return false;
    }
  }

  checkout(branchName) {
    if (!this.branches[branchName]) {
      Logger.warn(`La rama ${branchName} no existe`);
      return false;
    }
    
    const previousBranch = this.currentBranch;
    this.currentBranch = branchName;
    
    Logger.log(`✅ Cambiado de '${previousBranch}' a '${branchName}'`);
    Logger.log(`💡 Ahora estás trabajando en la rama '${branchName}'`);
    
    // Sugerencia visual
    if (this.branches[branchName]) {
      Logger.log(`📊 Los próximos commits se agregarán a '${branchName}'`);
    }
    
    return true;
  }

  merge(sourceBranch) {
    if (!this.gitgraph || !this.branches[sourceBranch] || !this.branches[this.currentBranch]) return false;
    
    try {
      this.branches[this.currentBranch].merge(this.branches[sourceBranch]);
      return true;
    } catch (e) {
      Logger.error('Error merging branch', e);
      return false;
    }
  }

  merge(sourceBranch) {
    if (!this.initialized || !this.gitgraph || !this.branches[sourceBranch] || !this.branches[this.currentBranch]) {
      Logger.warn('No se puede fusionar: ramas no disponibles');
      return false;
    }
    
    try {
      this.branches[this.currentBranch].merge(this.branches[sourceBranch]);
      Logger.log(`Rama ${sourceBranch} fusionada en ${this.currentBranch}`);
      return true;
    } catch (e) {
      Logger.error('Error merging branch', e);
      return false;
    }
  }

  reset() {
    this.branches = {};
    this.currentBranch = 'main';
    this.commitCount = 0;
    this.initialized = false;
    this.showEmptyState();
    Logger.log('GitGraph reseteado');
  }

  generateHash() {
    return Math.random().toString(36).substring(2, 8);
  }
}

// ============================================================================
// ConsoleController simplificado
// ============================================================================
class ConsoleController {
  constructor(outputId, inputId, graphController = null) {
    this.outputElement = document.getElementById(outputId);
    this.inputElement = document.getElementById(inputId);
    this.graphController = graphController;
    this.validator = null;
    this.isFirstCommand = true; // Bandera para detectar primer comando
    
    this.state = {
      initialized: false,
      staged: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: []
    };
    
    // Mostrar mensaje de bienvenida en la consola
    this.showWelcomeMessage();
  }
  
  showWelcomeMessage() {
    if (!this.outputElement) return;
    
    this.addOutput('', 'info');
    this.addOutput('', 'info');
    this.addOutput('Terminal Git Interactiva', 'info');
    this.addOutput('', 'info');
    this.addOutput('Aquí verás todos los comandos que ejecutes y sus resultados.', 'info');
    this.addOutput('Escribe comandos Git para interactuar con tu repositorio.', 'info');
    this.addOutput('', 'info');
    this.addOutput('Escribe "help" o "ayuda" para ver los comandos disponibles', 'info');
    this.addOutput('', 'info');
  }

  clearWelcomeMessage() {
    // Limpiar el mensaje de bienvenida al ejecutar el primer comando
    if (this.isFirstCommand && this.outputElement) {
      this.outputElement.innerHTML = '';
      this.isFirstCommand = false;
    }
  }

  setValidator(validator) {
    this.validator = validator;
  }

  executeCommand(commandString) {
    // Limpiar mensaje de bienvenida antes de ejecutar el primer comando
    this.clearWelcomeMessage();

    const parts = commandString.toLowerCase().trim().split(' ');
    const isGitCommand = parts[0] === 'git';
    const command = isGitCommand ? parts[1] : parts[0];
    const args = isGitCommand ? parts.slice(2) : parts.slice(1);

    this.addOutput(`$ ${commandString}`, 'command');

    switch (command) {
      case 'init':
        this.gitInit();
        break;
      case 'status':
        this.gitStatus();
        break;
      case 'add':
        this.gitAdd(args);
        break;
      case 'commit':
        this.gitCommit(args);
        break;
      case 'branch':
        if (args.length > 0) {
          this.gitBranch(args[0]);
        } else {
          this.gitBranchList();
        }
        break;
      case 'checkout':
        this.gitCheckout(args);
        break;
      case 'merge':
        this.gitMerge(args);
        break;
      case 'rebase':
        this.gitRebase(args);
        break;
      case 'pull':
        this.gitPull(args);
        break;
      case 'push':
        this.gitPush(args);
        break;
      case 'log':
        this.gitLog();
        break;
      case 'clear':
        this.clearOutput();
        break;
      case 'help':
      case 'ayuda':
        this.showHelp();
        break;
      default:
        this.addOutput(`git: '${command}' no es un comando git válido`, 'error');
    }
  }

  gitInit() {
    if (this.state.initialized) {
      this.addOutput('El repositorio ya está inicializado', 'warning');
      return;
    }
    
    this.state.initialized = true;
    this.addOutput('Repositorio Git inicializado correctamente', 'success');
    
    if (this.graphController) {
      const success = this.graphController.init();
      if (success) {
        this.addOutput('📊 Gráfico Git inicializado', 'success');
      } else {
        this.addOutput('⚠️ Gráfico Git no disponible aún', 'warning');
      }
    }
  }

  gitStatus() {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    this.addOutput(`En la rama ${this.state.currentBranch}`, 'info');
    
    if (this.state.staged.length === 0) {
      this.addOutput('No hay cambios para confirmar', 'info');
    } else {
      this.addOutput('Cambios a ser confirmados:', 'info');
      this.state.staged.forEach(file => {
        this.addOutput(`  nuevo archivo: ${file}`, 'success');
      });
    }
  }

  gitAdd(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Nothing specified, nothing added.', 'warning');
      return;
    }

    const file = args[0];
    if (file === '.') {
      this.state.staged = ['archivo1.txt', 'archivo2.txt'];
      this.addOutput('Archivos agregados al staging area', 'success');
    } else {
      if (!this.state.staged.includes(file)) {
        this.state.staged.push(file);
      }
      this.addOutput(`Archivo '${file}' agregado al staging area`, 'success');
    }
  }

  gitCommit(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (this.state.staged.length === 0) {
      this.addOutput('No hay cambios en el staging area', 'warning');
      return;
    }

    const messageIndex = args.indexOf('-m');
    if (messageIndex === -1 || messageIndex === args.length - 1) {
      this.addOutput('Error: falta el mensaje del commit (-m)', 'error');
      return;
    }

    const message = args.slice(messageIndex + 1).join(' ').replace(/['"]/g, '');
    
    this.state.commits.push({
      message: message,
      files: [...this.state.staged],
      branch: this.state.currentBranch
    });

    const hash = this.generateHash();
    this.addOutput(`[${this.state.currentBranch} ${hash}] ${message}`, 'success');
    this.addOutput(`${this.state.staged.length} archivo(s) cambiados`, 'info');

    // Actualizar gráfico
    if (this.graphController) {
      const success = this.graphController.commit(message);
      if (success) {
        // Indicar visualmente en qué rama se hizo el commit
        const branchIcon = this.state.currentBranch === 'main' ? '🔵' : '🟠';
        this.addOutput(`📊 ${branchIcon} Commit en rama '${this.state.currentBranch}' agregado al gráfico`, 'success');
        
        // Si hay múltiples ramas, indicar la bifurcación
        if (this.state.branches.length > 1) {
          this.addOutput(`🌳 Ramas activas: ${this.state.branches.join(', ')}`, 'info');
        }
      } else {
        this.addOutput('⚠️ No se pudo agregar al gráfico', 'warning');
      }
    }

    this.state.staged = [];
  }

  gitBranch(branchName) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (this.state.branches.includes(branchName)) {
      this.addOutput(`La rama '${branchName}' ya existe`, 'warning');
      return;
    }

    this.state.branches.push(branchName);
    this.addOutput(`Rama '${branchName}' creada desde '${this.state.currentBranch}'`, 'success');

    if (this.graphController) {
      const success = this.graphController.branch(branchName);
      if (success) {
        // Hacer checkout temporal y crear commit inicial para visualizar la rama
        const previousBranch = this.state.currentBranch;
        this.graphController.checkout(branchName);
        this.graphController.commit(`Creada rama ${branchName}`);
        
        // Volver a la rama anterior
        this.graphController.checkout(previousBranch);
        this.state.currentBranch = previousBranch; // Mantener el estado correcto
        
        this.addOutput(`🌿 Rama '${branchName}' creada y visible en el gráfico`, 'success');
        this.addOutput(`💡 Usa 'git checkout ${branchName}' para cambiar a esta rama`, 'info');
      } else {
        this.addOutput('⚠️ No se pudo agregar la rama al gráfico', 'warning');
      }
    }
  }

  gitBranchList() {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    this.state.branches.forEach(branch => {
      const prefix = branch === this.state.currentBranch ? '* ' : '  ';
      this.addOutput(`${prefix}${branch}`, 'info');
    });
  }

  gitCheckout(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Error: falta el nombre de la rama', 'error');
      return;
    }

    const branchName = args[0];
    const previousBranch = this.state.currentBranch;
    
    if (args.includes('-b')) {
      // Crear y cambiar a nueva rama
      if (!this.state.branches.includes(branchName)) {
        this.state.branches.push(branchName);
        this.addOutput(`Rama '${branchName}' creada desde '${previousBranch}'`, 'success');
        
        if (this.graphController) {
          const success = this.graphController.branch(branchName);
          if (success) {
            this.addOutput(`📊 Rama '${branchName}' creada en el gráfico`, 'success');
          }
        }
      }
    }

    if (!this.state.branches.includes(branchName)) {
      this.addOutput(`error: pathspec '${branchName}' did not match any file(s) known to git`, 'error');
      return;
    }

    this.state.currentBranch = branchName;
    this.addOutput(`Switched to branch '${branchName}'`, 'success');

    if (this.graphController) {
      const success = this.graphController.checkout(branchName);
      if (success) {
        this.addOutput(`📊 ✓ Ahora estás en la rama '${branchName}'`, 'success');
        this.addOutput(`💡 Haz un commit para ver la bifurcación en el gráfico`, 'info');
      }
    }
  }

  gitMerge(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Error: falta el nombre de la rama a fusionar', 'error');
      return;
    }

    const sourceBranch = args[0];
    
    if (!this.state.branches.includes(sourceBranch)) {
      this.addOutput(`merge: ${sourceBranch} - not something we can merge`, 'error');
      return;
    }

    if (sourceBranch === this.state.currentBranch) {
      this.addOutput('Ya estás en esa rama', 'warning');
      return;
    }

    this.addOutput(`Fusionando rama '${sourceBranch}' en '${this.state.currentBranch}'`, 'success');
    
    if (this.graphController) {
      const success = this.graphController.merge(sourceBranch);
      if (success) {
        this.addOutput(`📊 Fusión reflejada en el gráfico`, 'info');
        this.addOutput(`Merge successful`, 'success');
      } else {
        this.addOutput('⚠️ No se pudo reflejar la fusión en el gráfico', 'warning');
      }
    }
  }

  gitRebase(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Error: falta el nombre de la rama base', 'error');
      this.addOutput('Uso: git rebase <rama-base>', 'info');
      return;
    }

    const baseBranch = args[0];
    
    if (!this.state.branches.includes(baseBranch)) {
      this.addOutput(`fatal: invalid upstream '${baseBranch}'`, 'error');
      return;
    }

    if (baseBranch === this.state.currentBranch) {
      this.addOutput(`Current branch ${this.state.currentBranch} is up to date.`, 'info');
      return;
    }

    this.addOutput(`Rebasing '${this.state.currentBranch}' sobre '${baseBranch}'...`, 'info');
    this.addOutput(`First, rewinding head to replay your work on top of it...`, 'info');
    
    // Simular rebase: aplicar commits de la rama actual sobre la rama base
    if (this.graphController) {
      // En GitGraph, rebase se simula haciendo merge
      // En un rebase real, se reescriben los commits, pero para la visualización usamos merge
      const success = this.graphController.merge(baseBranch);
      if (success) {
        this.addOutput(`Successfully rebased and updated refs/heads/${this.state.currentBranch}`, 'success');
        this.addOutput(`📊 Rebase reflejado en el gráfico`, 'info');
        this.addOutput(`💡 Los commits de '${this.state.currentBranch}' ahora están sobre '${baseBranch}'`, 'info');
      } else {
        this.addOutput('⚠️ No se pudo completar el rebase', 'warning');
      }
    }
  }

  gitPull(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    // Simular git pull (fetch + merge)
    const remote = args[0] || 'origin';
    const branch = args[1] || this.state.currentBranch;

    this.addOutput(`🌐 Conectando con remoto '${remote}'...`, 'info');
    this.addOutput(`From ${remote}`, 'info');
    this.addOutput(` * branch            ${branch} -> FETCH_HEAD`, 'info');
    
    // Simular que hay cambios nuevos
    const hasChanges = Math.random() > 0.3; // 70% de probabilidad de tener cambios
    
    if (hasChanges) {
      this.addOutput(`Updating ${this.generateHash()}..${this.generateHash()}`, 'info');
      this.addOutput(`Fast-forward`, 'success');
      
      // Crear un commit automático para representar los cambios descargados
      if (this.graphController) {
        this.graphController.commit(`📥 Pull from ${remote}/${branch}`);
      }
      
      const filesChanged = Math.floor(Math.random() * 5) + 1;
      const insertions = Math.floor(Math.random() * 50) + 10;
      this.addOutput(` ${filesChanged} file(s) changed, ${insertions} insertions(+)`, 'success');
      this.addOutput(`✅ Cambios del repositorio remoto integrados`, 'success');
    } else {
      this.addOutput(`Already up to date.`, 'info');
      this.addOutput(`💡 Tu rama está sincronizada con '${remote}/${branch}'`, 'info');
    }
  }

  gitPush(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (this.state.commits.length === 0) {
      this.addOutput('No hay commits para enviar', 'warning');
      this.addOutput('💡 Usa "git commit" para crear commits antes de hacer push', 'info');
      return;
    }

    // Simular git push
    const remote = args[0] || 'origin';
    const branch = args[1] || this.state.currentBranch;

    this.addOutput(`🚀 Enviando cambios a '${remote}'...`, 'info');
    this.addOutput(`Enumerating objects: ${this.state.commits.length}, done.`, 'info');
    this.addOutput(`Counting objects: 100% (${this.state.commits.length}/${this.state.commits.length}), done.`, 'info');
    
    // Simular compresión
    const deltaObjects = Math.min(this.state.commits.length, 3);
    this.addOutput(`Delta compression using up to 8 threads`, 'info');
    this.addOutput(`Compressing objects: 100% (${deltaObjects}/${deltaObjects}), done.`, 'info');
    this.addOutput(`Writing objects: 100% (${deltaObjects}/${deltaObjects}), ${(Math.random() * 5 + 1).toFixed(2)} KiB | ${(Math.random() * 2 + 0.5).toFixed(2)} MiB/s, done.`, 'info');
    this.addOutput(`Total ${deltaObjects} (delta ${Math.max(0, deltaObjects - 1)}), reused 0 (delta 0)`, 'info');
    
    // Mensaje de éxito
    this.addOutput(`remote: Resolving deltas: 100% (${Math.max(0, deltaObjects - 1)}/${Math.max(0, deltaObjects - 1)}), done.`, 'info');
    this.addOutput(`To ${remote}`, 'success');
    const oldHash = this.generateHash().substring(0, 7);
    const newHash = this.generateHash().substring(0, 7);
    this.addOutput(`   ${oldHash}..${newHash}  ${branch} -> ${branch}`, 'success');
    this.addOutput(`✅ Cambios enviados exitosamente a ${remote}/${branch}`, 'success');
  }

  gitLog() {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (this.state.commits.length === 0) {
      this.addOutput('No hay commits en este repositorio', 'info');
      return;
    }

    this.state.commits.reverse().forEach((commit, index) => {
      this.addOutput(`commit ${this.generateHash()}`, 'info');
      this.addOutput(`    ${commit.message}`, 'info');
      if (index < this.state.commits.length - 1) this.addOutput('', 'info');
    });
  }

  resetAll() {
    this.state = {
      initialized: false,
      staged: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: []
    };
    
    this.clearOutput();
    this.addOutput('🔄 Sistema reseteado', 'info');
    
    if (this.graphController) {
      this.graphController.reset();
      this.addOutput('📊 Gráfico reseteado', 'info');
    }
  }

  addOutput(text, type = 'info') {
    if (!this.outputElement) return;

    const line = document.createElement('div');
    line.className = `console__output-line console__output-line--${type}`;
    line.textContent = text;
    
    this.outputElement.appendChild(line);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  clearOutput() {
    if (this.outputElement) {
      this.outputElement.innerHTML = '';
    }
  }

  showHelp() {
    this.addOutput('Comandos Git disponibles:', 'info');
    this.addOutput('  git init                 - Inicializar repositorio', 'info');
    this.addOutput('  git status               - Ver estado del repositorio', 'info');
    this.addOutput('  git add <archivo>        - Agregar archivo al staging', 'info');
    this.addOutput('  git commit -m "mensaje"  - Crear commit', 'info');
    this.addOutput('  git branch <nombre>      - Crear rama', 'info');
    this.addOutput('  git checkout <rama>      - Cambiar de rama', 'info');
    this.addOutput('  git merge <rama>         - Fusionar rama', 'info');
    this.addOutput('  git rebase <rama>        - Rebasar rama actual sobre otra', 'info');
    this.addOutput('  git pull [origin] [rama] - Descargar cambios del remoto', 'info');
    this.addOutput('  git push [origin] [rama] - Enviar commits al remoto', 'info');
    this.addOutput('  git log                  - Ver historial', 'info');
    this.addOutput('  clear                    - Limpiar consola', 'info');
  }

  generateHash() {
    return Math.random().toString(36).substring(2, 8);
  }
}

// ============================================================================
// ExerciseValidator simplificado
// ============================================================================
class ExerciseValidator {
  constructor(consoleController, graphController) {
    this.consoleController = consoleController;
    this.graphController = graphController;
    this.exercises = [];
    this.currentExerciseIndex = 0;
    this.hintLevel = 0;
  }

  setExercises(exercises) {
    this.exercises = exercises;
    this.currentExerciseIndex = 0;
    this.hintLevel = 0;
  }

  getCurrentExercise() {
    return this.exercises[this.currentExerciseIndex] || null;
  }

  validateCommand(command, args) {
    const exercise = this.getCurrentExercise();
    if (!exercise) return { valid: false, message: '❌ No hay ejercicios activos' };

    const fullCommand = `${command} ${args.join(' ')}`.trim().toLowerCase();
    const expected = exercise.expectedCommand.toLowerCase();

    if (this.isCommandMatch(fullCommand, expected)) {
      return { 
        valid: true, 
        message: exercise.successMessage 
      };
    }

    // Proporcionar mensajes de error más específicos
    const expectedCmd = expected.replace(/^git\s+/, '').split(' ')[0];
    const actualCmd = command.toLowerCase();

    if (actualCmd !== expectedCmd) {
      return { 
        valid: false, 
        message: `❌ Se esperaba el comando "${expectedCmd}", pero usaste "${actualCmd}"`,
        suggestion: exercise.hint
      };
    }

    // El comando es correcto pero los argumentos no
    return { 
      valid: false, 
      message: `❌ Comando correcto, pero revisa los argumentos. Se esperaba: ${exercise.expectedCommand}`,
      suggestion: exercise.hint
    };
  }

  isCommandMatch(actual, expected) {
    const cleanActual = actual.replace(/^git\s+/, '').replace(/\s+/g, ' ').trim();
    const cleanExpected = expected.replace(/^git\s+/, '').replace(/\s+/g, ' ').trim();

    // Para commit, solo verificar que tenga commit (con o sin -m)
    if (cleanExpected.startsWith('commit')) {
      return cleanActual.startsWith('commit');
    }

    // Para branch, verificar comando + nombre de rama si se especifica
    if (cleanExpected.startsWith('branch')) {
      if (cleanExpected.includes(' ')) {
        const expectedBranch = cleanExpected.split(' ')[1];
        return cleanActual.startsWith('branch') && cleanActual.includes(expectedBranch);
      }
      return cleanActual.startsWith('branch');
    }

    // Para checkout, verificar comando + nombre de rama si se especifica
    if (cleanExpected.startsWith('checkout')) {
      if (cleanExpected.includes(' ')) {
        const expectedBranch = cleanExpected.split(' ')[1];
        return cleanActual.startsWith('checkout') && cleanActual.includes(expectedBranch);
      }
      return cleanActual.startsWith('checkout');
    }

    // Para merge, verificar comando + nombre de rama si se especifica
    if (cleanExpected.startsWith('merge')) {
      if (cleanExpected.includes(' ')) {
        const expectedBranch = cleanExpected.split(' ')[1];
        return cleanActual.startsWith('merge') && cleanActual.includes(expectedBranch);
      }
      return cleanActual.startsWith('merge');
    }

    // Para add, verificar que sea add . o add con archivos
    if (cleanExpected.startsWith('add')) {
      return cleanActual.startsWith('add');
    }

    // Para otros comandos, coincidencia exacta
    return cleanActual === cleanExpected;
  }

  nextExercise() {
    this.currentExerciseIndex++;
    this.hintLevel = 0;
    
    if (this.currentExerciseIndex >= this.exercises.length) {
      return { completed: true };
    }
    
    return { 
      completed: false, 
      exercise: this.exercises[this.currentExerciseIndex] 
    };
  }

  reset() {
    this.currentExerciseIndex = 0;
    this.hintLevel = 0;
  }
}

// ============================================================================
// Ejercicios para cada pantalla
// ============================================================================
const SCREEN_EXERCISES = {
  screen1: [
    {
      id: 1,
      title: "Crear la máquina del tiempo",
      description: "Inicializa un repositorio Git para comenzar tu viaje temporal",
      expectedCommand: "git init",
      successMessage: "🚗 ¡La máquina del tiempo está lista! El DeLorean se ha inicializado",
      hint: "Usa 'git init' para crear un nuevo repositorio Git"
    },
    {
      id: 2,
      title: "Documentar la situación inicial",
      description: "Agrega archivos al staging area antes de documentar el estado actual",
      expectedCommand: "git add .",
      successMessage: "📄 Archivos preparados en el staging area para el commit",
      hint: "Usa 'git add .' para agregar todos los archivos al staging area"
    },
    {
      id: 3,
      title: "Registrar el punto de partida (1985)",
      description: "Crea tu primer commit para documentar la situación en 1985",
      expectedCommand: "git commit",
      successMessage: "⏰ Punto temporal 1985 registrado correctamente en el commit",
      hint: "Usa 'git commit -m \"mensaje\"' para crear un commit"
    },
    {
      id: 4,
      title: "Crear línea temporal alternativa",
      description: "Crea un nuevo branch llamado '1955' para la línea temporal donde Marty interfiere",
      expectedCommand: "git branch 1955",
      successMessage: "🌀 Nuevo branch '1955' creado",
      hint: "Usa 'git branch 1955' para crear el nuevo branch"
    },
    {
      id: 5,
      title: "Viajar a 1955",
      description: "Cambia al branch '1955' usando checkout para trabajar en esa línea temporal",
      expectedCommand: "git checkout 1955",
      successMessage: "🚗💨 Has viajado a 1955 con checkout. ¡Cuidado con no cambiar la historia!",
      hint: "Usa 'git checkout 1955' para cambiar a ese branch"
    },
    {
      id: 6,
      title: "Volver a la línea principal",
      description: "Regresa al branch 'main' antes de hacer el merge",
      expectedCommand: "git checkout main",
      successMessage: "✅ De vuelta en la línea temporal principal",
      hint: "Usa 'git checkout main' para volver a la rama principal"
    },
    {
      id: 7,
      title: "Fusionar las líneas temporales",
      description: "Haz merge del branch '1955' para restaurar la línea temporal",
      expectedCommand: "git merge 1955",
      successMessage: "🎉 ¡Merge completado! Marty ha regresado a 1985 exitosamente",
      hint: "Usa 'git merge 1955' para fusionar los cambios"
    }
  ],

  // Pantalla 2: Time Travel (2015) - FUTURO + DISTOPÍA DE BIFF
  screen2: [
    {
      id: 1,
      title: 'Preparar el viaje al futuro',
      description: 'Inicializa un repositorio para documentar el viaje temporal a 2015',
      expectedCommand: 'git init',
      successMessage: '🚀 ¡Viaje a 2015 iniciado! Doc lleva a Marty y Jennifer al futuro',
      hint: "Usa 'git init' para inicializar el repositorio"
    },
    {
      id: 2,
      title: 'Documentar el problema futuro',
      description: 'Agrega archivos para documentar los problemas con Marty Jr.',
      expectedCommand: 'git add .',
      successMessage: '📄 Problemas del futuro documentados',
      hint: "Usa 'git add .' para agregar archivos al staging area"
    },
    {
      id: 3,
      title: 'Registrar llegada a 2015',
      description: 'Crea un commit documentando la llegada al futuro',
      expectedCommand: 'git commit',
      successMessage: '⏰ Llegada a 2015 registrada - ¡Bienvenidos al futuro!',
      hint: 'Usa \'git commit -m "mensaje"\' para crear el commit'
    },
    {
      id: 4,
      title: 'Crear línea temporal corrupta',
      description: "Crea una rama llamada 'biff-paradise' para la distopía que crea Biff",
      expectedCommand: 'git branch biff-paradise',
      successMessage: '💀 Rama distópica creada - Biff alterará la historia',
      hint: "Usa 'git branch biff-paradise' para crear la nueva rama"
    },
    {
      id: 5,
      title: 'Entrar en la distopía',
      description: "Cambia a la rama 'biff-paradise' donde Biff es millonario",
      expectedCommand: 'git checkout biff-paradise',
      successMessage: '😈 Has entrado en el 1985 alternativo - ¡Biff controla todo!',
      hint: "Usa 'git checkout biff-paradise' para cambiar a esa rama"
    },
    {
      id: 6,
      title: 'Documentar la distopía',
      description: 'Agrega archivos documentando el mundo corrupto de Biff',
      expectedCommand: 'git add .',
      successMessage: '📄 La distopía de Biff ha sido documentada',
      hint: "Usa 'git add .' para agregar los archivos"
    },
    {
      id: 7,
      title: 'Registrar la paradoja de Biff',
      description: 'Crea un commit documentando cómo Biff cambió la historia',
      expectedCommand: 'git commit',
      successMessage: '💸 Paradoja registrada - Biff es millonario gracias al almanaque',
      hint: 'Usa \'git commit -m "mensaje"\' para documentar la paradoja'
    }
  ],

  // Pantalla 3: Dystopia (1985A) - COMANDOS AVANZADOS
  screen3: [
    {
      id: 1,
      title: 'Volver a la línea temporal principal',
      description: 'Regresa al branch main para continuar la historia',
      expectedCommand: 'git checkout main',
      successMessage: '🔄 De vuelta en la línea temporal principal',
      hint: "Usa 'git checkout main' para volver a la rama principal"
    },
    {
      id: 2,
      title: 'Crear la línea temporal corregida',
      description: "Crea una rama llamada 'timeline-fixed' para la realidad corregida",
      expectedCommand: 'git branch timeline-fixed',
      successMessage: '✨ Nueva línea temporal creada para la realidad corregida',
      hint: "Usa 'git branch timeline-fixed' para crear la nueva rama"
    },
    {
      id: 3,
      title: 'Entrar en la línea corregida',
      description: "Cambia a la rama 'timeline-fixed'",
      expectedCommand: 'git checkout timeline-fixed',
      successMessage: '🎯 Ahora estás en la línea temporal que debe ser corregida',
      hint: "Usa 'git checkout timeline-fixed' para cambiar a esa rama"
    },
    {
      id: 4,
      title: 'Documentar la recuperación del almanaque',
      description: 'Agrega archivos documentando cómo Marty recupera el almanaque de Biff',
      expectedCommand: 'git add .',
      successMessage: '📚 Recuperación del almanaque documentada',
      hint: "Usa 'git add .' para agregar los archivos"
    },
    {
      id: 5,
      title: 'Registrar la destrucción del almanaque',
      description: 'Crea un commit documentando que el almanaque fue destruido',
      expectedCommand: 'git commit',
      successMessage: '🔥 ¡Almanaque destruido! La línea temporal será restaurada',
      hint: 'Usa \'git commit -m "mensaje"\' para registrar la destrucción'
    },
    {
      id: 6,
      title: 'Volver a la línea principal',
      description: "Regresa al branch 'main'",
      expectedCommand: 'git checkout main',
      successMessage: '🔄 De vuelta en la línea temporal principal',
      hint: "Usa 'git checkout main' para volver a main"
    },
    {
      id: 7,
      title: 'Fusionar la corrección temporal',
      description: "Haz merge de 'timeline-fixed' para restaurar la realidad",
      expectedCommand: 'git merge timeline-fixed',
      successMessage: '🎉 ¡Línea temporal restaurada! Pero Doc ha desaparecido...',
      hint: "Usa 'git merge timeline-fixed' para fusionar los cambios"
    }
  ],

  // Pantalla 4: Wild West (1885) - COMANDOS EXPERTOS
  screen4: [
    {
      id: 1,
      title: 'Preparar el rescate de Doc',
      description: 'Inicializa un nuevo repositorio para el viaje al Lejano Oeste',
      expectedCommand: 'git init',
      successMessage: '🤠 ¡Preparándose para el Lejano Oeste! Marty debe rescatar a Doc',
      hint: "Usa 'git init' para inicializar el repositorio"
    },
    {
      id: 2,
      title: 'Crear línea temporal del Oeste',
      description: "Crea una rama llamada '1885' para el Lejano Oeste",
      expectedCommand: 'git branch 1885',
      successMessage: '🏜️ Línea temporal del Lejano Oeste creada',
      hint: "Usa 'git branch 1885' para crear la rama del Oeste"
    },
    {
      id: 3,
      title: 'Viajar al Lejano Oeste',
      description: "Cambia a la rama '1885' para rescatar a Doc",
      expectedCommand: 'git checkout 1885',
      successMessage: '🚂 ¡Has llegado al Lejano Oeste de 1885! Busca a Doc',
      hint: "Usa 'git checkout 1885' para viajar al Oeste"
    },
    {
      id: 4,
      title: 'Documentar el encuentro con Doc',
      description: 'Agrega archivos documentando el reencuentro con Doc en 1885',
      expectedCommand: 'git add .',
      successMessage: '👨‍🔬 Encuentro con Doc documentado',
      hint: "Usa 'git add .' para agregar los archivos"
    },
    {
      id: 5,
      title: 'Registrar el plan de escape',
      description: 'Crea un commit documentando el plan para volver a 1985',
      expectedCommand: 'git commit',
      successMessage: '📝 Plan de escape registrado - ¡Usarán la locomotora!',
      hint: 'Usa \'git commit -m "mensaje"\' para registrar el plan'
    },
    {
      id: 6,
      title: 'Crear línea temporal romántica',
      description: "Crea una rama llamada 'clara-romance' para la historia de amor de Doc",
      expectedCommand: 'git branch clara-romance',
      successMessage: '💕 Línea temporal romántica creada - Doc conoce a Clara',
      hint: "Usa 'git branch clara-romance' para crear la rama romántica"
    },
    {
      id: 7,
      title: 'Explorar el romance',
      description: "Cambia a la rama 'clara-romance'",
      expectedCommand: 'git checkout clara-romance',
      successMessage: '💖 Doc se enamora de Clara Clayton',
      hint: "Usa 'git checkout clara-romance' para explorar el romance"
    },
    {
      id: 8,
      title: 'Volver a la línea principal',
      description: "Regresa al branch 'main' para el merge final",
      expectedCommand: 'git checkout main',
      successMessage: '🔄 En la línea temporal principal para el final',
      hint: "Usa 'git checkout main' para volver a main"
    },
    {
      id: 9,
      title: 'Fusionar todas las líneas temporales',
      description: "Haz merge de '1885' para completar la saga",
      expectedCommand: 'git merge 1885',
      successMessage: '🎉 ¡SAGA COMPLETA! Has dominado Git através de Back to the Future',
      hint: "Usa 'git merge 1885' para completar la historia"
    }
  ]
};

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes confettiFall {
    to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('🚗⚡ Git to the Future - Clases cargadas correctamente');