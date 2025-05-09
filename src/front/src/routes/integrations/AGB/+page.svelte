<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import ApexCharts from 'apexcharts';
  import { dev } from '$app/environment';



  const DEVEL_HOST = "http://localhost:16078";
  let API = "/api/v1/public-transit-stats";
  if (dev) {
    API = DEVEL_HOST + API;
  }

  const RAPID_API_KEY = '2a354653a3mshe8b0c196513d19bp11ac11jsn5c666ee93581';

  let consorcioData = [];
  let cargandoConsorcio = true;

  let provincias = [];
  let ticketPrices = [];
  let applesCosts = [];
  let cappuccinoCosts = [];
  let gasolineCosts = [];

  let chartContainer2;

  onMount(async () => {
    //Integración consorcio (uso HTML)
    try {
      const resConsorcio = await fetch('https://api.ctan.es/v1/Consorcios/7/consorcios');
      const json = await resConsorcio.json();
      consorcioData = json.consorcios;
    } catch (err) {
      console.error("Error consorcio:", err);
    } finally {
      cargandoConsorcio = false;
    }

    //Integración coste de vida (chart.js tipo bubble)
    

    //integración datos INE
    try {
      const [ineData, apiData] = await Promise.all([
        fetch("https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/49359?tip=AM").then(res => res.json()),
        fetch(API).then(res => res.json())
      ]);

      const ine2024 = ineData[0].Data
        .filter(d => d.Anyo === 2024)
        .map(d => ({ label: d.T3_Periodo, value: d.Valor }));

      const api2024 = apiData
        .filter(d => d.year === 2024)
        .map(d => ({ label: d.province, value: d.total_trips }));

      const allLabels = [
        ...ine2024.map(d => d.label),
        ...api2024.map(d => d.label)
      ];

      const seriesDataINE = ine2024.map(d => d.value * 1000);
      const seriesDataAPI = api2024.map(d => d.value);

      const options = {
        chart: {
          type: 'radar',
          height: 500
        },
        title: {
          text: 'Comparativa Viajeros 2024 (INE vs API)'
        },
        xaxis: {
          categories: allLabels
        },
        series: [
          {
            name: 'INE',
            data: seriesDataINE
          },
          {
            name: 'API',
            data: Array(ine2024.length).fill(null).concat(seriesDataAPI)
          }
        ]
      };

      new ApexCharts(chartContainer2, options).render();
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  });
</script>


<h1>Integración de APIs</h1>

<a href="/integrations/AGB/sos">Integraciones SOS</a>

<section>
  <h2>Datos de Consorcios de Transporte</h2>
  {#if cargandoConsorcio}
    <p>Cargando datos de consorcios...</p>
  {:else}
    {#if consorcioData.length > 0}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nombre corto</th>
          </tr>
        </thead>
        <tbody>
          {#each consorcioData as consorcio}
            <tr>
              <td>{consorcio.idConsorcio}</td>
              <td>{consorcio.nombre}</td>
              <td>{consorcio.nombreCorto}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No se encontraron datos de consorcios.</p>
    {/if}
  {/if}
</section>


<section>
  <h2>Widget de Viajeros y Provincias (2024)</h2>
  <div bind:this={chartContainer2} style="margin-top: 2rem;"></div>
</section>


<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
  }

  section {
    margin-top: 2rem;
  }
</style>
