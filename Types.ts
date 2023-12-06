export type AuthContextData = {
  authData?: AuthData;
  loading: boolean;
  signIn(firstName: string, lastName: string) : Promise<void>;
  // signOut(): void;
};
    
export type AuthData = {
  token: string;
  firstName: string;
  lastName: string
};
