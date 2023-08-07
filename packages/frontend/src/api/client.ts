import axios from 'axios';

import { Api } from './sdk';

const client = new Api({
  format: 'json',
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'https://sudope-api.sipher.gg',
});

export const atherIdBaseUrl =
  process.env.NEXT_PUBLIC_ATHER_ID_URL ?? 'https://api-staging-atherid.sipher.gg';

export const atherIdFetcher = axios.create({ baseURL: atherIdBaseUrl });

export default client;
