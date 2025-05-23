<svelte:head>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/heatmap.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/export-data.js"></script>
  <script src="https://code.highcharts.com/modules/accessibility.js"></script>

  <script src="https://cdn.plot.ly/plotly-2.27.1.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

</svelte:head>

<script>
// @ts-nocheck
  import { onMount, tick } from 'svelte';

  let cargandoTransporte = true;
  let cargandoContratos = true;
  let cargandoTemperaturas = true;
  let cargandoUniversidad = true;
  let cargandoAccidentes = true;

  let chartContainer;
  let plotContainer;
  let radarContainer;
  let streamContainer;

  let transporte = [];
  let contratos = [];
  let temperatura = [];
  let universidad = [];
  let accidentes = [];

  const provinciasMap = {
    "Alicante/Alacant": "Alicante",
    "Valencia/València": "Valencia"
  };
  const provinciasObjetivo = ["Alicante", "Valencia"];
  const añoObjetivo = 2024;

  // Para temperaturas y transporte 
  const provinciasObjetivoTemp = ["Sevilla", "Málaga"];
  const añoObjetivoTemp = 2020;

  async function getData21() {
    try {
      const miapi = await fetch('https://sos2425-21.onrender.com/api/v1/public-transit-stats');
      transporte = await miapi.json();

    } catch (error) {
      console.error("ERROR: GET data 21", error);
    } finally {
      cargandoTransporte = false;
    }
  }
  async function getData18() {
    try {
      const api18 = await fetch('https://sos2425-18.onrender.com/api/v2/contr-mun-stats');
      contratos = await api18.json();
    } catch(err){
      console.error("ERROR: GET data 18", error);
    } finally{
      cargandoContratos = false;
      await tick();
      if (chartContainer) {
        dibujarHeatmap();
      }
    }
  }
  

  async function getData17() {
    try {
      await fetch("https://sos2425-17.onrender.com/api/v2/university-demands/loadInitialData");
    } catch (err) {
      console.warn("Los datos iniciales ya estaban cargados o hubo otro aviso:", err);
    }
    try {
      const api17 = await fetch("https://sos2425-17.onrender.com/api/v2/university-demands");
      universidad = await api17.json();
    } catch (err) {
      console.error("ERROR: GET data 17", err);
    } finally {
      cargandoUniversidad = false;
      await tick();
      if (radarContainer) {
        dibujarPolarChart();
      }
    }
  }

  async function getData20() {
    try {
      await fetch("https://sos2425-20.onrender.com/api/v1/accidents-with-animals/loadInitialData");
    } catch (err) {
      console.warn("Los datos iniciales ya estaban cargados o hubo otro aviso:", err);
    }
    try {
      const api20 = await fetch('https://sos2425-20.onrender.com/api/v1/accidents-with-animals');
      accidentes = await api20.json();
    } catch(err){
      console.error("ERROR: GET data 20", error);
    } finally {
      cargandoAccidentes = false;
      await tick();
      if (streamContainer){
        console.log('Dibujando el gráfico de scatter');
        dibujarStreamGraph();
      }
    }
  }
  
  function dibujarHeatmap() {
    const contratosPorProvincia = {};
    contratos.forEach(c => {
      const nombre = provinciasMap[c.prov_name];
      if (provinciasObjetivo.includes(nombre) && c.year === añoObjetivo) {
        contratosPorProvincia[nombre] = (contratosPorProvincia[nombre] || 0) + c.num_contracts;
      }
    });

    const viajesPorProvincia = {};
    transporte.forEach(t => {
      if (provinciasObjetivo.includes(t.province)) {
        viajesPorProvincia[t.province] = (viajesPorProvincia[t.province] || 0) + t.total_trips;
      }
    });
    const categoriasY = ["Viajes", "Contratos"];
    const categoriasX = provinciasObjetivo;

    const data = [];

    provinciasObjetivo.forEach((prov, xIndex) => {
      data.push([xIndex, 0, viajesPorProvincia[prov] || 0]);      // viajes
      data.push([xIndex, 1, contratosPorProvincia[prov] || 0]);   // contratos
    });

    Highcharts.chart(chartContainer, {
      chart: {
        type: 'heatmap',
        plotBorderWidth: 1
      },
      xAxis: {
        categories: categoriasX,
        title: { text: 'Provincia' }
      },
      yAxis: {
        categories: categoriasY,
        title: { text: 'Tipo de dato' },
        reversed: true
      },
      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: Highcharts.getOptions().colors[0]
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
      },
      tooltip: {
        formatter: function () {
          return `<b>${this.series.yAxis.categories[this.point.y]}</b> en <b>${this.series.xAxis.categories[this.point.x]}</b>: <b>${this.point.value.toLocaleString()}</b>`;
        }
      },
      series: [{
        name: 'Cantidad',
        borderWidth: 1,
        data: data,
        dataLabels: {
          enabled: true,
          color: '#000000'
        }
      }]
    });
  }

  
