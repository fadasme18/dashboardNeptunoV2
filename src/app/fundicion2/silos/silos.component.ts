import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import {
  Subscription,
  Subject,
  timer,
  of,
  TimeoutError,
  Observable,
} from 'rxjs';
import { switchMap, takeUntil, catchError, timeout, map } from 'rxjs/operators';
import 'highcharts/modules/boost';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-silos',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule, HttpClientModule],
  templateUrl: './silos.component.html',
  styleUrl: './silos.component.scss',
})
export class SilosComponent implements OnInit, OnDestroy {
  public estado_horno1F2: Boolean | null = null;
  public estado_horno2F2: Boolean | null = null;
  public estado_silo_cohete: Boolean | null = null;
  public estado_silo_norte: Boolean | null = null;
  public estado_silo_sur: Boolean | null = null;
  public estado_hornoTT1F2: Boolean | null = null;
  public estado_hornoTT2F2: Boolean | null = null;
  public estado_horno1F1: Boolean | null = null;
  public estado_horno2F1: Boolean | null = null;
  public estado_horno3F1: Boolean | null = null;
  public estado_horno4F1: Boolean | null = null;

  private wsSubscription: Subscription | undefined;
  private wsSubject: WebSocketSubject<any> | undefined;

  Highcharts = Highcharts;
  updateFlag: boolean = false;

  private destroy$ = new Subject<void>();
  private dataSubscription: Subscription | undefined;

  columnChartOptions1: Highcharts.Options;
  columnChartOptions2: Highcharts.Options;
  columnChartOptions3: Highcharts.Options;

  constructor(private http: HttpClient) {
    this.columnChartOptions1 = this.crearOpcionesColumnaSimple(
      'Nivel Actual Silo Cohete',
      '%',
      0,
      100,
      'Unidad de medida: Porcentaje de llenado (%)',
      'Silo Cohete',
      'Porcentaje de llenado (%)'
    );
    this.columnChartOptions2 = this.crearOpcionesColumnaSimple(
      'Nivel Actual Silo Sur',
      '%',
      0,
      100,
      'Unidad de medida: Porcentaje de llenado (%)',
      'Silo Sur',
      'Porcentaje de llenado (%)'
    );
    this.columnChartOptions3 = this.crearOpcionesColumnaSimple(
      'Nivel Actual Silo Norte',
      '%',
      0,
      100,
      'Unidad de medida: Porcentaje de llenado (%)',
      'Silo Norte',
      'Porcentaje de llenado (%)'
    );
  }

  lineChartOptions1: Highcharts.Options = this.crearOpcionesGraficoDefault(
    'Silo Cohete Fundición 2',
    'Unidad de medida: Porcentaje de llenado (%)',
    'Porcentaje de llenado (%)',
    'Tiempo',
    0,
    100,
    '(%)'
  );
  lineChartOptions2: Highcharts.Options = this.crearOpcionesGraficoDefault(
    'Silo sur Fundición 2 (Arena Nueva)',
    'Unidad de medida: Porcentaje de llenado (%)',
    'Porcentaje de llenado (%)',
    'Tiempo',
    0,
    100,
    '(%)'
  );
  lineChartOptions3: Highcharts.Options = this.crearOpcionesGraficoDefault(
    'Silo Norte Fundición 2 (Arena Reutilizada)',
    'Unidad de medida: Porcentaje de llenado (%)',
    'Porcentaje de llenado (%)',
    'Tiempo',
    0,
    100,
    '(%)'
  );
  //Propiedades para guardar las instancias de los graficos
  chart1Instance: Highcharts.Chart | undefined;
  chart2Instance: Highcharts.Chart | undefined;
  chart3Instance: Highcharts.Chart | undefined;
  chart4Instance: Highcharts.Chart | undefined;
  chart5Instance: Highcharts.Chart | undefined;
  chart6Instance: Highcharts.Chart | undefined;
  chart7Instance: Highcharts.Chart | undefined;

