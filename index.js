const express = require('express')
const app = express()
const fs = require('fs')
const mysql = require('mysql')
const multer = require('multer');

//Express Setting
app.use(express.static('public'))
app.use('/views', express.static('views'))

//body Parser
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))


//Function
const print = (data) => console.log(data)

async function readFile(path) {
    return await new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            resolve(data)
        })
    })
}

async function renderFile(path, replaceItems = {}) {
    var content = await readFile(path)

    for (i in replaceItems) {
        content = content.replaceAll(`{{${i}}}`, replaceItems[i])
    }
    return content
}

async function sendRender(req, res, path, replaceItems) {
    res.send(await renderFile(req, path, replaceItems))
}

function htmlImgView(date, before, after, filelist, index){
    if(before){
        before=`<div class="viewer-header controller"><a href='/data/${filelist[index - 1]}'><div style='width:100%;height:100%'><</div></a></div>`
    }
    else {
        before=''
    }
    if(after){
        after=`<div class="viewer-footer controller"><a href='/data/${filelist[index +1]}'><div style='width:100%;height:100%'>></div></a></div>`
    }
    else {
        after=''
    }
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
        *{
            text-decoration: none;
        }
            .imgViewer {
                display: flex;
                flex-direction: row;
            }
    
            .imgViewer > * {
                transition: 0.2s;
            }
    
            .viewer-header {
                flex: 1;
            }
    
            .controller {
                cursor: pointer;
                display:flex;
                justify-content: center;
                align-items: center;
                font-size:50px;
                text-decoration : none;
                background-color: rgb(226, 226, 226);
            }

            .controller > a > div {
                color: white;
            }
    
            .controller:hover {
                background-color: rgb(156, 156, 156);
            }
    
            .viewer-container {
                flex: 5;
                display:flex;
                justify-content: center;
                align-items: center;
            }
    
            .viewer-footer {
                flex: 1;
            }
        </style>
    </head>
    
    <body>
        <h3><a href='/'>HOME</a></h3>
        <h1>${date}</h1>
        <br>
        <div class="container">
            <div class="imgViewer">
                ${before}
                <div class="viewer-container">
                    <img src='/img/${date}'></img>
                </div>
                ${after}
    
            </div>
        </div>
    </body>
    
    </html>`
}


//Web
app.get('/', async (req, res) => {
    fs.readdir('./public/img/', function (error, filelist) {
        html = `<a href='/today'><h3>오늘</h3></a>`
        print(filelist)
        for (var i in filelist) {
            html += `<li><a href='/data/${filelist[i]}'>${filelist[i]}</a></li>`
        }
        //today.toISOString().slice(0,10)
        res.send(html)
    })
})

app.get('/today', async (req, res) => {
    fs.readdir('./public/img/', function (error, filelist) {
        html = `<a href='/'><h3>HOME</h3></a>`
        html += '<style>img{width:200px; height:140px}</style>'
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10)
        for (var i in filelist) {
            if (filelist[i].indexOf(dateStr) != -1)
                html += `<li><a href='/data/${filelist[i]}'><img src='/img/${filelist[i]}'></img></a></li>`
        }
        res.send(html)
    })
})


app.get('/data/:date', async (req, res) => {
    fs.readdir('./public/img/', function (error, filelist) {
        var index = filelist.indexOf(req.params.date)
        before = false
        if (index - 1 >= 0) {
            before = true
        }
        after = false
        if (index + 1 < filelist.length) {
            after = true
        }
        res.send(htmlImgView(req.params.date, before, after, filelist, index))
    })
})

app.listen(5500, () => console.log('Server run https://localhost:5500'))
