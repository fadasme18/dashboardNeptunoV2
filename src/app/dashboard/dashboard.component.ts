// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { Subject, Subscription } from 'rxjs';
// import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.scss'
// })
// export class DashboardComponent {

//     public estado_horno1F2: Boolean | null = null;
//     public estado_horno2F2: Boolean | null = null;
//     public estado_silo_cohete: Boolean | null = null;
//     public estado_silo_norte: Boolean | null = null;
//     public estado_silo_sur: Boolean | null = null;
//     public estado_hornoTT1F2: Boolean | null = null;
//     public estado_hornoTT2F2: Boolean | null = null;
//     public estado_horno1F1: Boolean | null = null;
//     public estado_horno2F1: Boolean | null = null;
//     public estado_horno3F1: Boolean | null = null;
//     public estado_horno4F1: Boolean | null = null;

//     private wsSubscription: Subscription | undefined;
//     private wsSubject: WebSocketSubject<any> | undefined;

//     private destroy$ = new Subject<void>();

//   ngOnInit(): void {
//       //Iniciar polling cada 30 seg
//       this.conectarWebSocketEstados();
//     }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//     if (this.wsSubscription) {
//       this.wsSubscription.unsubscribe();
//       console.log('Suscripción WebSocket de estados deshecha.');
//     }
//     if (this.wsSubject) {
//       this.wsSubject.complete(); // Cierra la conexión WebSocket
//       console.log('Subject WebSocket de estados completado (conexión cerrada).');
//     }
//   }

//   private conectarWebSocketEstados(): void {
//     const WEBSOCKET_URL = 'ws://192.168.1.18:1880/ws/connectionstatus';

//     this.wsSubject = webSocket(WEBSOCKET_URL);

//     this.wsSubscription = this.wsSubject.subscribe(
//       (payloadRecibido) => {
//         console.log('Estado máquinas recibido:', payloadRecibido);

//         // El payloadRecibido es el objeto 'transformedData' de Node-RED
//         if (payloadRecibido.hasOwnProperty('horno1F2')) {
//           this.estado_horno1F2 = payloadRecibido.horno1F2 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('horno2F2')) {
//           this.estado_horno2F2 = payloadRecibido.horno2F2 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('silo_cohete')) {
//           this.estado_silo_cohete = payloadRecibido.silo_cohete ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('silo_norte')) {
//           this.estado_silo_norte = payloadRecibido.silo_norte ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('silo_sur')) {
//           this.estado_silo_sur = payloadRecibido.silo_sur ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('hornoTT1F2')) {
//           this.estado_hornoTT1F2 = payloadRecibido.hornoTT1F2 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('hornoTT2F2')) {
//           this.estado_hornoTT2F2 = payloadRecibido.hornoTT2F2 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('horno1F1')) {
//           this.estado_horno1F1 = payloadRecibido.horno1F1 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('horno2F1')) {
//           this.estado_horno2F1 = payloadRecibido.horno2F1 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('horno3F1')) {
//           this.estado_horno3F1 = payloadRecibido.horno3F1 ? true : false;
//         }
//         if (payloadRecibido.hasOwnProperty('horno4F1')) {
//           this.estado_horno4F1 = payloadRecibido.horno4F1 ? true : false;
//         }

//       },
//       (error) => {
//         console.error('Error en WebSocket de estados:', error);
//         this.ponerTodosLosEstadosDesconocidos();
//       },
//       () => {
//         console.warn('WebSocket de estados cerrado.');
//         this.ponerTodosLosEstadosDesconocidos();
//       }
//     );
//   }

//   private ponerTodosLosEstadosDesconocidos(): void {
//     this.estado_horno1F2 = null;
//     this.estado_horno2F2 = null;
//     this.estado_silo_cohete = null;
//     this.estado_silo_norte = null;
//     this.estado_silo_sur = null;
//     this.estado_hornoTT1F2 = null;
//     this.estado_hornoTT2F2 = null;
//     this.estado_horno1F1 = null;
//     this.estado_horno2F1 = null;
//     this.estado_horno3F1 = null;
//     this.estado_horno4F1 = null;
//   }
// }

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core'; // Importar ChangeDetectorRef y ChangeDetectionStrategy
import { Subject, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

interface Maquina {
  id: string; // Corresponderá a la clave en el payload del WebSocket (ej: 'horno1F1')
  nombreMostrado: string; // El nombre que se verá en la UI (ej: 'Horno 1')
  estado: boolean | null;
  // Aquí podrías añadir más KPIs en el futuro:
  // oee?: number;
  // temperatura?: number;
  // produccionActual?: number;
}

interface TiempoKPI {
  minutos: number;
  horas: number;
  porcentaje: number;
}

interface ConsumoEnergeticoKPI {
  valorInicialAcumuladorKWh: number | null;
  timestampValorInicialUTC: string | null;
  valorFinalAcumuladorKWh: number | null;
  timestampValorFinalUTC: string | null;
  consumoTotalEstimadoKWh: number;
  notaImportante: string;
}

interface ProduccionKPI {
  cantidadColadasDiaActual: number;
  diaAnalizado?: string; // Hacer opcional si no siempre viene
  nota?: string; // Hacer opcional
}

interface ContextoCalculoKPI {
  fechaReporte: string;
  horaReporte: string;
  periodoAnalizadoDiaActual: {
    inicio: string;
    fin: string;
  };
  minutosDelHorarioLaboralHoyConsideradosParaNoUso?: number;
  definicionHorarioLaboral?: string;
  // ... otros campos relevantes del contexto que envíe Node-RED
}

// Interfaz principal para los KPIs del horno específico
interface HornoPrincipalKPIs {
  tiempoDeUso?: TiempoKPI; // Hacerlos opcionales por si algún dato no llega
  tiempoDeNoUso?: TiempoKPI;
  consumoEnergetico?: ConsumoEnergeticoKPI;
  produccion?: ProduccionKPI;
  contextoCalculoGeneral?: ContextoCalculoKPI;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimización de detección de cambios
})
export class DashboardComponent implements OnInit, OnDestroy {
  public maquinasFundicion1: Maquina[] = [
    { id: 'horno1F1', nombreMostrado: 'Horno 1', estado: null },
    { id: 'horno2F1', nombreMostrado: 'Horno 2', estado: null },
    { id: 'horno3F1', nombreMostrado: 'Horno 3', estado: null },
    { id: 'horno4F1', nombreMostrado: 'Horno 4', estado: null },
  ];

