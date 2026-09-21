-- ============================================================
-- Procedimiento almacenado: sp_recalcular_total_pedido
-- Descripción : Recalcula el total de un pedido sumando
--               cantidad * precio_unitario de todos sus ítems
--               y actualiza la columna total en la tabla pedidos.
-- Parámetros  :
--   p_pedido_id (IN)  – ID del pedido a recalcular
--   p_total     (OUT) – Total calculado que se retorna al llamador
-- ============================================================

CREATE OR REPLACE PROCEDURE sp_recalcular_total_pedido(
    IN  p_pedido_id BIGINT,
    OUT p_total     NUMERIC(10, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0.00)
    INTO   p_total
    FROM   items_pedido i
    WHERE  i.pedido_id = p_pedido_id;

    UPDATE pedidos
    SET    total = p_total
    WHERE  id    = p_pedido_id;
END;
$$
@@
