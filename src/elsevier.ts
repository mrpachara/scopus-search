import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type ElsevierResponst = AxiosResponse<Record<string, unknown>>;

export type ResultLink = {
  '@_fa': boolean,
  '@ref': string,
  '@href': string,
  '@type': string,
};

export const headers = {
  'Accept': 'application/json',
  'X-ELS-APIKey': process.env.ESL_API_KEY,
};

export const elsevierInstant = axios.create({
  baseURL: 'https://api.elsevier.com/',
  headers: headers,
});

export const linkInstant = axios.create({
  headers: headers,
});

export async function get(url: string, config?: AxiosRequestConfig): Promise<ElsevierResponst> {
  return elsevierInstant.get(url, config);
}

export async function follow(url: string): Promise<ElsevierResponst> {
  return linkInstant.get(url);
}

export async function query(url: string, query: string, params?: Record<string, unknown>): Promise<ElsevierResponst> {
  const sendingParams: Record<string, unknown> = {
    'query': query,
    'cursor': '*',
    ...params,
  };

  return elsevierInstant.get(url, {
    params: sendingParams,
  });
}
