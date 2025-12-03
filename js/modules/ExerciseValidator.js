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
    if (!exercise) return { valid: false, shouldShowError: false, message: '❌ No hay ejercicios activos' };

    const fullCommand = `${command} ${args.join(' ')}`.trim().toLowerCase();
    const expected = exercise.expectedCommand.toLowerCase();

    // ✅ Comando correcto
    if (this.isCommandMatch(fullCommand, expected)) {
      return { 
        valid: true,
        shouldShowError: false,
        message: exercise.successMessage 
      };
    }

    // ❌ Comando incorrecto - dar feedback específico
    const expectedParts = expected.split(' ');
    const actualParts = fullCommand.split(' ');
    
    const expectedCmd = expectedParts[0] === 'git' ? expectedParts[1] : expectedParts[0];
    const actualCmd = actualParts[0] === 'git' ? actualParts[1] : actualParts[0];
    
    // Comando diferente al esperado - NO mostrar error (permitir explorar)
    if (actualCmd !== expectedCmd) {
      return { 
        valid: false,
        shouldShowError: false,
        message: `Se esperaba el comando "${expectedCmd}"`,
        suggestion: exercise.hint
      };
    }

    // Comando correcto pero argumentos incorrectos - SÍ mostrar error
    if (expectedCmd === 'commit') {
      return { 
        valid: false,
        shouldShowError: true,
        message: `❌ El mensaje del commit no es el esperado. Revisa las instrucciones.`,
        suggestion: exercise.hint
      };
    }

    if (expectedCmd === 'branch' || expectedCmd === 'checkout') {
      return { 
        valid: false,
        shouldShowError: true,
        message: `❌ El nombre de la rama no es el esperado. Revisa las instrucciones.`,
        suggestion: exercise.hint
      };
    }

    // Otros casos - mostrar error genérico
    return { 
      valid: false,
      shouldShowError: true,
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
    const cleanActual = actual.replace(/^git\s+/, '').replace(/\s+/g, ' ').trim().toLowerCase();
    const cleanExpected = expected.replace(/^git\s+/, '').replace(/\s+/g, ' ').trim().toLowerCase();

    // Para commits, verificar mensaje EXACTO (normalizado)
    if (cleanExpected.startsWith('commit')) {
      if (!cleanActual.startsWith('commit') || !cleanActual.includes('-m')) {
        return false;
      }
      
      // Extraer el mensaje del commit (entre comillas)
      const actualMatch = cleanActual.match(/commit\s+-m\s+["'](.+?)["']/);
      const expectedMatch = cleanExpected.match(/commit\s+-m\s+["'](.+?)["']/);
      
      if (!actualMatch || !expectedMatch) {
        return false;
      }
      
      // Comparar mensajes normalizados (sin importar comillas simples o dobles)
      return actualMatch[1].toLowerCase().trim() === expectedMatch[1].toLowerCase().trim();
    }

    // Para branch, verificar comando + nombre de rama EXACTO
    if (cleanExpected.startsWith('branch')) {
      const expectedBranch = cleanExpected.split(' ')[1];
      const actualBranch = cleanActual.split(' ')[1];
      return cleanActual.startsWith('branch') && actualBranch === expectedBranch;
    }

    // Para checkout, verificar comando + nombre de rama EXACTO
    if (cleanExpected.startsWith('checkout')) {
      const expectedBranch = cleanExpected.split(' ')[1];
      const actualBranch = cleanActual.split(' ')[1];
      return cleanActual.startsWith('checkout') && actualBranch === expectedBranch;
    }

    // Para rebase, verificar comando + rama
    if (cleanExpected.startsWith('rebase')) {
      const expectedBranch = cleanExpected.split(' ')[1];
      return cleanActual.startsWith('rebase') && cleanActual.includes(expectedBranch);
    }

    // Para cherry-pick, verificar comando + hash
    if (cleanExpected.startsWith('cherry-pick')) {
      return cleanActual.startsWith('cherry-pick');
    }

    // Para reset, verificar comando + modo
    if (cleanExpected.startsWith('reset')) {
      return cleanActual.startsWith('reset');
    }

    // Para revert, verificar comando
    if (cleanExpected.startsWith('revert')) {
      return cleanActual.startsWith('revert');
    }

    // Para stash, verificar comando
    if (cleanExpected.startsWith('stash')) {
      return cleanActual.startsWith('stash');
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
  // Pantalla 1: Origin (1985→1955) - FUNDAMENTOS (6 ejercicios)
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
      title: 'Primer commit: 1985',
      description: 'Registra el inicio de la historia en 1985',
      expectedCommand: 'git commit -m "1985: Marty conoce el DeLorean y viaja al pasado"',
      hint: '💡 Usa "git commit -m" con un mensaje descriptivo',
      hints: [
        'Necesitas hacer un commit que resuma el inicio',
        'El formato es: git commit -m "mensaje"',
        'Comando: git commit -m "1985: Marty conoce el DeLorean y viaja al pasado"'
      ],
      successMessage: '¡Punto de partida registrado! Marty viaja a 1955',
      validation: { commitCount: 1 },
    },
    {
      id: 3,
      title: 'Crear rama: marty-sin-papas',
      description: 'Crea una rama para la paradoja de los padres',
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
      id: 4,
      title: 'Viajar a marty-sin-papas',
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
      id: 5,
      title: 'Commit: Paradoja resuelta',
      description: 'Marty logra que sus padres se enamoren en el baile',
      expectedCommand: 'git commit -m "1955: Marty resuelve la paradoja en el baile"',
      hint: '💡 Registra cómo Marty arregla el futuro',
      hints: [
        'George y Lorraine se enamoran en el baile',
        'Marty resuelve la paradoja y vuelve a existir',
        'Comando: git commit -m "1955: Marty resuelve la paradoja en el baile"'
      ],
      successMessage: '¡La paradoja está resuelta! Marty salvó a sus padres',
      validation: { commitCount: 2 },
    },
    {
      id: 6,
      title: 'Fusionar la paradoja',
      description: 'Merge: Integra la solución a la línea principal',
      expectedCommand: 'git merge marty-sin-papas',
      hint: '💡 Primero vuelve a main, luego haz merge',
      hints: [
        'Primero: git checkout main',
        'Luego: git merge marty-sin-papas',
        'Esto integrará los cambios de la paradoja'
      ],
      successMessage: '¡Primera aventura completa! Marty regresa a 1985 exitosamente',
      validation: { currentBranch: 'main', merged: 'marty-sin-papas' },
    },
  ],

  // Pantalla 2: Time Travel (2015) - FUTURO + DISTOPÍA DE BIFF (6 ejercicios)
  screen2: [
    {
      id: 1,
      title: 'Commit: Viaje a 2015',
      description: 'Doc lleva a Marty y Jennifer al futuro para salvar a su hijo',
      expectedCommand: 'git commit -m "2015: Doc, Marty y Jennifer viajan al futuro"',
      hint: '💡 Registra el viaje a 2015',
      hints: [
        'Doc regresa del futuro y los lleva a 2015',
        'Hay problemas con Marty Jr.',
        'Comando: git commit -m "2015: Doc, Marty y Jennifer viajan al futuro"'
      ],
      successMessage: '¡Bienvenidos al año 2015!',
      validation: { commitCount: 3 },
    },
    {
      id: 2,
      title: 'Commit: Biff roba el DeLorean',
      description: 'El viejo Biff descubre la máquina y viaja a 1955 con el almanaque',
      expectedCommand: 'git commit -m "Biff roba el DeLorean y viaja a 1955 con el almanaque"',
      hint: '💡 Biff crea una paradoja con el almanaque deportivo',
      hints: [
        'El viejo Biff escucha sobre el DeLorean',
        'Le da el almanaque a su yo joven en 1955',
        'Comando: git commit -m "Biff roba el DeLorean y viaja a 1955 con el almanaque"'
      ],
      successMessage: 'Oh no... Biff ha corrompido el futuro',
      validation: { commitCount: 4 },
    },
    {
      id: 3,
      title: 'Crear rama: biff-paradise',
      description: 'Crea la línea temporal distópica donde Biff es millonario',
      expectedCommand: 'git branch biff-paradise',
      hint: '💡 Crea la rama "biff-paradise"',
      hints: [
        'Esta rama representa el 1985 alternativo corrupto',
        'Biff es millonario y poderoso',
        'Comando: git branch biff-paradise'
      ],
      successMessage: 'Rama distópica creada',
      validation: { hasBranch: 'biff-paradise' },
    },
    {
      id: 4,
      title: 'Viajar a biff-paradise',
      description: 'Entra en la línea temporal distópica',
      expectedCommand: 'git checkout biff-paradise',
      hint: '💡 Cambia a "biff-paradise"',
      hints: [
        'Entra en el 1985 alternativo',
        'Verás un mundo corrupto',
        'Comando: git checkout biff-paradise'
      ],
      successMessage: 'Estás en el 1985 distópico de Biff',
      validation: { currentBranch: 'biff-paradise' },
    },
    {
      id: 5,
      title: 'Commit: Marty recupera el almanaque',
      description: 'Marty viaja a 1955 y le quita el almanaque al joven Biff',
      expectedCommand: 'git commit -m "1955: Marty recupera el almanaque y lo destruye"',
      hint: '💡 Marty arregla la línea temporal',
      hints: [
        'Marty persigue a Biff en 1955',
        'Recupera el almanaque y lo quema',
        'Comando: git commit -m "1955: Marty recupera el almanaque y lo destruye"'
      ],
      successMessage: '¡Almanaque destruido! Pero un rayo golpea el DeLorean...',
      validation: { commitCount: 5 },
    },
    {
      id: 6,
      title: 'Commit: Doc viaja a 1885',
      description: 'Un rayo envía accidentalmente a Doc al Lejano Oeste',
      expectedCommand: 'git commit -m "Doc es enviado a 1885 por un rayo"',
      hint: '💡 Doc desaparece hacia el pasado',
      hints: [
        'Un rayo golpea el DeLorean',
        'Doc viaja 70 años al pasado',
        'Comando: git commit -m "Doc es enviado a 1885 por un rayo"'
      ],
      successMessage: 'Doc está varado en 1885... ¡Marty debe rescatarlo!',
      validation: { commitCount: 6 },
    },
  ],

  // Pantalla 3: Dystopia (1985A) - COMANDOS AVANZADOS: REBASE & CHERRY-PICK (8 ejercicios)
  screen3: [
    {
      id: 1,
      title: 'Volver a main',
      description: 'Sal de biff-paradise y regresa a la línea principal',
      expectedCommand: 'git checkout main',
      hint: '💡 Usa "git checkout main"',
      hints: [
        'Sal de la rama distópica',
        'Vuelve a main para continuar',
        'Comando: git checkout main'
      ],
      successMessage: 'De vuelta en main',
      validation: { currentBranch: 'main' },
    },
    {
      id: 2,
      title: 'Crear rama: familia-feliz',
      description: 'Crea la rama de la mejor realidad posible',
      expectedCommand: 'git branch familia-feliz',
      hint: '💡 Crea la rama "familia-feliz"',
      hints: [
        'Esta rama representa el 1985 mejorado',
        'George es escritor, Biff lava autos',
        'Comando: git branch familia-feliz'
      ],
      successMessage: 'Rama de la familia exitosa creada',
      validation: { hasBranch: 'familia-feliz' },
    },
    {
      id: 3,
      title: 'Viajar a familia-feliz',
      description: 'Cambia a la línea temporal mejorada',
      expectedCommand: 'git checkout familia-feliz',
      hint: '💡 Cambia a "familia-feliz"',
      hints: [
        'Entra en la mejor realidad',
        'Todo es mejor gracias a los cambios de Marty',
        'Comando: git checkout familia-feliz'
      ],
      successMessage: 'Estás en la línea temporal de la familia exitosa',
      validation: { currentBranch: 'familia-feliz' },
    },
    {
      id: 4,
      title: 'Commit: Familia McFly exitosa',
      description: 'Registra la nueva realidad mejorada',
      expectedCommand: 'git commit -m "1985: George es escritor exitoso"',
      hint: '💡 El 1985 mejorado gracias a los cambios',
      hints: [
        'George es escritor famoso',
        'Su primer libro es un éxito',
        'Comando: git commit -m "1985: George es escritor exitoso"'
      ],
      successMessage: '¡George es un autor publicado!',
      validation: { commitCount: 7 },
    },
    {
      id: 5,
      title: '🔥 REBASE: Reorganizar historia',
      description: 'Usa rebase para reescribir la historia de familia-feliz sobre main',
      expectedCommand: 'git rebase main',
      hint: '💡 Usa "git rebase main" para reorganizar commits',
      hints: [
        'Rebase reescribe la historia moviendo commits',
        'Esto limpia la línea temporal',
        'Comando: git rebase main'
      ],
      successMessage: '¡Historia reorganizada! La línea temporal es más limpia',
      validation: { currentBranch: 'familia-feliz' },
    },
    {
      id: 6,
      title: 'Commit: Biff lava autos',
      description: 'Añade el cambio en el destino de Biff',
      expectedCommand: 'git commit -m "Biff ahora trabaja para los McFly"',
      hint: '💡 Registra el nuevo trabajo de Biff',
      hints: [
        'Biff ya no es el matón',
        'Ahora lava los autos de la familia',
        'Comando: git commit -m "Biff ahora trabaja para los McFly"'
      ],
      successMessage: '¡Biff ha cambiado completamente!',
      validation: { commitCount: 8 },
    },
    {
      id: 7,
      title: '🍒 CHERRY-PICK: Rescatar cambio específico',
      description: 'Usa cherry-pick para traer el commit de "almanaque destruido" desde biff-paradise',
      expectedCommand: 'git cherry-pick biff-paradise',
      hint: '💡 Usa "git cherry-pick" para copiar un commit específico',
      hints: [
        'Cherry-pick copia commits específicos',
        'Necesitas el commit donde se destruyó el almanaque',
        'Comando: git cherry-pick biff-paradise (o el hash del commit)'
      ],
      successMessage: '¡Cambio específico copiado! El almanaque está destruido en esta línea',
      validation: { commitCount: 9 },
    },
    {
      id: 8,
      title: 'Fusionar en main',
      description: 'Merge final: Integra familia-feliz a la línea principal',
      expectedCommand: 'git merge familia-feliz',
      hint: '💡 Primero vuelve a main, luego haz merge',
      hints: [
        'Primero: git checkout main',
        'Luego: git merge familia-feliz',
        'Esto consolida la mejor realidad'
      ],
      successMessage: '¡Realidad mejorada consolidada! Ahora a rescatar a Doc en 1885',
      validation: { currentBranch: 'main', merged: 'familia-feliz' },
    },
  ],

  // Pantalla 4: Wild West (1885) - COMANDOS EXPERTOS: RESET, REVERT & STASH (10 ejercicios)
  screen4: [
    {
      id: 1,
      title: 'Commit: Marty viaja a 1885',
      description: 'Marty viaja al Lejano Oeste para rescatar a Doc',
      expectedCommand: 'git commit -m "1885: Marty llega al Lejano Oeste"',
      hint: '💡 Marty llega al salvaje oeste',
      hints: [
        'El Doc de 1955 ayuda a Marty a viajar a 1885',
        'Marty debe rescatar a Doc',
        'Comando: git commit -m "1885: Marty llega al Lejano Oeste"'
      ],
      successMessage: '¡Bienvenido al salvaje oeste!',
      validation: { commitCount: 8 },
    },
    {
      id: 2,
      title: 'Crear rama: clara-viva',
      description: 'Crea la rama donde Doc conoce a Clara',
      expectedCommand: 'git branch clara-viva',
      hint: '💡 Crea la rama "clara-viva"',
      hints: [
        'Esta rama representa donde Clara sobrevive',
        'Doc se enamorará de ella',
        'Comando: git branch clara-viva'
      ],
      successMessage: 'Rama del romance de Doc creada',
      validation: { hasBranch: 'clara-viva' },
    },
    {
      id: 3,
      title: 'Viajar a clara-viva',
      description: 'Entra en la línea donde Doc y Clara se enamoran',
      expectedCommand: 'git checkout clara-viva',
      hint: '💡 Cambia a "clara-viva"',
      hints: [
        'Entra en la línea temporal romántica',
        'Doc salvará a Clara del barranco',
        'Comando: git checkout clara-viva'
      ],
      successMessage: 'Estás en la línea temporal de Clara',
      validation: { currentBranch: 'clara-viva' },
    },
    {
      id: 4,
      title: 'Commit: Doc conoce a Clara',
      description: 'Doc salva a Clara del barranco',
      expectedCommand: 'git commit -m "Doc salva a Clara del barranco"',
      hint: '💡 El momento crucial',
      hints: [
        'Doc ve a Clara en peligro',
        'La salva justo a tiempo',
        'Comando: git commit -m "Doc salva a Clara del barranco"'
      ],
      successMessage: '¡Clara está a salvo!',
      validation: { commitCount: 9 },
    },
    {
      id: 5,
      title: '💾 STASH: Guardar trabajo temporal',
      description: '¡Ataque indio! Usa stash para guardar cambios no comiteados',
      expectedCommand: 'git stash',
      hint: '💡 Usa "git stash" para guardar trabajo temporal',
      hints: [
        'Stash guarda cambios sin hacer commit',
        'Útil cuando necesitas cambiar de rama rápido',
        'Comando: git stash'
      ],
      successMessage: '¡Trabajo guardado! Puedes huir de los indios',
      validation: { hasStash: true },
    },
    {
      id: 6,
      title: 'STASH POP: Recuperar trabajo',
      description: 'Recupera los cambios guardados con stash pop',
      expectedCommand: 'git stash pop',
      hint: '💡 Usa "git stash pop" para recuperar cambios',
      hints: [
        'Stash pop recupera y elimina del stash',
        'Los cambios vuelven a tu working directory',
        'Comando: git stash pop'
      ],
      successMessage: '¡Cambios recuperados! De vuelta al romance',
      validation: { hasStash: false },
    },
    {
      id: 7,
      title: 'Commit: Doc y Clara se enamoran',
      description: 'Registra el amor entre Doc y Clara',
      expectedCommand: 'git commit -m "Doc y Clara se enamoran"',
      hint: '💡 El romance florece',
      hints: [
        'Doc y Clara se enamoran profundamente',
        'Pasan tiempo juntos en el telescopio',
        'Comando: git commit -m "Doc y Clara se enamoran"'
      ],
      successMessage: '¡El amor ha llegado a la vida de Doc!',
      validation: { commitCount: 10 },
    },
    {
      id: 8,
      title: '⚠️ RESET SOFT: Deshacer commit (mantener cambios)',
      description: '¡Doc duda! Usa reset --soft para deshacer el último commit pero mantener cambios',
      expectedCommand: 'git reset --soft HEAD~1',
      hint: '💡 Usa "git reset --soft HEAD~1" para deshacer commit',
      hints: [
        'Reset --soft deshace commit pero mantiene cambios staged',
        'HEAD~1 significa "un commit atrás"',
        'Comando: git reset --soft HEAD~1'
      ],
      successMessage: '¡Commit deshecho! Doc puede repensar su decisión',
      validation: { commitCount: 9 },
    },
    {
      id: 9,
      title: 'COMMIT: Doc elige el amor',
      description: 'Doc decide quedarse con Clara',
      expectedCommand: 'git commit -m "Doc elige quedarse con Clara en 1885"',
      hint: '💡 Doc toma su decisión final',
      hints: [
        'Doc decide que el amor es más importante',
        'Se quedará en 1885 con Clara',
        'Comando: git commit -m "Doc elige quedarse con Clara en 1885"'
      ],
      successMessage: '¡Doc ha elegido el amor sobre todo!',
      validation: { commitCount: 10 },
    },
    {
      id: 10,
      title: '🔄 REVERT: Deshacer sin reescribir',
      description: 'Usa revert para deshacer el commit anterior SIN reescribir historia',
      expectedCommand: 'git revert HEAD',
      hint: '💡 Usa "git revert HEAD" para crear commit inverso',
      hints: [
        'Revert crea un nuevo commit que deshace cambios',
        'No reescribe historia (seguro para ramas compartidas)',
        'Comando: git revert HEAD'
      ],
      successMessage: '¡Momento! Marty y Doc construyen la locomotora del tiempo',
      validation: { commitCount: 11 },
    },
    {
      id: 11,
      title: 'COMMIT: Locomotora del tiempo',
      description: 'Doc convierte la locomotora en máquina del tiempo',
      expectedCommand: 'git commit -m "Doc construye locomotora del tiempo"',
      hint: '💡 La ingeniosa solución de Doc',
      hints: [
        'Doc usa una locomotora en vez del DeLorean',
        'Ahora pueden viajar juntos',
        'Comando: git commit -m "Doc construye locomotora del tiempo"'
      ],
      successMessage: '¡Doc ha creado una nueva máquina del tiempo!',
      validation: { commitCount: 12 },
    },
    {
      id: 12,
      title: 'Commit: Familia Doc Brown',
      description: 'Doc y Clara tienen hijos: Jules y Verne',
      expectedCommand: 'git commit -m "Doc y Clara tienen a Jules y Verne"',
      hint: '💡 La familia viajera del tiempo',
      hints: [
        'Doc y Clara forman una hermosa familia',
        'Sus hijos se llaman Jules y Verne',
        'Comando: git commit -m "Doc y Clara tienen a Jules y Verne"'
      ],
      successMessage: '¡Familia completa! Doc es feliz',
      validation: { commitCount: 13 },
    },
    {
      id: 13,
      title: 'Merge final: Integrar la historia',
      description: 'Fusiona clara-viva en main para completar la saga',
      expectedCommand: 'git merge clara-viva',
      hint: '💡 Primero vuelve a main, luego haz merge',
      hints: [
        'Primero: git checkout main',
        'Luego: git merge clara-viva',
        'Esto cierra el círculo temporal completo'
      ],
      successMessage: '🎉 ¡SAGA COMPLETA! Has dominado Git recreando Back to the Future',
      validation: { currentBranch: 'main', merged: 'clara-viva' },
    },
  ],
};
