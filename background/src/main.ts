import * as activeWindow from 'active-win'
import * as robotjs from 'robotjs'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as express from 'express'
import * as cors from 'cors'
import SysTray from 'systray2'
const PORT = 49072

const { width, height } = robotjs.getScreenSize()
const platorm = os.platform()
let folder = ''
if (platorm === 'win32') {
    folder = path.join(os.homedir(), 'AppData', 'Roaming', 'game-activity')
} else if (platorm === 'linux') {
    folder = path.join(os.homedir(), '.config', 'game-activity')
} else {
    console.error('Unsupported platform')
    process.exit(1)
}

if (!fs.existsSync(folder)) fs.mkdirSync(folder)

let timeRecord: Record<string, number> = {}

const date = new Date()
const day = date.getDate().toString().padStart(2, '0')
const month = (date.getMonth() + 1).toString().padStart(2, '0')
const year = date.getFullYear()
const filename = `${day}-${month}-${year}.json`
const filepath = path.join(folder, filename)
if (fs.existsSync(filepath)) {
    timeRecord = JSON.parse(fs.readFileSync(filepath, 'utf8'))
} else {
    fs.writeFileSync(filepath, JSON.stringify({}))
}

const img = path.join(
    __dirname,
    '..',
    'img',
    `clock.${platorm === 'win32' ? 'ico' : 'png'}`
)

const urlItem = {
    title: 'Open Webpage',
    tooltip: 'open the webpage to see your game activity',
    checked: false,
    enabled: true,
    click: () => {
        var url = `http://localhost:${PORT}`
        var start =
            process.platform == 'darwin'
                ? 'open'
                : process.platform == 'win32'
                ? 'start'
                : 'xdg-open'
        require('child_process').exec(start + ' ' + url)
    }
}

const exitItem = {
    title: 'Exit',
    tooltip: 'close the program',
    checked: false,
    enabled: true,
    click: () => {
        process.exit(0)
    }
}

const systray = new SysTray({
    menu: {
        title: 'Game Activity',
        icon: img,
        tooltip: 'Game Activity',
        items: [urlItem, exitItem]
    },
    copyDir: true
})

systray.onClick(action => {
    //@ts-ignore
    if (action.item.click != null) {
        //@ts-ignore
        action.item.click()
    }
})
const app = express()
app.use(
    cors({
        origin: '*'
    })
)

app.listen(PORT, 'localhost', () => console.log(`listening on port ${PORT}`))

app.get('/all', (req, res) => {
    const files = fs.readdirSync(folder)
    const data: Record<string, Record<string, number>> = {}
    for (const file of files) {
        data[path.parse(file).name] = JSON.parse(
            fs.readFileSync(path.join(folder, file), 'utf-8')
        )
    }
    res.json(data)
})

const publicPath = path.join(__dirname, '..', 'public')
if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath)
app.use('/', express.static(publicPath))
app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(publicPath, 'index.html'))
})

setInterval(async () => {
    const window = await activeWindow()
    if (!window) return
    const { name } = window.owner
    const isFullscreen =
        width == window.bounds.width && height == window.bounds.height
    if (!isFullscreen) return
    if (timeRecord[name] === undefined) {
        timeRecord[name] = 1
    } else {
        timeRecord[name]++
    }

    fs.writeFileSync(filepath, JSON.stringify(timeRecord, null, 4))
}, 1000)
