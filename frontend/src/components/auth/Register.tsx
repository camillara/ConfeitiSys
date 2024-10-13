import React, { useState, useRef } from "react";
import { TextField, Button, Typography, Container, Box, Link, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { Toast } from "primereact/toast";  // Importar o Toast do PrimeReact

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");  // Campo para confirmar senha
  const [showPassword, setShowPassword] = useState(false);  // Estado para controlar a exibição da senha
  const [error, setError] = useState("");  // Estado para exibir erros
  const toast = useRef<Toast>(null);  // Referência para o Toast

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verifica se as senhas coincidem antes de enviar
    if (password !== confirmPassword) {
      setError("As senhas devem ser iguais.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/users/register", { email, password });
      if (response.status === 200) {
        // Exibir o toast de sucesso
        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Cadastro realizado com sucesso!",
          life: 3000,
        });
      }
    } catch (error: any) {
      // Exibir o toast de erro
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: error.response?.data || "Erro ao registrar o usuário.",
        life: 5000,
      });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);  // Alterna entre mostrar e esconder a senha
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();  // Previne o comportamento padrão ao clicar
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Cadastro
        </Typography>
        <Toast ref={toast} /> {/* Componente Toast que exibe as mensagens */}
        <form onSubmit={handleRegister}>
          <TextField
            label="Email"
            fullWidth
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Senha"
            fullWidth
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}  // Alterna entre texto e senha
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirmar Senha"
            fullWidth
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}  // Usa o mesmo controle de visibilidade da senha
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Exibe erro se as senhas não coincidirem */}
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Cadastrar
          </Button>
        </form>

        {/* Exibe o link para voltar ao login após o sucesso no cadastro */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" align="center">
            Já possui uma conta?{" "}
            <Link href="/login" variant="body2" underline="hover">
              Faça login aqui
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
