export enum DependenciesFlags {
  Prod = 0,
  Dev = 1,
  Peer = 2,
  Optional = 4,
  All = 7,
}

export enum Strategy {
  latest,
  semver,
}
