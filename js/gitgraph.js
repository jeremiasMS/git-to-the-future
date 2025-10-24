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
  main.commit('1985 - Presente original');
  main.commit('Marty conoce a Doc Brown'); 

  const rama1955 = main.branch('1955');
  rama1955.commit('Marty viaja accidentalmente a 1955');
  rama1955.commit('Interfiere con el encuentro de sus padres');
  rama1955.commit('Debe arreglar la línea temporal');
  
  main.merge('1955');
  main.commit('1985 - Regreso exitoso');

  const rama2015 = main.branch('2015');
  rama2015.commit('Viaje al futuro con Doc');
  rama2015.commit('Problema con la familia McFly');
  
  const distopia = rama2015.branch('1985A');
  distopia.commit('Biff alteró la historia');
  distopia.commit('Realidad distópica');
  
  rama2015.merge('distopia');
  rama2015.commit('Línea temporal corregida');
  
  main.merge('2015');
  
  const rama1885 = main.branch('1885');
  rama1885.commit('Doc atrapado en el Viejo Oeste');
  rama1885.commit('Marty debe rescatarlo');
  rama1885.commit('Escape en el tren');
  
  main.merge('1885');
  main.commit('Historia completa restaurada');
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

// Ya no cargamos el demo automáticamente
// El demo se carga solo cuando el usuario hace clic en el botón correspondiente