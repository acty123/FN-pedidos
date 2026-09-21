import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap } from 'rxjs';
import {
  PedidoResponse,
  CrearPedidoRequest,
  EstadoPedido,
  PedidoStats
} from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/pedidos';

  // Signals para estado reactivo
  public readonly pedidos = signal<PedidoResponse[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  public readonly isUsingMockData = signal<boolean>(false);

  // Mock data inicial para fallback
  private mockPedidos: PedidoResponse[] = [
    {
      id: 101,
      cliente: 'Tech Corp Solutions',
      descripcion: 'Licencias de Software y Equipamiento de Oficina',
      estado: 'EN_PROCESO',
      total: 3450.00,
      fechaCreacion: new Date(Date.now() - 3600000 * 5).toISOString(),
      items: [
        { id: 1, descripcion: 'Licencia Servidor Enterprise', tipo: 'SERVICIO', cantidad: 2, precioUnitario: 1200.00, subtotal: 2400.00 },
        { id: 2, descripcion: 'Monitor 4K 27"', tipo: 'PRODUCTO', cantidad: 3, precioUnitario: 350.00, subtotal: 1050.00 }
      ]
    },
    {
      id: 102,
      cliente: 'Inversiones Globales S.A.',
      descripcion: 'Desarrollo de Portal Web Institucional',
      estado: 'COMPLETADO',
      total: 5800.00,
      fechaCreacion: new Date(Date.now() - 3600000 * 24).toISOString(),
      items: [
        { id: 3, descripcion: 'Diseño UX/UI y Frontend Angular', tipo: 'SERVICIO', cantidad: 1, precioUnitario: 3500.00, subtotal: 3500.00 },
        { id: 4, descripcion: 'API Backend Spring Boot & PostgreSQL', tipo: 'SERVICIO', cantidad: 1, precioUnitario: 2300.00, subtotal: 2300.00 }
      ]
    },
    {
      id: 103,
      cliente: 'Servicios Logísticos del Norte',
      descripcion: 'Mantenimiento Preventivo de Servidores',
      estado: 'PENDIENTE',
      total: 950.50,
      fechaCreacion: new Date(Date.now() - 3600000 * 2).toISOString(),
      items: [
        { id: 5, descripcion: 'Auditoría de Seguridad y Respaldo', tipo: 'SERVICIO', cantidad: 1, precioUnitario: 950.50, subtotal: 950.50 }
      ]
    },
    {
      id: 104,
      cliente: 'Construcciones Modernas',
      descripcion: 'Impresoras Industriales y Suministros',
      estado: 'CANCELADO',
      total: 1200.00,
      fechaCreacion: new Date(Date.now() - 3600000 * 48).toISOString(),
      items: [
        { id: 6, descripcion: 'Impresora Térmica de Etiquetas', tipo: 'PRODUCTO', cantidad: 4, precioUnitario: 300.00, subtotal: 1200.00 }
      ]
    }
  ];

  constructor() {
    this.cargarMockLocal();
  }

  private cargarMockLocal(): void {
    const guardado = localStorage.getItem('fn_pedidos_mock');
    if (guardado) {
      try {
        this.mockPedidos = JSON.parse(guardado);
      } catch {
        // Mantener inicial si hay error al parsear
      }
    }
  }

  private guardarMockLocal(): void {
    localStorage.setItem('fn_pedidos_mock', JSON.stringify(this.mockPedidos));
  }

  public cargarPedidos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<PedidoResponse[]>(this.apiUrl).pipe(
      tap((data) => {
        this.pedidos.set(data);
        this.isUsingMockData.set(false);
        this.loading.set(false);
      }),
      catchError((err) => {
        console.warn('Backend API no disponible. Usando datos de demostración.', err);
        this.pedidos.set([...this.mockPedidos]);
        this.isUsingMockData.set(true);
        this.loading.set(false);
        return of(this.mockPedidos);
      })
    ).subscribe();
  }

  public crearPedido(request: CrearPedidoRequest): Observable<PedidoResponse> {
    this.loading.set(true);
    return this.http.post<PedidoResponse>(this.apiUrl, request).pipe(
      tap((nuevo) => {
        this.pedidos.update(actuales => [nuevo, ...actuales]);
        this.loading.set(false);
      }),
      catchError(() => {
        // Fallback local
        const totalCalculado = request.items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
        const nuevoMock: PedidoResponse = {
          id: Math.floor(100 + Math.random() * 900),
          cliente: request.cliente,
          descripcion: request.descripcion,
          estado: 'PENDIENTE',
          total: totalCalculado,
          fechaCreacion: new Date().toISOString(),
          items: request.items.map((item, index) => ({
            id: index + 1,
            descripcion: item.descripcion,
            tipo: item.tipo,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario
          }))
        };

        this.mockPedidos = [nuevoMock, ...this.mockPedidos];
        this.guardarMockLocal();
        this.pedidos.set([...this.mockPedidos]);
        this.isUsingMockData.set(true);
        this.loading.set(false);
        return of(nuevoMock);
      })
    );
  }

  public actualizarEstado(id: number, nuevoEstado: EstadoPedido): Observable<PedidoResponse> {
    const url = `${this.apiUrl}/${id}/estado?estado=${nuevoEstado}`;
    return this.http.patch<PedidoResponse>(url, {}).pipe(
      tap((actualizado) => {
        this.pedidos.update(list => list.map(p => p.id === id ? actualizado : p));
      }),
      catchError((err) => {
        if (err && err.status === 400) {
          throw err;
        }
        let estadoRechazado = false;
        let estadoActualStr = '';
        this.mockPedidos = this.mockPedidos.map(p => {
          if (p.id === id) {
            if (nuevoEstado === 'PENDIENTE' && p.estado !== 'PENDIENTE') {
              estadoRechazado = true;
              estadoActualStr = p.estado;
              return p;
            }
            return { ...p, estado: nuevoEstado };
          }
          return p;
        });
        if (estadoRechazado) {
          throw new Error(`Un pedido en estado ${estadoActualStr} no puede volver al estado PENDIENTE.`);
        }
        this.guardarMockLocal();
        this.pedidos.set([...this.mockPedidos]);
        const modificado = this.mockPedidos.find(p => p.id === id)!;
        return of(modificado);
      })
    );
  }

  public actualizarPedido(id: number, request: CrearPedidoRequest): Observable<PedidoResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<PedidoResponse>(url, request).pipe(
      tap((actualizado) => {
        this.pedidos.update(list => list.map(p => p.id === id ? actualizado : p));
      }),
      catchError((err) => {
        if (err && err.status === 400) {
          throw err;
        }
        const totalCalculado = request.items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
        this.mockPedidos = this.mockPedidos.map(p => {
          if (p.id === id) {
            if (p.estado !== 'PENDIENTE') {
              throw new Error(`Solo se permiten modificaciones a pedidos en estado PENDIENTE. Estado actual: ${p.estado}`);
            }
            return {
              ...p,
              cliente: request.cliente,
              descripcion: request.descripcion,
              total: totalCalculado,
              items: request.items.map((item, index) => ({
                id: index + 1,
                descripcion: item.descripcion,
                tipo: item.tipo,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.cantidad * item.precioUnitario
              }))
            };
          }
          return p;
        });
        this.guardarMockLocal();
        this.pedidos.set([...this.mockPedidos]);
        const modificado = this.mockPedidos.find(p => p.id === id)!;
        return of(modificado);
      })
    );
  }

  public eliminarPedido(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.pedidos.update(list => list.filter(p => p.id !== id));
      }),
      catchError(() => {
        // Fallback local
        this.mockPedidos = this.mockPedidos.filter(p => p.id !== id);
        this.guardarMockLocal();
        this.pedidos.set([...this.mockPedidos]);
        return of(void 0);
      })
    );
  }

  public calcularEstadisticas(lista: PedidoResponse[]): PedidoStats {
    return {
      totalPedidos: lista.length,
      pendientes: lista.filter(p => p.estado === 'PENDIENTE').length,
      enProceso: lista.filter(p => p.estado === 'EN_PROCESO').length,
      completados: lista.filter(p => p.estado === 'COMPLETADO').length,
      cancelados: lista.filter(p => p.estado === 'CANCELADO').length,
      montoTotal: lista.reduce((sum, p) => sum + (p.total || 0), 0)
    };
  }
}
