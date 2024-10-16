import Head from "next/head";
import { Layout } from "components";

export default function Home() {
  return (
    <div>
      <Head>
        <title>ConfeitiSys</title>
        <meta name="description" content="Sistema de Gestão para Confeitarias Artesanais" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout />
    </div>
  );
}
