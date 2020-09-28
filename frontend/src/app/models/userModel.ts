export class User {
  private id: string;
  private username: string;
  private firstName: string;
  private lastName: string;
  private email: string;
  private role: string;
  private companyId: string;
  private projectsId: string[];
  private clientId: string[];

  constructor(id: string, username: string, email: string){
      this.id = id;
      this.username = username;
      this.email = email;
  }

  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
      return this.username;
  }
  public setUsername(username: string): void {
      this.username = username;
  }

  public getFirstName(): string {
      return this.firstName;
  }
  public setFirstName(firstName: string): void {
      this.firstName = firstName;
  }

  public getLastName(): string {
      return this.lastName;
  }
  public setLastName(lastName: string): void {
      this.lastName = lastName;
  }

  public getEmail(): string {
      return this.email;
  }
  public setEmail(email: string): void {
      this.email = email;
  }

  public getRole(): string {
      return this.role;
  }
  public setRole(role: string): void {
      this.role = role;
  }

  public getCompanyId(): string {
      return this.companyId;
  }
  public setCompanyId(companyId: string): void {
      this.companyId = companyId;
  }

  public getProjectsId(): string[] {
      return this.projectsId;
  }
  public setProjectsId(projectsId: string[]): void {
      this.projectsId = projectsId;
  }

  public getClientId(): string[] {
      return this.clientId;
  }
  public setClientId(clientId: string[]): void {
      this.clientId = clientId;
  }
}


