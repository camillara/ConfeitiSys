package com.github.camillara.confeitisys.exception;

public class VendaNaoEncontradaException extends RuntimeException {
    public VendaNaoEncontradaException(Long id) {
        super("Venda não encontrada para o ID: " + id);
    }
}
