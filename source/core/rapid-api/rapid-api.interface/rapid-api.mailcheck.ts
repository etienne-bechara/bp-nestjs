export interface RapidApiMailCheck {
  valid: boolean | string;
  block: boolean | string;
  disposable: boolean | string;
  domain: string;
  text: string;
  reason: string;
  risk: 10,
  mx_host: string;
  possible_typo: string[];
  mx_ip: string;
  mx_info: string;
  last_changed_at: string;
}
