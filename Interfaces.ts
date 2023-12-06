
export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IMarker {
  key: number
  title: string
  coordinates: ILocation;
  color: string
}

export interface IEmployee {
  id: string
  firstName: string;
  lastName: string;
  createDate: Date;
  modifiedDate: Date;
  deletedDate: Date;
}

export interface IDuty {
  id: string
  createDate: Date;
  modifiedDate: Date;
  deletedDate: Date;
}