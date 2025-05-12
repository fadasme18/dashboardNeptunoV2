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
  selector: 'app-ttermicos',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule, HttpClientModule],
  templateUrl: './ttermicos.component.html',
  styleUrl: './ttermicos.component.scss'
})
export class TtermicosComponent implements OnInit, OnDestroy {

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

  constructor(private http: HttpClient) {}

  lineChartOptions1: Highcharts.Options = this.crearOpcionesGraficoDefault(
    'Horno 1 Tratamientos Térmicos - Fundición 2',
    'Unidad de medida: Grados Celsius (°C)',
    'Temperatura (°C)',
    'Tiempo',
    0,
    1000,
    '°C'
  );
  lineChartOptions2: Highcharts.Options = this.crearOpcionesGraficoDefault(
    'Horno 2 Tratamientos Térmicos - Fundición 2',
    'Unidad de medida: Grados Celsius (°C)',
    'Temperatura (°C)',
    'Tiempo',
    0,
    1000,
    '°C'
  );

  //Propiedades para guardar las instancias de los graficos
  chart1Instance: Highcharts.Chart | undefined;
  chart2Instance: Highcharts.Chart | undefined;

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
      console.log('Subject WebSocket de estados completado (conexión cerrada).');
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
    console.log('Instancia Grafico 1 recibida');
    this.chart1Instance = chart;
  };
  logChartInstance2 = (chart: Highcharts.Chart) => {
    this.chart2Instance = chart;
  };

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
            const day = new Intl.DateTimeFormat('es-CL', { day: '2-digit', timeZone: 'America/Santiago' }).format(date);
            let month = new Intl.DateTimeFormat('es-CL', { month: 'short', timeZone: 'America/Santiago' }).format(date);
            month = month.replace(/\.$/, '').toLowerCase();
            const timeParts = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'America/Santiago' }).formatToParts(date);
            let hourVal = '', minuteVal = '', secondVal = '', dayPeriodVal = '';
            for (const part of timeParts) {
              switch (part.type) {
                case 'hour': hourVal = part.value; break;
                case 'minute': minuteVal = part.value; break;
                case 'second': secondVal = part.value; break;
                case 'dayPeriod':
                  const periodLower = part.value.toLowerCase().replace(/\s/g, '');
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
        enabled: true, // Asegúrate de que la leyenda esté habilitada (es true por defecto)
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
              }">\u25CF</span> ${point.series.name}: <b>${(point.y as number)?.toFixed(2)} ${umedida}</b>`;
            });
          }
  
          const timestamp = this.x as number; 
          const date = new Date(timestamp);
  
          const day = new Intl.DateTimeFormat('es-CL', {
            day: '2-digit',
            timeZone: 'America/Santiago'
          }).format(date);
  
          let month = new Intl.DateTimeFormat('es-CL', {
            month: 'short',
            timeZone: 'America/Santiago'
          }).format(date);
          month = month.replace(/\.$/, '').toLowerCase();
  
          const year = new Intl.DateTimeFormat('es-CL', {
              year: 'numeric',
              timeZone: 'America/Santiago'
          }).format(date);
          const timeParts = new Intl.DateTimeFormat('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/Santiago'
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
                    const day = new Intl.DateTimeFormat('es-CL', { day: '2-digit', timeZone: 'America/Santiago' }).format(date);
                    let month = new Intl.DateTimeFormat('es-CL', { month: 'short', timeZone: 'America/Santiago' }).format(date);
                    month = month.replace(/\.$/, '').toLowerCase();
                    const timeParts = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', /* sin segundos */ hour12: true, timeZone: 'America/Santiago' }).formatToParts(date);
                    let hourVal = '', minuteVal = '', dayPeriodVal = '';
                    for (const part of timeParts) {
                      if (part.type === 'hour') hourVal = part.value;
                      if (part.type === 'minute') minuteVal = part.value;
                      if (part.type === 'dayPeriod') {
                          const p = part.value.toLowerCase().replace(/\s/g,'');
                          dayPeriodVal = p.includes('a')?'a.m.':(p.includes('p')?'p.m.':part.value);
                      }
                    }
                    return `${day}-${month}, ${hourVal}:${minuteVal} ${dayPeriodVal}`;
                  }
                }
              }
            }
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
                    const timeParts = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Santiago' }).formatToParts(date);
                    let hourVal = '', minuteVal = '', dayPeriodVal = '';
                    for (const part of timeParts) {
                       if (part.type === 'hour') hourVal = part.value;
                       if (part.type === 'minute') minuteVal = part.value;
                       if (part.type === 'dayPeriod') {
                          const p = part.value.toLowerCase().replace(/\s/g,'');
                          dayPeriodVal = p.includes('a')?'a.m.':(p.includes('p')?'p.m.':part.value);
                      }
                    }
                    return `${hourVal}:${minuteVal} ${dayPeriodVal}`;
                  }
                }
              }
            }
          }
        ]
      },
      boost: {
        useGPUTranslations: true,
      },
    };
  }

  //----------------------------------------------------------------------------------------------------------------------------

  //-------------ADQUISICION DE DATOS Y ACTUALIZACION DEL GRAFICO---------------------------------------------

  startPolling(intervalMs: number): void {
    const apiUrl = 'http://192.168.1.18:1880/api/f2ttermicos'; //EDITAR A GUSTO
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
          //Indicar a highcharts que actualice
          this.updateFlag = true;

          //Calcular y aplicar nuevos extremos del eje X
          setTimeout(() => {
            let overallMaxTimestamp = 0;
            //Encontrar timestamp mas reciente de todos los datos
            [
              datosProcesados.data1,
              datosProcesados.data2,
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
              //Define cuanto tiempo quiero mostrar hacia atras
              // const duracionEjeX = 30 * 60 * 1000; //Tiempo en ms

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
              if (!necesitaRedibujar) {
                this.chart1Instance?.redraw(animacion);
                this.chart2Instance?.redraw(animacion);
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
  ): Observable<{ data1: any[]; data2: any[] }> {
    const REQUEST_TIMEOUT = 15000;
    const MEDICION_OBJETIVO = 'F2-TT-[ADAM-6018]'; // CAMBIAR NOMBRE AL MEASUREMENT CORRESPONDIENTE

    return this.http.get<any[]>(apiUrl).pipe(
      timeout(REQUEST_TIMEOUT),
      map((datosEnBruto) => {
        const resultado: {
          data1: any[];
          data2: any[];
        } = { data1: [], data2: [] };

        if (Array.isArray(datosEnBruto)) {
          datosEnBruto.forEach((item: any) => {
            //Validacion
            if (
              !item ||
              typeof item.time !== 'string' ||
              item.numero === undefined ||
              item.numero === null ||
              typeof item.field !== 'string' ||
              typeof item.measurement !== 'string'
            ) {
              console.warn(
                `Item emotido por datos faltantes o invalidos:`,
                item
              );
              return;
            }

            //------Filtro por measurement------
            if (item.measurement !== MEDICION_OBJETIVO) {
              return;
            }

            //si pasa el filtro de measurement, se procesa el item
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

              //---- Filtro por campo "FIELD" y asignaion al grafico que corresponde ----
              //----- CAMBIAR PO NOMBRES CORRESPONDIENTES A CADA PAGINA -----------------
              switch (item.field) {
                case 'TT_horno1_F2':
                  resultado.data1.push([timestamp, valorY]);
                  break;
                case 'TT_horno2_F2':
                  resultado.data2.push([timestamp, valorY]);
                  break;                
                default:
                  break;
              }
            } catch (e) {
              console.error('Error procesando item:', item, e);
            }
          });
        } else {
          console.warn(`Los datos de ${apiUrl} no son un array`, datosEnBruto);
        }
        console.log(
          `Multi-datos parseados (filtrados por measurement='${MEDICION_OBJETIVO}' y campo) desde ${apiUrl}:`,
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
        return of({ data1: [], data2: []});
      })
    );
  }
}
//----------------------------------------------------------------------------------------------------------