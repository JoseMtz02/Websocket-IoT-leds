$(document).ready(function () {
  var chart;
  var defaultBgColor = "rgb(153, 102, 255)";
  var defaultBorderColor = "rgb(153, 102, 255)";
  var lastColorLed = "";

  var verdeImg = document.getElementById("verdeImg");
  var amarilloImg = document.getElementById("amarilloImg");
  var rojoImg = document.getElementById("rojoImg");

  var ledImages = {
    verde: "./img/VERDE ON.png",
    amarillo: "./img/AMARILLO ON.png",
    rojo: "./img/ROJO ON.png",
    apagadoVerde: "./img/VERDE OFF.png",
    apagadoAmarillo: "./img/AMARILLO OFF.png",
    apagadoRojo: "./img/ROJO OFF.png",
  };

  function createChart(type) {
    var ctx = document.getElementById("myChart").getContext("2d");
    if (chart) {
      chart.destroy();
    }
    chart = new Chart(ctx, {
      type: type,
      data: {
        labels: [],
        datasets: [
          {
            label: "Sensor Data",
            backgroundColor: defaultBgColor,
            borderColor: defaultBorderColor,
            data: [],
          },
        ],
      },
      options: {},
    });
    console.log("Gráfico creado");
  }

  createChart("line");

  $("#chartType").change(function () {
    var selectedType = $(this).val();
    createChart(selectedType);
  });

  function updateChartColors(color) {
    var colors = {
      verde: {
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgb(75, 192, 192)",
      },
      amarillo: {
        backgroundColor: "rgb(255, 205, 86)",
        borderColor: "rgb(255, 205, 86)",
      },
      rojo: {
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
      },
    };

    var colorSet = colors[color] || {
      backgroundColor: defaultBgColor,
      borderColor: defaultBorderColor,
    };
    chart.data.datasets.forEach((dataset) => {
      dataset.backgroundColor = colorSet.backgroundColor;
      dataset.borderColor = colorSet.borderColor;
    });
    chart.update();
  }

  function updateData(data) {
    var labels = [];
    var sensorData = [];
    var colorLed = [];
    const ultimo=data[0];

    data.forEach(function (row) {
        labels.push(row[1]); // Accede al primer elemento del arreglo como la fecha
        sensorData.push(row[0]); // Accede al segundo elemento del arreglo como el mensaje
        colorLed.push(row[2]); // Accede al tercer elemento del arreglo como el color del LED
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = sensorData;
    chart.update();

    updateDataLatest(ultimo);

    var ultimoValorDistancia = sensorData[sensorData.length - 1];
    document.getElementById('valor_distancia').innerText = "Último valor de distancia: " + ultimoValorDistancia + "cm";
}

  function updateDataLatest(colorLed) {
    verdeImg.src = ledImages.apagadoVerde;
    amarilloImg.src = ledImages.apagadoAmarillo;
    rojoImg.src = ledImages.apagadoRojo;

    var ultimoValor = colorLed[2];
    if (ultimoValor !== lastColorLed) {
      lastColorLed = ultimoValor;
      updateChartColors(ultimoValor);
    }

    switch (ultimoValor) {
      case "verde":
        verdeImg.src = ledImages.verde;
        break;
      case "amarillo":
        amarilloImg.src = ledImages.amarillo;
        break;
      case "rojo":
        rojoImg.src = ledImages.rojo;
        break;
    }
  }

  // Crear una conexión WebSocket
  var ws = new WebSocket("ws://localhost:8767");

  ws.onopen = function () {
    console.log("Conectado al servidor WebSocket");
  };

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);
    updateData(data);
  };
});
