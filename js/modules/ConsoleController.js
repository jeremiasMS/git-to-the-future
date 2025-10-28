// 🖥️ Controlador de Consola Git - Módulo reutilizable
export class ConsoleController {
  constructor(outputId, inputId, graphController = null) {
    this.outputElement = document.getElementById(outputId);
    this.inputElement = document.getElementById(inputId);
    this.graphController = graphController;
    this.validator = null; // 🆕 Validador de ejercicios (opcional)
    this.isFirstCommand = true; // Bandera para detectar primer comando
    
    this.state = {
      initialized: false,
      staged: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
      stash: [], // 🆕 Para git stash
      lastCommitMessage: '', // 🆕 Para revert
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
      rebase: this.gitRebase.bind(this), // 🆕 Comando rebase
      'cherry-pick': this.gitCherryPick.bind(this), // 🆕 Comando cherry-pick
      stash: this.gitStash.bind(this), // 🆕 Comando stash
      revert: this.gitRevert.bind(this), // 🆕 Comando revert
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
    if (!this.outputElement) return;
    
    const line = document.createElement('div');
    line.className = `output-line output-line--${type}`;
    line.textContent = text;
    this.outputElement.appendChild(line);
    
    // Auto-scroll al final
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  clearWelcomeMessage() {
    // Limpiar el mensaje de bienvenida al ejecutar el primer comando
    if (this.isFirstCommand && this.outputElement) {
      this.outputElement.innerHTML = '';
      this.isFirstCommand = false;
    }
  }

  // Ejecutar comando
  executeCommand(command, args = []) {
    // Limpiar mensaje de bienvenida antes de ejecutar el primer comando
    this.clearWelcomeMessage();

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
    this.addOutput('✅ Archivos agregados al staging area', 'success');
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

    const commitId = Math.random().toString(36).slice(2, 9);
    
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

    // Verificar si es reset --soft HEAD~1
    if (args.includes('--soft') && args.some(arg => arg.includes('HEAD'))) {
      if (this.state.commits.length === 0) {
        this.addOutput('❌ No hay commits para deshacer', 'warning');
        return;
      }

      const lastCommit = this.state.commits.pop();
      this.state.staged = [...lastCommit.files];
      
      // Actualizar gráfico
      if (this.graphController) {
        this.graphController.undoLastCommit();
      }

      this.addOutput(`✅ Commit deshecho (cambios preservados en staging): "${lastCommit.message}"`, 'success');
      this.addOutput('💾 Los cambios se mantienen en el staging area (staged)', 'info');
      this.addOutput('📚 Explicación: reset --soft deshace commits pero mantiene los cambios', 'warning');
      this.addOutput('⚠️ Este comando reescribe la historia (usar con cuidado)', 'warning');
      return;
    }

    // Reset normal (limpiar staging)
    this.state.staged = [];
    this.addOutput('✅ Staging area limpiado', 'success');
    this.addOutput('📚 Explicación: git reset deshace cambios en el staging area', 'info');
  }

  // 🆕 Git Rebase - Reorganizar historia
  gitRebase(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('❌ Especifica una rama base para rebase', 'warning');
      this.addOutput('💡 Ejemplo: git rebase main', 'info');
      return;
    }

    const baseBranch = args[0];
    if (!this.state.branches.includes(baseBranch)) {
      this.addOutput(`❌ La rama '${baseBranch}' no existe`, 'warning');
      return;
    }

    if (this.state.currentBranch === baseBranch) {
      this.addOutput('❌ Ya estás en esa rama', 'warning');
      return;
    }

    // Actualizar gráfico
    if (this.graphController) {
      this.graphController.rebase(baseBranch);
    }

    this.addOutput(`✅ Rebase completado: '${this.state.currentBranch}' ahora está sobre '${baseBranch}'`, 'success');
    this.addOutput('🔥 Los commits han sido reorganizados para una historia más limpia', 'info');
    this.addOutput('📚 Explicación: rebase mueve commits a un nuevo punto base', 'info');
    this.addOutput('⚠️ Este comando reescribe la historia (usar con cuidado)', 'warning');
    
    if (this.graphController) {
      this.addOutput('🎨 ¡Mira el gráfico! La línea temporal se ha reorganizado', 'info');
    }
  }

  // 🆕 Git Cherry-Pick - Copiar commit específico
  gitCherryPick(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('❌ Especifica un commit o rama para cherry-pick', 'warning');
      this.addOutput('💡 Ejemplo: git cherry-pick biff-paradise', 'info');
      return;
    }

    const source = args[0];
    
    // Verificar si es una rama
    if (this.state.branches.includes(source)) {
      // Simular copiar el último commit de esa rama
      if (this.graphController) {
        this.graphController.cherryPick(source);
      }

      this.addOutput(`✅ Cherry-pick desde '${source}' aplicado`, 'success');
      this.addOutput(`🍒 Commit específico copiado a '${this.state.currentBranch}'`, 'info');
      this.addOutput('📚 Explicación: cherry-pick copia commits específicos entre ramas', 'info');
      
      if (this.graphController) {
        this.addOutput('🎨 ¡Mira el gráfico! El commit se ha copiado a esta rama', 'info');
      }
    } else {
      this.addOutput(`❌ No se encontró la rama o commit '${source}'`, 'warning');
      this.addOutput('💡 Usa "git branch" para ver ramas disponibles', 'info');
    }
  }

