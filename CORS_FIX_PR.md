# Fix CORS Issues - Menu Principal ya funciona sin servidor

## El Problema
Cuando abría `index-menu.html` haciendo doble clic me salía este error:
```
Access to script at 'file:///C:/Users/.../js/modules/index.js' from origin 'null' has been blocked by CORS policy
```

Los clics en las tarjetas no funcionaban porque el JavaScript no se cargaba. Esto pasa porque los navegadores bloquean los módulos ES6 cuando abres archivos localmente (`file://`).

## La Solución
- **Quité los imports/exports de ES6** y puse todo el código JavaScript inline
- **Convertí las clases** `ScreenController` y `UIController` para que funcionen sin módulos
- **Agregué `DOMContentLoaded`** para que se inicialice bien
- **Mantuve toda la funcionalidad**: progreso, notificaciones, navegación entre pantallas

## Ahora funciona:
✅ Doble clic en `index-menu.html` → se abre y funciona  
✅ Los clics en "Nivel 1", "Nivel 2", etc. responden correctamente  
✅ Las notificaciones aparecen sin problemas  
✅ El progreso se guarda en localStorage  

## Lo que NO cambió:
- Mismo diseño visual
- Misma lógica de desbloqueo de pantallas  
- Mismo sistema de progreso
- Compatibilidad con el resto del proyecto

## Testing
Probé abriendo el archivo directamente desde Windows Explorer y todo funciona perfecto. Ya no hace falta montar un servidor HTTP para probar la app.

---

**Nota**: Si alguien prefiere usar servidor HTTP (con `npx http-server` o similar) también sigue funcionando igual que antes.