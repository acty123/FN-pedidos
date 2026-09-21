package com.pedidos.backend.service;

import com.pedidos.backend.domain.enums.EstadoPedido;
import com.pedidos.backend.dto.request.CrearPedidoRequestDTO;
import com.pedidos.backend.dto.response.PedidoResponseDTO;

import java.util.List;

public interface PedidoService {
    PedidoResponseDTO crearPedido(CrearPedidoRequestDTO request);
    List<PedidoResponseDTO> obtenerTodos();
    PedidoResponseDTO obtenerPorId(Long id);
    List<PedidoResponseDTO> obtenerPorEstado(EstadoPedido estado);
    PedidoResponseDTO actualizarEstado(Long id, EstadoPedido nuevoEstado);
    PedidoResponseDTO actualizarPedido(Long id, CrearPedidoRequestDTO request);
    void eliminarPedido(Long id);
}
