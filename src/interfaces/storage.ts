export interface Storage {
  getUser(id: string): Promise<User>;
  createUser(user: User): Promise<void>;
  updateUser(id: string, user: Partial<User>): Promise<void>;

  getProjectPolicies(accountId: string): Promise<Policy[]>;   // id = accountId
  createProjectPolicy(accountId: string, projectKey: string, policy: Policy): Promise<void>;
  updateProjectPolicy(accountId: string, projectKey: string, policy: Partial<Policy>): Promise<void>;

  getGitAccounts(): Promise<Account[]>;

  getTemplates(): Promise<Template[]>;
  addTemplate(template: Template): Promise<void>;

  getCredentials(accountId: string): Promise<Credentials>;
  updateCredentials(accountId: string, credentials: Credentials): Promise<void>;
  removeCredentials(accountId: string): Promise<void>;

  getCloudAccounts(): Promise<CloudAccount[]>;

  getRepository(id: string): Promise<Repository>;
  getRepositories(): Promise<Repository[]>;
  getRepoForGitAccount(gitId: string): Promise<Repository[]>;
  getRepoForCloudAccount(accountId: string): Promise<Repository[]>;
  creatRepository(repository: Repository): Promise<void>;
  deleteRepository(id: string): Promise<void>;
  deactivateRepo(id: string): Promise<void>;
  activateRepo(id: string): Promise<void>;

  setCache(key: string, value: string): Promise<void>;
  getCache(key: string): Promise<string>;
  clearCache(key: string): Promise<void>;
  // put();
  // get();
  // update();
  // remove();
}

export interface User {
  id: string;
}

export interface Policy {
  id: string;
}

export interface Account {
  id: string;
}

export interface Template {
  id: string;
}
export type Credentials = string;

export interface CloudAccount {
  id: string;
}

export interface Repository {
  id: string;
}