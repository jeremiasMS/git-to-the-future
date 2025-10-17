// 🖥️ Controlador de Consola Git - Módulo reutilizable
export class ConsoleController {
  constructor(outputId, inputId, graphController = null) {
    this.outputElement = document.getElementById(outputId);
    this.inputElement = document.getElementById(inputId);
    this.graphController = graphController;
    this.validator = null; // 🆕 Validador de ejercicios (opcional)
    
    this.state = {
      initialized: false,
      staged: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
    };

    this.commands = {
      init: this.gitInit.bind(this),
      status: this.gitStatus.bind(this),
      add: this.gitAdd.bind(this),
      commit: this.gitCommit.bind(this),
      branch: this.gitBranch.bind(this),
      checkout: this.gitCheckout.bind(this),
      merge: this.gitMerge.bind(this),
      log: this.gitLog.bind(this),
      reset: this.gitReset.bind(this),
      clear: this.clearConsole.bind(this),
      hint: this.showHint.bind(this), // 🆕 Comando de ayuda
      ayuda: this.showHint.bind(this), // 🆕 Alias en español
      help: this.showHelp.bind(this), // 🆕 Ayuda general
    };
  }

  // 🆕 Vincular validador de ejercicios
  setValidator(validator) {
    this.validator = validator;
  }

  // Vincular controlador de gráfico
  setGraphController(graphController) {
    this.graphController = graphController;
  }

