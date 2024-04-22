document.addEventListener("DOMContentLoaded", () => {
  const websocket = new WebSocket("ws://localhost:8766");
  
  websocket.onopen = () => console.log("Conectado al servidor WebSocket led");
  var focoImg = document.getElementById("focoImg");

  var focoImages = {
    foco_on: "./img/foco_on.png",
    foco_off: "./img/foco_off.png",
  };

 // Manejar mensajes recibidos del servidor
websocket.onmessage = (event) => {
  const message = event.data;
  console.log("Mensaje recibido:", message);
  
  // Actualiza la interfaz de usuario según el estado del LED
  const toggleBtn = document.getElementById("darkmode-toggle");

  if(message === "1") {
    toggleBtn.checked = true;
    focoImg.src = focoImages.foco_on; // Cambiar a foco_on cuando el mensaje es "1"
  } else if(message === "0") {
    toggleBtn.checked = false;
    focoImg.src = focoImages.foco_off; // Cambiar a foco_off cuando el mensaje es "0"
  }
};


  document.getElementById("darkmode-toggle").addEventListener("change", function () {
    const command = this.checked ? "1" : "0";
    websocket.send(command);
    console.log("Enviado:", command);
  });
});
