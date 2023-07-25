import { Menu, BrowserWindow } from 'electron';


const template: Electron.MenuItemConstructorOptions[] = [
    // {
    //     label: 'File',
    //     submenu: [
    //         {
    //             label: 'New',
    //             // accelerator: 'CmdOrCtrl+N',
    //             // click: () => {
    //             //     BrowserWindow.getFocusedWindow().webContents.send('new-file');
    //             // }
    //         },
    //     ]
    // },

    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' }
        ]
    },

    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },

    {
        label: 'Themes',
        submenu: [
            {
                label: 'Light',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'default'); }
            },
            {
                label: 'Summer',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'orange'); }
            },
            {
                label: 'Grass',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'grass'); }
            },
            {
                label: 'Dark',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'dark'); }
            },
            {
                label: 'Dim',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'dim'); }
            },
            {
                label: 'Deep Blue',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'deep-blue'); }
            },
            {
                label: 'Deep Purple',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'deep-purple'); }
            },
            {
                label: 'Wine',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'wine'); }
            },
            {
                label: 'Nightlife',
                click: () => { BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'nightlife'); }
            },
        ]
    }
]

export const mainMenu = Menu.buildFromTemplate(template);