import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "context/UserContext"; // Importa o contexto de usuário

const withAuth = (WrappedComponent: React.FC) => {
  const ComponentWithAuth = (props: any) => {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        // Se o usuário não estiver logado, redireciona para a página de login
        router.push("/login");
      }
    }, [user]);

    // Se o usuário não estiver logado, não renderiza nada
    if (!user) {
      return null;
    }

    // Renderiza o componente protegido se o usuário estiver autenticado
    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
