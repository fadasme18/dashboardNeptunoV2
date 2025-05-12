import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

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
    
    private destroy$ = new Subject<void>();

  ngOnInit(): void {
      //Iniciar polling cada 30 seg
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
}
