import { _addDriver } from './Data';
import {AuthContextData, AuthData} from './Types';
import React from 'react';

export const AuthContext = React.createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [authData, setAuthData] = React.useState<AuthData>();
  const [loading, setLoading] = React.useState(false);

  const signIn = async (firstName: string, lastName: string) => {
    _addDriver(firstName, lastName).then((json) => {
      setAuthData({ "token": json.employee.id, "firstName": json.employee.firstName, "lastName": json.employee.lastName})
    })
  };

  /*
  const signOut = async () => {
    setAuthData(undefined);
  };
  */

  return (
    //This component will be used to encapsulate the whole App,
    //so all components will have access to the Context
    <AuthContext.Provider value={{authData, loading, signIn /*, signOut*/}}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}