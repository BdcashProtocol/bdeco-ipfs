var formidable = require('formidable')
var express = require('express')
var fs = require('fs')
const fileType = require('file-type')

var app = express()
const IPFS = require('ipfs')
const node = new IPFS({ repo: '~/.ipfs' })

app.get('/info', function (req, res){
  setTimeout(function(){
    node.version(function (err, version) {
      if (err) {
        throw err
      }
      res.send(version.version)
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.post('/add', function (req, res){
  setTimeout(function () {
    var form = new formidable.IncomingForm();
    form.multiples = true
    form.parse(req, function(err, fields, files) {
      if(files.files !== undefined){
        if(fields.folder !== undefined){
          var ipfscontents = new Array()
          for(var k in files.files){
            var file = fs.readFileSync(files.files[k].path)
            var ipfsobj = {
              path: fields.folder + '/' + files.files[k].name,
              content: file
            }
            ipfscontents.push(ipfsobj)
          }
          node.add(ipfscontents).then(results => {
            res.send({
              data: results,
              status: 200
            })
          })
        }else{
          res.send({
            data: {
              error: "Specify folder first."
            },
            status: 422
          })
        }
      }else{
        if(files.file !== undefined){
          var content = fs.readFileSync(files.file.path)
          node.add(content).then(results => {
            const hash = results[0].hash
            res.send({
              data: {
                hash: hash
              },
              status: 200
            })
          })
        }else{
          res.send({
            data: {
              error: "Specify one or more file first."
            },
            status: 422
          })
        }
      }
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.post('/verify/:hash', function (req, res){
  setTimeout(function () {
    var hash = req.params.hash
    var form = new formidable.IncomingForm();
    form.parse(req)
    form.on('file', function (name, file){
        fs.readFile(file.path, {onlyHash: true}, function(error, content){
          node.add(content).then(results => {
            var calculated = results[0].hash
            if(calculated !== hash){
              res.send(false)
            }else{
              res.send(true)
            }
          })
        })
    });
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.get('/ls/:hash', function (req, res){
  setTimeout(function () {
    const hash = req.params.hash
    node.ls(hash, function (err, result) {
      if (err) {
          throw err
      }
      res.send(result)
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.get('/ipfs/:hash/:folder', function (req, res){
  setTimeout(function () {
    const hash = req.params.hash
    const folder = req.params.folder
    node.cat(hash + '/' + folder, function (err, file) {
      if (err) {
          throw err
      }
      var mimetype = fileType(file)
      if(mimetype){
        res.setHeader('Content-Type', mimetype.mime);
      }
      res.end(file)
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.get('/ipfs/:hash', function (req, res){
  setTimeout(function () {
    const hash = req.params.hash
    node.cat(hash, function (err, file) {
      if (err) {
          throw err
      }
      var mimetype = fileType(file)
      if(mimetype){
        res.setHeader('Content-Type', mimetype.mime);
      }
      res.end(file)
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.get('/pins', function (req, res){
  setTimeout(function(){
    node.pin.ls({ type: 'recursive' }, function (err, pinset) {
      if (err) {
        throw err
      }
      res.send({
        data: pinset,
        status: 200
      })
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

app.get('/add/:hash', function (req, res){
  setTimeout(function(){
    const hash = req.params.hash
    node.pin.add(hash, function (err) {
      if (err) {
        throw err
      }
      res.send({
        data: true,
        status: 200
      })
    })
  }, 10 * Math.floor((Math.random() * 10) + 1))
});

node.on('ready', () => {
  console.log('NODE READY')
  app.listen(3000);
});