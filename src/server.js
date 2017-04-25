const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const child_process = require('child_process')
let port = 9001

app.use(bodyParser())
app.use(express.static(__dirname))

// 添加文件夹路径并且获取文件夹里所有文件
app.post('/dir', function(req, res) {
  let dir = req.body.dir;
  if (fs.existsSync(dir)) {
    let result = fs.readdirSync(dir)
    
    let db = JSON.parse(fs.readFileSync(`${__dirname}/db/dir_list.json`))
    let arr = dir.split('/')
    if (arr[arr.length - 1] == "") {
      arr.pop()
    }
    dir = arr.toString()
    dir = dir.replace(/,/g, "/")
    for (let x in db) {
      if ( db[x].dir == dir ) {
        return res.status(400).send('文件路径已存在')
      }
    }
    let data = {
      id: (db[db.length] && db[db.length].id + 1) || db.length + 1,
      dir: dir,
      data: result,
      title: path.basename(dir) || "未命名"
    }
    db.push(data)
    fs.writeFileSync(`${__dirname}/db/dir_list.json`, JSON.stringify(db), 'utf8')
    res.json({
      status: 200,
      data: data
    })
  } else {
    res.status(500).json({
      status: 500,
      error: "不存在这个文件目录"
    })
  }
});

// 获取所有文件夹
app.get('/dir', function(req, res) {
  let data = JSON.parse(fs.readFileSync(`${__dirname}/db/dir_list.json`))
  res.json({
    status: 200,
    data: data
  })
});

// 删除文件夹
app.delete('/dir/:id', function(req, res) {
  let index = req.params.id
  let data = JSON.parse(fs.readFileSync(`${__dirname}/db/dir_list.json`))
  data.splice(index ,1)
  fs.writeFileSync(`${__dirname}/db/dir_list.json`, JSON.stringify(data), 'utf8')
  res.json({
    status: 200,
    data: data
  })
});

// 读取文件
app.post('/readfile', function(req, res) {
  let dir = req.body.dir
  if (fs.statSync(dir).isFile()) {
    child_process.execSync(`"${dir}"`)
    return res.json({
      status: 200,
      data: null,
      isFile: true
    })
  } else {
    let result = fs.readdirSync(dir)
    return res.json({
      status: 200,
      data: result,
      dir: dir,
      isFile: false
    })
  }
});

// 返回文件上一级
app.get('/back', function(req, res) {
  let dir = req.query.dir
  let arr = dir.split('/')
  arr.pop()
  dir = arr.toString()
  dir = dir.replace(/,/g, "/")
  let result = fs.readdirSync(dir)
  res.json({
    status: 200,
    data: result,
    dir: dir
  })
});

// 修改文件夹命名
app.put('/dir/:id', function(req, res) {
  let title = req.body.title
  let index = req.params.id
  let data = JSON.parse(fs.readFileSync(`${__dirname}/db/dir_list.json`))
  data[index].title = title
  fs.writeFileSync(`${__dirname}/db/dir_list.json`, JSON.stringify(data), 'utf8')
  res.json({
    status: 200,
    data: data[index]
  })
});

app.listen(port, function() {
  console.log(`App listening on port ${port}!`);
});