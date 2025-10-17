// 🏆 Sistema de Logros e Insignias
export class AchievementSystem {
  constructor() {
    this.achievements = {
      // Logros de Pantalla 1 - Fundamentos
      time_traveler: {
        id: 'time_traveler',
        name: '⏰ Viajero del Tiempo',
        description: 'Completaste la Pantalla 1: Origin',
        icon: '🚗',
        level: 1,
        unlocked: false,
        screen: 1,
      },
      first_commit: {
        id: 'first_commit',
        name: '📝 Primer Commit',
        description: 'Hiciste tu primer commit',
        icon: '✨',
        level: 1,
        unlocked: false,
        screen: 1,
      },
      branch_master: {
        id: 'branch_master',
        name: '🌿 Maestro de Ramas',
        description: 'Creaste tu primera rama',
        icon: '🌳',
        level: 1,
        unlocked: false,
        screen: 1,
      },
      
      // Logros de Pantalla 2 - Futuro
      future_explorer: {
        id: 'future_explorer',
        name: '🔮 Explorador del Futuro',
        description: 'Completaste la Pantalla 2: Time Travel',
        icon: '⚡',
        level: 2,
        unlocked: false,
        screen: 2,
      },
      merge_beginner: {
        id: 'merge_beginner',
        name: '🔀 Fusionador Principiante',
        description: 'Completaste tu primer merge',
        icon: '🎯',
        level: 2,
        unlocked: false,
        screen: 2,
      },
      
      // Logros de Pantalla 3 - Comandos Intermedios
      rebase_master: {
        id: 'rebase_master',
        name: '🔥 Maestro del Rebase',
        description: 'Completaste la Pantalla 3 y dominaste rebase',
        icon: '🔥',
        level: 3,
        unlocked: false,
        screen: 3,
      },
      cherry_picker: {
        id: 'cherry_picker',
        name: '🍒 Recolector de Cerezas',
        description: 'Usaste cherry-pick exitosamente',
        icon: '🍒',
        level: 3,
        unlocked: false,
        screen: 3,
      },
      history_rewriter: {
        id: 'history_rewriter',
        name: '📜 Reescritor de Historia',
        description: 'Reorganizaste la línea temporal con rebase',
        icon: '📚',
        level: 3,
        unlocked: false,
        screen: 3,
      },
      
      // Logros de Pantalla 4 - Comandos Expertos
      wild_west_hero: {
        id: 'wild_west_hero',
        name: '🤠 Héroe del Oeste',
        description: 'Completaste la Pantalla 4: Wild West',
        icon: '🏜️',
        level: 4,
        unlocked: false,
        screen: 4,
      },
      stash_expert: {
        id: 'stash_expert',
        name: '💾 Experto en Stash',
        description: 'Guardaste y recuperaste trabajo con stash',
        icon: '📦',
        level: 4,
        unlocked: false,
        screen: 4,
      },
      reset_warrior: {
        id: 'reset_warrior',
        name: '⚠️ Guerrero del Reset',
        description: 'Deshiciste commits con reset --soft',
        icon: '🔙',
        level: 4,
        unlocked: false,
        screen: 4,
      },
      revert_sage: {
        id: 'revert_sage',
        name: '🔄 Sabio del Revert',
        description: 'Deshiciste cambios de forma segura con revert',
        icon: '♻️',
        level: 4,
        unlocked: false,
        screen: 4,
      },
      
      // Logros Especiales
      git_master: {
        id: 'git_master',
        name: '🎓 Maestro de Git',
        description: '¡Completaste todas las pantallas!',
        icon: '👑',
        level: 5,
        unlocked: false,
        screen: 0,
      },
      speedrunner: {
        id: 'speedrunner',
        name: '⚡ Corredor Veloz',
        description: 'Completaste una pantalla en menos de 5 minutos',
        icon: '🏃',
        level: 5,
        unlocked: false,
        screen: 0,
      },
      perfectionist: {
        id: 'perfectionist',
        name: '💎 Perfeccionista',
        description: 'Completaste una pantalla sin usar hints',
        icon: '🌟',
        level: 5,
        unlocked: false,
        screen: 0,
      },
    };

    this.unlockedAchievements = this.loadFromLocalStorage();
    this.listeners = [];
  }

