import Head from "next/head";
import { Layout } from "components";
import { RelatoriosHome } from "components/relatoriosHome/index";  // Importa o componente de relatórios

export default function RelatoriosPage() {
  return (
    <div>
      <Head>
        <title>Relatórios - ConfeitiSys</title>
        <meta name="description" content="Relatórios de gestão para Confeitaria" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <RelatoriosHome />  {/* Exibe o componente de relatórios */}
      </Layout>
    </div>
  );
}