function dibujarPolarChart() {
  const demanda = universidad.find(u =>
    u.location === "BADAJOZ" &&
    u.academicYear === "2017-2018" &&
    u.degree === "GRADO EN EDUCACIÓN PRIMARIA"
  );

  const transporteAlicante = transporte.find(t =>
    t.province === "Alicante" && t.year === 2024
  );

  const graduados = demanda?.graduated ?? 0;
  const ruta = transporteAlicante?.route_length ?? 0;

  const options = {
    chart: {
      type: 'polarArea',
      height: 500
    },
    labels: ['Graduados Badajoz (2017-18)', 'Longitud ruta Alicante (2024)'],
    series: [graduados, ruta],
    stroke: {
      colors: ['#fff']
    },
    fill: {
      opacity: 0.8
    }
  };

  new ApexCharts(radarContainer, options).render();
}

function dibujarStreamGraph() {
  const añoObjetivo = 2023;

  // === DATOS DE TRANSPORTE ===
  const ticketData = transporte
    .filter(d => d.year === añoObjetivo)
    .reduce((acc, curr) => {
      if (!acc[curr.province]) acc[curr.province] = [];
      acc[curr.province].push(curr.ticket_price);
      return acc;
    }, {});

  const avgTicketByProvince = Object.entries(ticketData).map(([prov, precios]) => ({
    name: `Precio medio - ${prov}`,
    value: precios.reduce((a, b) => a + b, 0) / precios.length
  }));

  // === DATOS DE ACCIDENTES ===
  const accidentData = accidentes
    .filter(d => d.anyo === añoObjetivo)  // CAMBIO: era d.year
    .reduce((acc, curr) => {
      const grupo = `Grupo ${curr.animal_group}`; // O puedes mapear a nombres reales si los conoces
      acc[grupo] = (acc[grupo] || 0) + 1;
      return acc;
    }, {});

  const animalSeries = Object.entries(accidentData).map(([animal, count]) => ({
    name: `Accidentes - ${animal}`,
    value: count
  }));

  // === COMBINAR DATOS ===
  const combinedData = [...avgTicketByProvince, ...animalSeries];

  if (combinedData.length === 0) {
    console.warn("No hay datos para el año seleccionado:", añoObjetivo);
    return;
  }

  const names = combinedData.map(e => e.name);
  const values = combinedData.map(e => e.value);

  const data = [{
    type: 'bar',
    x: values,
    y: names,
    orientation: 'h',
    marker: {
      color: 'rgba(58,71,80,0.6)',
      line: {
        color: 'rgba(58,71,80,1.0)',
        width: 1
      }
    }
  }];

  const layout = {
    title: 'Comparativa: Precio medio vs Accidentes con animales',
    margin: { l: 250, r: 50, t: 50, b: 50 },
    height: 600
  };

  Plotly.newPlot(streamContainer, data, layout);
}
onMount(async () => {
  await getData21();
  await getData18();
  
  await getData17();
  await getData20();
});

</script>

<section>
  <h2>Transporte y Contratos</h2>
  {#if cargandoContratos || cargandoTransporte}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={chartContainer} style="width: 100%; height: 500px;"></div>
  {/if}
</section>



<section>
  <h2>Transporte y Universidades</h2>
  {#if cargandoTransporte || cargandoUniversidad}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={radarContainer} style="width: 100%; height: 500px;"></div>
  {/if}
</section>

<section>
  <h2>Transporte y Accidentes animales</h2>
  {#if cargandoTransporte || cargandoAccidentes}
    <p>Cargando datos...</p>
  {:else}
    <div bind:this={streamContainer} style="width: 100%; height: 400px;"></div>
  {/if}
</section>