  // Cargar logros desde localStorage
  loadFromLocalStorage() {
    const saved = localStorage.getItem('bttf-achievements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  // Guardar en localStorage
  saveToLocalStorage() {
    localStorage.setItem('bttf-achievements', JSON.stringify(this.unlockedAchievements));
  }

  // Desbloquear logro
  unlock(achievementId) {
    const achievement = this.achievements[achievementId];
    
    if (!achievement) {
      console.warn(`Achievement ${achievementId} not found`);
      return false;
    }

    if (achievement.unlocked || this.unlockedAchievements.includes(achievementId)) {
      return false; // Ya está desbloqueado
    }

    achievement.unlocked = true;
    this.unlockedAchievements.push(achievementId);
    this.saveToLocalStorage();

    // Notificar a los listeners
    this.notifyListeners(achievement);

    // Mostrar notificación visual
    this.showAchievementNotification(achievement);

    return true;
  }

  // Verificar si un logro está desbloqueado
  isUnlocked(achievementId) {
    return this.unlockedAchievements.includes(achievementId);
  }

  // Obtener todos los logros
  getAllAchievements() {
    return Object.values(this.achievements).map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.includes(achievement.id),
    }));
  }

  // Obtener logros por pantalla
  getAchievementsByScreen(screenNumber) {
    return Object.values(this.achievements)
      .filter(a => a.screen === screenNumber)
      .map(achievement => ({
        ...achievement,
        unlocked: this.unlockedAchievements.includes(achievement.id),
      }));
  }

  // Obtener progreso total
  getProgress() {
    const total = Object.keys(this.achievements).length;
    const unlocked = this.unlockedAchievements.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  }

  // Mostrar notificación visual de logro
  showAchievementNotification(achievement) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-notification__content">
        <div class="achievement-notification__icon">${achievement.icon}</div>
        <div class="achievement-notification__text">
          <h3 class="achievement-notification__title">¡Logro Desbloqueado!</h3>
          <p class="achievement-notification__name">${achievement.name}</p>
          <p class="achievement-notification__description">${achievement.description}</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.add('achievement-notification--show');
    }, 100);

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('achievement-notification--show');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);

    // Reproducir sonido (opcional)
    this.playAchievementSound();
  }

  // Reproducir sonido de logro (opcional)
  playAchievementSound() {
    // Crear un sonido simple usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silenciar errores de audio
    }
  }

  // Agregar listener para logros desbloqueados
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Notificar a los listeners
  notifyListeners(achievement) {
    this.listeners.forEach(callback => {
      try {
        callback(achievement);
      } catch (e) {
        console.error('Error in achievement listener:', e);
      }
    });
  }

  // Reiniciar todos los logros (para testing)
  resetAll() {
    this.unlockedAchievements = [];
    Object.values(this.achievements).forEach(achievement => {
      achievement.unlocked = false;
    });
    this.saveToLocalStorage();
  }

  // Verificar y desbloquear logros automáticamente basado en progreso
  checkProgress(screenNumber, exerciseIndex, totalExercises) {
    // Logros de primera vez
    if (exerciseIndex === 1) {
      if (screenNumber === 1) {
        this.unlock('first_commit');
      }
    }

    // Logros de completar pantalla
    if (exerciseIndex === totalExercises) {
      if (screenNumber === 1) {
        this.unlock('time_traveler');
      } else if (screenNumber === 2) {
        this.unlock('future_explorer');
      } else if (screenNumber === 3) {
        this.unlock('rebase_master');
      } else if (screenNumber === 4) {
        this.unlock('wild_west_hero');
      }

      // Verificar si completó todas las pantallas
      const allScreensComplete = [1, 2, 3, 4].every(screen => {
        return this.isUnlocked(`time_traveler`) || 
               this.isUnlocked(`future_explorer`) || 
               this.isUnlocked(`rebase_master`) || 
               this.isUnlocked(`wild_west_hero`);
      });

      if (this.isUnlocked('time_traveler') && 
          this.isUnlocked('future_explorer') && 
          this.isUnlocked('rebase_master') && 
          this.isUnlocked('wild_west_hero')) {
        this.unlock('git_master');
      }
    }
  }

  // Desbloquear logros específicos por comando
  checkCommandAchievement(command) {
    if (command === 'branch') {
      this.unlock('branch_master');
    } else if (command === 'merge') {
      this.unlock('merge_beginner');
    } else if (command === 'rebase') {
      this.unlock('history_rewriter');
    } else if (command === 'cherry-pick') {
      this.unlock('cherry_picker');
    } else if (command === 'stash') {
      this.unlock('stash_expert');
    } else if (command.includes('reset') && command.includes('soft')) {
      this.unlock('reset_warrior');
    } else if (command === 'revert') {
      this.unlock('revert_sage');
    }
  }
}