  public maquinasFundicion2: Maquina[] = [
    { id: 'horno1F2', nombreMostrado: 'Horno Ind 1', estado: null },
    { id: 'horno2F2', nombreMostrado: 'Horno Ind 2', estado: null },
    { id: 'silo_cohete', nombreMostrado: 'Silo Cohete', estado: null },
    {
      id: 'silo_norte',
      nombreMostrado: 'Silo Norte (Arena Reutilizada)',
      estado: null,
    },
    { id: 'silo_sur', nombreMostrado: 'Silo Sur (Arena Nueva)', estado: null },
    { id: 'hornoTT1F2', nombreMostrado: 'Horno TT 1', estado: null },
    { id: 'hornoTT2F2', nombreMostrado: 'Horno TT 2', estado: null },
  ];

  public hornoPrincipalKPIs: HornoPrincipalKPIs | null = null; // Para los KPIs del horno DPM-C530

  // Puedes tener una lista consolidada si prefieres gestionar todo junto
  // public todasLasMaquinas: Maquina[] = [...this.maquinasFundicion1, ...this.maquinasFundicion2];

  private wsSubscription: Subscription | undefined;
  private wsSubject: WebSocketSubject<any> | undefined;
  private destroy$ = new Subject<void>();
  public wsConnectionStatus: 'connecting' | 'connected' | 'error' | 'closed' =
    'connecting';
  public lastUpdateTime: Date | null = null;

  constructor(private cdr: ChangeDetectorRef) {} // Inyectar ChangeDetectorRef

  ngOnInit(): void {
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
      this.wsSubject.complete();
      console.log(
        'Subject WebSocket de estados completado (conexión cerrada).'
      );
    }
  }

  private conectarWebSocketEstados(): void {
    const WEBSOCKET_URL = 'ws://192.168.1.18:1880/ws/connectionstatus'; // Reemplaza con tu URL
    this.wsConnectionStatus = 'connecting';
    this.cdr.markForCheck(); // Notificar cambios

    this.wsSubject = webSocket({
      url: WEBSOCKET_URL,
      openObserver: {
        next: () => {
          console.log('WebSocket conectado exitosamente.');
          this.wsConnectionStatus = 'connected';
          this.cdr.markForCheck();
        },
      },
      closeObserver: {
        // Maneja cierres (esperados o inesperados)
        next: (event) => {
          console.warn('WebSocket cerrado.', event);
          this.wsConnectionStatus = 'closed';
          this.ponerTodosLosEstadosDesconocidos();
          // Opcional: intentar reconectar
          // setTimeout(() => this.conectarWebSocketEstados(), 5000);
          this.cdr.markForCheck();
        },
      },
    });

    this.wsSubscription = this.wsSubject.subscribe(
      (payloadRecibido) => {
        console.log('Datos recibidos:', payloadRecibido);
        this.wsConnectionStatus = 'connected'; // Asegurar estado en caso de reconexión silenciosa
        this.actualizarEstadosDesdePayload(payloadRecibido);
        this.lastUpdateTime = new Date();
        this.cdr.markForCheck(); // Notificar a Angular que actualice la vista
      },
      (error) => {
        console.error('Error en WebSocket de estados:', error);
        this.wsConnectionStatus = 'error';
        this.ponerTodosLosEstadosDesconocidos();
        this.cdr.markForCheck();
        // Opcional: intentar reconectar
        // setTimeout(() => this.conectarWebSocketEstados(), 5000);
      }
      // El 'complete' se maneja con closeObserver ahora
    );
  }

  private actualizarEstadosDesdePayload(payload: any): void {
    // Actualizar estados de máquinas individuales (tu lógica actual)
    this.maquinasFundicion1.forEach((maquina) => {
      if (payload.hasOwnProperty(maquina.id)) {
        maquina.estado = !!payload[maquina.id];
      }
    });
    this.maquinasFundicion2.forEach((maquina) => {
      if (payload.hasOwnProperty(maquina.id)) {
        maquina.estado = !!payload[maquina.id];
      }
    });

    // NUEVO: Extraer y asignar los KPIs del horno principal
    // Ajusta 'hornoDPM_C530_KPIs' al nombre exacto de la clave que envíes desde Node-RED
    if (payload.hasOwnProperty('hornoDPM_C530_KPIs')) {
      this.hornoPrincipalKPIs = payload.hornoDPM_C530_KPIs;
      console.log('KPIs Horno Principal recibidos:', this.hornoPrincipalKPIs);
    } else {
      // Opcional: si no vienen los KPIs, podrías querer limpiarlos o mantener el valor anterior
      // this.hornoPrincipalKPIs = null;
    }
  }

  private ponerTodosLosEstadosDesconocidos(): void {
    this.maquinasFundicion1.forEach((maquina) => (maquina.estado = null));
    this.maquinasFundicion2.forEach((maquina) => (maquina.estado = null));
    this.hornoPrincipalKPIs = null; // <--- AÑADIR ESTO para resetear los KPIs
    this.lastUpdateTime = null;
    this.cdr.markForCheck();
  }
}
