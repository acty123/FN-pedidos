package com.pedidos.backend.service.impl;

import com.pedidos.backend.domain.enums.EstadoPedido;
import com.pedidos.backend.dto.request.CrearPedidoRequestDTO;
import com.pedidos.backend.dto.request.ItemRequestDTO;
import com.pedidos.backend.dto.response.ItemResponseDTO;
import com.pedidos.backend.dto.response.PedidoResponseDTO;
import com.pedidos.backend.entity.ItemPedidoEntity;
import com.pedidos.backend.entity.PedidoEntity;
import com.pedidos.backend.repository.PedidoRepository;
import com.pedidos.backend.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;

    @Override
    @Transactional
    public PedidoResponseDTO crearPedido(CrearPedidoRequestDTO request) {
        PedidoEntity pedido = PedidoEntity.builder()
                .descripcion(request.getDescripcion())
                .cliente(request.getCliente())
                .estado(EstadoPedido.PENDIENTE)
                .fechaCreacion(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAcumulado = BigDecimal.ZERO;

        if (request.getItems() != null) {
            for (ItemRequestDTO itemDto : request.getItems()) {
                BigDecimal precio = itemDto.getPrecioUnitario() != null ? itemDto.getPrecioUnitario() : BigDecimal.ZERO;
                int cantidad = itemDto.getCantidad() != null ? itemDto.getCantidad() : 0;
                BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(cantidad));
                totalAcumulado = totalAcumulado.add(subtotal);

                ItemPedidoEntity itemEntity = ItemPedidoEntity.builder()
                        .descripcion(itemDto.getDescripcion())
                        .tipo(itemDto.getTipo())
                        .cantidad(cantidad)
                        .precioUnitario(precio)
                        .pedido(pedido)
                        .build();

                pedido.getItems().add(itemEntity);
            }
        }

        pedido.setTotal(totalAcumulado);
        PedidoEntity guardado = pedidoRepository.save(pedido);
        return mapToDTO(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> obtenerTodos() {
        return pedidoRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PedidoResponseDTO obtenerPorId(Long id) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + id));
        return mapToDTO(pedido);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> obtenerPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PedidoResponseDTO actualizarEstado(Long id, EstadoPedido nuevoEstado) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + id));

        if (nuevoEstado == EstadoPedido.PENDIENTE && pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new IllegalStateException("Un pedido en estado " + pedido.getEstado() + " no puede volver al estado PENDIENTE.");
        }

        pedido.setEstado(nuevoEstado);
        PedidoEntity actualizado = pedidoRepository.save(pedido);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public PedidoResponseDTO actualizarPedido(Long id, CrearPedidoRequestDTO request) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + id));

        if (pedido.getEstado() == EstadoPedido.COMPLETADO) {
            throw new IllegalStateException("No se permite realizar ninguna modificación a un pedido en estado COMPLETADO.");
        }

        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new IllegalStateException("Solo se permite realizar modificaciones a pedidos en estado PENDIENTE. Estado actual: " + pedido.getEstado());
        }

        pedido.setCliente(request.getCliente());
        pedido.setDescripcion(request.getDescripcion());

        pedido.getItems().clear();

        BigDecimal totalAcumulado = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (ItemRequestDTO itemDto : request.getItems()) {
                BigDecimal precio = itemDto.getPrecioUnitario() != null ? itemDto.getPrecioUnitario() : BigDecimal.ZERO;
                int cantidad = itemDto.getCantidad() != null ? itemDto.getCantidad() : 0;
                BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(cantidad));
                totalAcumulado = totalAcumulado.add(subtotal);

                ItemPedidoEntity itemEntity = ItemPedidoEntity.builder()
                        .descripcion(itemDto.getDescripcion())
                        .tipo(itemDto.getTipo())
                        .cantidad(cantidad)
                        .precioUnitario(precio)
                        .pedido(pedido)
                        .build();

                pedido.getItems().add(itemEntity);
            }
        }

        pedido.setTotal(totalAcumulado);
        PedidoEntity actualizado = pedidoRepository.save(pedido);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public void eliminarPedido(Long id) {
        if (!pedidoRepository.existsById(id)) {
            throw new IllegalArgumentException("Pedido no encontrado con ID: " + id);
        }
        pedidoRepository.deleteById(id);
    }

    private PedidoResponseDTO mapToDTO(PedidoEntity entity) {
        List<ItemResponseDTO> itemsDTO = entity.getItems().stream()
                .map(item -> ItemResponseDTO.builder()
                        .id(item.getId())
                        .descripcion(item.getDescripcion())
                        .tipo(item.getTipo())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                        .build())
                .collect(Collectors.toList());

        return PedidoResponseDTO.builder()
                .id(entity.getId())
                .descripcion(entity.getDescripcion())
                .cliente(entity.getCliente())
                .estado(entity.getEstado())
                .total(entity.getTotal())
                .fechaCreacion(entity.getFechaCreacion())
                .items(itemsDTO)
                .build();
    }
}
