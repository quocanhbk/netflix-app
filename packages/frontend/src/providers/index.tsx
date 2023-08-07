import { useRef } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProviderProps {
  children: React.ReactNode;
  pageProps: any;
}

const Provider = ({ children, pageProps }: ProviderProps) => {
  const qcRef = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={qcRef.current}>
      <Hydrate state={pageProps.dehydratedState}>{children}</Hydrate>
    </QueryClientProvider>
  );
};

export default Provider;
