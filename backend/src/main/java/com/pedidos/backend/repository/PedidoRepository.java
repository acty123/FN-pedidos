package com.pedidos.backend.repository;

import com.pedidos.backend.domain.enums.EstadoPedido;
import com.pedidos.backend.entity.PedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<PedidoEntity, Long> {

    List<PedidoEntity> findByEstado(EstadoPedido estado);

    List<PedidoEntity> findByClienteContainingIgnoreCase(String cliente);

    /**
     * Llama al procedimiento almacenado sp_recalcular_total_pedido.
     * Recalcula la suma de (cantidad × precio_unitario) de todos los ítems
     * del pedido indicado, persiste el resultado en la columna total
     * y lo retorna como valor de retorno del método.
     *
     * @param pedidoId ID del pedido a recalcular
     * @return total recalculado
     */
    @Procedure(name = "PedidoEntity.recalcularTotal")
    BigDecimal recalcularTotal(@Param("p_pedido_id") Long pedidoId);
}

