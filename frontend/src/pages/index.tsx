import Head from "next/head";
import { Layout } from "components";
import { RelatoriosHome } from "components/relatoriosHome"; 
import withAuth from "components/common/withAuth";


function Home() {
  return (
    <div>
      <Head>
        <title>ConfeitiSys</title>
        <meta name="description" content="Sistema de Gestão para Confeitarias Artesanais" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <RelatoriosHome />
      </Layout>
    </div>
  );
}

// Exporta a página Home com proteção de autenticação
export default withAuth(Home);
