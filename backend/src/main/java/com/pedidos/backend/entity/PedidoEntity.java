package com.pedidos.backend.entity;

import com.pedidos.backend.domain.enums.EstadoPedido;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NamedStoredProcedureQuery(
    name = "PedidoEntity.recalcularTotal",
    procedureName = "sp_recalcular_total_pedido",
    parameters = {
        @StoredProcedureParameter(mode = ParameterMode.IN,  name = "p_pedido_id", type = Long.class),
        @StoredProcedureParameter(mode = ParameterMode.OUT, name = "p_total",     type = java.math.BigDecimal.class)
    }
)
@Entity
@Table(
    name = "pedidos",
    indexes = {
        @Index(name = "idx_pedidos_estado",         columnList = "estado"),
        @Index(name = "idx_pedidos_fecha_creacion",  columnList = "fecha_creacion")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false, length = 100)
    private String cliente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ItemPedidoEntity> items = new ArrayList<>();

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
