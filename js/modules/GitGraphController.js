// 📊 Controlador del Gráfico GitGraph - Módulo reutilizable
export class GitGraphController {
  constructor(containerId) {
    this.containerId = containerId;
    this.gitgraph = null;
    this.branches = {};
    this.currentBranch = null;
    this.currentBranchName = '';
    this.colors = [
      '#2196f3', // Azul DeLorean
      '#a1887f', // Marrón vintage
      '#ff9100', // Naranja BTTF
      '#ff4081', // Rosa neón
      '#d32f2f', // Rojo plutonio
      '#8bc34a', // Verde tiempo
      '#7c4dff', // Púrpura flux
    ];
  }

  // Inicializar el gráfico con configuración base
  initialize() {
    const graphContainer = document.getElementById(this.containerId);
    
    if (!graphContainer) {
      console.error(`Container ${this.containerId} not found`);
      return null;
    }

    // Limpiar el contenedor
    graphContainer.innerHTML = '';
    
    this.gitgraph = GitgraphJS.createGitgraph(graphContainer, {
      template: GitgraphJS.templateExtend('metro', {
        colors: this.colors,
        commit: {
          message: {
            displayAuthor: false,
            displayHash: false,
          },
        },
      }),
      orientation: 'vertical-reverse',
    });

    // Crear rama principal
    this.branches.main = this.gitgraph.branch('main');
    this.currentBranch = this.branches.main;
    this.currentBranchName = 'main';
    
    return this.gitgraph;
  }

  // Crear commit en la rama actual
  commit(message) {
    if (!this.currentBranch) {
      console.warn('No current branch selected');
      return false;
    }

    // Añadir indicador de rama actual al mensaje
    const commitMessage = `[${this.currentBranchName}] ${message}`;
    this.currentBranch.commit(commitMessage);
    return true;
  }

  // Crear nueva rama desde la rama actual
  createBranch(branchName) {
    if (!this.currentBranch) {
      console.warn('No current branch to branch from');
      return false;
    }

    if (this.branches[branchName]) {
      console.warn(`Branch ${branchName} already exists`);
      return false;
    }

    this.branches[branchName] = this.currentBranch.branch(branchName);
    // Hacer un commit visual para mostrar la bifurcación
    this.branches[branchName].commit(`✨ Rama '${branchName}' creada`);
    return true;
  }

  // Cambiar a otra rama (checkout)
  checkout(branchName) {
    if (!this.branches[branchName]) {
      console.warn(`Branch ${branchName} does not exist`);
      return false;
    }

    this.currentBranch = this.branches[branchName];
    this.currentBranchName = branchName;
    
    // Hacer un commit de checkout para visualizar el cambio
    this.currentBranch.commit(`🎯 Checkout a '${branchName}'`);
    return true;
  }

  // Fusionar rama en la rama actual
  merge(sourceBranchName) {
    if (!this.currentBranch) {
      console.warn('No current branch selected');
      return false;
    }

    if (!this.branches[sourceBranchName]) {
      console.warn(`Branch ${sourceBranchName} does not exist`);
      return false;
    }

    this.currentBranch.merge(this.branches[sourceBranchName]);
    // Commit de merge para visualizar
    this.currentBranch.commit(`🔀 Merge '${sourceBranchName}' → '${this.currentBranchName}'`);
    return true;
  }

  // 🆕 Rebase - Reorganizar historia sobre otra rama
  rebase(baseBranchName) {
    if (!this.currentBranch) {
      console.warn('No current branch selected');
      return false;
    }

    if (!this.branches[baseBranchName]) {
      console.warn(`Base branch ${baseBranchName} does not exist`);
      return false;
    }

    // Visualizar rebase como un commit especial
    this.currentBranch.commit({
      subject: `🔥 Rebase sobre '${baseBranchName}'`,
      style: {
        dot: {
          color: '#ff9100',
          size: 12,
          strokeWidth: 3,
        },
        message: {
          color: '#ff9100',
        },
      },
    });

    return true;
  }

  // 🆕 Cherry-pick - Copiar commit específico de otra rama
  cherryPick(sourceBranchName) {
    if (!this.currentBranch) {
      console.warn('No current branch selected');
      return false;
    }

    if (!this.branches[sourceBranchName]) {
      console.warn(`Source branch ${sourceBranchName} does not exist`);
      return false;
    }

    // Visualizar cherry-pick como commit especial
    this.currentBranch.commit({
      subject: `🍒 Cherry-pick desde '${sourceBranchName}'`,
      style: {
        dot: {
          color: '#ff4081',
          size: 10,
          strokeWidth: 2,
        },
        message: {
          color: '#ff4081',
        },
      },
    });

    return true;
  }

