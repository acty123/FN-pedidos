package com.pedidos.backend.dto.response;

import com.pedidos.backend.domain.enums.TipoItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {
    private Long id;
    private String descripcion;
    private TipoItem tipo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}
