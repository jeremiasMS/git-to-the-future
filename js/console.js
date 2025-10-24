// 🖥️ Simulador de consola Git interactiva
class GitConsole {
  constructor() {
    this.output = document.getElementById('consoleOutput');
    this.input = document.getElementById('commandInput');
    this.executeBtn = document.getElementById('executeBtn');
    this.gitState = {
      initialized: false,
      staged: [],
      committed: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
    };
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Botones de comandos predefinidos - ahora escriben en el input
    document.querySelectorAll('.cmd-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const command = btn.getAttribute('data-command');
        this.input.value = `git ${command}`;
        this.input.focus();
      });
    });

    // Ejecutar comando desde input
    this.executeBtn.addEventListener('click', () => {
      const command = this.input.value.trim();
      if (command) {
        this.executeCommand(command.replace('git ', ''));
        this.input.value = '';
      }
    });

    // Enter en el input
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.executeBtn.click();
      }
    });

    // Botón de reiniciar gráfico
    const resetGraphBtn = document.getElementById('resetGraphBtn');
    if (resetGraphBtn) {
      resetGraphBtn.addEventListener('click', () => {
        this.resetGraph();
      });
    }

    // Botón de cargar demo
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    if (loadDemoBtn) {
      loadDemoBtn.addEventListener('click', () => {
        this.loadDemo();
      });
    }
  }

  addOutput(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    line.innerHTML = `<span class="prompt">$</span> ${text}`;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  executeCommand(command) {
    const parts = command.toLowerCase().split(' ');
    const mainCommand = parts[0];
    const args = parts.slice(1);

    this.addOutput(`git ${command}`);

    switch (mainCommand) {
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
        this.gitBranch(args);
        break;
      case 'checkout':
        this.gitCheckout(args);
        break;
      case 'merge':
        this.gitMerge(args);
        break;
      case 'log':
        this.gitLog();
        break;
      case 'reset':
        this.gitReset();
        break;
      case 'clear':
        this.clearConsole();
        break;
      default:
        this.addOutput(`Comando no reconocido: ${command}`, 'warning');
        this.addOutput(
          '💡 Tip: Usa los botones o comandos como init, status, add, commit',
          'info'
        );
    }
  }

  gitInit() {
    if (this.gitState.initialized) {
      this.addOutput(
        'Ya existe un repositorio Git inicializado',
        'warning'
      );
    } else {
      this.gitState.initialized = true;
      
      // Actualizar el gráfico
      if (window.GitGraphController) {
        window.GitGraphController.init();
      }
      
      this.addOutput(
        '✅ Repositorio Git inicializado exitosamente',
        'success'
      );
      this.addOutput(
        '📚 Explicación: git init crea un nuevo repositorio Git vacío',
        'info'
      );
      this.addOutput(
        '🎨 ¡Mira el gráfico! Se ha creado la rama main con un commit inicial',
        'info'
      );
    }
  }

  gitStatus() {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    this.addOutput(`En la rama ${this.gitState.currentBranch}`, 'info');

    if (
      this.gitState.staged.length === 0 &&
      this.gitState.commits.length === 0
    ) {
      this.addOutput(
        'No hay nada para hacer commit, directorio de trabajo limpio',
        'success'
      );
    } else if (this.gitState.staged.length > 0) {
      this.addOutput('Cambios preparados para commit:', 'success');
      this.gitState.staged.forEach((file) => {
        this.addOutput(`  nuevo archivo: ${file}`, 'success');
      });
    }

    this.addOutput(
      '📚 Explicación: git status muestra el estado del directorio de trabajo',
      'info'
    );
  }

  gitAdd(args) {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    const files = ['index.html', 'README.md', 'style.css'];
    this.gitState.staged = [...files];
    this.addOutput(
      '✅ Archivos agregados al área de preparación',
      'success'
    );
    files.forEach((file) => {
      this.addOutput(`  ${file}`, 'success');
    });
    this.addOutput(
      '📚 Explicación: git add prepara los archivos para el próximo commit',
      'info'
    );
  }

  gitCommit(args) {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (this.gitState.staged.length === 0) {
      this.addOutput(
        '❌ No hay cambios preparados para commit',
        'warning'
      );
      this.addOutput('💡 Tip: Usa "git add ." primero', 'info');
      return;
    }

    const commitId = Math.random().toString(36).substr(2, 7);
    // Extraer el mensaje del commit (después de -m '')
    let commitMsg = 'Changes committed';
    const msgIndex = args.indexOf('-m');
    if (msgIndex !== -1 && args[msgIndex + 1]) {
      commitMsg = args.slice(msgIndex + 1).join(' ').replace(/['"]/g, '');
    } else if (args.length > 0 && !args[0].startsWith('-')) {
      commitMsg = args.join(' ');
    }

    this.gitState.commits.push({
      id: commitId,
      message: commitMsg,
      files: [...this.gitState.staged],
    });

    this.gitState.staged = [];

    // Actualizar el gráfico
    if (window.GitGraphController) {
      window.GitGraphController.commit(commitMsg);
    }

    this.addOutput(
      `✅ [${this.gitState.currentBranch} ${commitId}] ${commitMsg}`,
      'success'
    );
    this.addOutput(
      '📚 Explicación: git commit guarda los cambios en el historial del repositorio',
      'info'
    );
    this.addOutput(
      `🎨 ¡Mira el gráfico! Nuevo commit en la rama '${this.gitState.currentBranch}'`,
      'info'
    );
  }

  gitBranch(args) {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('Ramas disponibles:', 'info');
      this.gitState.branches.forEach((branch) => {
        const marker =
          branch === this.gitState.currentBranch ? '* ' : '  ';
        const color =
          branch === this.gitState.currentBranch ? 'success' : '';
        this.addOutput(`${marker}${branch}`, color);
      });
    } else {
      const newBranch = args[0];
      if (!this.gitState.branches.includes(newBranch)) {
        this.gitState.branches.push(newBranch);
        
        // Actualizar el gráfico
        if (window.GitGraphController) {
          const success = window.GitGraphController.branch(newBranch);
          if (success) {
            this.addOutput(`✅ Rama '${newBranch}' creada desde '${this.gitState.currentBranch}'`, 'success');
            this.addOutput(
              `🎨 ¡Mira el gráfico! La rama '${newBranch}' se ha bifurcado desde '${this.gitState.currentBranch}'`,
              'info'
            );
            this.addOutput(
              `💡 Usa "git checkout ${newBranch}" para cambiar a la nueva rama`,
              'info'
            );
          }
        } else {
          this.addOutput(`✅ Rama '${newBranch}' creada`, 'success');
        }
      } else {
        this.addOutput(`❌ La rama '${newBranch}' ya existe`, 'warning');
      }
    }

    this.addOutput(
      '📚 Explicación: git branch crea o lista las ramas del repositorio',
      'info'
    );
  }

  gitCheckout(args) {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('❌ Especifica una rama para cambiar', 'warning');
      return;
    }

    const targetBranch = args[0];
    if (this.gitState.branches.includes(targetBranch)) {
      const previousBranch = this.gitState.currentBranch;
      this.gitState.currentBranch = targetBranch;
      
      // Actualizar el gráfico
      if (window.GitGraphController) {
        window.GitGraphController.checkout(targetBranch);
      }
      
      this.addOutput(`✅ Cambiado de '${previousBranch}' a '${targetBranch}'`, 'success');
      this.addOutput(
        '📚 Explicación: git checkout cambia entre ramas o commits',
        'info'
      );
      this.addOutput(
        `🎨 ¡Mira el gráfico! El indicador muestra que ahora estás en '${targetBranch}'`,
        'info'
      );
      this.addOutput(
        `💡 Los próximos commits se añadirán a la rama '${targetBranch}'`,
        'info'
      );
    } else {
      this.addOutput(`❌ La rama '${targetBranch}' no existe`, 'warning');
      this.addOutput(`💡 Usa "git branch" para ver las ramas disponibles`, 'info');
    }
  }

  gitMerge(args) {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (args.length === 0) {
      this.addOutput('❌ Especifica una rama para fusionar', 'warning');
      return;
    }

    const sourceBranch = args[0];
    if (this.gitState.branches.includes(sourceBranch)) {
      // Actualizar el gráfico
      if (window.GitGraphController) {
        const success = window.GitGraphController.merge(sourceBranch);
        if (success) {
          this.addOutput(
            `✅ Merge: '${sourceBranch}' → '${this.gitState.currentBranch}'`,
            'success'
          );
          this.addOutput(
            `🎨 ¡Mira el gráfico! Las ramas se han fusionado en '${this.gitState.currentBranch}'`,
            'info'
          );
          this.addOutput(
            `💡 Los cambios de '${sourceBranch}' ahora están en '${this.gitState.currentBranch}'`,
            'info'
          );
        }
      } else {
        this.addOutput(
          `✅ Fusión de '${sourceBranch}' en '${this.gitState.currentBranch}' completada`,
          'success'
        );
      }
      this.addOutput(
        '📚 Explicación: git merge combina cambios de diferentes ramas',
        'info'
      );
    } else {
      this.addOutput(`❌ La rama '${sourceBranch}' no existe`, 'warning');
      this.addOutput(`💡 Usa "git branch" para ver las ramas disponibles`, 'info');
    }
  }

  gitLog() {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    if (this.gitState.commits.length === 0) {
      this.addOutput('No hay commits en el historial', 'info');
    } else {
      this.addOutput('Historial de commits:', 'info');
      this.gitState.commits.reverse().forEach((commit) => {
        this.addOutput(`commit ${commit.id}`, 'success');
        this.addOutput(`    ${commit.message}`, '');
      });
      this.gitState.commits.reverse(); // Restaurar orden original
    }

    this.addOutput(
      '📚 Explicación: git log muestra el historial de commits',
      'info'
    );
  }

  gitReset() {
    if (!this.gitState.initialized) {
      this.addOutput('❌ No es un repositorio git', 'warning');
      return;
    }

    this.gitState.staged = [];
    this.addOutput('✅ Área de preparación limpiada', 'success');
    this.addOutput(
      '📚 Explicación: git reset deshace cambios en el área de preparación',
      'info'
    );
  }

  clearConsole() {
    this.output.innerHTML = `
      <div class="output-line">
        <span class="prompt">$</span> Consola limpiada - ¡Continuemos aprendiendo Git! 🚀
      </div>
    `;
  }

  resetGraph() {
    // Reiniciar estado
    this.gitState = {
      initialized: false,
      staged: [],
      committed: [],
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
    };

    // Reiniciar gráfico
    if (window.GitGraphController) {
      window.GitGraphController.reset();
    }

    // Limpiar consola y mostrar mensaje
    this.output.innerHTML = '';
    this.addOutput('🔄 Gráfico reiniciado completamente', 'success');
    this.addOutput('✨ Canvas limpio - Listo para crear tu propio historial Git', 'info');
    this.addOutput('🎯 El indicador muestra "Sin repositorio"', 'info');
    this.addOutput('💡 Comienza con "git init" para crear un nuevo repositorio', 'info');
  }

  loadDemo() {
    // Reiniciar estado y marcar como inicializado
    this.gitState = {
      initialized: true,
      staged: [],
      committed: [],
      branches: ['main', '1955', '2015', '1985A', '1885'],
      currentBranch: 'main',
      commits: [],
    };

    // Cargar el demo completo
    if (window.GitGraphController) {
      window.GitGraphController.loadDemo();
    }

    // Limpiar consola y mostrar mensaje
    this.output.innerHTML = '';
    this.addOutput('🚗⚡ Demo "Volver al Futuro" cargado', 'success');
    this.addOutput('🎬 Visualización completa de las líneas temporales', 'info');
    this.addOutput('💡 Usa "git branch" para ver todas las ramas', 'info');
    this.addOutput('📚 Ejemplo de cómo Git maneja viajes temporales', 'info');
  }
}

// Inicializar la consola cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  new GitConsole();
});