import type { AppProps } from "next/app";
import "bulma/css/bulma.css";
import "components/common/loader/loader.css";
import "primereact/resources/themes/md-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import "/node_modules/primeflex/primeflex.css";
import { UserProvider } from '../context/UserContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />;
      </UserProvider>
  );
}

export default MyApp;
