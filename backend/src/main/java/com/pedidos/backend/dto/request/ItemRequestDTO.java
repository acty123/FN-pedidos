package com.pedidos.backend.dto.request;

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
public class ItemRequestDTO {
    private String descripcion;
    private TipoItem tipo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
}
