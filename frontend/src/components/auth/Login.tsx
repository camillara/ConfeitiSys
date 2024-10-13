import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Typography, Container, Box, Link, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';  
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  
  const [error, setError] = useState('');
  const router = useRouter();


  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.MouseEvent) => event.preventDefault();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const response = await axios.post('http://localhost:8080/api/users/login', { email, password });
      if (response.status === 200) {

        router.push('/');
      }
    } catch (error: any) {
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
            type={showPassword ? 'text' : 'password'}  // Alterna entre texto e senha
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
