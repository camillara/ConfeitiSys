import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Typography, Container, Box, Link, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useUser } from 'context/UserContext'; // Importa o contexto de usuário

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser } = useUser();  // Usar o setUser do contexto para armazenar o usuário

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.MouseEvent) => event.preventDefault();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', { email, password });
      console.log("API Response: ", response.data);  // Verifica o que está sendo retornado pela API
      if (response.status === 200) {
        const userData = response.data;  // Supondo que a resposta contenha o id e o email do usuário
        // Verifique se os dados retornados possuem os valores corretos
        if (userData.id && userData.email) {
          // Armazena as informações do usuário no contexto
          setUser({ id: userData.id, email: userData.email });
          console.log("UserContext after login:", { id: userData.id, email: userData.email });
          // Redireciona para o dashboard
          router.push('/relatorios');
        } else {
          console.error("ID ou email do usuário não encontrados na resposta da API.");
        }
      }
    } catch (error: any) {
      console.error("Erro ao logar:", error);
      setError('Credenciais inválidas');
    }
  };
  

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
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
            type={showPassword ? 'text' : 'password'}
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
            Entrar
          </Button>
        </form>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" align="center">
            Não tem uma conta?{' '}
            <Link href="/register" variant="body2" underline="hover">
              Cadastre-se
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
