package com.pedidos.backend.dto.response;

import com.pedidos.backend.domain.enums.EstadoPedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoResponseDTO {
    private Long id;
    private String descripcion;
    private String cliente;
    private EstadoPedido estado;
    private BigDecimal total;
    private LocalDateTime fechaCreacion;

    @Builder.Default
    private List<ItemResponseDTO> items = new ArrayList<>();
}
