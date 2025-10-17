// ✅ Validador de Ejercicios - Para verificar que el usuario complete correctamente cada pantalla
export class ExerciseValidator {
  constructor(consoleController, graphController) {
    this.consoleController = consoleController;
    this.graphController = graphController;
    this.exercises = [];
    this.currentExerciseIndex = 0;
    this.hintLevel = 0; // 🆕 Nivel de pista actual (0, 1, 2)
  }

  // Definir ejercicios para una pantalla
  setExercises(exercises) {
    this.exercises = exercises;
    this.currentExerciseIndex = 0;
    this.hintLevel = 0;
  }

  // Obtener ejercicio actual
  getCurrentExercise() {
    return this.exercises[this.currentExerciseIndex] || null;
  }

  // 🆕 Obtener pista progresiva del ejercicio actual
  getHint() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return '✅ No hay ejercicios activos';

    const hints = exercise.hints || [
      exercise.hint,
      `El comando que necesitas es: git ${exercise.expectedCommand.split(' ')[1]}`,
      `Comando completo: ${exercise.expectedCommand}`
    ];

    if (this.hintLevel >= hints.length) {
      return `🎯 Última pista: ${hints[hints.length - 1]}`;
    }

    const hint = hints[this.hintLevel];
    this.hintLevel++;

    return `💡 Pista ${this.hintLevel}/${hints.length}: ${hint}`;
  }

  // 🆕 Analizar comando y dar feedback específico
  analyzeCommand(command, args) {
    const exercise = this.getCurrentExercise();
    if (!exercise) return { valid: false, message: '❌ No hay ejercicios activos' };

    const fullCommand = `${command} ${args.join(' ')}`.trim().toLowerCase();
    const expected = exercise.expectedCommand.toLowerCase();

    // ✅ Comando correcto
    if (this.isCommandMatch(fullCommand, expected)) {
      return { 
        valid: true, 
        message: exercise.successMessage 
      };
    }

    // ❌ Comando incorrecto - dar feedback específico
    const expectedParts = expected.split(' ');
    const actualParts = fullCommand.split(' ');
    
    const expectedCmd = expectedParts[0] === 'git' ? expectedParts[1] : expectedParts[0];
    const actualCmd = actualParts[0] === 'git' ? actualParts[1] : actualParts[0];
    
    // Comando diferente al esperado
    if (actualCmd !== expectedCmd) {
      return { 
        valid: false, 
        message: `❌ Se esperaba el comando "${expectedCmd}"`,
        suggestion: exercise.hint
      };
    }

    // Comando correcto pero faltan/sobran argumentos
    return { 
      valid: false, 
      message: `❌ Revisa los argumentos del comando`,
      suggestion: exercise.hint
    };
  }

  // Validar si un comando es correcto para el ejercicio actual
  validateCommand(command, args) {
    return this.analyzeCommand(command, args);
  }

  // Comparar comandos (con flexibilidad para variaciones)
  isCommandMatch(actual, expected) {
    // Normalizar espacios y remover "git" si existe
    const cleanActual = actual.replace(/^git\s+/, '').replace(/\s+/g, ' ').trim();
    const cleanExpected = expected.replace(/^git\s+/, '').replace(/\s+/g, ' ').trim();

    // Para commits, solo verificar que tenga commit y -m
    if (cleanExpected.startsWith('commit')) {
      return cleanActual.startsWith('commit') && cleanActual.includes('-m');
    }

    // Para branch, verificar comando + nombre de rama
    if (cleanExpected.startsWith('branch')) {
      const expectedBranch = cleanExpected.split(' ')[1];
      return cleanActual.startsWith('branch') && cleanActual.includes(expectedBranch);
    }

    // Para checkout, verificar comando + nombre de rama
    if (cleanExpected.startsWith('checkout')) {
      const expectedBranch = cleanExpected.split(' ')[1];
      return cleanActual.startsWith('checkout') && cleanActual.includes(expectedBranch);
    }

    // Coincidencia exacta para otros comandos
    return cleanActual === cleanExpected;
  }

  // Avanzar al siguiente ejercicio
  nextExercise() {
    this.currentExerciseIndex++;
    this.hintLevel = 0; // 🆕 Reiniciar nivel de pistas
    
    if (this.currentExerciseIndex >= this.exercises.length) {
      return {
        completed: true,
        message: '🎉 ¡Felicidades! Has completado todos los ejercicios de esta pantalla.',
      };
    }

    return {
      completed: false,
      message: `📝 Ejercicio ${this.currentExerciseIndex + 1}/${this.exercises.length}`,
      exercise: this.getCurrentExercise(),
    };
  }

  // Verificar si todos los ejercicios están completos
  isComplete() {
    return this.currentExerciseIndex >= this.exercises.length;
  }

  // Obtener progreso actual
  getProgress() {
    return {
      current: this.currentExerciseIndex,
      total: this.exercises.length,
      percentage: Math.round((this.currentExerciseIndex / this.exercises.length) * 100),
    };
  }

  // Reiniciar ejercicios
  reset() {
    this.currentExerciseIndex = 0;
    this.hintLevel = 0; // 🆕 Reiniciar pistas
  }

  // Validar estado del repositorio
  validateRepoState(expectedState) {
    if (!this.consoleController || !this.graphController) {
      return { valid: false, message: 'Controladores no disponibles' };
    }

    const state = this.consoleController.state;
    const checks = [];

    // Verificar si está inicializado
    if (expectedState.initialized !== undefined) {
      checks.push({
        name: 'Repositorio inicializado',
        valid: state.initialized === expectedState.initialized,
      });
    }

    // Verificar rama actual
    if (expectedState.currentBranch) {
      checks.push({
        name: 'Rama actual',
        valid: state.currentBranch === expectedState.currentBranch,
      });
    }

    // Verificar número de ramas
    if (expectedState.branchCount) {
      checks.push({
        name: 'Número de ramas',
        valid: state.branches.length === expectedState.branchCount,
      });
    }

    // Verificar que exista una rama específica
    if (expectedState.hasBranch) {
      checks.push({
        name: `Rama '${expectedState.hasBranch}' existe`,
        valid: state.branches.includes(expectedState.hasBranch),
      });
    }

    // Verificar número de commits
    if (expectedState.commitCount) {
      checks.push({
        name: 'Número de commits',
        valid: state.commits.length >= expectedState.commitCount,
      });
    }

    const allValid = checks.every(check => check.valid);
    const failedChecks = checks.filter(check => !check.valid);

    return {
      valid: allValid,
      checks: checks,
      message: allValid 
        ? '✅ El estado del repositorio es correcto'
        : `❌ Verificaciones fallidas: ${failedChecks.map(c => c.name).join(', ')}`,
    };
  }
}

