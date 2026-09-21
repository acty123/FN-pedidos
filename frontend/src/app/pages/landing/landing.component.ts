import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import {
  PedidoResponse,
  EstadoPedido,
  TipoItem,
  ItemRequest,
  CrearPedidoRequest
} from '../../models/pedido.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  public readonly pedidoService = inject(PedidoService);

  // Filtro y búsqueda
  public readonly filtroEstado = signal<EstadoPedido | 'TODOS'>('TODOS');
  public readonly busqueda = signal<string>('');

  // Modales
  public readonly showCrearModal = signal<boolean>(false);
  public readonly showDetalleModal = signal<boolean>(false);
  public readonly pedidoSeleccionado = signal<PedidoResponse | null>(null);
  public readonly pedidoEditar = signal<PedidoResponse | null>(null);

  // Formulario de nuevo/editar pedido
  public nuevoCliente = signal<string>('');
  public nuevaDescripcion = signal<string>('');
  public itemsNuevoPedido = signal<ItemRequest[]>([
    { descripcion: '', tipo: 'PRODUCTO', cantidad: 1, precioUnitario: 0 }
  ]);

  // Mensajes toast
  public readonly toastMessage = signal<string | null>(null);

  // Lista filtrada computable
  public readonly pedidosFiltrados = computed(() => {
    const lista = this.pedidoService.pedidos();
    const estado = this.filtroEstado();
    const query = this.busqueda().toLowerCase().trim();

    return lista.filter((p) => {
      const coincideEstado = estado === 'TODOS' || p.estado === estado;
      const coincideQuery =
        !query ||
        p.cliente.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        p.id.toString().includes(query);
      return coincideEstado && coincideQuery;
    });
  });

  // Estadísticas computables
  public readonly stats = computed(() => {
    return this.pedidoService.calcularEstadisticas(this.pedidoService.pedidos());
  });

  // Total calculado dinámico del modal
  public readonly totalNuevoPedido = computed(() => {
    return this.itemsNuevoPedido().reduce((acc, item) => {
      const cant = item.cantidad || 0;
      const precio = item.precioUnitario || 0;
      return acc + cant * precio;
    }, 0);
  });

  ngOnInit(): void {
    this.pedidoService.cargarPedidos();
  }

  public setFiltro(estado: EstadoPedido | 'TODOS'): void {
    this.filtroEstado.set(estado);
  }

  public onBusquedaChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busqueda.set(value);
  }

  // Operaciones de Items en Formulario
  public agregarItem(): void {
    this.itemsNuevoPedido.update((items) => [
      ...items,
      { descripcion: '', tipo: 'PRODUCTO', cantidad: 1, precioUnitario: 0 }
    ]);
  }

  public eliminarItem(index: number): void {
    if (this.itemsNuevoPedido().length <= 1) return;
    this.itemsNuevoPedido.update((items) => items.filter((_, i) => i !== index));
  }

  public updateItemField(index: number, field: keyof ItemRequest, value: any): void {
    this.itemsNuevoPedido.update((items) => {
      const copia = [...items];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  }

  // Abrir y cerrar modales
  public abrirModalCrear(): void {
    this.pedidoEditar.set(null);
    this.nuevoCliente.set('');
    this.nuevaDescripcion.set('');
    this.itemsNuevoPedido.set([
      { descripcion: 'Producto / Servicio Inicial', tipo: 'PRODUCTO', cantidad: 1, precioUnitario: 100 }
    ]);
    this.showCrearModal.set(true);
  }

  public abrirModalEditar(pedido: PedidoResponse): void {
    if (pedido.estado === 'COMPLETADO') {
      this.mostrarToast('⛔ Un pedido en estado COMPLETADO no permite ningún tipo de modificación.');
      return;
    }
    if (pedido.estado !== 'PENDIENTE') {
      this.mostrarToast('⚠️ Solo se pueden realizar modificaciones a pedidos en estado PENDIENTE.');
      return;
    }

    this.pedidoEditar.set(pedido);
    this.nuevoCliente.set(pedido.cliente);
    this.nuevaDescripcion.set(pedido.descripcion);
    this.itemsNuevoPedido.set(
      pedido.items && pedido.items.length > 0
        ? pedido.items.map((it) => ({
            descripcion: it.descripcion,
            tipo: it.tipo,
            cantidad: it.cantidad,
            precioUnitario: it.precioUnitario
          }))
        : [{ descripcion: '', tipo: 'PRODUCTO', cantidad: 1, precioUnitario: 0 }]
    );
    this.showCrearModal.set(true);
  }

  public cerrarModalCrear(): void {
    this.showCrearModal.set(false);
    this.pedidoEditar.set(null);
  }

  public abrirModalDetalle(pedido: PedidoResponse): void {
    this.pedidoSeleccionado.set(pedido);
    this.showDetalleModal.set(true);
  }

  public cerrarModalDetalle(): void {
    this.showDetalleModal.set(false);
    this.pedidoSeleccionado.set(null);
  }

  // Guardar (crear o editar) pedido
  public guardarPedido(): void {
    if (!this.nuevoCliente().trim() || !this.nuevaDescripcion().trim()) {
      this.mostrarToast('Por favor completa el nombre del cliente y la descripción.');
      return;
    }

    const itemsValidos = this.itemsNuevoPedido().filter(
      (it) => it.descripcion.trim().length > 0 && it.precioUnitario >= 0
    );

    if (itemsValidos.length === 0) {
      this.mostrarToast('Agrega al menos un ítem válido al pedido.');
      return;
    }

    const payload: CrearPedidoRequest = {
      cliente: this.nuevoCliente().trim(),
      descripcion: this.nuevaDescripcion().trim(),
      items: itemsValidos
    };

    const pedidoEdicion = this.pedidoEditar();
    if (pedidoEdicion) {
      this.pedidoService.actualizarPedido(pedidoEdicion.id, payload).subscribe({
        next: () => {
          this.cerrarModalCrear();
          this.mostrarToast(`¡Pedido #${pedidoEdicion.id} modificado exitosamente!`);
        },
        error: (err) => {
          const msg = err?.error?.message || 'No se pudo realizar la modificación del pedido.';
          this.mostrarToast(`❌ ${msg}`);
        }
      });
    } else {
      this.pedidoService.crearPedido(payload).subscribe(() => {
        this.cerrarModalCrear();
        this.mostrarToast('¡Pedido creado exitosamente!');
      });
    }
  }

  // Actualizar estado de pedido
  public cambiarEstado(pedido: PedidoResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value as EstadoPedido;

    if (nuevoEstado === 'PENDIENTE' && pedido.estado !== 'PENDIENTE') {
      this.mostrarToast(`⛔ Un pedido en estado ${pedido.estado} no puede volver al estado PENDIENTE.`);
      select.value = pedido.estado;
      return;
    }

    this.pedidoService.actualizarEstado(pedido.id, nuevoEstado).subscribe({
      next: () => {
        this.mostrarToast(`Estado del pedido #${pedido.id} actualizado a ${nuevoEstado}.`);
      },
      error: (err) => {
        select.value = pedido.estado;
        const msg = err?.error?.message || err?.message || 'No se pudo actualizar el estado.';
        this.mostrarToast(`❌ ${msg}`);
      }
    });
  }

  // Eliminar pedido
  public eliminarPedido(pedido: PedidoResponse): void {
    if (confirm(`¿Estás seguro de eliminar el pedido #${pedido.id} de ${pedido.cliente}?`)) {
      this.pedidoService.eliminarPedido(pedido.id).subscribe(() => {
        this.mostrarToast(`Pedido #${pedido.id} eliminado correctamente.`);
      });
    }
  }

  public mostrarToast(msj: string): void {
    this.toastMessage.set(msj);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4500);
  }

  // Utilidades de formato
  public getEstadoBadgeClass(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'EN_PROCESO':
        return 'badge-en-proceso';
      case 'COMPLETADO':
        return 'badge-completado';
      case 'CANCELADO':
        return 'badge-cancelado';
      default:
        return 'badge-default';
    }
  }

  public formatearFecha(fechaIso: string): string {
    if (!fechaIso) return 'Reciente';
    try {
      const f = new Date(fechaIso);
      return f.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaIso;
    }
  }
}