  // Añadir línea al output de la consola
  addOutput(text, type = 'default') {
    const line = document.createElement('div');
    line.className = `console__output-line console__output-line--${type}`;
    line.innerHTML = `<span class="prompt">$</span> ${text}`;
    this.outputElement.appendChild(line);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  // Ejecutar comando Git
  executeCommand(commandString) {
    const parts = commandString.trim().toLowerCase().split(' ');
    const command = parts[0] === 'git' ? parts[1] : parts[0];
    const args = parts[0] === 'git' ? parts.slice(2) : parts.slice(1);

    // Mostrar comando ejecutado
    this.addOutput(`git ${command} ${args.join(' ')}`.trim(), 'default');

    // Ejecutar comando si existe
    if (this.commands[command]) {
      this.commands[command](args);
    } else {
      this.addOutput(`❌ Comando no reconocido: ${command}`, 'warning');
      this.addOutput('💡 Tip: Usa comandos como init, status, add, commit, branch, checkout, merge', 'info');
    }
  }

  // Comandos Git
  gitInit(args) {
    if (this.state.initialized) {
      this.addOutput('⚠️ Ya existe un repositorio Git inicializado', 'warning');
      return;
    }

    this.state.initialized = true;
    
    // Actualizar gráfico si está disponible
    if (this.graphController) {
      this.graphController.initialize();
      this.graphController.commit('Initial commit');
    }
    
    this.addOutput('✅ Repositorio Git inicializado exitosamente', 'success');
    this.addOutput('📚 Explicación: git init crea un nuevo repositorio Git vacío', 'info');
    if (this.graphController) {
      this.addOutput('🎨 ¡Mira el gráfico! Se ha creado la rama main con un commit inicial', 'info');
    }
  }

  gitStatus(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    this.addOutput(`En la rama ${this.state.currentBranch}`, 'info');

    if (this.state.staged.length === 0 && this.state.commits.length === 0) {
      this.addOutput('No hay nada para hacer commit, directorio de trabajo limpio', 'success');
    } else if (this.state.staged.length > 0) {
      this.addOutput('Cambios preparados para commit:', 'success');
      this.state.staged.forEach((file) => {
        this.addOutput(`  nuevo archivo: ${file}`, 'success');
      });
    }

    this.addOutput('📚 Explicación: git status muestra el estado del directorio de trabajo', 'info');
  }

  gitAdd(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    const files = ['index.html', 'README.md', 'style.css'];
    this.state.staged = [...files];
    this.addOutput('✅ Archivos agregados al área de preparación', 'success');
    files.forEach((file) => {
      this.addOutput(`  ${file}`, 'success');
    });
    this.addOutput('📚 Explicación: git add prepara los archivos para el próximo commit', 'info');
  }

  gitCommit(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (this.state.staged.length === 0) {
      this.addOutput('❌ No hay cambios preparados para commit', 'warning');
      this.addOutput('💡 Tip: Usa "git add ." primero', 'info');
      return;
    }

    const commitId = Math.random().toString(36).substr(2, 7);
    
    // Extraer mensaje del commit
    let commitMsg = 'Changes committed';
    const msgIndex = args.indexOf('-m');
    if (msgIndex !== -1 && args[msgIndex + 1]) {
      commitMsg = args.slice(msgIndex + 1).join(' ').replace(/['"]/g, '');
    } else if (args.length > 0 && !args[0].startsWith('-')) {
      commitMsg = args.join(' ');
    }

    this.state.commits.push({
      id: commitId,
      message: commitMsg,
      files: [...this.state.staged],
    });
    this.state.staged = [];

    // Actualizar gráfico
    if (this.graphController) {
      this.graphController.commit(commitMsg);
    }

    this.addOutput(`✅ [${this.state.currentBranch} ${commitId}] ${commitMsg}`, 'success');
    this.addOutput('📚 Explicación: git commit guarda los cambios en el historial del repositorio', 'info');
    
    if (this.graphController) {
      this.addOutput(`🎨 ¡Mira el gráfico! Nuevo commit en la rama '${this.state.currentBranch}'`, 'info');
    }
  }

  gitBranch(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      // Listar ramas
      this.addOutput('Ramas disponibles:', 'info');
      this.state.branches.forEach((branch) => {
        const marker = branch === this.state.currentBranch ? '* ' : '  ';
        const type = branch === this.state.currentBranch ? 'success' : 'default';
        this.addOutput(`${marker}${branch}`, type);
      });
    } else {
      // Crear nueva rama
      const newBranch = args[0];
      if (this.state.branches.includes(newBranch)) {
        this.addOutput(`❌ La rama '${newBranch}' ya existe`, 'warning');
        return;
      }

      this.state.branches.push(newBranch);
      
      // Actualizar gráfico
      if (this.graphController) {
        this.graphController.createBranch(newBranch);
        this.addOutput(`✅ Rama '${newBranch}' creada desde '${this.state.currentBranch}'`, 'success');
        this.addOutput(`🎨 ¡Mira el gráfico! La rama '${newBranch}' se ha bifurcado desde '${this.state.currentBranch}'`, 'info');
        this.addOutput(`💡 Usa "git checkout ${newBranch}" para cambiar a la nueva rama`, 'info');
      } else {
        this.addOutput(`✅ Rama '${newBranch}' creada`, 'success');
      }
    }

    this.addOutput('📚 Explicación: git branch crea o lista las ramas del repositorio', 'info');
  }

  gitCheckout(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('❌ Especifica una rama para cambiar', 'warning');
      return;
    }

    const targetBranch = args[0];
    if (!this.state.branches.includes(targetBranch)) {
      this.addOutput(`❌ La rama '${targetBranch}' no existe`, 'warning');
      this.addOutput(`💡 Usa "git branch" para ver las ramas disponibles`, 'info');
      return;
    }

    const previousBranch = this.state.currentBranch;
    this.state.currentBranch = targetBranch;
    
    // Actualizar gráfico
    if (this.graphController) {
      this.graphController.checkout(targetBranch);
    }
    
    this.addOutput(`✅ Cambiado de '${previousBranch}' a '${targetBranch}'`, 'success');
    this.addOutput('📚 Explicación: git checkout cambia entre ramas o commits', 'info');
    
    if (this.graphController) {
      this.addOutput(`🎨 ¡Mira el gráfico! El indicador muestra que ahora estás en '${targetBranch}'`, 'info');
      this.addOutput(`💡 Los próximos commits se añadirán a la rama '${targetBranch}'`, 'info');
    }
  }

  gitMerge(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('❌ Especifica una rama para fusionar', 'warning');
      return;
    }

    const sourceBranch = args[0];
    if (!this.state.branches.includes(sourceBranch)) {
      this.addOutput(`❌ La rama '${sourceBranch}' no existe`, 'warning');
      this.addOutput(`💡 Usa "git branch" para ver las ramas disponibles`, 'info');
      return;
    }

    // Actualizar gráfico
    if (this.graphController) {
      this.graphController.merge(sourceBranch);
      this.addOutput(`✅ Merge: '${sourceBranch}' → '${this.state.currentBranch}'`, 'success');
      this.addOutput(`🎨 ¡Mira el gráfico! Las ramas se han fusionado en '${this.state.currentBranch}'`, 'info');
      this.addOutput(`💡 Los cambios de '${sourceBranch}' ahora están en '${this.state.currentBranch}'`, 'info');
    } else {
      this.addOutput(`✅ Fusión de '${sourceBranch}' en '${this.state.currentBranch}' completada`, 'success');
    }
    
    this.addOutput('📚 Explicación: git merge combina cambios de diferentes ramas', 'info');
  }

