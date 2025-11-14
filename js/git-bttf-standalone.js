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
      commits: [],
      remotes: []
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
      case 'remote':
        this.gitRemote(args);
        break;
      case 'push':
        this.gitPush(args);
        break;
      case 'revert':
        this.gitRevert(args);
        break;
      case 'stash':
        this.gitStash(args);
        break;
      case 'cherry-pick':
        this.gitCherryPick(args);
        break;
      case 'apply':
        this.gitApply(args);
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
      this.addOutput('Error: falta el nombre de la rama o commit', 'error');
      return;
    }

    const target = args[0];
    const previousBranch = this.state.currentBranch;
    
    if (args.includes('-b')) {
      // Crear y cambiar a nueva rama
      if (!this.state.branches.includes(target)) {
        this.state.branches.push(target);
        this.addOutput(`Rama '${target}' creada desde '${previousBranch}'`, 'success');
        
        if (this.graphController) {
          const success = this.graphController.branch(target);
          if (success) {
            this.addOutput(`📊 Rama '${target}' creada en el gráfico`, 'success');
          }
        }
      }
    }

    // Permitir checkout a "commits simulados" como 1955, 1885, etc.
    const isSimulatedCommit = /^\d{4}$/.test(target); // Formato año: 1955, 1885, 2015, etc.
    
    if (!this.state.branches.includes(target) && !isSimulatedCommit) {
      this.addOutput(`error: pathspec '${target}' did not match any file(s) known to git`, 'error');
      return;
    }

    if (isSimulatedCommit) {
      // Simular checkout a un commit (detached HEAD state)
      this.addOutput(`Note: switching to '${target}'.`, 'info');
      this.addOutput(``, 'info');
      this.addOutput(`You are in 'detached HEAD' state. You can look around, make experimental`, 'info');
      this.addOutput(`changes and commit them, and you can discard any commits you make in this`, 'info');
      this.addOutput(`state without impacting any branches by switching back to a branch.`, 'info');
      this.addOutput(``, 'info');
      this.addOutput(`HEAD is now at ${this.generateHash().substring(0, 7)} Time travel to ${target}`, 'success');
      this.state.currentBranch = `detached-${target}`;
      return;
    }

    this.state.currentBranch = target;
    this.addOutput(`Switched to branch '${target}'`, 'success');

    if (this.graphController) {
      const success = this.graphController.checkout(target);
      if (success) {
        this.addOutput(`📊 ✓ Ahora estás en la rama '${target}'`, 'success');
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

  gitRemote(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    const subcommand = args[0];

    if (!subcommand) {
      // Listar remotos
      if (!this.state.remotes || this.state.remotes.length === 0) {
        this.addOutput('No hay repositorios remotos configurados', 'info');
        return;
      }
      this.state.remotes.forEach(remote => {
        this.addOutput(remote.name, 'info');
      });
      return;
    }

    if (subcommand === 'add') {
      const remoteName = args[1] || 'origin';
      const remoteUrl = args[2] || 'https://github.com/DocBrown/DeLorean.git';

      if (!this.state.remotes) {
        this.state.remotes = [];
      }

      // Verificar si ya existe
      const exists = this.state.remotes.find(r => r.name === remoteName);
      if (exists) {
        this.addOutput(`error: remote ${remoteName} already exists.`, 'error');
        return;
      }

      this.state.remotes.push({ name: remoteName, url: remoteUrl });
      this.addOutput(`🔗 Repositorio remoto '${remoteName}' añadido exitosamente`, 'success');
      this.addOutput(`   URL: ${remoteUrl}`, 'info');
    } else if (subcommand === '-v') {
      // Mostrar remotos con URLs
      if (!this.state.remotes || this.state.remotes.length === 0) {
        this.addOutput('No hay repositorios remotos configurados', 'info');
        return;
      }
      this.state.remotes.forEach(remote => {
        this.addOutput(`${remote.name}\t${remote.url} (fetch)`, 'info');
        this.addOutput(`${remote.name}\t${remote.url} (push)`, 'info');
      });
    } else {
      this.addOutput(`git remote: '${subcommand}' no es un subcomando válido`, 'error');
      this.addOutput('Usa: git remote [-v] | git remote add <nombre> <url>', 'info');
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

  gitRevert(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (this.state.commits.length === 0) {
      this.addOutput('No hay commits para revertir', 'warning');
      return;
    }

    const commitRef = args[0] || 'HEAD';
    
    this.addOutput(`Revertiendo ${commitRef}...`, 'info');
    this.addOutput(``, 'info');
    this.addOutput(`[${this.state.currentBranch} ${this.generateHash().substring(0, 7)}] Revert "${commitRef}"`, 'info');
    
    // Crear un nuevo commit que invierte los cambios
    const revertMessage = `Revert changes from ${commitRef}`;
    this.state.commits.push({
      branch: this.state.currentBranch,
      message: revertMessage,
      hash: this.generateHash()
    });

    if (this.graphController) {
      this.graphController.commit(revertMessage);
    }

    this.addOutput(`✅ Revert completado. Los cambios de ${commitRef} han sido deshechos de forma segura`, 'success');
    this.addOutput(`💡 Se creó un nuevo commit que invierte los cambios sin alterar el historial`, 'info');
  }

  gitStash(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    const subcommand = args[0];

    if (!subcommand) {
      // git stash (sin argumentos) = stash push
      if (this.state.staged.length === 0) {
        this.addOutput('No hay cambios para guardar en el stash', 'info');
        return;
      }

      if (!this.state.stash) {
        this.state.stash = [];
      }

      const stashEntry = {
        files: [...this.state.staged],
        branch: this.state.currentBranch,
        message: `WIP on ${this.state.currentBranch}: ${this.generateHash().substring(0, 7)}`,
        timestamp: Date.now()
      };

      this.state.stash.push(stashEntry);
      this.state.staged = [];

      this.addOutput(`Saved working directory and index state ${stashEntry.message}`, 'success');
      this.addOutput(`📦 Cambios guardados en el stash. Ahora puedes cambiar de rama sin hacer commit`, 'info');
      this.addOutput(`💡 Usa 'git stash pop' para recuperar los cambios más tarde`, 'info');
      return;
    }

    if (subcommand === 'list') {
      // git stash list
      if (!this.state.stash || this.state.stash.length === 0) {
        this.addOutput('No hay entradas en el stash', 'info');
        return;
      }

      this.state.stash.forEach((entry, index) => {
        this.addOutput(`stash@{${index}}: ${entry.message}`, 'info');
      });
      return;
    }

    if (subcommand === 'pop') {
      // git stash pop
      if (!this.state.stash || this.state.stash.length === 0) {
        this.addOutput('No hay entradas en el stash para recuperar', 'warning');
        return;
      }

      const entry = this.state.stash.pop();
      this.state.staged = [...entry.files];

      this.addOutput(`Dropped refs/stash@{0} (${this.generateHash().substring(0, 7)})`, 'info');
      this.addOutput(`✅ Cambios recuperados del stash`, 'success');
      this.addOutput(`💡 Los archivos volvieron al staging area. Usa 'git status' para verlos`, 'info');
      return;
    }

    if (subcommand === 'clear') {
      // git stash clear
      if (!this.state.stash || this.state.stash.length === 0) {
        this.addOutput('El stash ya está vacío', 'info');
        return;
      }

      const count = this.state.stash.length;
      this.state.stash = [];
      this.addOutput(`✅ Stash limpiado. ${count} entrada(s) eliminada(s)`, 'success');
      return;
    }

    this.addOutput(`git stash: '${subcommand}' no es un subcomando válido`, 'error');
    this.addOutput('Usa: git stash [list|pop|clear]', 'info');
  }

  gitCherryPick(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Error: falta el hash del commit a cherry-pick', 'error');
      this.addOutput('Uso: git cherry-pick <commit-hash>', 'info');
      return;
    }

    const commitHash = args[0];
    
    this.addOutput(`Aplicando commit ${commitHash}...`, 'info');
    this.addOutput(``, 'info');
    this.addOutput(`[${this.state.currentBranch} ${this.generateHash().substring(0, 7)}] Cherry-pick: ${commitHash}`, 'info');
    
    // Simular cherry-pick: copiar un commit específico
    const cherryMessage = `Cherry-picked from ${commitHash}`;
    this.state.commits.push({
      branch: this.state.currentBranch,
      message: cherryMessage,
      hash: this.generateHash()
    });

    if (this.graphController) {
      this.graphController.commit(cherryMessage);
    }

    this.addOutput(`✅ Cherry-pick completado exitosamente`, 'success');
    this.addOutput(`💡 El commit ${commitHash} fue copiado a la rama actual sin traer otros commits`, 'info');
  }

  gitApply(args) {
    if (!this.state.initialized) {
      this.addOutput('fatal: not a git repository', 'error');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Error: falta el archivo de parche', 'error');
      this.addOutput('Uso: git apply <archivo.patch>', 'info');
      return;
    }

    const patchFile = args[0];
    
    this.addOutput(`Aplicando parche ${patchFile}...`, 'info');
    this.addOutput(`Checking patch ${patchFile}...`, 'info');
    this.addOutput(`Applied patch ${patchFile} cleanly.`, 'success');
    this.addOutput(``, 'info');
    
    // Simular cambios aplicados
    const filesChanged = Math.floor(Math.random() * 3) + 1;
    const insertions = Math.floor(Math.random() * 20) + 5;
    
    this.addOutput(`✅ Parche aplicado exitosamente`, 'success');
    this.addOutput(`📝 ${filesChanged} archivo(s) modificado(s), ${insertions} línea(s) insertada(s)`, 'info');
    this.addOutput(`💡 Los cambios del parche están listos. Usa 'git add' y 'git commit' para confirmar`, 'info');
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
      commits: [],
      remotes: []
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
    this.addOutput('  git stash [list|pop]     - Guardar cambios temporalmente', 'info');
    this.addOutput('  git revert <commit>      - Deshacer commit de forma segura', 'info');
    this.addOutput('  git cherry-pick <commit> - Copiar commit específico', 'info');
    this.addOutput('  git apply <patch>        - Aplicar archivo de parche', 'info');
    this.addOutput('  git remote add <url>     - Añadir repositorio remoto', 'info');
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

    // Para remote add, verificar comando + subcomando
    if (cleanExpected.startsWith('remote add')) {
      return cleanActual.startsWith('remote add') || cleanActual.startsWith('remote');
    }

    // Para push, verificar que contenga push (con o sin -u, origin, main, etc.)
    if (cleanExpected.startsWith('push')) {
      return cleanActual.startsWith('push');
    }

    // Para rebase, verificar comando (con o sin rama específica)
    if (cleanExpected.startsWith('rebase')) {
      return cleanActual.startsWith('rebase');
    }

    // Para revert, verificar comando (con o sin commit específico)
    if (cleanExpected.startsWith('revert')) {
      return cleanActual.startsWith('revert');
    }

    // Para stash, verificar comando
    if (cleanExpected.startsWith('stash')) {
      return cleanActual.startsWith('stash');
    }

    // Para cherry-pick, verificar comando
    if (cleanExpected.startsWith('cherry-pick')) {
      return cleanActual.startsWith('cherry-pick');
    }

    // Para apply, verificar comando
    if (cleanExpected.startsWith('apply')) {
      return cleanActual.startsWith('apply');
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
      title: "Inicializar la máquina del tiempo",
      description: "Doc Brown está listo para su epifanía. Inicializa el repositorio en Hill Valley 1985",
      expectedCommand: "git init",
      successMessage: "⚡ ¡Repositorio inicializado! El DeLorean está bajo control de versiones",
      hint: "Usa 'git init' para crear un nuevo repositorio Git en tu proyecto"
    },
    {
      id: 2,
      title: "Preparar los componentes del DeLorean",
      description: "Reúne todos los archivos del laboratorio caótico de Doc (familia_mcfly.txt, delorean.txt)",
      expectedCommand: "git add .",
      successMessage: "📦 Todos los componentes preparados. Planos del DeLorean y estado de la familia McFly listos",
      hint: "Usa 'git add .' para agregar todos los archivos al staging area"
    },
    {
      id: 3,
      title: "Registrar el estado inicial: 1985",
      description: "Guarda una instantánea del proyecto. La familia McFly es disfuncional, pero es tu punto de partida",
      expectedCommand: "git commit",
      successMessage: "📸 Commit creado: Hill Valley 1985 - George es cobarde, Lorraine descontenta, Biff es el jefe",
      hint: "Usa 'git commit -m \"Initial state: 1985\"' para crear tu primer commit con un mensaje descriptivo"
    },
    {
      id: 4,
      title: "Conectar con el repositorio remoto",
      description: "Doc no guarda su invento solo para él. Añade el repositorio remoto del DeLorean",
      expectedCommand: "git remote add origin",
      successMessage: "🔗 Repositorio remoto conectado: https://github.com/DocBrown/DeLorean.git",
      hint: "Usa 'git remote add origin <url>' para conectar tu repo local con uno remoto. Ejemplo: git remote add origin https://github.com/DocBrown/DeLorean.git"
    },
    {
      id: 5,
      title: "Llevar el DeLorean al Twin Pines Mall",
      description: "Doc empuja su invento fuera del laboratorio para la demostración. ¡Es hora del primer push!",
      expectedCommand: "git push",
      successMessage: "🚀 ¡Push exitoso! El DeLorean está en el estacionamiento del Twin Pines Mall. El mundo (y Marty) pueden verlo",
      hint: "Usa 'git push -u origin main' para subir tus cambios al repositorio remoto por primera vez"
    }
  ],

  // Pantalla 2: Time Travel (2015) - FUTURO + DISTOPÍA DE BIFF
  screen2: [
    {
      id: 1,
      title: 'Viajar accidentalmente a 1955',
      description: 'Marty viaja al pasado con el DeLorean. Usa checkout para ir al commit "1955"',
      expectedCommand: 'git checkout 1955',
      successMessage: '⚡ ¡Has viajado a 1955! Te enfrentas a libios y plutonio. Archivo creado: relacion_padres.txt',
      hint: "Usa 'git checkout 1955' para viajar al pasado (un commit anterior)"
    },
    {
      id: 2,
      title: 'Crear rama para arreglar el pasado',
      description: 'Marty interrumpió el encuentro de sus padres. Crea una rama para arreglar sin corromper main',
      expectedCommand: 'git branch feature/fix-past',
      successMessage: '🌿 Rama de corrección creada - Entorno aislado para que George y Lorraine se enamoren',
      hint: "Usa 'git branch feature/fix-past' para crear una rama donde trabajar la solución"
    },
    {
      id: 3,
      title: 'Entrar a la rama de corrección',
      description: 'Muévete a la rama feature/fix-past para empezar a trabajar en la solución',
      expectedCommand: 'git checkout feature/fix-past',
      successMessage: '🎯 Ahora estás en la rama de corrección - Puedes arreglar el encuentro sin alterar main',
      hint: "Usa 'git checkout feature/fix-past' para cambiar a esa rama"
    },
    {
      id: 4,
      title: 'Documentar los pasos del plan',
      description: 'Marty se hace pasar por extraterrestre y ayuda a George. Prepara estos cambios',
      expectedCommand: 'git add .',
      successMessage: '📝 Plan documentado: disfraz de extraterrestre, George gana confianza',
      hint: "Usa 'git add .' para preparar los archivos del plan"
    },
    {
      id: 5,
      title: 'Confirmar que George y Lorraine se enamoran',
      description: 'George golpea a Biff en el baile. ¡Los padres de Marty se enamoran! Haz commit',
      expectedCommand: 'git commit',
      successMessage: '💕 ¡Éxito! George y Lorraine se besan en el baile. El pasado está arreglado',
      hint: 'Usa \'git commit -m "Fix: George and Lorraine fall in love"\' para confirmar la solución'
    },
    {
      id: 6,
      title: 'Volver a la línea temporal principal',
      description: 'El pasado está arreglado. Regresa a main listo para integrar los cambios',
      expectedCommand: 'git checkout main',
      successMessage: '🔙 De vuelta en la rama principal - Listo para fusionar la corrección',
      hint: "Usa 'git checkout main' para volver a la rama principal"
    },
    {
      id: 7,
      title: 'Fusionar la corrección del pasado',
      description: 'El rayo en la torre del reloj provee energía. Fusiona los cambios de feature/fix-past',
      expectedCommand: 'git merge feature/fix-past',
      successMessage: '⚡ ¡Merge exitoso! El rayo ha dado energía al DeLorean. Volviendo a 1985...',
      hint: "Usa 'git merge feature/fix-past' para integrar los cambios en main"
    },
    {
      id: 8,
      title: 'Reescribir la historia - 1985 mejorado',
      description: 'Al regresar, la familia es exitosa y feliz. Usa rebase para reescribir la historia',
      expectedCommand: 'git rebase',
      successMessage: '🎉 ¡Historia reescrita! Familia McFly mejorada: George es autor, Lorraine feliz, Biff lava el auto',
      hint: "Usa 'git rebase main' para reescribir la historia con las mejoras aplicadas limpiamente"
    }
  ],

  // Pantalla 3: Dystopia (1985A) - COMANDOS AVANZADOS
  screen3: [
    {
      id: 1,
      title: 'Volver de 2015 y sincronizar',
      description: 'Marty y Doc regresan de 2015. Haz pull para descubrir que la historia ha cambiado',
      expectedCommand: 'git pull',
      successMessage: '😱 ¡CONFLICTO! El 1985 ha cambiado completamente. Biff reescribió la historia con el almanaque',
      hint: "Usa 'git pull' para traer cambios del remoto y descubrir la distopía"
    },
    {
      id: 2,
      title: 'Ir al punto donde se corrompe la historia',
      description: 'Vuelve a 1955 (el commit donde Biff recibe el almanaque) para investigar',
      expectedCommand: 'git checkout 1955',
      successMessage: '🕰️ Has vuelto a 1955. Archivos creados: hill_valley_ley.txt (Biff propietario), george_mcfly.txt (fallecido)',
      hint: "Usa 'git checkout 1955' para viajar al punto de corrupción"
    },
    {
      id: 3,
      title: 'Crear rama para la solución',
      description: 'Crea una rama para arreglar el problema sin borrar la historia',
      expectedCommand: 'git branch fix/burn-almanac',
      successMessage: '🌿 Rama de corrección creada - Trabajarás de forma segura',
      hint: "Usa 'git branch fix/burn-almanac' para crear una rama de trabajo segura"
    },
    {
      id: 4,
      title: 'Entrar a la rama de corrección',
      description: 'Cambia a la rama fix/burn-almanac para empezar a trabajar',
      expectedCommand: 'git checkout fix/burn-almanac',
      successMessage: '🎯 En la rama de corrección - Listo para quemar el almanaque',
      hint: "Usa 'git checkout fix/burn-almanac' para cambiar a la rama"
    },
    {
      id: 5,
      title: 'Deshacer el cambio de Biff de forma segura',
      description: 'Usa revert para crear un nuevo commit que anule el "bad commit" de Biff. ¡Quema el almanaque!',
      expectedCommand: 'git revert',
      successMessage: '🔥 ¡Almanaque quemado! Nuevo commit creado que invierte los efectos del almanaque de Biff',
      hint: "Usa 'git revert HEAD' para deshacer el último commit de forma segura sin reescribir historia"
    },
    {
      id: 6,
      title: 'Volver a la línea principal',
      description: 'Regresa a main para fusionar la corrección',
      expectedCommand: 'git checkout main',
      successMessage: '🔄 De vuelta en main - Listo para fusionar la solución',
      hint: "Usa 'git checkout main' para volver a la rama principal"
    },
    {
      id: 7,
      title: 'Fusionar la corrección',
      description: 'Fusiona la rama fix/burn-almanac para restaurar la línea temporal',
      expectedCommand: 'git merge fix/burn-almanac',
      successMessage: '✅ Historia restaurada. Biff ya no tiene el almanaque',
      hint: "Usa 'git merge fix/burn-almanac' para integrar la solución"
    },
    {
      id: 8,
      title: 'Rescatar a Jennifer específicamente',
      description: 'En medio del caos de 2015, Jennifer quedó en su casa. Usa cherry-pick para traer solo ese commit',
      expectedCommand: 'git cherry-pick',
      successMessage: '👩 ¡Jennifer rescatada! Cherry-pick aplicó solo el commit específico sin traer todo lo demás',
      hint: "Usa 'git cherry-pick <hash>' para copiar un commit específico a la rama actual"
    },
    {
      id: 9,
      title: 'Aplicar información de la carta de 1885',
      description: 'Western Union entrega una carta de Doc desde 1885. Aplica el parche carta_doc_1885.patch',
      expectedCommand: 'git apply',
      successMessage: '📜 ¡Carta de Doc aplicada! Urgente: Doc está atrapado en 1885 y necesita rescate',
      hint: "Usa 'git apply carta_doc_1885.patch' para aplicar los cambios del archivo de parche"
    }
  ],

  // Pantalla 4: Wild West (1885) - COMANDOS EXPERTOS
  screen4: [
    {
      id: 1,
      title: 'Guardar trabajo temporal en 1955',
      description: 'Marty está en 1955 reparando el DeLorean. Guarda cambios temporalmente con stash',
      expectedCommand: 'git stash',
      successMessage: '📦 Trabajo guardado. Archivo delorean.txt (reparaciones en progreso) guardado temporalmente',
      hint: "Usa 'git stash' para guardar cambios sin hacer commit y poder cambiar de tarea"
    },
    {
      id: 2,
      title: 'Crear rama para la aventura del Oeste',
      description: 'Crea una rama para el rescate de Doc en 1885',
      expectedCommand: 'git branch aventura/viejo-oeste',
      successMessage: '🤠 Rama del Lejano Oeste creada - ¡Rescate de Doc comienza!',
      hint: "Usa 'git branch aventura/viejo-oeste' para crear la rama de la aventura"
    },
    {
      id: 3,
      title: 'Entrar a la rama del Oeste',
      description: 'Cambia a la rama aventura/viejo-oeste para trabajar en el rescate',
      expectedCommand: 'git checkout aventura/viejo-oeste',
      successMessage: '🏞️ Has viajado al Lejano Oeste de 1885. Marty encuentra a Doc trabajando de herrero',
      hint: "Usa 'git checkout aventura/viejo-oeste' para cambiar a la rama"
    },
    {
      id: 4,
      title: 'Documentar que Doc salva a Clara',
      description: 'Doc impide que Clara caiga al precipicio. Prepara estos archivos',
      expectedCommand: 'git add .',
      successMessage: '👩‍💼 Clara Clayton salvada por Doc. El amor comienza...',
      hint: "Usa 'git add .' para preparar los archivos"
    },
    {
      id: 5,
      title: 'Confirmar el rescate de Clara',
      description: 'Doc salvó a Clara del precipicio. Haz commit de este evento crucial',
      expectedCommand: 'git commit',
      successMessage: '💕 Commit: El Doc salva a Clara - El amor florece en el Lejano Oeste',
      hint: 'Usa \'git commit -m "El Doc salva a Clara"\' para registrar el evento'
    },
    {
      id: 6,
      title: 'Documentar el robo de la locomotora',
      description: 'Marty y Doc roban una locomotora para empujar el DeLorean. Prepara los archivos',
      expectedCommand: 'git add .',
      successMessage: '🚂 Locomotora robada. Plan: empujar el DeLorean a 88 mph',
      hint: "Usa 'git add .' para preparar los archivos del plan"
    },
    {
      id: 7,
      title: 'Confirmar el plan de la locomotora',
      description: 'Registra el ingenioso plan para el empuje final',
      expectedCommand: 'git commit',
      successMessage: '⚡ Commit: Roban locomotora para empuje final. Doc y Clara juntos',
      hint: 'Usa \'git commit -m "Roban locomotora para el empuje final"\' para registrar'
    },
    {
      id: 8,
      title: 'Marty regresa solo a 1985',
      description: 'Marty vuelve a main. Doc se queda con Clara en el Oeste',
      expectedCommand: 'git checkout main',
      successMessage: '⏱️ Marty ha regresado a 1985. Doc se quedó en 1885 con Clara',
      hint: "Usa 'git checkout main' para que Marty regrese a su línea temporal"
    },
    {
      id: 9,
      title: 'Verificar que la rama de Doc sigue existiendo',
      description: 'Usa branch -a para ver que aventura/viejo-oeste continúa independiente',
      expectedCommand: 'git branch',
      successMessage: '🎉 ¡Ramas visibles! aventura/viejo-oeste sigue viva. Doc y Clara tienen familia en el Oeste',
      hint: "Usa 'git branch -a' o 'git branch' para ver todas las ramas. La historia de Doc continúa en paralelo"
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