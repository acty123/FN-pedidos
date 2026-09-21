package com.pedidos.backend.controller;

import com.pedidos.backend.domain.enums.EstadoPedido;
import com.pedidos.backend.dto.request.CrearPedidoRequestDTO;
import com.pedidos.backend.dto.response.PedidoResponseDTO;
import com.pedidos.backend.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> crearPedido(@RequestBody CrearPedidoRequestDTO request) {
        PedidoResponseDTO nuevoPedido = pedidoService.crearPedido(request);
        return new ResponseEntity<>(nuevoPedido, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(pedidoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PedidoResponseDTO>> obtenerPorEstado(@PathVariable EstadoPedido estado) {
        return ResponseEntity.ok(pedidoService.obtenerPorEstado(estado));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestParam EstadoPedido estado) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, estado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> actualizarPedido(
            @PathVariable Long id,
            @RequestBody CrearPedidoRequestDTO request) {
        return ResponseEntity.ok(pedidoService.actualizarPedido(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        pedidoService.eliminarPedido(id);
        return ResponseEntity.noContent().build();
    }
}
