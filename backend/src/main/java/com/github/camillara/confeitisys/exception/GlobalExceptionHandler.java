package com.github.camillara.confeitisys.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OperacaoNaoPermitidaException.class)
    public ResponseEntity<String> handleOperacaoNaoPermitidaException(OperacaoNaoPermitidaException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(VendaNaoEncontradaException.class)
    public ResponseEntity<?> handleVendaNaoEncontradaException(VendaNaoEncontradaException ex, WebRequest request) {
        // Retorna um 404 Not Found junto com a mensagem da exceção
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

}
