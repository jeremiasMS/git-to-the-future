# 🎓 Estructura de Ejercicios - Git to the Future

## 📊 Resumen de Progresión de Dificultad

El proyecto ahora implementa una **progresión pedagógica** que enseña Git desde conceptos básicos hasta comandos expertos:

### 🟢 Pantalla 1: Origin (1985→1955) - **FUNDAMENTOS** (6 ejercicios)
**Nivel:** Principiante  
**Comandos:** `init`, `commit`, `branch`, `checkout`, `merge`

1. ✅ Inicializar repositorio (`git init`)
2. ✅ Primer commit: 1985
3. ✅ Crear rama: marty-sin-papas
4. ✅ Cambiar a la rama de la paradoja
5. ✅ Commit: Paradoja resuelta
6. ✅ Fusionar la paradoja

**Conceptos aprendidos:**
- Inicialización de repositorios
- Commits básicos
- Creación de ramas
- Navegación entre ramas
- Merge simple

---

### 🔵 Pantalla 2: Time Travel (2015) - **FUNDAMENTOS AVANZADOS** (6 ejercicios)
**Nivel:** Principiante-Intermedio  
**Comandos:** `commit`, `branch`, `checkout`

1. ✅ Viaje a 2015
2. ✅ Biff roba el DeLorean
3. ✅ Crear rama: biff-paradise (distopía)
4. ✅ Viajar a biff-paradise
5. ✅ Marty recupera el almanaque
6. ✅ Doc es enviado a 1885

**Conceptos aprendidos:**
- Commits narrativos
- Ramas complejas (líneas temporales alternativas)
- Preparación para conceptos avanzados

---

### 🟠 Pantalla 3: Dystopia (1985A) - **COMANDOS INTERMEDIOS-AVANZADOS** (8 ejercicios)
**Nivel:** Intermedio  
**Comandos:** `rebase`, `cherry-pick`, `branch`, `commit`, `merge`

1. ✅ Volver a main
2. ✅ Crear rama: familia-feliz
3. ✅ Viajar a familia-feliz
4. ✅ Commit: George es escritor exitoso
5. 🔥 **REBASE**: Reorganizar historia (`git rebase main`)
6. ✅ Commit: Biff lava autos
7. 🍒 **CHERRY-PICK**: Rescatar cambio específico (`git cherry-pick`)
8. ✅ Fusionar en main

**Conceptos aprendidos:**
- **Rebase**: Reorganización de historia para líneas temporales más limpias
- **Cherry-pick**: Copiar commits específicos entre ramas
- Reescritura de historia (conceptos intermedios)

---

### 🔴 Pantalla 4: Wild West (1885) - **COMANDOS EXPERTOS** (13 ejercicios)
**Nivel:** Avanzado-Experto  
**Comandos:** `stash`, `reset --soft`, `revert`, `commit`, `merge`

1. ✅ Commit: Marty viaja a 1885
2. ✅ Crear rama: clara-viva
3. ✅ Viajar a clara-viva
4. ✅ Commit: Doc salva a Clara
5. 💾 **STASH**: Guardar trabajo temporal (`git stash`)
6. 💾 **STASH POP**: Recuperar trabajo (`git stash pop`)
7. ✅ Commit: Doc y Clara se enamoran
8. ⚠️ **RESET SOFT**: Deshacer commit manteniendo cambios (`git reset --soft HEAD~1`)
9. ✅ Commit: Doc elige el amor
10. 🔄 **REVERT**: Deshacer sin reescribir historia (`git revert HEAD`)
11. ✅ Commit: Locomotora del tiempo
12. ✅ Commit: Familia Doc Brown (Jules y Verne)
13. ✅ Merge final: Saga completa

**Conceptos aprendidos:**
- **Stash**: Trabajo temporal sin commits
- **Reset --soft**: Deshacer commits manteniendo cambios en staging
- **Revert**: Deshacer cambios de forma segura (sin reescribir historia)
- Diferencia entre comandos destructivos y no destructivos
- Gestión avanzada de historia

---

## 🎯 Filosofía Pedagógica

### Progresión de Complejidad
```
Pantalla 1 → 2: Fundamentos (init, commit, branch, checkout, merge)
Pantalla 3: Intermedio (rebase, cherry-pick)
Pantalla 4: Avanzado (stash, reset, revert)
```

### Comandos por Nivel

#### 🟢 Nivel 1 - Fundamentos (Pantallas 1-2)
- `git init` - Crear repositorio
- `git commit` - Guardar cambios
- `git branch` - Crear ramas
- `git checkout` - Cambiar de rama
- `git merge` - Fusionar ramas

#### 🟠 Nivel 2 - Intermedio (Pantalla 3)
- `git rebase` - Reorganizar historia
- `git cherry-pick` - Copiar commits específicos

#### 🔴 Nivel 3 - Avanzado (Pantalla 4)
- `git stash` / `stash pop` - Trabajo temporal
- `git reset --soft` - Deshacer commits (mantener cambios)
- `git revert` - Deshacer de forma segura

---

## 📈 Total de Ejercicios: 33

| Pantalla | Ejercicios | Nivel | Comandos Clave |
|----------|-----------|-------|----------------|
| 1 | 6 | 🟢 Principiante | init, commit, branch, checkout, merge |
| 2 | 6 | 🔵 Principiante+ | commit, branch, checkout |
| 3 | 8 | 🟠 Intermedio | **rebase**, **cherry-pick**, merge |
| 4 | 13 | 🔴 Avanzado | **stash**, **reset**, **revert** |

---

## 🎬 Narrativa + Aprendizaje

Cada comando se introduce en un **contexto narrativo** de Back to the Future:

- **Stash**: Guardar trabajo cuando hay un ataque indio 🏇
- **Reset --soft**: Doc duda de su decisión sobre Clara 💭
- **Revert**: Deshacer la decisión pero sin destruir historia 🔄
- **Rebase**: Limpiar la línea temporal de la familia feliz 🧹
- **Cherry-pick**: Traer el commit del almanaque destruido 🍒

Esto hace que comandos complejos sean **memorables** y **comprensibles**.

---

## 🚀 Próximos Pasos

Para futuras mejoras, podrías agregar:

1. **Pantalla 5 (Opcional)**: Comandos colaborativos
   - `git remote`
   - `git push`
   - `git pull`
   - `git fetch`
   - Pull requests

2. **Comandos adicionales**:
   - `git reset --hard` (destructivo)
   - `git reflog` (recuperar commits perdidos)
   - `git bisect` (búsqueda binaria de bugs)
   - `git tag` (versiones)

3. **Modos de juego**:
   - Modo sandbox (sin guía)
   - Modo desafío (contrarreloj)
   - Modo tutorial (explicaciones paso a paso)

---

## 📚 Referencias de Comandos

### Comandos Seguros (No destructivos)
- ✅ `git commit`
- ✅ `git branch`
- ✅ `git checkout`
- ✅ `git merge`
- ✅ `git stash`
- ✅ `git revert`

### Comandos Cuidadosos (Pueden reescribir historia)
- ⚠️ `git rebase` - Reorganiza commits
- ⚠️ `git cherry-pick` - Copia commits
- ⚠️ `git reset --soft` - Deshace commits (mantiene cambios)

### Comandos Peligrosos (Destructivos)
- ❌ `git reset --hard` - Destruye cambios
- ❌ `git push --force` - Sobrescribe historia remota

---

**¡Ahora los usuarios aprenderán Git de forma completa y divertida!** 🎉