  // 🆕 Deshacer último commit (para reset --soft)
  undoLastCommit() {
    // En GitGraph no podemos realmente deshacer, pero podemos visualizarlo
    if (this.currentBranch) {
      this.currentBranch.commit({
        subject: `⚠️ Reset --soft (commit deshecho)`,
        style: {
          dot: {
            color: '#ff5722',
            size: 8,
            strokeWidth: 2,
            strokeColor: '#ff5722',
          },
          message: {
            color: '#ff5722',
          },
        },
      });
    }
    return true;
  }

  // Obtener nombre de la rama actual
  getCurrentBranch() {
    return this.currentBranchName;
  }

  // Verificar si una rama existe
  branchExists(branchName) {
    return !!this.branches[branchName];
  }

  // Obtener lista de todas las ramas
  getAllBranches() {
    return Object.keys(this.branches);
  }

  // Reiniciar todo el gráfico
  reset() {
    this.branches = {};
    this.currentBranch = null;
    this.currentBranchName = '';
    
    const graphContainer = document.getElementById(this.containerId);
    if (graphContainer) {
      graphContainer.innerHTML = '';
    }
  }

  // Cargar demo completo de Back to the Future
  loadBTTFDemo() {
    this.initialize();
    
    const main = this.branches.main;
    main.commit('1885 Lejano Oeste');
    main.commit('Doc viaja por error (Checkout)');
    main.commit('Marty llega a 1985');

    const claraViva = main.branch('clara-viva');
    claraViva.commit('Doc conoce a Clara en 1885');

    main.commit('Clara muere en 1885');
    claraViva.commit('Marty se mete en problemas');
    claraViva.commit('Roban locomotora');
    claraViva.commit('Marty viaja al futuro (1985)');

    main.merge(claraViva);

    claraViva.commit('Doc y Clara forman familia');

    main.commit('El Doc escribe una nota para Marty');
    main.commit('1955');
    main.commit('Marty llega desde 1985');

    main.commit('Biff llega desde 1985 con el calendario');

    const biffParadise = main.branch('biff-paradise');
    this.branches['biff-paradise'] = biffParadise;
    biffParadise.commit('Marty llega nuevamente a 1955');
    biffParadise.commit('Jennifer se queda en esta distopia');

    const martyCalendario = biffParadise.branch('marty-calendario');
    this.branches['marty-calendario'] = martyCalendario;

    biffParadise.commit('Biff se entrega el calendario');

    martyCalendario.commit('Marty le quita el calendario a Biff (Joven)');

    // Marty sin papás
    const martySinPapas = main.branch('marty-sin-papas');
    this.branches['marty-sin-papas'] = martySinPapas;
    martySinPapas.commit('Marty interfiere en la cita de sus padres');
    martySinPapas.commit('Marty empieza a desaparecer');
    martySinPapas.commit('Marty logra que sus padres se enamoren');

    main.commit('George McFly conoce a Lorraine');
    main.commit('El Baile del Encanto Bajo el Mar');

    main.merge(martySinPapas);
    main.merge(martyCalendario);

    const familiaFeliz = main.branch('familia-feliz');
    this.branches['familia-feliz'] = familiaFeliz;

    main.commit('12 Noviembre 22:04 hs Rayo en la torre del reloj');

    martyCalendario.commit('El Doc desaparece (viaja al pasado por accidente)');
    martyCalendario.commit('Marty recibe una carta de 1885');
    martyCalendario.commit('El doc ayuda a Marty a viajar al pasado');

    biffParadise.commit('El Doc es encerrado en el manicomio');

    main.commit('El Doc inventa la Máquina del tiempo');

    biffParadise.commit('George McFly muere');
    biffParadise.commit('Jennifer, Marty y el Doc llegan desde 2015');
    biffParadise.commit('Marty enfrenta a Biff');

    main.commit('1985 normal y aburrido');

    biffParadise.commit('Jennifer vuelve a la rama principal (cherry-pick)');
    familiaFeliz.merge(biffParadise);

    biffParadise.commit('Branch deprecada');

    familiaFeliz.commit('1985 Familia McFly Exitosa');

    main.commit('Marty conoce la máquina del tiempo');
    main.commit('Los libios descubren al Doc y le disparan');
    main.commit('Marty tiene un accidente');

    familiaFeliz.commit('Marty no tiene un accidente');

    main.commit('Marty y Jennifer se casan');
    main.commit('2015');
    main.commit('Despiden a marty del trabajo');

    familiaFeliz.commit('No despiden a Marty del trabajo');

    main.commit('Biff descubre la verdad');
    main.commit('');
    main.commit('');

    this.currentBranchName = 'main';
  }
}