  ngOnInit(): void {
    //Iniciar polling cada 30 seg
    this.startPolling(10000);
    this.conectarWebSocketEstados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      console.log('Suscripción WebSocket de estados deshecha.');
    }
    if (this.wsSubject) {
      this.wsSubject.complete(); // Cierra la conexión WebSocket
      console.log(
        'Subject WebSocket de estados completado (conexión cerrada).'
      );
    }
  }

  private conectarWebSocketEstados(): void {
    const WEBSOCKET_URL = 'ws://192.168.1.18:1880/ws/connectionstatus';

    this.wsSubject = webSocket(WEBSOCKET_URL);

    this.wsSubscription = this.wsSubject.subscribe(
      (payloadRecibido) => {
        console.log('Estado máquinas recibido:', payloadRecibido);

        // El payloadRecibido es el objeto 'transformedData' de Node-RED
        if (payloadRecibido.hasOwnProperty('horno1F2')) {
          this.estado_horno1F2 = payloadRecibido.horno1F2 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('horno2F2')) {
          this.estado_horno2F2 = payloadRecibido.horno2F2 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('silo_cohete')) {
          this.estado_silo_cohete = payloadRecibido.silo_cohete ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('silo_norte')) {
          this.estado_silo_norte = payloadRecibido.silo_norte ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('silo_sur')) {
          this.estado_silo_sur = payloadRecibido.silo_sur ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('hornoTT1F2')) {
          this.estado_hornoTT1F2 = payloadRecibido.hornoTT1F2 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('hornoTT2F2')) {
          this.estado_hornoTT2F2 = payloadRecibido.hornoTT2F2 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('horno1F1')) {
          this.estado_horno1F1 = payloadRecibido.horno1F1 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('horno2F1')) {
          this.estado_horno2F1 = payloadRecibido.horno2F1 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('horno3F1')) {
          this.estado_horno3F1 = payloadRecibido.horno3F1 ? true : false;
        }
        if (payloadRecibido.hasOwnProperty('horno4F1')) {
          this.estado_horno4F1 = payloadRecibido.horno4F1 ? true : false;
        }
      },
      (error) => {
        console.error('Error en WebSocket de estados:', error);
        this.ponerTodosLosEstadosDesconocidos();
      },
      () => {
        console.warn('WebSocket de estados cerrado.');
        this.ponerTodosLosEstadosDesconocidos();
      }
    );
  }

  private ponerTodosLosEstadosDesconocidos(): void {
    this.estado_horno1F2 = null;
    this.estado_horno2F2 = null;
    this.estado_silo_cohete = null;
    this.estado_silo_norte = null;
    this.estado_silo_sur = null;
    this.estado_hornoTT1F2 = null;
    this.estado_hornoTT2F2 = null;
    this.estado_horno1F1 = null;
    this.estado_horno2F1 = null;
    this.estado_horno3F1 = null;
    this.estado_horno4F1 = null;
  }

  //Fundciones callback que highcharts llamara cuando cree/actualice los graficos
  logChartInstance1 = (chart: Highcharts.Chart) => {
    this.chart1Instance = chart;
  };
  logChartInstance2 = (chart: Highcharts.Chart) => {
    this.chart2Instance = chart;
  };
  logChartInstance3 = (chart: Highcharts.Chart) => {
    this.chart3Instance = chart;
  };
  logChartInstance4 = (chart: Highcharts.Chart) => {
    this.chart4Instance = chart;
  };
  logChartInstance5 = (chart: Highcharts.Chart) => {
    this.chart5Instance = chart;
  };
  logChartInstance6 = (chart: Highcharts.Chart) => {
    this.chart6Instance = chart;
  };

  //--------CONFIGURACION GENERAL DEL GRAFICO BARRA------------------------------------------------------------------------------------
  private crearOpcionesColumnaSimple(
    tituloBreve: string,
    unidad: string,
    yMin: number = 0,
    yMax: number = 100,
    subtitulo: string,
    ejeXtext: string,
    ejeYtext: string
  ): Highcharts.Options {
    return {
      chart: {
        type: 'column', // Tipo de gráfico
        height: '100%',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 5,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: tituloBreve,
        align: 'center',
        margin: 10, // Espacio bajo el título
        style: { fontSize: '1em' },
      },
      subtitle: {
        text: subtitulo,
        align: 'center',
      },

      xAxis: {
        categories: [''],
        labels: { enabled: false },
        title: {
          text: '',
        },
        lineWidth: 0, // Ocultar línea del eje X
        tickWidth: 0, // Ocultar marcas del eje X
      },
      yAxis: {
        min: yMin,
        max: yMax,
        title: {
          text: ejeYtext,
        },
        labels: {
          enabled: true, // Mostrar etiquetas del eje Y (0, 25, 50, 75, 100)
          style: { fontSize: '0.8em' },
        },
        gridLineWidth: 0.5, 
        tickAmount: 5,
      },
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        column: {
          pointPadding: 0.1, // Espacio alrededor de la columna (menos es más ancha)
          borderWidth: 0, // Sin borde en la columna
          colorByPoint: false, // Usar color de la serie, no uno por punto
          dataLabels: {
            enabled: true,
            useHTML: true,
            format:
              `<div style="text-align:center; font-size:1.2em; font-weight:600; color:#333;">` +
              `{y:.1f}` + // Valor con 1 decimal
              `<span style="font-size:0.7em; opacity:0.8; display:block;">${unidad}</span>` + // Unidad abajo
              `</div>`,
            style: {
            },
            y: -5, 
          },
          
          zones: [
            { value: 10, color: '#DF5353' }, // <= 10: Rojo
            { value: 80, color: '#DDDF0D' }, // <= 80: Amarillo
            { color: '#55BF3B' }, // > 80: Verde
          ],
          zoneAxis: 'y',
        },
      },
      series: [
        {
          name: tituloBreve, 
          type: 'column',
          data: [0], // Valor inicial
        },
      ],
    };
  }
  // ---------------------------------------------------------

  //--------CONFIGURACION GENERAL DEL GRAFICO------------------------------------------------------------------------------------

  private crearOpcionesGraficoDefault(
    titulo: string,
    subtitulo: string,
    ejeY: string,
    ejeX: string,
    ymin?: number,
    ymax?: number,
    umedida?: string
  ): Highcharts.Options {
    return {
      title: {
        text: titulo,
        align: 'center',
      },
      subtitle: {
        text: subtitulo,
        align: 'center',
      },
      yAxis: {
        title: {
          text: ejeY,
        },
        max: ymax,
        min: ymin,
      },

      xAxis: {
        title: {
          text: ejeX,
        },
        type: 'datetime',
        tickPixelInterval: 180, // Un valor mayor = menos ticks/etiquetas.
        // --------------------
        labels: {
          autoRotation: [-10, -20, -30, -45, -60, -70, -80, -90],
          // ---------------------------------------
          formatter: function () {
            const timestamp = this.value as number;
            const date = new Date(timestamp);
            const day = new Intl.DateTimeFormat('es-CL', {
              day: '2-digit',
              timeZone: 'America/Santiago',
            }).format(date);
            let month = new Intl.DateTimeFormat('es-CL', {
              month: 'short',
              timeZone: 'America/Santiago',
            }).format(date);
            month = month.replace(/\.$/, '').toLowerCase();
            const timeParts = new Intl.DateTimeFormat('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              timeZone: 'America/Santiago',
            }).formatToParts(date);
            let hourVal = '',
              minuteVal = '',
              secondVal = '',
              dayPeriodVal = '';
            for (const part of timeParts) {
              switch (part.type) {
                case 'hour':
                  hourVal = part.value;
                  break;
                case 'minute':
                  minuteVal = part.value;
                  break;
                case 'second':
                  secondVal = part.value;
                  break;
                case 'dayPeriod':
                  const periodLower = part.value
                    .toLowerCase()
                    .replace(/\s/g, '');
                  if (periodLower.includes('a')) dayPeriodVal = 'a.m.';
                  else if (periodLower.includes('p')) dayPeriodVal = 'p.m.';
                  else dayPeriodVal = part.value;
                  break;
              }
            }
            return `${day}-${month}, ${hourVal}:${minuteVal}:${secondVal} ${dayPeriodVal}`;
          },
        },
      },

      legend: {
        enabled: true, 
        layout: 'horizontal', // Organiza los ítems de la leyenda en una fila
        align: 'center', // Centra la leyenda horizontalmente
        verticalAlign: 'bottom', // Posiciona la leyenda en la parte inferior del gráfico
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false,
          },
          stickyTracking: false,
        },
        series: {
          boostThreshold: 1, //cantidad de puntos para que se active el boost
        },
      },

      series: [
        {
          id: 'serieInicial_grafico', // ID único para la serie base
          name: titulo,
          type: 'line',
          data: [],
        },
      ],

      tooltip: {
        shared: true,
        animation: false,
        formatter: function () {
          let pointsInfo = '';
          if (this.points) {
            this.points.forEach((point) => {
              pointsInfo += `<br/><span style="color:${
                point.color
              }">\u25CF</span> ${point.series.name}: <b>${(
                point.y as number
              )?.toFixed(2)} ${umedida}</b>`;
            });
          }

          const timestamp = this.x as number;
          const date = new Date(timestamp);

          const day = new Intl.DateTimeFormat('es-CL', {
            day: '2-digit',
            timeZone: 'America/Santiago',
          }).format(date);

          let month = new Intl.DateTimeFormat('es-CL', {
            month: 'short',
            timeZone: 'America/Santiago',
          }).format(date);
          month = month.replace(/\.$/, '').toLowerCase();

          const year = new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            timeZone: 'America/Santiago',
          }).format(date);
          const timeParts = new Intl.DateTimeFormat('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/Santiago',
          }).formatToParts(date);

          let hourVal = '';
          let minuteVal = '';
          let secondVal = '';
          let dayPeriodVal = '';

          for (const part of timeParts) {
            switch (part.type) {
              case 'hour':
                hourVal = part.value;
                break;
              case 'minute':
                minuteVal = part.value;
                break;
              case 'second':
                secondVal = part.value;
                break;
              case 'dayPeriod':
                const periodLower = part.value.toLowerCase().replace(/\s/g, '');
                if (periodLower.includes('a')) {
                  dayPeriodVal = 'a.m.';
                } else if (periodLower.includes('p')) {
                  dayPeriodVal = 'p.m.';
                } else {
                  dayPeriodVal = part.value;
                }
                break;
            }
          }
          const fechaFormateada = `${day}-${month}-${year}, ${hourVal}:${minuteVal}:${secondVal} ${dayPeriodVal}`;

          return `<b>${fechaFormateada}</b>${pointsInfo}`;
        },
      },

      chart: {
        type: 'line',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 5,
      },
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 700,
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
              xAxis: {
                tickPixelInterval: 100,
                labels: {
                  formatter: function () {
                    const timestamp = this.value as number;
                    const date = new Date(timestamp);
                    const day = new Intl.DateTimeFormat('es-CL', {
                      day: '2-digit',
                      timeZone: 'America/Santiago',
                    }).format(date);
                    let month = new Intl.DateTimeFormat('es-CL', {
                      month: 'short',
                      timeZone: 'America/Santiago',
                    }).format(date);
                    month = month.replace(/\.$/, '').toLowerCase();
                    const timeParts = new Intl.DateTimeFormat('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      /* sin segundos */ hour12: true,
                      timeZone: 'America/Santiago',
                    }).formatToParts(date);
                    let hourVal = '',
                      minuteVal = '',
                      dayPeriodVal = '';
                    for (const part of timeParts) {
                      if (part.type === 'hour') hourVal = part.value;
                      if (part.type === 'minute') minuteVal = part.value;
                      if (part.type === 'dayPeriod') {
                        const p = part.value.toLowerCase().replace(/\s/g, '');
                        dayPeriodVal = p.includes('a')
                          ? 'a.m.'
                          : p.includes('p')
                          ? 'p.m.'
                          : part.value;
                      }
                    }
                    return `${day}-${month}, ${hourVal}:${minuteVal} ${dayPeriodVal}`;
                  },
                },
              },
            },
          },
          {
            condition: {
              maxWidth: 480,
            },
            chartOptions: {
              xAxis: {
                tickPixelInterval: 80,
                labels: {
                  formatter: function () {
                    const timestamp = this.value as number;
                    const date = new Date(timestamp);
                    const timeParts = new Intl.DateTimeFormat('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'America/Santiago',
                    }).formatToParts(date);
                    let hourVal = '',
                      minuteVal = '',
                      dayPeriodVal = '';
                    for (const part of timeParts) {
                      if (part.type === 'hour') hourVal = part.value;
                      if (part.type === 'minute') minuteVal = part.value;
                      if (part.type === 'dayPeriod') {
                        const p = part.value.toLowerCase().replace(/\s/g, '');
                        dayPeriodVal = p.includes('a')
                          ? 'a.m.'
                          : p.includes('p')
                          ? 'p.m.'
                          : part.value;
                      }
                    }
                    return `${hourVal}:${minuteVal} ${dayPeriodVal}`;
                  },
                },
              },
            },
          },
        ],
      },
      boost: {
        useGPUTranslations: true,
      },
    };
  }

  //----------------------------------------------------------------------------------------------------------------------------

  //-------------ADQUISICION DE DATOS Y ACTUALIZACION DEL GRAFICO---------------------------------------------

  startPolling(intervalMs: number): void {
    const apiUrl = 'http://192.168.1.18:1880/api/f2silos'; //EDITAR A GUSTO
    const duracionEjeX = 24 * 60 * 60 * 1000; //EDITAR A GUSTO

    this.dataSubscription = timer(0, intervalMs)
      .pipe(
        switchMap(() => this.fetchGraphData(apiUrl)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (datosProcesados) => {
          console.log(
            'Datos procesados recibidos en polling:',
            datosProcesados
          );
          // --- Actualización Gráficos de Línea ---
          this.lineChartOptions1 = {
            ...this.lineChartOptions1,
            series: [
              {
                type: 'spline',
                name: this.lineChartOptions1.title?.text,
                data: datosProcesados.data1,
              },
            ],
          };

          this.lineChartOptions2 = {
            ...this.lineChartOptions2,
            series: [
              {
                type: 'spline',
                name: this.lineChartOptions2.title?.text,
                data: datosProcesados.data2,
              },
            ],
          };

          this.lineChartOptions3 = {
            ...this.lineChartOptions3,
            series: [
              {
                type: 'spline',
                name: this.lineChartOptions3.title?.text,
                data: datosProcesados.data3,
              },
            ],
          };
          // --- Actualización Gráficos Medidor ---
          const getLastValue = (dataSet: any[] | undefined): number => {
            // ... (tu función getLastValue) ...
            if (dataSet && dataSet.length > 0) {
              return dataSet[dataSet.length - 1][1];
            }
            return 0;
          };

          const currentValueSiloCohete = getLastValue(datosProcesados.data1);
          const currentValueSiloSur = getLastValue(datosProcesados.data2);
          const currentValueSiloNorte = getLastValue(datosProcesados.data3);

          // --- Actualización Gráficos COLUMNA ---
          this.columnChartOptions1 = {
            ...this.columnChartOptions1,
            series: [
              {
                type: 'column', // Asegura tipo columna
                name:
                  this.columnChartOptions1.series?.[0]?.name || 'Silo Cohete',
                data: [currentValueSiloCohete],
              },
            ],
          };
          this.columnChartOptions2 = {
            ...this.columnChartOptions2,
            series: [
              {
                type: 'column',
                name: this.columnChartOptions2.series?.[0]?.name || 'Silo Sur',
                data: [currentValueSiloSur],
              },
            ],
          };
          this.columnChartOptions3 = {
            ...this.columnChartOptions3,
            series: [
              {
                type: 'column',
                name:
                  this.columnChartOptions3.series?.[0]?.name || 'Silo Norte',
                data: [currentValueSiloNorte],
              },
            ],
          };

          //Indicar a highcharts que actualice
          this.updateFlag = true;

          //Calcular y aplicar nuevos extremos del eje X
          setTimeout(() => {
            let overallMaxTimestamp = 0;
            //Encontrar timestamp mas reciente de todos los datos
            [
              datosProcesados.data1,
              datosProcesados.data2,
              datosProcesados.data3,
            ].forEach((dataSet) => {
              if (dataSet && dataSet.length > 0) {
                //asume que los datos estan ordenados por tiempo o busca el maximo
                const lastPointTimestamp = dataSet[dataSet.length - 1][0]; // [timestamp, value]
                if (lastPointTimestamp > overallMaxTimestamp) {
                  overallMaxTimestamp = lastPointTimestamp;
                }
              }
            });

            //si se encuentra un timestamp maximo valido
            if (overallMaxTimestamp > 0) {
              const nuevoMax = overallMaxTimestamp;
              const nuevoMin = overallMaxTimestamp - duracionEjeX;

              console.log(
                `Ajustando eje X: min=<span class="math-inline">\{new Date\(nuevoMin\)\.toLocaleString\(\)\}, max\=</span>{new Date(nuevoMax).toLocaleString()}`
              );

              const necesitaRedibujar = false;
              const animacion = false;

              //aplicar a cada instancia de grafico (usando opcional chainin '?.' por seguridad)
              this.chart1Instance?.xAxis?.[0]?.setExtremes(
                nuevoMin,
                nuevoMax,
                necesitaRedibujar,
                animacion
              ); //redraw =true, animation=false
              this.chart2Instance?.xAxis?.[0]?.setExtremes(
                nuevoMin,
                nuevoMax,
                necesitaRedibujar,
                animacion
              );
              this.chart3Instance?.xAxis?.[0]?.setExtremes(
                nuevoMin,
                nuevoMax,
                necesitaRedibujar,
                animacion
              );
              if (!necesitaRedibujar) {
                this.chart1Instance?.redraw(animacion);
                this.chart2Instance?.redraw(animacion);
                this.chart3Instance?.redraw(animacion);
                // this.chart4Instance?.redraw(animacion);
              }
            } else {
              console.log(
                'No se encontraron puntos de datos para ajustar el eje X'
              );
            }
          }, 0);
        },
        error: (err) => {
          console.error('Error fatal en el stream de polling:', err);
        },
      });
  }

  //----------------------------------------------------------------------------------------------------------

  //--------------SELECCION DE DATOS PARA LOS GRAFICOS (EDITAR) -------------------------------------------------------

  fetchGraphData(
    apiUrl: string
  ): Observable<{ data1: any[]; data2: any[]; data3: any[] }> {
    // ... (Tu código existente para fetchGraphData, que ya funciona) ...
    const REQUEST_TIMEOUT = 15000;
    const MEASUREMENT_SILOS_NORTE_SUR = 'F2-silo-NyS-[ADAM6017]';
    const MEASUREMENT_SILO_COHETE = 'F2-silo-cohete-[ADAM6017]';

    return this.http.get<any[]>(apiUrl).pipe(
      timeout(REQUEST_TIMEOUT),
      map((datosEnBruto) => {
        const resultado: { data1: any[]; data2: any[]; data3: any[] } = {
          data1: [],
          data2: [],
          data3: [],
        };
        if (Array.isArray(datosEnBruto)) {
          datosEnBruto.forEach((item: any) => {
            if (
              !item ||
              typeof item.time !== 'string' ||
              item.numero === undefined ||
              item.numero === null ||
              typeof item.field !== 'string' ||
              typeof item.measurement !== 'string'
            ) {
              console.warn(
                `Item omitido por datos faltantes o invalidos:`,
                item
              );
              return;
            }
            try {
              const fechaItem = new Date(item.time);
              const timestamp = fechaItem.getTime();
              const valorY = Number(item.numero);
              if (isNaN(valorY)) {
                console.warn(
                  'Item omitido porque "numero" no es un numero valido:',
                  item
                );
                return;
              }
              if (item.measurement === MEASUREMENT_SILO_COHETE) {
                if (item.field === 'silo_cohete') {
                  resultado.data1.push([timestamp, valorY]);
                }
              } else if (item.measurement === MEASUREMENT_SILOS_NORTE_SUR) {
                if (item.field === 'silo_sur') {
                  resultado.data2.push([timestamp, valorY]);
                } else if (item.field === 'silo_norte') {
                  resultado.data3.push([timestamp, valorY]);
                }
              }
            } catch (e) {
              console.error('Error procesando item:', item, e);
            }
          });
        } else {
          console.warn(`Los datos de ${apiUrl} no son un array`, datosEnBruto);
        }
        console.log(
          `Datos parseados desde ${apiUrl} para los silos:`,
          resultado
        );
        return resultado;
      }),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          console.error(`Timeout (>${REQUEST_TIMEOUT}ms) en ${apiUrl}`);
        } else {
          console.error(
            `Error en ${apiUrl}: ${
              error.message || error.statusText || 'Error desconocido'
            }`
          );
        }
        return of({ data1: [], data2: [], data3: [] });
      })
    );
  }
}
//----------------------------------------------------------------------------------------------------------
