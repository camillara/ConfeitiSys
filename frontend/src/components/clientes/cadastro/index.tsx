import { Layout } from "components/layout";
import { useState, useEffect } from "react";
import { ClienteForm } from "./form";
import { Cliente } from "app/models/clientes";
import { useClienteService } from "app/services";
import { Alert } from "components/common/message";
import { useRouter } from "next/router";

export const CadastroCliente: React.FC = () => {
  const [cliente, setCliente] = useState<Cliente>({});
  const [messages, setMessages] = useState<Array<Alert>>([]);
  const service = useClienteService();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      service.carregarCliente(id).then((clienteEncontrado) => {
        setCliente(clienteEncontrado);
      });
    }
  });

  const handleSubmit = (cliente: Cliente) => {
    console.log(cliente);

    if (cliente.id) {
      service.atualizar(cliente).then((response) => {
        setMessages([
          {
            tipo: "success",
            texto: "Cliente atualizado com sucesso!",
          },
        ]);
      });
    } else {
      service.salvar(cliente).then((clienteSalvo) => {
        setCliente(clienteSalvo);
        setMessages([
          {
            tipo: "success",
            texto: "Cliente salvo com sucesso!",
          },
        ]);
      });
    }
  };

  return (
    <Layout titulo="CADASTRO DE CLIENTE" mensagens={messages}>
      <ClienteForm cliente={cliente} onSubmit={handleSubmit} />
    </Layout>
  );
};
