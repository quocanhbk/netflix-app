import useSWR from 'swr';

import fetcher from 'src/lib/fetcher';

const useMovieList = () => {
  const { data, error, isLoading } = useSWR('/api/movies', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return { data, error, isLoading };
};

export default useMovieList;
