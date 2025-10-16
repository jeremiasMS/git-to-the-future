// 🎬 Gráfico de líneas temporales de "Volver al Futuro" usando GitGraph
// Gráfico global para acceso desde la consola
let gitgraph;
let branches = {};
let currentBranch;
let currentBranchName = 'main';

// Función para actualizar el indicador de rama actual
function updateBranchIndicator(branchName) {
  const indicator = document.getElementById('currentBranchIndicator');
  if (indicator) {
    indicator.textContent = branchName;
    indicator.style.animation = 'pulse 0.5s ease-in-out';
    setTimeout(() => {
      indicator.style.animation = '';
    }, 500);
  }
}

// Función para inicializar el gráfico
function initializeGitGraph() {
  const colors = [
    '#2196f3',
    '#a1887f',
    '#ff9100',
    '#ff4081',
    '#d32f2f',
    '#8bc34a',
    '#7c4dff',
  ];
  
  const graphContainer = document.getElementById('gitGraph');
  
  // Limpiar el contenedor
  graphContainer.innerHTML = '';
  
  gitgraph = GitgraphJS.createGitgraph(graphContainer, {
    template: GitgraphJS.templateExtend('metro', {
      colors,
      commit: {
        message: {
          displayAuthor: false,
          displayHash: false,
        },
      },
    }),
    orientation: 'vertical-reverse',
  });

  // Rama principal
  branches.main = gitgraph.branch('main');
  currentBranch = branches.main;
  currentBranchName = 'main';
  updateBranchIndicator('main');
  
  return gitgraph;
}

// Función para cargar el demo completo de Back to the Future
function loadBackToTheFutureDemo() {
  initializeGitGraph();
  
  const main = branches.main;
  main.commit('1885 Lejano Oeste');
  main.commit('Doc viaja por error (Checkout)');
  main.commit('Marty llega a 1985');

  const claraViva = main.branch('clara-viva');
  claraViva.commit('Doc conoce a Clara en 1885');

  main.commit('Clara muere en 1885');
  claraViva.commit('Marty se mete en problemas');
  claraViva.commit('Roban locomotora');
  claraViva.commit('Marty viaja al futuro (1985)');

  main.merge('clara-viva');

  claraViva.commit('Doc y Clara forman familia');

  main.commit('El Doc escribe una nota para Marty');
  main.commit('1955');
  main.commit('Marty llega desde 1985');

  main.commit('Biff llega desde 1985 con el calendario');

  const biffParadise = main.branch('biff-paradise');
  biffParadise.commit('Marty llega nuevamente a 1955');
  biffParadise.commit('Jennifer se queda en esta distopia');

  const martyCalendario = biffParadise.branch('marty-calendario');

  biffParadise.commit('Biff se entrega el caendario');

  martyCalendario.commit('Marty le quita el calendario a Biff (Joven)');

  // Marty sin papás
  const martySinPapas = main.branch('marty-sin-papas');
  martySinPapas.commit('Marty interfiere en la cita de sus padres');
  martySinPapas.commit('Marty empieza a desaparecer');
  martySinPapas.commit('Marty logra que sus padres se enamoren');

  main.commit('George McFly conoce a Lorraine');
  main.commit('El Baile del Encanto Bajo el Mar');

  main.merge('marty-sin-papas');
  main.merge('marty-calendario');

  const familiaFeliz = main.branch('familia-feliz');

  main.commit('12 Noviembre 22:04 hs Rayo en la torre del reloj');

  martyCalendario.commit(
    'El Doc desaparece (viaja al pasado por accidente)'
  );
  martyCalendario.commit('Marty recibe una carta de 1885');
  martyCalendario.commit('El doc ayuda a Marty a viajar al pasado');

  biffParadise.commit('El Doc es encerrado en el manicomio');

  main.commit('El Doc inventa la Máquina del tiempo');

  biffParadise.commit('George McFly muere');
  biffParadise.commit('Jennifer, Marty y el Doc llegan desde 2015');
  biffParadise.commit('Marty enfrenta a Biff');

  main.commit('1985 normal y aburrido');

  biffParadise.commit('Jennifer vuelve a la rama principal (cherry-pick)');
  familiaFeliz.merge('biff-paradise');

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
}

// Funciones para control del gráfico desde la consola
window.GitGraphController = {
  init: function() {
    initializeGitGraph();
    branches.main.commit('Initial commit');
    updateBranchIndicator('main');
  },
  
  commit: function(message) {
    if (currentBranch) {
      // Añadir indicador de rama actual al mensaje
      const commitMessage = `[${currentBranchName}] ${message}`;
      currentBranch.commit(commitMessage);
      return true;
    }
    return false;
  },
  
  branch: function(branchName) {
    if (currentBranch && !branches[branchName]) {
      branches[branchName] = currentBranch.branch(branchName);
      // Hacer un commit visual para mostrar la bifurcación
      branches[branchName].commit(`✨ Rama '${branchName}' creada`);
      return true;
    }
    return false;
  },
  
  checkout: function(branchName) {
    if (branches[branchName]) {
      currentBranch = branches[branchName];
      currentBranchName = branchName;
      updateBranchIndicator(branchName);
      // Hacer un commit de checkout para visualizar el cambio
      currentBranch.commit(`🎯 Checkout a '${branchName}'`);
      return true;
    }
    return false;
  },
  
  merge: function(branchName) {
    if (currentBranch && branches[branchName]) {
      currentBranch.merge(branches[branchName]);
      // Commit de merge para visualizar
      currentBranch.commit(`🔀 Merge '${branchName}' → '${currentBranchName}'`);
      return true;
    }
    return false;
  },
  
  loadDemo: function() {
    loadBackToTheFutureDemo();
    currentBranchName = 'main';
    updateBranchIndicator('main (Demo BTTF)');
  },
  
  reset: function() {
    branches = {};
    currentBranch = null;
    currentBranchName = '';
    const indicator = document.getElementById('currentBranchIndicator');
    if (indicator) {
      indicator.textContent = 'Sin repositorio';
      indicator.style.opacity = '0.5';
    }
  },
  
  getCurrentBranch: function() {
    return currentBranchName;
  }
};

// Cargar el demo al inicio
document.addEventListener('DOMContentLoaded', () => {
  loadBackToTheFutureDemo();
  updateBranchIndicator('main (Demo BTTF)');
});