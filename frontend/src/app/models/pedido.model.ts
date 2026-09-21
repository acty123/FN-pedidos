export type EstadoPedido = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
export type TipoItem = 'PRODUCTO' | 'SERVICIO';

export interface ItemRequest {
  descripcion: string;
  tipo: TipoItem;
  cantidad: number;
  precioUnitario: number;
}

export interface ItemResponse {
  id?: number;
  descripcion: string;
  tipo: TipoItem;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CrearPedidoRequest {
  descripcion: string;
  cliente: string;
  items: ItemRequest[];
}

export interface PedidoResponse {
  id: number;
  descripcion: string;
  cliente: string;
  estado: EstadoPedido;
  total: number;
  fechaCreacion: string;
  items: ItemResponse[];
}

export interface PedidoStats {
  totalPedidos: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  cancelados: number;
  montoTotal: number;
}
