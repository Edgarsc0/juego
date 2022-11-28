import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import { hostname } from "os";
// Initializations

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
const server = http.createServer(app);
const io = new SocketServer(server,{
    cors:{
        origin:"*"
    }
});

app.use(express.static("public"));

// Middlewares
//app.use(cors());
//app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
    console.log(`socket connected: ${socket.id}`);
    socket.emit("socket:id",{id:socket.id});
    socket.on("join",({to})=>{
        io.emit("acceptJoin",{from:socket.id,to:to});
    })
    socket.on("deny",({to})=>{
        io.emit("join:denied",{to:to});
    })
    socket.on("accept",({to,from})=>{
        io.emit("join:accept",{to:to,from:from});
    });
    socket.on("final:cuenta",({to,puntuacion})=>{
        io.emit("cuenta",{to:to,puntuacion:puntuacion});
    })
});


app.get("/",(req,res)=>{
    console.log(req.hostname);
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=<device-width>, initial-scale=1.0">
        <title>TRIVIAL SHIPS</title>
        <style>
        .ship{
            width: 100px;
            height: 100px;
            border: 1px solid black;
            animation-duration: 1.7s;
            animation-name: move;
            animation-iteration-count: infinite;
            border: 0px;
        }
        .mainContent{
            height: 900px;
            border: 1px solid black;
            overflow: hidden;
            display: flex;
        }
        .time{
            display: flex;
        }
        @keyframes move{
            from{
                margin-top: -20%;
            }
            to{
                margin-top: 100%;
            }
        
        }
        </style>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
        <h1>Crear Partida</h1>
        <hr>
        <a href="/game">Crear partida multijugador</a>
        <h1>Unirse a partida</h1>
        <hr>
        <label>Codigo: </label><input id="sid" type="text"> <button id="join">Unirse</button>
        <script>
            document.getElementById("join").onclick=()=>{
                const id=document.getElementById("sid").value;
                globalThis.socket = io("http://${req.hostname}:8000");
                socket.on("socket:id",({id})=>{
                    globalThis.thisSocket=id;
                })  
                socket.emit("join",{to:id});
                alert("Esperando confirmacion");
                socket.on("join:denied",({to})=>{
                    if(to==thisSocket){
                        alert("Peticion denegada");
                        window.location.reload();
                        socket.disconnect();
                    }
                })
                socket.on("join:accept",({to,from})=>{
                    globalThis.oponentID=from;
                    if(to==thisSocket){
                        document.body.innerHTML=" <h1>JUEGIÑO</h1> <div id='puntuacionOponente'></div> <p>Puntuacion actual: </p><div id='points'></div> <p>TIEMPO: </p> <div class='time'> <div id='min'><h1>01:</h1></div><div id='sec'><h1>30</h1></div> </div> <hr> <div class='mainContent' id='padre'> <div class='ship' id='1' onclick='removerDiv(id)'></div> <div class='ship' id='2' onclick='removerDiv(id)'></div> <div class='ship' id='3' onclick='removerDiv(id)'></div> <div class='ship' id='4' onclick='removerDiv(id)'></div> <div class='ship' id='5' onclick='removerDiv(id)'></div> <div class='ship' id='6' onclick='removerDiv(id)'></div> <div class='ship' id='7' onclick='removerDiv(id)'></div> <div class='ship' id='8' onclick='removerDiv(id)'></div> <div class='ship' id='9' onclick='removerDiv(id)'></div> <div class='ship' id='10' onclick='removerDiv(id)'></div> <div class='ship' id='11' onclick='removerDiv(id)'></div> </div>"
                        startGame();
                    }
                })
            }
            let cuenta=0;
            const removerDiv=(id)=>{
                cuenta+=1;
                pointsDiv.innerHTML='<h1>'+cuenta+'</h1>';
                padre.removeChild(document.getElementById(id));
                const newDiv=document.createElement('DIV');
                let ram = Math.floor(Math.random()*(15-10) +10);
                newDiv.className='ship';
                newDiv.setAttribute('id',id);
                newDiv.setAttribute('onclick','removerDiv(id)');
                newDiv.style.animationDuration=ram+'s';
                newDiv.style.backgroundImage='url(../img/b1.png)';
                newDiv.style.backgroundRepeat='no-repeat';
                newDiv.style.backgroundSize='contain';
                padre.appendChild(newDiv);
            }
            
            const startGame=()=>{
                const div=document.getElementsByClassName('ship')
                for(i of div){
                    let ram = Math.floor(Math.random()*(15-10) +10);
                    i.style.animationDuration=ram+'s';
                    i.style.backgroundImage='url(../img/b1.png)';
                    i.style.backgroundRepeat='no-repeat';
                    i.style.backgroundSize='contain';
                }
                globalThis.padre=document.getElementById('padre');
                globalThis.pointsDiv=document.getElementById('points');
                globalThis.minDiv=document.getElementById('min');
                globalThis.secDiv=document.getElementById('sec');
                let segundos=30;
                let minutos=1;
                const actualizarTiempo=()=>{
                    if(minutos==0 && segundos==1){
                        setTimeout(()=>{
                            minDiv.innerHTML='<h1>00:</h1>';
                            secDiv.innerHTML='<h1>00</h1>';
                        },1000);
                    }else{
                        if(segundos==1){
                        setTimeout(()=>{
                            segundos=59;
                            minutos-=1;
                            if(minutos.toString().split('').length>1){
                                minDiv.innerHTML='<h1>'+minutos+':</h1>';
                            }else{
                                minDiv.innerHTML='<h1>0'+minutos+':</h1>';
                            }
                            if(segundos.toString().split('').length>1){
                                secDiv.innerHTML='<h1>'+segundos+'</h1>'
                            }else{
                                secDiv.innerHTML='<h1>0'+segundos+'</h1>'
                            }
                            actualizarTiempo();
                        },1000);
                    }else{
                        setTimeout(()=>{
                            segundos-=1;
                            if(segundos.toString().split('').length>1){
                                secDiv.innerHTML='<h1>'+segundos+'</h1>'
                            }else{
                                secDiv.innerHTML='<h1>0'+segundos+'</h1>'
                            }
                            actualizarTiempo();
                        },1000);
                    }
                    }
                }
                actualizarTiempo();
                setTimeout(()=>{
                    alert('Fin del juego');
                    for(i of div){
                        i.style={};
                    }
                    socket.emit("final:cuenta",{to:oponentID,puntuacion:cuenta})
                },90000);
                socket.on("cuenta",({to,puntuacion})=>{
                    if(to==thisSocket){
                        console.log(puntuacion);
                        if(puntuacion>cuenta){
                            alert("PERDISTE!");
                            socket.disconnect();
                            window.location.href="/";
                        }else{
                            alert("GANASTE!");
                            socket.disconnect();
                            window.location.href="/";
                        }
                    }
                })
            }
        </script>
    </body>
    </html>
    `)
});

app.get("/game",(req,res)=>{
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=<device-width>, initial-scale=1.0">
        <script src="/socket.io/socket.io.js"></script>
        <title>TRIVIAL SHIPS</title>
        <style>
        .ship{
            width: 100px;
            height: 100px;
            border: 1px solid black;
            animation-duration: 1.7s;
            animation-name: move;
            animation-iteration-count: infinite;
            border: 0px;
        }
        .mainContent{
            height: 900px;
            border: 1px solid black;
            overflow: hidden;
            display: flex;
        }
        .time{
            display: flex;
        }
        @keyframes move{
            from{
                margin-top: -20%;
            }
            to{
                margin-top: 100%;
            }
        
        }
        </style>
    </head>
    <body>
        <h1>Crear Partida</h1>
        <p>Codigo de la partida: </p>
        <hr>
        <div id="socketId"></div>
        <div id="confirmation"></div>
        <script>
            const socket = io("http://${req.hostname}:8000");
            const socketIdDiv=document.getElementById("socketId");
            const confirmationDiv=document.getElementById("confirmation");
            socket.on("socket:id",({id})=>{
                globalThis.idSocket=id;
                socketIdDiv.innerHTML="<h3>"+id+"</h3>";
                socket.on("acceptJoin",({from,to})=>{
                    globalThis.fromSocket=from;
                    if(to==id){
                        confirmationDiv.innerHTML="<h1>"+from+" Esta tratando de unirse</h1><p>¿Quieres dejarlo entrar?</p><button onclick='accept()'>Si</button><br><button onclick='deny()'>No</button>";
                    }
                })
            });
            const accept=()=>{
                socket.emit("accept",{to:fromSocket,from:idSocket});
                document.body.innerHTML=" <h1>JUEGIÑO</h1> <div id='puntuacionOponente'></div> <p>Puntuacion actual: </p><div id='points'></div> <p>TIEMPO: </p> <div class='time'> <div id='min'><h1>01:</h1></div><div id='sec'><h1>30</h1></div> </div> <hr> <div class='mainContent' id='padre'> <div class='ship' id='1' onclick='removerDiv(id)'></div> <div class='ship' id='2' onclick='removerDiv(id)'></div> <div class='ship' id='3' onclick='removerDiv(id)'></div> <div class='ship' id='4' onclick='removerDiv(id)'></div> <div class='ship' id='5' onclick='removerDiv(id)'></div> <div class='ship' id='6' onclick='removerDiv(id)'></div> <div class='ship' id='7' onclick='removerDiv(id)'></div> <div class='ship' id='8' onclick='removerDiv(id)'></div> <div class='ship' id='9' onclick='removerDiv(id)'></div> <div class='ship' id='10' onclick='removerDiv(id)'></div> <div class='ship' id='11' onclick='removerDiv(id)'></div> </div>"
                startGame();
            }
            const deny=()=>{
                socket.emit("deny",{to:fromSocket});
                confirmationDiv.innerHTML="";
                alert("Peticion denegada");
            }
            let cuenta=0;
            const removerDiv=(id)=>{
                cuenta+=1;
                pointsDiv.innerHTML='<h1>'+cuenta+'</h1>';
                padre.removeChild(document.getElementById(id));
                const newDiv=document.createElement('DIV');
                let ram = Math.floor(Math.random()*(15-10) +10);
                newDiv.className='ship';
                newDiv.setAttribute('id',id);
                newDiv.setAttribute('onclick','removerDiv(id)');
                newDiv.style.animationDuration=ram+'s';
                newDiv.style.backgroundImage='url(../img/b1.png)';
                newDiv.style.backgroundRepeat='no-repeat';
                newDiv.style.backgroundSize='contain';
                padre.appendChild(newDiv);
            }
            
            const startGame=()=>{
                const div=document.getElementsByClassName('ship')
                for(i of div){
                    let ram = Math.floor(Math.random()*(15-10) +10);
                    i.style.animationDuration=ram+'s';
                    i.style.backgroundImage='url(../img/b1.png)';
                    i.style.backgroundRepeat='no-repeat';
                    i.style.backgroundSize='contain';
                }
                globalThis.padre=document.getElementById('padre');
                globalThis.pointsDiv=document.getElementById('points');
                globalThis.minDiv=document.getElementById('min');
                globalThis.secDiv=document.getElementById('sec');
                let segundos=30;
                let minutos=1;
                const actualizarTiempo=()=>{
                    if(minutos==0 && segundos==1){
                        setTimeout(()=>{
                            minDiv.innerHTML='<h1>00:</h1>';
                            secDiv.innerHTML='<h1>00</h1>';
                        },1000);
                    }else{
                        if(segundos==1){
                        setTimeout(()=>{
                            segundos=59;
                            minutos-=1;
                            if(minutos.toString().split('').length>1){
                                minDiv.innerHTML='<h1>'+minutos+':</h1>';
                            }else{
                                minDiv.innerHTML='<h1>0'+minutos+':</h1>';
                            }
                            if(segundos.toString().split('').length>1){
                                secDiv.innerHTML='<h1>'+segundos+'</h1>'
                            }else{
                                secDiv.innerHTML='<h1>0'+segundos+'</h1>'
                            }
                            actualizarTiempo();
                        },1000);
                    }else{
                        setTimeout(()=>{
                            segundos-=1;
                            if(segundos.toString().split('').length>1){
                                secDiv.innerHTML='<h1>'+segundos+'</h1>'
                            }else{
                                secDiv.innerHTML='<h1>0'+segundos+'</h1>'
                            }
                            actualizarTiempo();
                        },1000);
                    }
                    }
                }
                actualizarTiempo();
                setTimeout(()=>{
                    alert('Fin del juego');
                    for(i of div){
                        i.style={};
                    }
                    socket.emit("final:cuenta",{to:fromSocket,puntuacion:cuenta});
                },90000);
                socket.on("cuenta",({to,puntuacion})=>{
                    if(to==idSocket){
                        console.log(puntuacion);
                        if(puntuacion>cuenta){
                            alert("PERDISTE!");
                            socket.disconnect();
                            window.location.href="/";
                        }else{
                            alert("GANASTE!");
                            socket.disconnect();
                            window.location.href="/";
                        }
                    }
                })
            }
        </script>
    </body>
    </html>
    `)
})

const port=process.env.PORT||8000;
server.listen(port,()=>{
    console.log("server socket on port "+port);
});