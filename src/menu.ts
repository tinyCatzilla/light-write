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
                label: 'Default',
                click: () => {
                    BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'default');
                }
            },
            {
                label: 'Dark',
                click: () => {
                    BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'dark');
                }
            },
            {
                label: 'Orange',
                click: () => {
                    BrowserWindow.getFocusedWindow()?.webContents.send('theme-change', 'orange');
                }
            },
        ]
    },
    

    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More'
            }
        ]
    }
]

export const mainMenu = Menu.buildFromTemplate(template);