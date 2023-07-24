// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  changeTheme: (theme: string) => ipcRenderer.send('theme-change', theme),
  onThemeChange: (func: any) => ipcRenderer.on('theme-change', func)
});

contextBridge.exposeInMainWorld(
  "api", {
    capturePage: () => ipcRenderer.invoke('capture-page')
  }
)