// Ejercicios predefinidos para cada pantalla
export const SCREEN_EXERCISES = {
  // Pantalla 1: Origin (1985→1955)
  screen1: [
    {
      id: 1,
      title: 'Inicializar repositorio',
      description: 'Crea un nuevo repositorio Git para comenzar tu viaje temporal',
      expectedCommand: 'git init',
      hint: '💡 Usa el comando "git init" para inicializar el repositorio',
      hints: [
        'Necesitas crear un repositorio Git en este directorio',
        'El comando empieza con "git" y sirve para inicializar',
        'Comando: git init'
      ],
      successMessage: '¡Has creado la máquina del tiempo (repositorio Git)!',
      validation: { initialized: true },
    },
    {
      id: 2,
      title: 'Primer commit',
      description: 'Registra el punto de partida: 1985',
      expectedCommand: 'git commit',
      hint: '💡 Primero añade archivos con "git add ." y luego haz commit',
      hints: [
        'Primero debes preparar archivos con "git add ."',
        'Luego usa "git commit -m" para guardar los cambios',
        'Comando: git add . && git commit -m "mensaje"'
      ],
      successMessage: 'Has registrado el punto de partida temporal',
      validation: { commitCount: 1 },
    },
    {
      id: 3,
      title: 'Crear rama del pasado',
      description: 'Crea una rama llamada "1955" para viajar al pasado',
      expectedCommand: 'git branch 1955',
      hint: '💡 Usa "git branch 1955" para crear la rama',
      hints: [
        'Necesitas crear una rama llamada "1955"',
        'El comando es "git branch" seguido del nombre',
        'Comando: git branch 1955'
      ],
      successMessage: '¡Has abierto una línea temporal hacia 1955!',
      validation: { hasBranch: '1955' },
    },
    {
      id: 4,
      title: 'Viajar al pasado',
      description: 'Cambia a la rama "1955" para comenzar tu aventura',
      expectedCommand: 'git checkout 1955',
      hint: '💡 Usa "git checkout 1955" para cambiar de rama',
      hints: [
        'Debes cambiar a la rama que acabas de crear',
        'El comando es "git checkout" más el nombre de la rama',
        'Comando: git checkout 1955'
      ],
      successMessage: '¡Bienvenido a 1955! Has viajado al pasado correctamente',
      validation: { currentBranch: '1955' },
    },
  ],

  // Pantalla 2: Time Travel (2015)
  screen2: [
    {
      id: 1,
      title: 'Viajar al futuro',
      description: 'Crea una rama "2015" y viaja al futuro',
      expectedCommand: 'git branch 2015',
      hint: '💡 Crea la rama con "git branch 2015"',
      hints: [
        'Necesitas crear una nueva rama hacia el futuro',
        'El comando branch crea una nueva línea temporal',
        'Comando: git branch 2015'
      ],
      successMessage: 'Has creado una línea temporal hacia el futuro',
      validation: { hasBranch: '2015' },
    },
    {
      id: 2,
      title: 'Checkout al futuro',
      description: 'Cambia a la rama "2015"',
      expectedCommand: 'git checkout 2015',
      hint: '💡 Usa "git checkout 2015"',
      hints: [
        'Ahora viaja a la rama que creaste',
        'Checkout te permite cambiar entre ramas',
        'Comando: git checkout 2015'
      ],
      successMessage: '¡Bienvenido al año 2015!',
      validation: { currentBranch: '2015' },
    },
  ],

  // Pantalla 3: Dystopia (1985A)
  screen3: [
    {
      id: 1,
      title: 'Rama distópica',
      description: 'Crea una rama "1985-dystopia" para la línea temporal corrupta',
      expectedCommand: 'git branch 1985-dystopia',
      hint: '💡 Usa "git branch 1985-dystopia"',
      hints: [
        'Crea una rama para la realidad alternativa',
        'Esta línea temporal está corrompida',
        'Comando: git branch 1985-dystopia'
      ],
      successMessage: 'Has creado la línea temporal distópica',
      validation: { hasBranch: '1985-dystopia' },
    },
    {
      id: 2,
      title: 'Entrar en la distopía',
      description: 'Cambia a la rama distópica',
      expectedCommand: 'git checkout 1985-dystopia',
      hint: '💡 Usa "git checkout 1985-dystopia"',
      hints: [
        'Entra a la realidad alternativa',
        'Usa checkout para cambiar de línea temporal',
        'Comando: git checkout 1985-dystopia'
      ],
      successMessage: 'Estás en el 1985 alternativo... ¡hay que arreglarlo!',
      validation: { currentBranch: '1985-dystopia' },
    },
  ],

  // Pantalla 4: Wild West (1885)
  screen4: [
    {
      id: 1,
      title: 'Viajar al Lejano Oeste',
      description: 'Crea una rama "1885" para el viaje accidental al Lejano Oeste',
      expectedCommand: 'git branch 1885',
      hint: '💡 Usa "git branch 1885"',
      hints: [
        'Doc ha viajado al Lejano Oeste por accidente',
        'Crea una rama para esta nueva línea temporal',
        'Comando: git branch 1885'
      ],
      successMessage: 'Has creado la línea temporal del Lejano Oeste',
      validation: { hasBranch: '1885' },
    },
    {
      id: 2,
      title: 'Checkout al Lejano Oeste',
      description: 'Viaja accidentalmente a 1885',
      expectedCommand: 'git checkout 1885',
      hint: '💡 Usa "git checkout 1885"',
      hints: [
        'Ahora debes viajar a rescatar al Doc',
        'Cambia a la rama del Lejano Oeste',
        'Comando: git checkout 1885'
      ],
      successMessage: '¡Bienvenido al salvaje oeste!',
      validation: { currentBranch: '1885' },
    },
  ],
};
