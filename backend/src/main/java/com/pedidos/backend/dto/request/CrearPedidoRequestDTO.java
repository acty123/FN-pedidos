package com.pedidos.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearPedidoRequestDTO {
    private String descripcion;
    private String cliente;

    @Builder.Default
    private List<ItemRequestDTO> items = new ArrayList<>();
}
