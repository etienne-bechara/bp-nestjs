import { AxiosResponse } from 'axios';

export interface HttpsResponse extends AxiosResponse {
  cookies: Record<string, string>
}