  // 🆕 Git Stash - Guardar trabajo temporal
  gitStash(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    const subcommand = args[0] || 'push';

    if (subcommand === 'push' || args.length === 0) {
      // Guardar cambios
      if (this.state.staged.length === 0) {
        this.addOutput('⚠️ No hay cambios para guardar en stash', 'warning');
        return;
      }

      this.state.stash.push({
        files: [...this.state.staged],
        branch: this.state.currentBranch,
        message: args[1] || 'WIP on ' + this.state.currentBranch
      });
      
      this.state.staged = [];
      
      this.addOutput('✅ Cambios guardados en stash', 'success');
      this.addOutput('💾 Tu trabajo está a salvo temporalmente', 'info');
      this.addOutput('📚 Explicación: stash guarda cambios sin hacer commit', 'info');
      this.addOutput('💡 Usa "git stash pop" para recuperarlos', 'info');
      
    } else if (subcommand === 'pop') {
      // Recuperar cambios
      if (this.state.stash.length === 0) {
        this.addOutput('❌ No hay nada en el stash', 'warning');
        return;
      }

      const stashed = this.state.stash.pop();
      this.state.staged = [...stashed.files];
      
      this.addOutput('✅ Cambios recuperados desde stash', 'success');
      this.addOutput('💾 Los cambios han vuelto al área de trabajo', 'info');
      this.addOutput('📚 Explicación: stash pop recupera y elimina del stash', 'info');
      
    } else if (subcommand === 'list') {
      // Listar stash
      if (this.state.stash.length === 0) {
        this.addOutput('No hay nada guardado en stash', 'info');
      } else {
        this.addOutput('📦 Elementos en stash:', 'info');
        this.state.stash.forEach((item, i) => {
          this.addOutput(`  stash@{${i}}: ${item.message}`, 'default');
        });
      }
    }
  }

  // 🆕 Git Revert - Deshacer commit de forma segura
  gitRevert(args) {
    if (!this.state.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (this.state.commits.length === 0) {
      this.addOutput('❌ No hay commits para revertir', 'warning');
      return;
    }

    const target = args[0] || 'HEAD';
    
    if (target === 'HEAD' || target.includes('HEAD')) {
      const lastCommit = this.state.commits[this.state.commits.length - 1];
      
      // Crear un nuevo commit que deshace el anterior
      const revertCommitId = Math.random().toString(36).substr(2, 7);
      const revertMsg = `Revert "${lastCommit.message}"`;
      
      this.state.commits.push({
        id: revertCommitId,
        message: revertMsg,
        files: [],
        isRevert: true
      });

      // Actualizar gráfico
      if (this.graphController) {
        this.graphController.commit(revertMsg);
      }

      this.addOutput(`✅ [${this.state.currentBranch} ${revertCommitId}] ${revertMsg}`, 'success');
      this.addOutput('🔄 Cambios revertidos mediante un nuevo commit', 'info');
      this.addOutput('📚 Explicación: revert deshace cambios sin reescribir historia', 'info');
      this.addOutput('✅ Método seguro para colaboración (no cambia commits anteriores)', 'success');
      
      if (this.graphController) {
        this.addOutput('🎨 ¡Mira el gráfico! Se agregó un commit de reversión', 'info');
      }
    }
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
    this.addOutput('📚 Comandos Git Básicos:', 'info');
    this.addOutput('  init - Inicializar repositorio', 'default');
    this.addOutput('  add . - Añadir archivos al staging', 'default');
    this.addOutput('  commit -m "msg" - Guardar cambios', 'default');
    this.addOutput('  branch <nombre> - Crear rama', 'default');
    this.addOutput('  checkout <rama> - Cambiar de rama', 'default');
    this.addOutput('  merge <rama> - Fusionar ramas', 'default');
    this.addOutput('  status - Ver estado actual', 'default');
    this.addOutput('  log - Ver historial', 'default');
    this.addOutput('', 'default');
    this.addOutput('🔥 Comandos Avanzados:', 'warning');
    this.addOutput('  rebase <rama> - Reorganizar historia', 'default');
    this.addOutput('  cherry-pick <rama> - Copiar commit específico', 'default');
    this.addOutput('  stash - Guardar trabajo temporal', 'default');
    this.addOutput('  stash pop - Recuperar trabajo guardado', 'default');
    this.addOutput('  reset --soft HEAD~1 - Deshacer último commit', 'default');
    this.addOutput('  revert HEAD - Deshacer commit (seguro)', 'default');
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
      stash: [],
      lastCommitMessage: '',
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
