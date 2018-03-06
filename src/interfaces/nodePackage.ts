export interface INodePackage {
  name?: string;
  version?: string;
  versions?: { [key: string]: INodePackage };
  'dist-tags'?: { [key: string]: string };
  error?: string;
  reason?: string;
}
