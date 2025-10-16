# 🚀 Commit to the Future

**Una propuesta interactiva** que explora las líneas temporales de *Volver al Futuro* a través de ramas de Git.  
Cada commit representa un evento clave y cada rama una historia alternativa.  
Un recurso divertido y visual para explicar conceptos de Git como *branching*, *merge* y *cherry-pick*.

## ✨ Funcionalidades

### 🎮 Consola Git Interactiva en Vivo
- **Sincronización en tiempo real**: Cada comando Git que ejecutes se refleja instantáneamente en el gráfico visual
- **Modo Aprendizaje**: Reinicia el gráfico y crea tu propio historial desde cero
- **Modo Demo**: Carga el historial completo de "Volver al Futuro" con un clic
- **Feedback visual**: Mensajes informativos te guían mientras aprendes

### 📊 Visualización GitGraph
- Gráfico interactivo que se actualiza en tiempo real
- Colores distintos para cada rama
- Representación visual de merges y bifurcaciones

### 🎯 Comandos Disponibles
Todos sincronizados con el gráfico:
- `git init` - Inicializa repositorio y crea rama main
- `git add .` - Prepara archivos para commit
- `git commit -m "mensaje"` - Crea commit visible en el gráfico
- `git branch [nombre]` - Crea nueva rama desde el punto actual
- `git checkout [rama]` - Cambia de rama
- `git merge [rama]` - Fusiona ramas (¡verás la unión!)
- `git status` - Muestra estado actual
- `git log` - Historial de commits
- `git reset` - Limpia staging area

---
---

# Back to the Future 🚗⚡ meets Git

| Concepto Git   | Explicación técnica | Ejemplo en *Back to the Future* |
|----------------|---------------------|----------------------------------|
| **Checkout 🕒**   | Cambiar el puntero `HEAD` a otro commit o rama, sin generar cambios nuevos. | Einstein viaja 1 minuto al futuro / Marty y Doc van al 2015: se mueven en la línea temporal pero no modifican nada. |
| **Pull 📥**       | Traer los cambios de un remoto y aplicarlos en tu rama local. | Al volver de 2015 encuentran la distopía de Biff: se trajeron (sin querer) los cambios que Biff hizo en otra rama. |
| **Rebase ✨**     | Reescribir la base de commits, aplicando tu historial sobre otro. | Cuando salvan a Clara o Marty evita que sus padres se conozcan: la historia se reescribe desde ese punto. |
| **Cherry-pick 🍒**| Aplicar un commit específico de otra rama sin traer el resto. | Jennifer trae un cambio puntual de la línea de Biff millonario a la línea “normal”. |
| **Commit 📝**     | Guardar un nuevo cambio en el historial. | Cada acción clave es un commit: “Biff roba el almanaque”, “Doc conoce a Clara”. |
| **Merge 🔀**      | Combinar dos ramas distintas, conservando ambas historias en un punto común. | Marty logra que sus padres se conozcan de nuevo: hace merge de los cambios para restaurar la historia. |
| **Stash 📦**      | Guardar cambios de manera temporal sin incluirlos en el historial. | La carta del Doc en 1885: queda “stash-eada” hasta que Marty la aplica en 1955. |
| **Tag 🏷️**        | Marcar un commit específico como punto de referencia importante. | El rayo en el reloj: siempre vuelven a ese instante clave en el tiempo. |
