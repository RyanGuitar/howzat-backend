const WebSocketServer = require('ws');
const wss = new WebSocketServer.Server({ port: 8080 })

const clients = new Set();

function createUser(data){
  let newUser = JSON.parse(data)
  let user = {
    name: newUser.name,
    tel: newUser.tel
  }
  return user
}

function shareMessage(data){
  let str = String.fromCharCode.apply(null, data);
  for(let client of clients) {
    if(client.user.tel){
      client.send(str);
    } else {
      console.log('Bogus client')
    }
  }
}

function checkLoggedIn(ws){
  for(let client of clients){
    if(client.user.tel == ws.user.tel){
      ws.close()
      return
    }
  }
  addUser(ws)
  shareLogginStatus()
}

function addUser(ws){
  clients.add(ws)
}

function shareLogginStatus(){
  for(let client of clients){
    console.log(`${client.user.name} : ${client.user.tel} is online`)
  }
}

function addRejectClient(ws, data){
  ws.user = createUser(data)
  if(!clients.size){
    addUser(ws)
     console.log(`${ws.user.name} : ${ws.user.tel} is online`)
    //ws.send(JSON.stringify(ws.user))
  } else {
    checkLoggedIn(ws)
  }
}

wss.on("connection", ws => {
  console.log('connected')

  ws.on("message", data => {

    if(data.includes("Typing...")){

      console.dir(`${ws.user.name} is Typing...`)
    }

    if(data.includes("tel")){
      addRejectClient(ws, data)
    } else {
      shareMessage(data)
    }
  });

  ws.on("close", () => {
    if(clients.has(ws)){
      clients.delete(ws);
    }
    if(!clients.size){
      console.dir('Nobody logged in')
    } else {
      shareLogginStatus()
    }
  });

  ws.on("error", () => {
    console.log("Some Error occurred")
  });

});

console.log("The WebSocket server is running on port 8080");