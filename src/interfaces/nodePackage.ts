export interface INodePackage {
  name: string;
  version?: string;
  versions?: INodePackage[];
  'dist-tags'?: { [key: string]: string };
  error?: string;
  reason?: string;
}