  gitLog(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (this.state.commits.length === 0) {
      this.addOutput('No hay commits en el historial', 'info');
    } else {
      this.addOutput('Historial de commits:', 'info');
      [...this.state.commits].reverse().forEach((commit) => {
        this.addOutput(`commit ${commit.id}`, 'success');
        this.addOutput(`    ${commit.message}`, 'default');
      });
    }

    this.addOutput('📚 Explicación: git log muestra el historial de commits', 'info');
  }

  gitReset(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    this.state.staged = [];
    this.addOutput('✅ Área de preparación limpiada', 'success');
    this.addOutput('📚 Explicación: git reset deshace cambios en el área de preparación', 'info');
  }

  clearConsole() {
    this.outputElement.innerHTML = `
      <div class="console__output-line">
        <span class="prompt">$</span> Consola limpiada - ¡Continuemos aprendiendo Git! 🚀
      </div>
    `;
    this.addOutput('💡 Comandos: init, add, commit, branch, checkout, merge, status, log', 'info');
    this.addOutput('🆘 Ayuda: hint (pista), help (comandos)', 'info');
  }

  // 🆕 Mostrar pista del ejercicio actual
  showHint() {
    if (!this.validator) {
      this.addOutput('💡 Este modo no tiene ejercicios guiados', 'info');
      this.addOutput('📚 Usa "help" para ver todos los comandos disponibles', 'info');
      return;
    }

    const hint = this.validator.getHint();
    this.addOutput(hint, 'warning');
    
    // Si es la última pista, mostrar comando ejemplo
    if (hint.includes('🎯')) {
      const exercise = this.validator.getCurrentExercise();
      if (exercise) {
        this.addOutput(`📋 Puedes copiar y pegar: ${exercise.expectedCommand}`, 'info');
      }
    }
  }

  // 🆕 Mostrar ayuda general de comandos
  showHelp() {
    this.addOutput('📚 Comandos Git disponibles:', 'info');
    this.addOutput('  init - Inicializar repositorio', 'default');
    this.addOutput('  add . - Añadir archivos al staging', 'default');
    this.addOutput('  commit -m "msg" - Guardar cambios', 'default');
    this.addOutput('  branch <nombre> - Crear rama', 'default');
    this.addOutput('  checkout <rama> - Cambiar de rama', 'default');
    this.addOutput('  merge <rama> - Fusionar ramas', 'default');
    this.addOutput('  status - Ver estado actual', 'default');
    this.addOutput('  log - Ver historial', 'default');
    this.addOutput('', 'default');
    this.addOutput('🆘 Comandos de ayuda:', 'info');
    this.addOutput('  hint/ayuda - Pista del ejercicio actual', 'default');
    this.addOutput('  help - Mostrar esta ayuda', 'default');
    this.addOutput('  clear - Limpiar consola', 'default');
  }

  // Reiniciar todo el estado
  resetAll() {
    this.state = {
      initialized: false,
      staged: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
    };

    if (this.graphController) {
      this.graphController.reset();
    }

    this.outputElement.innerHTML = '';
    this.addOutput('🔄 Sistema reiniciado completamente', 'success');
    this.addOutput('✨ Canvas limpio - Listo para crear tu propio historial Git', 'info');
    this.addOutput('💡 Comienza con "git init" para crear un nuevo repositorio', 'info');
  }

  // Cargar demo BTTF
  loadDemo() {
    this.state = {
      initialized: true,
      staged: [],
      branches: ['main', 'clara-viva', 'biff-paradise', 'marty-calendario', 'marty-sin-papas', 'familia-feliz'],
      currentBranch: 'main',
      commits: [],
    };

    if (this.graphController) {
      this.graphController.loadBTTFDemo();
    }

    this.outputElement.innerHTML = '';
    this.addOutput('🚗⚡ Demo "Volver al Futuro" cargado', 'success');
    this.addOutput('🎬 Puedes ver las líneas temporales de la película en el gráfico', 'info');
    this.addOutput('💡 Usa "git branch" para ver todas las ramas creadas', 'info');
    this.addOutput('📚 Este es un ejemplo completo de cómo Git maneja ramas y merges', 'info');
  }
}
