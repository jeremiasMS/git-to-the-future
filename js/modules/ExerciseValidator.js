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
  // Pantalla 1: Origin (1985→1955) - FUNDAMENTOS + INICIO DE LA HISTORIA
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
      title: '1985 normal y aburrido',
      description: 'Primer commit: El inicio de la historia',
      expectedCommand: 'git commit -m "1985 normal y aburrido"',
      hint: '💡 Usa "git commit -m" con el mensaje exacto',
      hints: [
        'Necesitas hacer un commit con el mensaje exacto',
        'El formato es: git commit -m "mensaje"',
        'Comando: git commit -m "1985 normal y aburrido"'
      ],
      successMessage: 'Punto de partida registrado: 1985',
      validation: { commitCount: 1 },
    },
    {
      id: 3,
      title: 'Doc inventa la Máquina del tiempo',
      description: 'Segundo commit: La invención del DeLorean',
      expectedCommand: 'git commit -m "El Doc inventa la Máquina del tiempo"',
      hint: '💡 Haz commit con el mensaje sobre el DeLorean',
      hints: [
        'Registra el momento en que Doc crea su invento',
        'Usa git commit -m "El Doc inventa la Máquina del tiempo"',
        'Comando: git commit -m "El Doc inventa la Máquina del tiempo"'
      ],
      successMessage: '¡El DeLorean está listo para viajar en el tiempo!',
      validation: { commitCount: 2 },
    },
    {
      id: 4,
      title: 'Marty conoce la máquina del tiempo',
      description: 'Tercer commit: El primer encuentro',
      expectedCommand: 'git commit -m "Marty conoce la máquina del tiempo"',
      hint: '💡 Registra el momento en que Marty ve el DeLorean',
      hints: [
        'Marty se encuentra con Doc y el DeLorean',
        'Haz un commit con este momento importante',
        'Comando: git commit -m "Marty conoce la máquina del tiempo"'
      ],
      successMessage: 'Marty ha conocido el secreto de Doc',
      validation: { commitCount: 3 },
    },
    {
      id: 5,
      title: 'Los libios descubren al Doc y le disparan',
      description: 'Cuarto commit: El evento que lo cambia todo',
      expectedCommand: 'git commit -m "Los libios descubren al Doc y le disparan"',
      hint: '💡 Registra el momento dramático con los libios',
      hints: [
        'Este es el momento que obliga a Marty a huir',
        'Haz commit del ataque de los libios',
        'Comando: git commit -m "Los libios descubren al Doc y le disparan"'
      ],
      successMessage: '¡Doc ha sido disparado! Marty debe escapar',
      validation: { commitCount: 4 },
    },
    {
      id: 6,
      title: 'Marty tiene un accidente',
      description: 'Quinto commit: El viaje accidental',
      expectedCommand: 'git commit -m "Marty tiene un accidente"',
      hint: '💡 Marty acelera a 88 mph por accidente',
      hints: [
        'Marty viaja al pasado sin querer',
        'Registra el momento del accidente',
        'Comando: git commit -m "Marty tiene un accidente"'
      ],
      successMessage: 'Marty ha viajado accidentalmente en el tiempo',
      validation: { commitCount: 5 },
    },
    {
      id: 7,
      title: 'Crear rama: marty-sin-papas',
      description: 'Crea una rama para la paradoja temporal',
      expectedCommand: 'git branch marty-sin-papas',
      hint: '💡 Usa "git branch marty-sin-papas"',
      hints: [
        'Marty va a interferir con el pasado de sus padres',
        'Necesitas crear una rama para esta línea temporal',
        'Comando: git branch marty-sin-papas'
      ],
      successMessage: 'Has creado la línea temporal de la paradoja',
      validation: { hasBranch: 'marty-sin-papas' },
    },
    {
      id: 8,
      title: 'Viajar a la rama marty-sin-papas',
      description: 'Cambia a la rama de la paradoja',
      expectedCommand: 'git checkout marty-sin-papas',
      hint: '💡 Usa "git checkout marty-sin-papas"',
      hints: [
        'Entra en la línea temporal donde Marty interfiere',
        'Cambia a la rama que acabas de crear',
        'Comando: git checkout marty-sin-papas'
      ],
      successMessage: '¡Estás en la línea temporal de la paradoja!',
      validation: { currentBranch: 'marty-sin-papas' },
    },
    {
      id: 9,
      title: 'Marty interfiere en la cita de sus padres',
      description: 'Commit en la rama: El problema comienza',
      expectedCommand: 'git commit -m "Marty interfiere en la cita de sus padres"',
      hint: '💡 Registra el momento en que Marty arruina todo',
      hints: [
        'Marty empuja a su padre y toma su lugar',
        'Haz commit de este momento crucial',
        'Comando: git commit -m "Marty interfiere en la cita de sus padres"'
      ],
      successMessage: 'Oh no, Marty ha cambiado el pasado',
      validation: { commitCount: 6 },
    },
    {
      id: 10,
      title: 'Marty empieza a desaparecer',
      description: 'Commit: La consecuencia de la paradoja',
      expectedCommand: 'git commit -m "Marty empieza a desaparecer"',
      hint: '💡 Marty se está borrando de la existencia',
      hints: [
        'La foto familiar muestra a Marty desapareciendo',
        'Registra este momento de peligro',
        'Comando: git commit -m "Marty empieza a desaparecer"'
      ],
      successMessage: 'Marty se está borrando... ¡hay que arreglarlo!',
      validation: { commitCount: 7 },
    },
    {
      id: 11,
      title: 'Marty logra que sus padres se enamoren',
      description: 'Commit: La solución de la paradoja',
      expectedCommand: 'git commit -m "Marty logra que sus padres se enamoren"',
      hint: '💡 Marty arregla lo que rompió',
      hints: [
        'Gracias al plan de Marty, George besa a Lorraine',
        'Registra el momento en que se resuelve la paradoja',
        'Comando: git commit -m "Marty logra que sus padres se enamoren"'
      ],
      successMessage: '¡La paradoja está resuelta! Marty volverá a existir',
      validation: { commitCount: 8 },
    },
    {
      id: 12,
      title: 'Volver a la rama main',
      description: 'Regresa a la línea temporal principal',
      expectedCommand: 'git checkout main',
      hint: '💡 Usa "git checkout main"',
      hints: [
        'Vuelve a la rama principal',
        'Usa checkout para cambiar de rama',
        'Comando: git checkout main'
      ],
      successMessage: 'Has vuelto a la línea temporal principal',
      validation: { currentBranch: 'main' },
    },
    {
      id: 13,
      title: 'George McFly conoce a Lorraine',
      description: 'Commit en main: La historia original',
      expectedCommand: 'git commit -m "George McFly conoce a Lorraine"',
      hint: '💡 Registra cómo se conocieron originalmente',
      hints: [
        'En la línea temporal original, George y Lorraine se conocen',
        'Haz commit de este momento',
        'Comando: git commit -m "George McFly conoce a Lorraine"'
      ],
      successMessage: 'El encuentro original ha sido registrado',
      validation: { commitCount: 9 },
    },
    {
      id: 14,
      title: 'El Baile del Encanto Bajo el Mar',
      description: 'Commit: El baile donde todo cambia',
      expectedCommand: 'git commit -m "El Baile del Encanto Bajo el Mar"',
      hint: '💡 El baile donde George y Lorraine se enamoran',
      hints: [
        'Este es el baile crucial de 1955',
        'Registra este evento importante',
        'Comando: git commit -m "El Baile del Encanto Bajo el Mar"'
      ],
      successMessage: 'El baile ha sido un éxito',
      validation: { commitCount: 10 },
    },
    {
      id: 15,
      title: 'Fusionar la paradoja resuelta',
      description: 'Merge: Integra los cambios de marty-sin-papas',
      expectedCommand: 'git merge marty-sin-papas',
      hint: '💡 Usa "git merge marty-sin-papas"',
      hints: [
        'Necesitas fusionar la rama de la paradoja con main',
        'Esto integrará los cambios que Marty hizo',
        'Comando: git merge marty-sin-papas'
      ],
      successMessage: '¡La paradoja ha sido integrada! La línea temporal está estable',
      validation: { merged: 'marty-sin-papas' },
    },
  ],

  // Pantalla 2: Time Travel (2015) - VIAJE AL FUTURO + PARADOJA DE BIFF
  screen2: [
    {
      id: 1,
      title: '12 Noviembre 22:04 hs Rayo en la torre del reloj',
      description: 'Commit: El momento clave para volver a 1985',
      expectedCommand: 'git commit -m "12 Noviembre 22:04 hs Rayo en la torre del reloj"',
      hint: '💡 Registra el rayo que alimenta el DeLorean',
      hints: [
        'Este rayo es la fuente de energía para volver al futuro',
        'Haz commit de este momento crucial',
        'Comando: git commit -m "12 Noviembre 22:04 hs Rayo en la torre del reloj"'
      ],
      successMessage: '¡El rayo ha golpeado! Marty puede volver a casa',
      validation: { commitCount: 11 },
    },
    {
      id: 2,
      title: 'Marty llega a 1985',
      description: 'Commit: El regreso al futuro',
      expectedCommand: 'git commit -m "Marty llega a 1985"',
      hint: '💡 Marty vuelve a su época',
      hints: [
        'Marty ha regresado exitosamente a 1985',
        'Registra su llegada',
        'Comando: git commit -m "Marty llega a 1985"'
      ],
      successMessage: 'Marty está de vuelta en 1985',
      validation: { commitCount: 12 },
    },
    {
      id: 3,
      title: 'Marty y Jennifer se casan',
      description: 'Commit: La vida continúa',
      expectedCommand: 'git commit -m "Marty y Jennifer se casan"',
      hint: '💡 El futuro de Marty y Jennifer juntos',
      hints: [
        'Marty y Jennifer forman una familia',
        'Registra este momento feliz',
        'Comando: git commit -m "Marty y Jennifer se casan"'
      ],
      successMessage: 'Marty y Jennifer están casados',
      validation: { commitCount: 13 },
    },
    {
      id: 4,
      title: '2015',
      description: 'Commit: Viaje al futuro',
      expectedCommand: 'git commit -m "2015"',
      hint: '💡 Doc lleva a Marty al futuro',
      hints: [
        'Doc regresa y lleva a Marty y Jennifer a 2015',
        'Haz commit del salto temporal',
        'Comando: git commit -m "2015"'
      ],
      successMessage: '¡Bienvenido al futuro!',
      validation: { commitCount: 14 },
    },
    {
      id: 5,
      title: 'Despiden a marty del trabajo',
      description: 'Commit: El problema en el futuro',
      expectedCommand: 'git commit -m "Despiden a marty del trabajo"',
      hint: '💡 Marty tiene problemas laborales en 2015',
      hints: [
        'Marty Jr. causa problemas que afectan a su padre',
        'Registra este evento',
        'Comando: git commit -m "Despiden a marty del trabajo"'
      ],
      successMessage: 'Marty ha perdido su trabajo en el futuro',
      validation: { commitCount: 15 },
    },
    {
      id: 6,
      title: 'Biff descubre la verdad',
      description: 'Commit: Biff encuentra el DeLorean',
      expectedCommand: 'git commit -m "Biff descubre la verdad"',
      hint: '💡 El viejo Biff encuentra la máquina del tiempo',
      hints: [
        'Biff escucha sobre los viajes en el tiempo',
        'Registra su descubrimiento',
        'Comando: git commit -m "Biff descubre la verdad"'
      ],
      successMessage: 'Oh no, Biff sabe del DeLorean',
      validation: { commitCount: 16 },
    },
    {
      id: 7,
      title: 'Volver al pasado desde 2015',
      description: 'Commit: Preparar el regreso',
      expectedCommand: 'git commit -m "1955"',
      hint: '💡 Necesitamos volver a 1955 en la línea principal',
      hints: [
        'Registra el punto temporal de 1955',
        'Este será un punto importante',
        'Comando: git commit -m "1955"'
      ],
      successMessage: 'Punto temporal 1955 establecido',
      validation: { commitCount: 17 },
    },
    {
      id: 8,
      title: 'Marty llega desde 1985',
      description: 'Commit: Primera llegada de Marty a 1955',
      expectedCommand: 'git commit -m "Marty llega desde 1985"',
      hint: '💡 Marty llega a 1955 por primera vez (BTTF1)',
      hints: [
        'Este es el viaje original de Marty',
        'Registra su llegada al pasado',
        'Comando: git commit -m "Marty llega desde 1985"'
      ],
      successMessage: 'Marty ha llegado a 1955 (primera vez)',
      validation: { commitCount: 18 },
    },
    {
      id: 9,
      title: 'Biff llega desde 1985 con el calendario',
      description: 'Commit: El viejo Biff viaja al pasado',
      expectedCommand: 'git commit -m "Biff llega desde 1985 con el calendario"',
      hint: '💡 Biff roba el DeLorean y viaja a 1955',
      hints: [
        'El viejo Biff lleva el almanaque deportivo',
        'Esto creará una paradoja',
        'Comando: git commit -m "Biff llega desde 1985 con el calendario"'
      ],
      successMessage: 'Biff ha viajado con el almanaque... esto es malo',
      validation: { commitCount: 19 },
    },
    {
      id: 10,
      title: 'Crear rama: biff-paradise',
      description: 'Rama de la línea temporal distópica',
      expectedCommand: 'git branch biff-paradise',
      hint: '💡 Crea la rama "biff-paradise"',
      hints: [
        'Esta rama representa el 1985 alternativo corrupto',
        'Biff se vuelve millonario con el almanaque',
        'Comando: git branch biff-paradise'
      ],
      successMessage: 'Rama distópica creada',
      validation: { hasBranch: 'biff-paradise' },
    },
    {
      id: 11,
      title: 'Viajar a biff-paradise',
      description: 'Entra en la línea temporal corrupta',
      expectedCommand: 'git checkout biff-paradise',
      hint: '💡 Cambia a la rama "biff-paradise"',
      hints: [
        'Entra en la realidad alternativa',
        'Usa checkout para cambiar de rama',
        'Comando: git checkout biff-paradise'
      ],
      successMessage: 'Estás en el 1985 distópico de Biff',
      validation: { currentBranch: 'biff-paradise' },
    },
    {
      id: 12,
      title: 'Biff se entrega el calendario',
      description: 'Commit: El joven Biff recibe el almanaque',
      expectedCommand: 'git commit -m "Biff se entrega el calendario"',
      hint: '💡 El viejo Biff le da el almanaque a su yo joven',
      hints: [
        'Este es el momento que corrompe la línea temporal',
        'Registra esta entrega fatal',
        'Comando: git commit -m "Biff se entrega el calendario"'
      ],
      successMessage: 'El almanaque está en manos del joven Biff',
      validation: { commitCount: 20 },
    },
    {
      id: 13,
      title: 'George McFly muere',
      description: 'Commit: Consecuencia de la línea distópica',
      expectedCommand: 'git commit -m "George McFly muere"',
      hint: '💡 En esta realidad, Biff mata a George',
      hints: [
        'Biff rico y poderoso elimina a George',
        'Registra este terrible evento',
        'Comando: git commit -m "George McFly muere"'
      ],
      successMessage: 'En esta línea temporal, George ha muerto',
      validation: { commitCount: 21 },
    },
    {
      id: 14,
      title: 'El Doc es encerrado en el manicomio',
      description: 'Commit: Doc es institucionalizado',
      expectedCommand: 'git commit -m "El Doc es encerrado en el manicomio"',
      hint: '💡 Biff encarcela a Doc',
      hints: [
        'En esta realidad, Doc está en un psiquiátrico',
        'Registra su encierro',
        'Comando: git commit -m "El Doc es encerrado en el manicomio"'
      ],
      successMessage: 'Doc está atrapado en el manicomio',
      validation: { commitCount: 22 },
    },
    {
      id: 15,
      title: 'Jennifer, Marty y el Doc llegan desde 2015',
      description: 'Commit: Llegada al 1985 alternativo',
      expectedCommand: 'git commit -m "Jennifer, Marty y el Doc llegan desde 2015"',
      hint: '💡 Regresan de 2015 a un 1985 diferente',
      hints: [
        'Descubren que 1985 ha cambiado horriblemente',
        'Registra su llegada sorpresiva',
        'Comando: git commit -m "Jennifer, Marty y el Doc llegan desde 2015"'
      ],
      successMessage: 'Han llegado al 1985 distópico',
      validation: { commitCount: 23 },
    },
    {
      id: 16,
      title: 'Marty enfrenta a Biff',
      description: 'Commit: Confrontación en el casino',
      expectedCommand: 'git commit -m "Marty enfrenta a Biff"',
      hint: '💡 Marty descubre la verdad sobre Biff',
      hints: [
        'Marty confronta al Biff millonario',
        'Registra este enfrentamiento',
        'Comando: git commit -m "Marty enfrenta a Biff"'
      ],
      successMessage: 'Marty sabe que Biff tiene el almanaque',
      validation: { commitCount: 24 },
    },
    {
      id: 17,
      title: 'Marty llega nuevamente a 1955',
      description: 'Commit: Segundo viaje a 1955',
      expectedCommand: 'git commit -m "Marty llega nuevamente a 1955"',
      hint: '💡 Marty vuelve a 1955 para arreglar la línea temporal',
      hints: [
        'Deben volver a 1955 para detener a Biff',
        'Registra este segundo viaje',
        'Comando: git commit -m "Marty llega nuevamente a 1955"'
      ],
      successMessage: 'Marty ha vuelto a 1955',
      validation: { commitCount: 25 },
    },
    {
      id: 18,
      title: 'Jennifer se queda en esta distopia',
      description: 'Commit: Jennifer queda atrapada',
      expectedCommand: 'git commit -m "Jennifer se queda en esta distopia"',
      hint: '💡 Jennifer no puede volver con Marty',
      hints: [
        'Jennifer queda temporalmente en el 1985 corrupto',
        'Registra su separación',
        'Comando: git commit -m "Jennifer se queda en esta distopia"'
      ],
      successMessage: 'Jennifer está en el 1985 distópico',
      validation: { commitCount: 26 },
    },
    {
      id: 19,
      title: 'Crear rama: marty-calendario',
      description: 'Sub-rama para recuperar el almanaque',
      expectedCommand: 'git branch marty-calendario',
      hint: '💡 Crea "marty-calendario" desde biff-paradise',
      hints: [
        'Esta rama representa la misión de recuperar el almanaque',
        'Es una sub-rama de biff-paradise',
        'Comando: git branch marty-calendario'
      ],
      successMessage: 'Rama de la misión creada',
      validation: { hasBranch: 'marty-calendario' },
    },
    {
      id: 20,
      title: 'Cambiar a marty-calendario',
      description: 'Entra en la misión de recuperación',
      expectedCommand: 'git checkout marty-calendario',
      hint: '💡 Cambia a "marty-calendario"',
      hints: [
        'Entra en la rama de la misión',
        'Usa checkout',
        'Comando: git checkout marty-calendario'
      ],
      successMessage: 'Estás en la misión de recuperar el almanaque',
      validation: { currentBranch: 'marty-calendario' },
    },
    {
      id: 21,
      title: 'Marty le quita el calendario a Biff (Joven)',
      description: 'Commit: ¡Misión cumplida!',
      expectedCommand: 'git commit -m "Marty le quita el calendario a Biff (Joven)"',
      hint: '💡 Marty recupera el almanaque',
      hints: [
        'Marty logra quitarle el almanaque al joven Biff',
        'Registra este momento crucial',
        'Comando: git commit -m "Marty le quita el calendario a Biff (Joven)"'
      ],
      successMessage: '¡Marty tiene el almanaque!',
      validation: { commitCount: 27 },
    },
    {
      id: 22,
      title: 'El Doc desaparece (viaja al pasado por accidente)',
      description: 'Commit: El rayo golpea el DeLorean',
      expectedCommand: 'git commit -m "El Doc desaparece (viaja al pasado por accidente)"',
      hint: '💡 Un rayo envía a Doc a 1885',
      hints: [
        'El DeLorean es golpeado por un rayo',
        'Doc viaja accidentalmente al Lejano Oeste',
        'Comando: git commit -m "El Doc desaparece (viaja al pasado por accidente)"'
      ],
      successMessage: '¡Doc ha desaparecido hacia 1885!',
      validation: { commitCount: 28 },
    },
    {
      id: 23,
      title: 'Marty recibe una carta de 1885',
      description: 'Commit: La carta del viejo oeste',
      expectedCommand: 'git commit -m "Marty recibe una carta de 1885"',
      hint: '💡 Doc envió una carta desde 1885',
      hints: [
        'Marty encuentra la carta de Doc de hace 70 años',
        'Registra este descubrimiento',
        'Comando: git commit -m "Marty recibe una carta de 1885"'
      ],
      successMessage: 'Marty sabe que Doc está en 1885',
      validation: { commitCount: 29 },
    },
    {
      id: 24,
      title: 'El doc ayuda a Marty a viajar al pasado',
      description: 'Commit: El Doc de 1955 ayuda',
      expectedCommand: 'git commit -m "El doc ayuda a Marty a viajar al pasado"',
      hint: '💡 El joven Doc repara el DeLorean',
      hints: [
        'El Doc de 1955 prepara el DeLorean para ir a 1885',
        'Registra esta ayuda',
        'Comando: git commit -m "El doc ayuda a Marty a viajar al pasado"'
      ],
      successMessage: 'El DeLorean está listo para ir a 1885',
      validation: { commitCount: 30 },
    },
    {
      id: 25,
      title: 'Volver a main',
      description: 'Regresa a la línea principal',
      expectedCommand: 'git checkout main',
      hint: '💡 Vuelve a main',
      hints: [
        'Sal de marty-calendario',
        'Vuelve a la rama principal',
        'Comando: git checkout main'
      ],
      successMessage: 'De vuelta en main',
      validation: { currentBranch: 'main' },
    },
    {
      id: 26,
      title: 'Fusionar marty-calendario',
      description: 'Merge: Integra la solución',
      expectedCommand: 'git merge marty-calendario',
      hint: '💡 Fusiona "marty-calendario" en main',
      hints: [
        'Integra la recuperación del almanaque',
        'Usa git merge',
        'Comando: git merge marty-calendario'
      ],
      successMessage: '¡La misión del almanaque se integra a la historia!',
      validation: { merged: 'marty-calendario' },
    },
  ],

  // Pantalla 3: Dystopia (1985A) - RAMA FAMILIA-FELIZ + RESOLUCIÓN
  screen3: [
    {
      id: 1,
      title: 'Crear rama: familia-feliz',
      description: 'Rama de la realidad mejorada',
      expectedCommand: 'git branch familia-feliz',
      hint: '💡 Crea la rama "familia-feliz"',
      hints: [
        'Esta rama representa el mejor 1985 posible',
        'Los cambios de Marty mejoraron el futuro',
        'Comando: git branch familia-feliz'
      ],
      successMessage: 'Rama de la familia exitosa creada',
      validation: { hasBranch: 'familia-feliz' },
    },
    {
      id: 2,
      title: 'Cambiar a familia-feliz',
      description: 'Entra en la línea temporal mejorada',
      expectedCommand: 'git checkout familia-feliz',
      hint: '💡 Cambia a "familia-feliz"',
      hints: [
        'Entra en la mejor realidad posible',
        'Usa checkout',
        'Comando: git checkout familia-feliz'
      ],
      successMessage: 'Estás en la línea temporal de la familia exitosa',
      validation: { currentBranch: 'familia-feliz' },
    },
    {
      id: 3,
      title: 'Jennifer vuelve a la rama principal (cherry-pick)',
      description: 'Commit: Jennifer es rescatada',
      expectedCommand: 'git commit -m "Jennifer vuelve a la rama principal (cherry-pick)"',
      hint: '💡 Jennifer es traída de la distopía',
      hints: [
        'Jennifer regresa a la línea temporal correcta',
        'Esto es como un cherry-pick de la distopía',
        'Comando: git commit -m "Jennifer vuelve a la rama principal (cherry-pick)"'
      ],
      successMessage: 'Jennifer ha sido rescatada',
      validation: { commitCount: 31 },
    },
    {
      id: 4,
      title: 'Fusionar biff-paradise en familia-feliz',
      description: 'Merge: Cierra la línea distópica',
      expectedCommand: 'git merge biff-paradise',
      hint: '💡 Fusiona "biff-paradise" en familia-feliz',
      hints: [
        'Integra y cierra la línea temporal distópica',
        'Esto marca el fin de esa realidad',
        'Comando: git merge biff-paradise'
      ],
      successMessage: 'La distopía ha sido integrada y cerrada',
      validation: { merged: 'biff-paradise' },
    },
    {
      id: 5,
      title: '1985 Familia McFly Exitosa',
      description: 'Commit: La nueva realidad',
      expectedCommand: 'git commit -m "1985 Familia McFly Exitosa"',
      hint: '💡 El 1985 mejorado gracias a Marty',
      hints: [
        'George es escritor exitoso, Biff lava autos',
        'Registra esta realidad mejorada',
        'Comando: git commit -m "1985 Familia McFly Exitosa"'
      ],
      successMessage: '¡La familia McFly es exitosa!',
      validation: { commitCount: 32 },
    },
    {
      id: 6,
      title: 'Marty no tiene un accidente',
      description: 'Commit: Marty aprende la lección',
      expectedCommand: 'git commit -m "Marty no tiene un accidente"',
      hint: '💡 Marty evita el accidente de auto',
      hints: [
        'Marty no cae en la provocación de Needles',
        'Su futuro mejora',
        'Comando: git commit -m "Marty no tiene un accidente"'
      ],
      successMessage: 'Marty ha aprendido a no ser impulsivo',
      validation: { commitCount: 33 },
    },
    {
      id: 7,
      title: 'No despiden a Marty del trabajo',
      description: 'Commit: Futuro laboral asegurado',
      expectedCommand: 'git commit -m "No despiden a Marty del trabajo"',
      hint: '💡 El futuro de Marty mejora',
      hints: [
        'Sin el accidente, Marty mantiene su empleo',
        'Registra esta mejora',
        'Comando: git commit -m "No despiden a Marty del trabajo"'
      ],
      successMessage: 'El futuro de Marty está asegurado',
      validation: { commitCount: 34 },
    },
    {
      id: 8,
      title: 'Volver a biff-paradise',
      description: 'Cierra la rama distópica',
      expectedCommand: 'git checkout biff-paradise',
      hint: '💡 Vuelve a "biff-paradise" para cerrarla',
      hints: [
        'Regresa a la rama distópica',
        'Vamos a marcarla como obsoleta',
        'Comando: git checkout biff-paradise'
      ],
      successMessage: 'En la rama distópica para cerrarla',
      validation: { currentBranch: 'biff-paradise' },
    },
    {
      id: 9,
      title: 'Branch deprecada',
      description: 'Commit final: Marca la rama como obsoleta',
      expectedCommand: 'git commit -m "Branch deprecada"',
      hint: '💡 Marca esta línea temporal como borrada',
      hints: [
        'Esta realidad ya no existe',
        'Haz un commit final de cierre',
        'Comando: git commit -m "Branch deprecada"'
      ],
      successMessage: 'La distopía ha sido marcada como obsoleta',
      validation: { commitCount: 35 },
    },
  ],

  // Pantalla 4: Wild West (1885) - LEJANO OESTE + DOC Y CLARA + FINAL
  screen4: [
    {
      id: 1,
      title: 'Volver a main',
      description: 'Regresa a la línea principal',
      expectedCommand: 'git checkout main',
      hint: '💡 Vuelve a main desde familia-feliz',
      hints: [
        'Sal de familia-feliz',
        'Regresa a la rama principal',
        'Comando: git checkout main'
      ],
      successMessage: 'De vuelta en la línea principal',
      validation: { currentBranch: 'main' },
    },
    {
      id: 2,
      title: '1885 Lejano Oeste',
      description: 'Commit: El inicio del Lejano Oeste',
      expectedCommand: 'git commit -m "1885 Lejano Oeste"',
      hint: '💡 Registra la época del salvaje oeste',
      hints: [
        'Estamos en 1885, la era de los vaqueros',
        'Haz commit de este punto temporal',
        'Comando: git commit -m "1885 Lejano Oeste"'
      ],
      successMessage: 'Bienvenido al Lejano Oeste',
      validation: { commitCount: 36 },
    },
    {
      id: 3,
      title: 'Doc viaja por error (Checkout)',
      description: 'Commit: El accidente temporal de Doc',
      expectedCommand: 'git commit -m "Doc viaja por error (Checkout)"',
      hint: '💡 Doc llega a 1885 por el rayo',
      hints: [
        'Doc fue enviado aquí accidentalmente',
        'Registra su llegada forzada',
        'Comando: git commit -m "Doc viaja por error (Checkout)"'
      ],
      successMessage: 'Doc está varado en 1885',
      validation: { commitCount: 37 },
    },
    {
      id: 4,
      title: 'Crear rama: clara-viva',
      description: 'Rama del romance en el oeste',
      expectedCommand: 'git branch clara-viva',
      hint: '💡 Crea la rama "clara-viva"',
      hints: [
        'Esta rama representa la línea donde Clara sobrevive',
        'Doc conocerá a Clara',
        'Comando: git branch clara-viva'
      ],
      successMessage: 'Rama de Clara creada',
      validation: { hasBranch: 'clara-viva' },
    },
    {
      id: 5,
      title: 'Cambiar a clara-viva',
      description: 'Entra en la línea de Clara',
      expectedCommand: 'git checkout clara-viva',
      hint: '💡 Cambia a "clara-viva"',
      hints: [
        'Entra en la rama donde Clara vive',
        'Usa checkout',
        'Comando: git checkout clara-viva'
      ],
      successMessage: 'Estás en la línea temporal de Clara',
      validation: { currentBranch: 'clara-viva' },
    },
    {
      id: 6,
      title: 'Doc conoce a Clara en 1885',
      description: 'Commit: El romance comienza',
      expectedCommand: 'git commit -m "Doc conoce a Clara en 1885"',
      hint: '💡 Doc y Clara se conocen',
      hints: [
        'Doc salva a Clara del barranco',
        'Se enamoran',
        'Comando: git commit -m "Doc conoce a Clara en 1885"'
      ],
      successMessage: 'Doc ha conocido al amor de su vida',
      validation: { commitCount: 38 },
    },
    {
      id: 7,
      title: 'Volver a main temporalmente',
      description: 'Regresa a main para continuar',
      expectedCommand: 'git checkout main',
      hint: '💡 Vuelve a main',
      hints: [
        'Regresa a la línea principal',
        'Veremos qué pasa en la línea original',
        'Comando: git checkout main'
      ],
      successMessage: 'En main de nuevo',
      validation: { currentBranch: 'main' },
    },
    {
      id: 8,
      title: 'Clara muere en 1885',
      description: 'Commit: La línea temporal original',
      expectedCommand: 'git commit -m "Clara muere en 1885"',
      hint: '💡 En la línea original, Clara muere',
      hints: [
        'Sin la intervención de Doc, Clara cae al barranco',
        'Registra este evento trágico',
        'Comando: git commit -m "Clara muere en 1885"'
      ],
      successMessage: 'En la línea original, Clara murió',
      validation: { commitCount: 39 },
    },
    {
      id: 9,
      title: 'Volver a clara-viva',
      description: 'Regresa a la línea de Clara',
      expectedCommand: 'git checkout clara-viva',
      hint: '💡 Vuelve a "clara-viva"',
      hints: [
        'Regresa a la rama donde Clara vive',
        'Usa checkout',
        'Comando: git checkout clara-viva'
      ],
      successMessage: 'De vuelta con Clara viva',
      validation: { currentBranch: 'clara-viva' },
    },
    {
      id: 10,
      title: 'Marty se mete en problemas',
      description: 'Commit: Problemas con Buford',
      expectedCommand: 'git commit -m "Marty se mete en problemas"',
      hint: '💡 Marty provoca a Buford "Mad Dog" Tannen',
      hints: [
        'Marty tiene un duelo con el antepasado de Biff',
        'Registra este conflicto',
        'Comando: git commit -m "Marty se mete en problemas"'
      ],
      successMessage: 'Marty está en problemas con Buford',
      validation: { commitCount: 40 },
    },
    {
      id: 11,
      title: 'Roban locomotora',
      description: 'Commit: El plan para volver al futuro',
      expectedCommand: 'git commit -m "Roban locomotora"',
      hint: '💡 Marty y Doc roban un tren',
      hints: [
        'Necesitan la locomotora para alcanzar 88 mph',
        'Registra este robo épico',
        'Comando: git commit -m "Roban locomotora"'
      ],
      successMessage: 'Han robado la locomotora',
      validation: { commitCount: 41 },
    },
    {
      id: 12,
      title: 'Marty viaja al futuro (1985)',
      description: 'Commit: Marty regresa a casa',
      expectedCommand: 'git commit -m "Marty viaja al futuro (1985)"',
      hint: '💡 Marty vuelve a 1985',
      hints: [
        'Marty empuja el DeLorean con la locomotora',
        'Regresa a su época',
        'Comando: git commit -m "Marty viaja al futuro (1985)"'
      ],
      successMessage: 'Marty ha vuelto a 1985',
      validation: { commitCount: 42 },
    },
    {
      id: 13,
      title: 'Volver a main para merge',
      description: 'Prepara el merge final',
      expectedCommand: 'git checkout main',
      hint: '💡 Vuelve a main',
      hints: [
        'Regresa a la línea principal',
        'Vamos a fusionar clara-viva',
        'Comando: git checkout main'
      ],
      successMessage: 'En main para el merge',
      validation: { currentBranch: 'main' },
    },
    {
      id: 14,
      title: 'Fusionar clara-viva',
      description: 'Merge: Integra la historia de Clara',
      expectedCommand: 'git merge clara-viva',
      hint: '💡 Fusiona "clara-viva" en main',
      hints: [
        'Integra la línea temporal donde Clara vive',
        'Usa git merge',
        'Comando: git merge clara-viva'
      ],
      successMessage: 'La historia de Clara está integrada',
      validation: { merged: 'clara-viva' },
    },
    {
      id: 15,
      title: 'Volver a clara-viva para el final',
      description: 'Regresa para el final feliz',
      expectedCommand: 'git checkout clara-viva',
      hint: '💡 Vuelve a "clara-viva"',
      hints: [
        'Regresa a la rama de Clara',
        'Vamos a ver el final',
        'Comando: git checkout clara-viva'
      ],
      successMessage: 'En la rama de Clara para el final',
      validation: { currentBranch: 'clara-viva' },
    },
    {
      id: 16,
      title: 'Doc y Clara forman familia',
      description: 'Commit: El final feliz',
      expectedCommand: 'git commit -m "Doc y Clara forman familia"',
      hint: '💡 Doc y Clara tienen hijos y viajan en el tiempo',
      hints: [
        'Doc construye una locomotora del tiempo',
        'Tienen dos hijos: Jules y Verne',
        'Comando: git commit -m "Doc y Clara forman familia"'
      ],
      successMessage: '¡Doc tiene su final feliz con Clara y sus hijos!',
      validation: { commitCount: 43 },
    },
    {
      id: 17,
      title: 'Volver a main - Final',
      description: 'Regresa a la línea principal',
      expectedCommand: 'git checkout main',
      hint: '💡 Vuelve a main una última vez',
      hints: [
        'Regresa a la rama principal',
        'La aventura está completa',
        'Comando: git checkout main'
      ],
      successMessage: 'De vuelta en main - Historia completa',
      validation: { currentBranch: 'main' },
    },
    {
      id: 18,
      title: 'El Doc escribe una nota para Marty',
      description: 'Commit final: Cierre del círculo',
      expectedCommand: 'git commit -m "El Doc escribe una nota para Marty"',
      hint: '💡 La carta que esperó 70 años',
      hints: [
        'Doc escribe la carta en 1885 que Marty lee en 1955',
        'El círculo temporal se cierra',
        'Comando: git commit -m "El Doc escribe una nota para Marty"'
      ],
      successMessage: '🎉 ¡HISTORIA COMPLETA! Has recreado toda la saga de Back to the Future con Git',
      validation: { commitCount: 44 },
    },
  ],
};
